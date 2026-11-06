"""Compatibility entry point for pixel art exporters; legacy sources are unused.

Run npm run art:scenes and npm run art:characters directly for new workflows.
ImageMagick is needed only when rebuilding the scene atlas, not for game runtime.
"""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
for script in ['draw-scenes.cjs', 'draw-panoramas.cjs', 'draw-characters.cjs', 'pixelate-items.cjs']:
    subprocess.run(['node', str(ROOT / 'scripts' / script)], check=True)
