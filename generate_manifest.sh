#!/bin/bash
# figure/ 内の画像を連番にリネームし manifest.json を生成する
# 使い方: bash generate_manifest.sh

SCRIPT_DIR="$(dirname "$0")"
python3 "$SCRIPT_DIR/generate_manifest.py"
