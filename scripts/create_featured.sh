#!/usr/bin/env bash
set -euo pipefail

if ! command -v dialog >/dev/null 2>&1; then
  echo "Error: 'dialog' is required. Install it and try again." >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_PATH="${ROOT_DIR}/data/featured.json"
TMP_FILE="$(mktemp)"

cleanup() {
  rm -f "$TMP_FILE"
}
trap cleanup EXIT

while true; do
  repo_name="$(dialog --inputbox "GitHub repo name (e.g., mini-sopa-intent)" 8 60 2>&1 >/dev/tty)" || break
  repo_name="$(echo "$repo_name" | xargs)"
  if [[ -z "$repo_name" ]]; then
    dialog --msgbox "Repo name is required." 6 40
    continue
  fi

  blurb="$(dialog --inputbox "Short blurb (optional)" 8 60 2>&1 >/dev/tty)" || blurb=""
  highlight="$(dialog --inputbox "Highlight tag (optional, e.g., ONNX + NLP)" 8 60 2>&1 >/dev/tty)" || highlight=""
  priority="$(dialog --inputbox "Priority number (optional, lower shows first)" 8 60 2>&1 >/dev/tty)" || priority=""

  printf "%s\t%s\t%s\t%s\n" "$repo_name" "$blurb" "$highlight" "$priority" >> "$TMP_FILE"

  if ! dialog --yesno "Add another featured repo?" 7 40; then
    break
  fi
done

if [[ ! -s "$TMP_FILE" ]]; then
  dialog --msgbox "No entries added. Nothing written." 6 40
  exit 0
fi

mkdir -p "$(dirname "$OUTPUT_PATH")"

python3 - "$TMP_FILE" "$OUTPUT_PATH" <<'PY'
import json
import sys
from pathlib import Path

tmp_path, out_path = sys.argv[1:3]
items = []

with open(tmp_path, "r", encoding="utf-8") as handle:
    for line in handle:
        name, blurb, highlight, priority = (line.rstrip("\n").split("\t") + ["", "", "", ""])[:4]
        name = name.strip()
        if not name:
            continue
        item = {"name": name}
        if blurb.strip():
            item["blurb"] = blurb.strip()
        if highlight.strip():
            item["highlight"] = highlight.strip()
        if priority.strip():
            try:
                item["priority"] = int(priority.strip())
            except ValueError:
                item["priority"] = priority.strip()
        items.append(item)

existing = []
if Path(out_path).exists():
    try:
        with open(out_path, "r", encoding="utf-8") as handle:
            loaded = json.load(handle)
            if isinstance(loaded, list):
                existing = loaded
    except json.JSONDecodeError:
        existing = []

merged = []
seen = set()
for entry in existing + items:
    if not isinstance(entry, dict):
        continue
    name = str(entry.get("name", "")).strip()
    if not name or name in seen:
        continue
    seen.add(name)
    merged.append(entry)

with open(out_path, "w", encoding="utf-8") as handle:
    json.dump(merged, handle, indent=2)
    handle.write("\n")
PY

dialog --msgbox "Saved $(wc -l < "$TMP_FILE") entry(ies) to ${OUTPUT_PATH}" 7 60
