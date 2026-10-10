"""Blender-only OBJ -> Draco GLB; supports one file or a directory.
Run: blender --background --python convert_obj.py -- INPUT OUTPUT --draco
Directory mode processes only top-level *.obj; never extracts archives.
"""
import argparse
import sys
from pathlib import Path
import bpy

parser = argparse.ArgumentParser()
parser.add_argument('input', type=Path)
parser.add_argument('output', type=Path)
parser.add_argument('--draco', action='store_true', required=True)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
if not args.input.exists():
    raise FileNotFoundError(args.input)
pairs = [(args.input, args.output)]
if args.input.is_dir():
    pairs = [(p, args.output / (p.stem + '.glb')) for p in sorted(args.input.glob('*.obj'))]
    if not pairs:
        raise RuntimeError('No OBJ files found')
for source, target in pairs:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.wm.obj_import(filepath=str(source.resolve()), forward_axis='NEGATIVE_Z', up_axis='Y')
    target.parent.mkdir(parents=True, exist_ok=True)
    result = bpy.ops.export_scene.gltf(
        filepath=str(target.resolve()), export_format='GLB',
        export_draco_mesh_compression_enable=args.draco,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
    )
    if result != {'FINISHED'}:
        raise RuntimeError(f'Export failed: {source}: {result}')
    print(f'Converted {source} -> {target}', flush=True)
