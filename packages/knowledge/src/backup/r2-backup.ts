import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

export interface R2BackupConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region?: string;
  prefix?: string;
}

export interface BackupManifest {
  version: string;
  timestamp: string;
  namespace: string;
  tenantId?: string;
  provider: string;
  tables: BackupTableManifest[];
  totalDocuments: number;
  totalEntities: number;
  totalRelations: number;
  checksum: string;
}

export interface BackupTableManifest {
  name: string;
  rowCount: number;
  sizeBytes: number;
  columns: string[];
  s3Key: string;
}

export interface BackupMetadata {
  id: string;
  manifest: BackupManifest;
  s3Key: string;
  createdAt: Date;
  sizeBytes: number;
}

function generateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
}

export class R2BackupService {
  private client: S3Client;
  private bucketName: string;
  private prefix: string;

  constructor(config: R2BackupConfig) {
    this.client = new S3Client({
      region: config.region ?? "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucketName = config.bucketName;
    this.prefix = config.prefix ?? "knowledge-backups";
  }

  async createBackup(
    namespace: string,
    tenantId: string | undefined,
    provider: string,
    documents: Record<string, unknown>[],
    entities: Record<string, unknown>[],
    relations: Record<string, unknown>[]
  ): Promise<BackupMetadata> {
    const timestamp = new Date().toISOString();
    const backupId = `${namespace}-${tenantId ?? "default"}-${timestamp.replace(/[:.]/g, "-")}`;
    const tableManifests: BackupTableManifest[] = [];

    const tables = [
      { name: "documents", data: documents, columns: Object.keys(documents[0] ?? {}) },
      { name: "entities", data: entities, columns: Object.keys(entities[0] ?? {}) },
      { name: "relations", data: relations, columns: Object.keys(relations[0] ?? {}) },
    ];

    for (const table of tables) {
      const jsonData = JSON.stringify(table.data, null, 2);
      const s3Key = `${this.prefix}/${backupId}/${table.name}.json`;
      
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: jsonData,
        ContentType: "application/json",
        Metadata: {
          namespace,
          tenantId: tenantId ?? "",
          backupId,
          table: table.name,
        },
      }));

      tableManifests.push({
        name: table.name,
        rowCount: table.data.length,
        sizeBytes: Buffer.byteLength(jsonData, "utf-8"),
        columns: table.columns,
        s3Key,
      });
    }

    const manifest: BackupManifest = {
      version: "1.0",
      timestamp,
      namespace,
      tenantId,
      provider,
      tables: tableManifests,
      totalDocuments: documents.length,
      totalEntities: entities.length,
      totalRelations: relations.length,
      checksum: generateChecksum(JSON.stringify({ documents: documents.length, entities: entities.length, relations: relations.length })),
    };

    const manifestKey = `${this.prefix}/${backupId}/manifest.json`;
    const manifestJson = JSON.stringify(manifest, null, 2);
    
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: manifestKey,
      Body: manifestJson,
      ContentType: "application/json",
    }));

    return {
      id: backupId,
      manifest,
      s3Key: manifestKey,
      createdAt: new Date(),
      sizeBytes: tableManifests.reduce((sum, t) => sum + t.sizeBytes, 0) + Buffer.byteLength(manifestJson, "utf-8"),
    };
  }

  async listBackups(namespace?: string, tenantId?: string): Promise<BackupMetadata[]> {
    const prefix = `${this.prefix}/`;
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
      Delimiter: "/",
    });

    const response = await this.client.send(command);
    const backups: BackupMetadata[] = [];

    if (response.CommonPrefixes) {
      for (const commonPrefix of response.CommonPrefixes) {
        const backupId = commonPrefix.Prefix?.replace(prefix, "").replace("/", "");
        if (!backupId) continue;

        const manifestKey = `${prefix}${backupId}/manifest.json`;
        try {
          const manifestResponse = await this.client.send(new GetObjectCommand({
            Bucket: this.bucketName,
            Key: manifestKey,
          }));
          const manifestStr = await streamToString(manifestResponse.Body as Readable);
          const manifest = JSON.parse(manifestStr) as BackupManifest;

          if (namespace && manifest.namespace !== namespace) continue;
          if (tenantId && manifest.tenantId !== tenantId) continue;

          backups.push({
            id: backupId,
            manifest,
            s3Key: manifestKey,
            createdAt: new Date(manifest.timestamp),
            sizeBytes: manifest.tables.reduce((sum, t) => sum + t.sizeBytes, 0),
          });
        } catch {
          continue;
        }
      }
    }

    return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async restoreBackup(backupId: string): Promise<{ documents: Record<string, unknown>[]; entities: Record<string, unknown>[]; relations: Record<string, unknown>[]; manifest: BackupManifest }> {
    const manifestKey = `${this.prefix}/${backupId}/manifest.json`;
    const manifestResponse = await this.client.send(new GetObjectCommand({
      Bucket: this.bucketName,
      Key: manifestKey,
    }));
    const manifestStr = await streamToString(manifestResponse.Body as Readable);
    const manifest = JSON.parse(manifestStr) as BackupManifest;

    const [documents, entities, relations] = await Promise.all(
      manifest.tables.map(async (table) => {
        const response = await this.client.send(new GetObjectCommand({
          Bucket: this.bucketName,
          Key: table.s3Key,
        }));
        const dataStr = await streamToString(response.Body as Readable);
        return JSON.parse(dataStr) as Record<string, unknown>[];
      })
    );

    return {
      documents,
      entities,
      relations,
      manifest,
    };
  }

  async deleteBackup(backupId: string): Promise<void> {
    const listCommand = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: `${this.prefix}/${backupId}/`,
    });

    const listResponse = await this.client.send(listCommand);
    
    if (listResponse.Contents) {
      for (const obj of listResponse.Contents) {
        if (obj.Key) {
          await this.client.send(new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: obj.Key,
          }));
        }
      }
    }
  }

  async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    const manifestKey = `${this.prefix}/${backupId}/manifest.json`;
    try {
      const response = await this.client.send(new GetObjectCommand({
        Bucket: this.bucketName,
        Key: manifestKey,
      }));
      const manifestStr = await streamToString(response.Body as Readable);
      const manifest = JSON.parse(manifestStr) as BackupManifest;

      return {
        id: backupId,
        manifest,
        s3Key: manifestKey,
        createdAt: new Date(manifest.timestamp),
        sizeBytes: manifest.tables.reduce((sum, t) => sum + t.sizeBytes, 0),
      };
    } catch {
      return null;
    }
  }
}

export function createR2BackupService(config: R2BackupConfig): R2BackupService {
  return new R2BackupService(config);
}