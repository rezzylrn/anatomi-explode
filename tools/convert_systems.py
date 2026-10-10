#!/usr/bin/env python3
"""FASE 3: Konversi batch OBJ -> GLB per sistem via Blender headless.

Jalankan: blender --background --python convert_systems.py
Untuk tiap sistem: import semua OBJ (Z-up mm, forward -Y -> identitas),
rename object = nama Inggris tersanitasi (unik), scale 0.001 + apply,
export SATU GLB per sistem dengan Draco compression.
"""
import bpy
import json
import re
import sys
import time
from pathlib import Path

BASE = Path("/home/hatch/workspace/anatomi-explode/v2")
DATASET = Path("/home/hatch/workspace/anatomi-explode/v2-dataset/extracted/isa_BP3D_4.0_obj_99")
OUTDIR = BASE / "models"
OUTDIR.mkdir(parents=True, exist_ok=True)

# Draco config (sama dgn convert_obj.py yg terverifikasi)
DRACO = dict(
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=12,
)

cls = json.load(open(OUTDIR / "classification.json"))
f2s = cls["file_to_system"]
inv = json.load(open(OUTDIR / "inventory.json"))
name_of = {r["file"]: (r["name_en"].strip() or r["file"][:-4]) for r in inv}

SYSTEMS = ["skeleton", "muscles", "heart", "arteries", "veins",
           "nervous_system", "respiratory", "digestive", "urinary",
           "sensory_organs", "skin", "reproductive", "lainnya"]

def sanitize(name):
    s = re.sub(r"[^0-9a-zA-Z_]", "_", name)
    s = re.sub(r"_+", "_", s).strip("_")
    return (s or "mesh")[:60]

def log(msg):
    print(msg, flush=True)

summary = {}
t_all = time.time()
for sistem in SYSTEMS:
    files = sorted(f for f, s in f2s.items() if s == sistem)
    if not files:
        log(f"[{sistem}] SKIP (0 files)")
        continue
    t0 = time.time()
    log(f"[{sistem}] start: {len(files)} files")
    bpy.ops.wm.read_factory_settings(use_empty=True)

    used = {}
    mapping = {}   # file -> [object names]
    failed = []
    n_done = 0
    for fn in files:
        src = DATASET / fn
        before = set(bpy.context.scene.objects)
        try:
            bpy.ops.wm.obj_import(filepath=str(src),
                                   forward_axis='NEGATIVE_Y', up_axis='Z')
        except Exception as e:
            failed.append((fn, f"import error: {e}"))
            continue
        new_objs = [o for o in bpy.context.scene.objects
                    if o not in before and o.type == 'MESH']
        if not new_objs:
            failed.append((fn, "no mesh objects imported"))
            continue
        base = sanitize(name_of[fn])
        obj_names = []
        for i, o in enumerate(new_objs):
            nm = base if (i == 0) else f"{base}_{i+1}"
            key = nm
            k = 2
            while key in used:
                key = f"{nm}_{k}"
                k += 1
            used[key] = True
            o.name = key
            o.data.name = key
            # skala mm -> meter
            o.scale[0] *= 0.001
            o.scale[1] *= 0.001
            o.scale[2] *= 0.001
            obj_names.append(key)
        mapping[fn] = obj_names
        n_done += 1
        if n_done % 100 == 0:
            log(f"[{sistem}] ... {n_done}/{len(files)}")

    mesh_objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    log(f"[{sistem}] imported meshes: {len(mesh_objs)}, failed: {len(failed)}")

    # apply scale ke semua mesh
    bpy.ops.object.select_all(action='DESELECT')
    for o in mesh_objs:
        o.select_set(True)
    if mesh_objs:
        bpy.context.view_layer.objects.active = mesh_objs[0]
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    target = OUTDIR / f"{sistem}.glb"
    result = bpy.ops.export_scene.gltf(
        filepath=str(target), export_format='GLB',
        export_yup=True,
        **DRACO,
    )
    if result != {'FINISHED'}:
        raise RuntimeError(f"Export failed for {sistem}: {result}")
    size = target.stat().st_size
    dt = time.time() - t0
    log(f"[{sistem}] DONE: {len(mesh_objs)} meshes -> {target.name} "
        f"({size/1e6:.2f} MB, {dt:.0f}s)")
    summary[sistem] = {
        "files": files, "mesh_count": len(mesh_objs),
        "bytes": size, "failed": failed, "mapping": mapping,
    }

with open(OUTDIR / "conversion_summary.json", "w") as f:
    json.dump(summary, f, indent=1)
total_mb = sum(v["bytes"] for v in summary.values()) / 1e6
log(f"ALL DONE in {time.time()-t_all:.0f}s. Total GLB: {total_mb:.2f} MB "
    f"(budget 60 MB)")
