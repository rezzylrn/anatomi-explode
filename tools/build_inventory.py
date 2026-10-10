#!/usr/bin/env python3
"""FASE 1: Parse 2234 header OBJ -> v2/models/inventory.json"""
import json, re
from pathlib import Path

DATASET = Path.home() / "workspace/anatomi-explode/v2-dataset/extracted/isa_BP3D_4.0_obj_99"
OUT = Path.home() / "workspace/anatomi-explode/v2/models/inventory.json"

PATTERNS = {
    "file_id": re.compile(r"^#\s*File ID\s*:\s*(.+?)\s*$"),
    "rep_id": re.compile(r"^#\s*Representation ID\s*:\s*(.+?)\s*$"),
    "fma": re.compile(r"^#\s*Concept ID\s*:\s*(.+?)\s*$"),
    "name_en": re.compile(r"^#\s*English name\s*:\s*(.+?)\s*$"),
}

items = []
missing_name = 0
for obj in sorted(DATASET.glob("*.obj")):
    rec = {"file": obj.name, "file_id": "", "rep_id": "", "fma": "", "name_en": ""}
    with obj.open("r", encoding="utf-8", errors="replace") as f:
        for line in f:
            if not line.startswith("#"):
                break
            for key, pat in PATTERNS.items():
                m = pat.match(line)
                if m:
                    rec[key] = m.group(1)
    if not rec["name_en"]:
        missing_name += 1
        print(f"WARNING: no English name in {obj.name}")
    items.append(rec)

OUT.parent.mkdir(parents=True, exist_ok=True)
with OUT.open("w", encoding="utf-8") as f:
    json.dump(items, f, ensure_ascii=False, indent=1)

print(f"Parsed {len(items)} files; missing English name: {missing_name}")
print(f"Wrote {OUT}")
assert len(items) == 2234, f"EXPECTED 2234, GOT {len(items)}"
print("INVENTORY OK: count == 2234")
