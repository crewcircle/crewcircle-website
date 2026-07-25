"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Loader2,
  Terminal,
  CheckCircle2,
  XCircle,
  Trash2,
  X,
} from "lucide-react";

interface DestroyProjectButtonProps {
  projectId: string;
  projectName: string;
}

type Phase = "idle" | "confirm" | "executing" | "completed" | "failed";

export function DestroyProjectButton({
  projectId,
  projectName,
}: DestroyProjectButtonProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [confirmText, setConfirmText] = useState("");
  const [outputLog, setOutputLog] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDestroy = async () => {
    setPhase("executing");
    setErrorMsg(null);
    setOutputLog("");

    try {
      const res = await fetch("/api/admin/deprovision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(
          (err as { error?: string }).error ?? "Failed to start deprovision job"
        );
        setPhase("failed");
        return;
      }

      const { jobId } = await res.json();

      // Poll for completion
      const poll = setInterval(async () => {
        const pollRes = await fetch(`/api/admin/deprovision?jobId=${jobId}`);
        if (!pollRes.ok) return;

        const data = await pollRes.json();
        setOutputLog(data.output_log ?? "");

        if (data.status === "completed") {
          clearInterval(poll);
          setPhase("completed");
          router.refresh();
        } else if (data.status === "failed") {
          clearInterval(poll);
          setErrorMsg(data.error_message ?? "Deprovision failed");
          setPhase("failed");
        }
      }, 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setPhase("failed");
    }
  };

  if (phase === "completed") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <span className="text-sm font-medium text-green-700">
          Project destroyed.
        </span>
        <button
          onClick={() => router.push("/admin")}
          className="ml-auto text-sm text-green-700 underline hover:text-green-800"
        >
          Back to projects
        </button>
      </div>
    );
  }

  // ---- Confirm dialog ----
  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setPhase("confirm")}
        className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Destroy Project
      </button>

      {/* Modal overlay */}
      {phase === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Destroy {projectName}?
                </h3>
              </div>
              <button
                onClick={() => {
                  setPhase("idle");
                  setConfirmText("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-sm text-gray-600">
              This will permanently destroy the Pulumi stack, Supabase project,
              ESC environment, and archive the GitHub repo. This action
              <strong> cannot be undone</strong>.
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Type <span className="font-mono text-red-600">{projectId}</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={projectId}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setPhase("idle");
                  setConfirmText("");
                }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDestroy}
                disabled={confirmText !== projectId}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                I understand, destroy it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution overlay */}
      {phase === "executing" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-red-600" />
              <span className="font-medium text-gray-900">
                Destroying {projectName}...
              </span>
            </div>
            {outputLog && (
              <div className="mt-4 rounded-md border border-gray-200 bg-gray-900 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
                  <Terminal className="h-3 w-3" />
                  Output
                </div>
                <pre className="max-h-48 overflow-auto text-xs text-green-400 whitespace-pre-wrap font-mono">
                  {outputLog}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {phase === "failed" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Deprovision Failed
                </h3>
              </div>
              <button
                onClick={() => setPhase("idle")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {errorMsg && (
              <p className="mt-3 text-sm text-red-700">{errorMsg}</p>
            )}
            {outputLog && (
              <div className="mt-3 rounded-md border border-gray-200 bg-gray-900 p-3">
                <pre className="max-h-48 overflow-auto text-xs text-green-400 whitespace-pre-wrap font-mono">
                  {outputLog}
                </pre>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setPhase("idle")}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setPhase("confirm");
                  setErrorMsg(null);
                  setOutputLog("");
                }}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
