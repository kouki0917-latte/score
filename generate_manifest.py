#!/usr/bin/env python3
import os, json, re

FIGURE_DIR = os.path.join(os.path.dirname(__file__), 'figure')
EXTS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}

# 対象ファイルを収集（連番ファイルを除く）
files = []
for f in sorted(os.listdir(FIGURE_DIR)):
    ext = os.path.splitext(f)[1].lower()
    if ext not in EXTS:
        continue
    if re.match(r'^\d{3}\.\w+$', f):
        # すでに連番 → 元の名前が不明なのでスキップせず保持
        continue
    files.append(f)

# 連番にリネーム
manifest = []
for i, original in enumerate(files, 1):
    ext = os.path.splitext(original)[1].lower()
    new_name = f'{i:03d}{ext}'
    name_only = os.path.splitext(original)[0]
    src = os.path.join(FIGURE_DIR, original)
    dst = os.path.join(FIGURE_DIR, new_name)
    if src != dst:
        os.rename(src, dst)
    manifest.append({'file': new_name, 'name': name_only})

# manifest.json を書き出し
output = os.path.join(FIGURE_DIR, 'manifest.json')
with open(output, 'w', encoding='utf-8') as fp:
    json.dump(manifest, fp, ensure_ascii=False, indent=2)

print(f'manifest.json を更新しました（{len(manifest)}件）')
for m in manifest:
    print(f"  {m['file']} → {m['name']}")
