#!/usr/bin/env python3
"""FASE 6: Smoke render tiap GLB -> preview-<sistem>.png (800x600, Workbench)."""
import bpy
import math
from mathutils import Vector
from pathlib import Path

BASE = Path("/home/hatch/workspace/anatomi-explode/v2")
MODELS = BASE / "models"
SYSTEMS = ["skeleton", "muscles", "heart", "arteries", "veins",
           "nervous_system", "respiratory", "digestive", "urinary",
           "sensory_organs", "skin", "reproductive", "lainnya"]

def log(m):
    print(m, flush=True)

for sistem in SYSTEMS:
    glb = MODELS / f"{sistem}.glb"
    out = MODELS / f"preview-{sistem}.png"
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(glb))

    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    if not meshes:
        log(f"[{sistem}] WARNING: no meshes after import!")
        continue

    # bounding box gabungan
    bmin = Vector((1e9, 1e9, 1e9))
    bmax = Vector((-1e9, -1e9, -1e9))
    for o in meshes:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            bmin = Vector(map(min, zip(bmin, w)))
            bmax = Vector(map(max, zip(bmax, w)))
    center = (bmin + bmax) / 2
    size = bmax - bmin
    max_dim = max(size.x, size.y, size.z, 1e-6)

    # kamera depan (+sedikit atas), fit
    dist = max_dim * 1.9
    cam_data = bpy.data.cameras.new(f"cam_{sistem}")
    cam = bpy.data.objects.new(f"cam_{sistem}", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = center + Vector((0, -dist, max_dim * 0.25))
    d = center - cam.location
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = cam

    # satu sun light biar ada shading
    ldata = bpy.data.lights.new("sun", 'SUN')
    ldata.energy = 3.0
    lobj = bpy.data.objects.new("sun", ldata)
    bpy.context.scene.collection.objects.link(lobj)
    lobj.location = center + Vector((max_dim, -max_dim, max_dim * 1.5))

    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_WORKBENCH'
    sc.render.resolution_x = 800
    sc.render.resolution_y = 600
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = False
    sc.render.filepath = str(out)
    sc.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(write_still=True)
    log(f"[{sistem}] preview -> {out.name} ({out.stat().st_size/1024:.0f} KB)")
log("PREVIEWS DONE")
