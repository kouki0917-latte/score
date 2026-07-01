#!/usr/bin/env python3
import os, json, re

FIGURE_DIR = os.path.join(os.path.dirname(__file__), 'figure')
EXTS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}

# 連番ファイルを元の名前に戻す（manifest.json を参照）
manifest_path = os.path.join(FIGURE_DIR, 'manifest.json')
if os.path.exists(manifest_path):
    with open(manifest_path, encoding='utf-8') as f:
        try:
            entries = json.load(f)
            for e in entries:
                if isinstance(e, dict) and 'file' in e and 'name' in e:
                    ext = os.path.splitext(e['file'])[1]
                    original = e['name'] + ext
                    src = os.path.join(FIGURE_DIR, e['file'])
                    dst = os.path.join(FIGURE_DIR, original)
                    if os.path.exists(src) and src != dst:
                        os.rename(src, dst)
                        print(f'  {e["file"]} → {original}')
        except Exception:
            pass

# 対象ファイルを収集してmanifest生成（リネームなし）
files = sorted([
    f for f in os.listdir(FIGURE_DIR)
    if os.path.splitext(f)[1].lower() in EXTS
])

manifest = [{'file': f, 'name': os.path.splitext(f)[0]} for f in files]

with open(manifest_path, 'w', encoding='utf-8') as fp:
    json.dump(manifest, fp, ensure_ascii=False, indent=2)

print(f'manifest.json を更新しました（{len(manifest)}件）')
