#!/bin/bash
# figure/ ディレクトリ内の画像一覧を manifest.json に書き出す
# 使い方: bash generate_manifest.sh
# ※ 画像を追加・削除するたびに実行してください

FIGURE_DIR="$(dirname "$0")/figure"
OUTPUT="$(dirname "$0")/figure/manifest.json"

files=()
for f in "$FIGURE_DIR"/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG}; do
  [ -f "$f" ] || continue
  files+=("\"$(basename "$f")\"")
done

echo "[" > "$OUTPUT"
for i in "${!files[@]}"; do
  if [ $i -lt $((${#files[@]} - 1)) ]; then
    echo "  ${files[$i]}," >> "$OUTPUT"
  else
    echo "  ${files[$i]}" >> "$OUTPUT"
  fi
done
echo "]" >> "$OUTPUT"

echo "manifest.json を更新しました（${#files[@]}件）"
cat "$OUTPUT"
