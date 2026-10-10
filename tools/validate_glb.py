#!/usr/bin/env python3
"""FASE 5: Validasi tiap GLB (magic, version, JSON chunk) + tulis manifest.json."""
import json
import struct
from pathlib import Path
from collections import Counter

BASE = Path.home() / "workspace/anatomi-explode/v2"
MODELS = BASE / "models"

cls = json.load(open(MODELS / "classification.json"))
expected = Counter(cls["file_to_system"].values())

manifest = {}
all_ok = True
for sistem, exp_count in sorted(expected.items()):
    path = MODELS / f"{sistem}.glb"
    assert path.exists(), f"MISSING {path}"
    data = path.read_bytes()
    # --- header binary 12 byte ---
    magic, version, length = struct.unpack("<4sII", data[:12])
    assert magic == b"glTF", f"{sistem}: bad magic {magic}"
    assert version == 2, f"{sistem}: bad version {version}"
    assert length == len(data), f"{sistem}: length mismatch {length} != {len(data)}"
    # --- chunk 0 (JSON) ---
    clen, ctype = struct.unpack("<II", data[12:20])
    assert ctype == 0x4E4F534A, f"{sistem}: chunk0 not JSON"
    js = json.loads(data[20:20 + clen])
    meshes = js.get("meshes", [])
    nodes = js.get("nodes", [])
    mesh_names = [m.get("name", "") for m in meshes]
    node_names = [n.get("name", "") for n in nodes]
    # --- chunk 1 (BIN) sanity ---
    off = 20 + clen
    has_bin = False
    if off < len(data):
        b_len, b_type = struct.unpack("<II", data[off:off + 8])
        assert b_type == 0x004E4942, f"{sistem}: chunk1 not BIN"
        assert off + 8 + b_len == len(data), f"{sistem}: trailing data"
        has_bin = True
    ok = (len(meshes) == exp_count and len(meshes) > 0)
    all_ok &= ok
    # nama mesh unik?
    dupes = len(mesh_names) - len(set(mesh_names))
    print(f"{sistem:16s} bytes={len(data):>9d} meshes={len(meshes):>4d} "
          f"(exp {exp_count:>4d}) nodes={len(nodes):>4d} dupes={dupes} "
          f"{'OK' if ok else 'MISMATCH!'}")
    manifest[sistem] = {
        "file": f"{sistem}.glb",
        "bytes": len(data),
        "mesh_count": len(meshes),
        "node_count": len(nodes),
        "mesh_names": mesh_names,
        "draco": "KHR_draco_mesh_compression" in js.get("extensionsUsed", []),
        "has_bin_chunk": has_bin,
    }

with open(MODELS / "manifest.json", "w") as f:
    json.dump(manifest, f, indent=1)

total = sum(m["bytes"] for m in manifest.values())
print(f"\nTotal GLB: {total} bytes ({total/1e6:.2f} MB) — budget 60 MB: "
      f"{'PASS' if total < 60e6 else 'OVER!'}")
print("manifest.json ditulis.")
assert all_ok, "ADA MISMATCH JUMLAH MESH"
print("SEMUA GLB VALID.")
