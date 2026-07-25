#!/usr/bin/env bash
set -euo pipefail

PROJECT="${1:-}"
ENV_FILE="${2:-}"
CONFIG="${3:-dev}"

if [[ -z "$PROJECT" || -z "$ENV_FILE" ]]; then
  echo "Usage: $0 <doppler-project> <env-file> [config]"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE"
  exit 1
fi

echo "Migrating secrets from $ENV_FILE to Doppler project: $PROJECT"

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line// /}" ]] && continue

  key="${line%%=*}"
  value="${line#*=}"

  [[ -z "$key" || "$key" == "$line" ]] && continue

  value="${value#\"}"
  value="${value%\"}"
  value="${value#\'}"
  value="${value%\'}"

  echo "  -> $key"
  printf '%s' "$value" | doppler secrets set "$key" --project "$PROJECT" --config "$CONFIG" --no-interactive >/dev/null 2>&1 || true
done < "$ENV_FILE"

echo "Done. Verify with: doppler secrets --project $PROJECT --config $CONFIG"
