"""Mechanically split generated originals and export game PNGs; requires Pillow + ImageMagick.

Usage: python3 scripts/export-art.py /path/to/sources.json
The source map contains hero/minsu strips, props sheet, npc-NAME singles, photo and seven backgrounds.
Pillow only reads dimensions/alpha bounds; ImageMagick crops, scales and packages the PNGs.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCES = json.loads(Path(sys.argv[1]).read_text())
OUT = ROOT / 'assets/art'
records = {}

def bounds(path, crop=None):
    with Image.open(path) as im:
        im = im.convert('RGBA')
        if crop:
            im = im.crop(crop)
        return im.getchannel('A').point(lambda a: 255 if a > 32 else 0).getbbox()

def export(key, source, crop=None, factor=None):
    path = OUT / (key + '.png')
    path.parent.mkdir(parents=True, exist_ok=True)
    b = bounds(source, crop)
    if not b:
        raise ValueError(f'Empty sprite: {key}')
    left, top, right, bottom = b
    width, height = right-left, bottom-top
    if crop:
        left += crop[0]
        top += crop[1]
    factor = factor or min(224/width, 224/height)
    rw, rh = round(width*factor), round(height*factor)
    # Common feet baseline and a shared scale across each animation strip.
    x, y = (256-rw)//2, 240-rh
    with tempfile.TemporaryDirectory() as tmp:
        cut = Path(tmp) / 'cut.png'
        subprocess.run(['magick', source, '-crop', f'{width}x{height}+{left}+{top}',
                        '+repage', '-resize', f'{rw}x{rh}!', str(cut)], check=True)
        subprocess.run(['magick', '-size', '256x256', 'canvas:none', str(cut),
                        '-geometry', f'+{x}+{y}', '-compose', 'Over', '-composite',
                        '-strip', 'PNG32:'+str(path)], check=True)
    records[key] = {'src': str(path.relative_to(ROOT)), 'bounds': list(bounds(path)),
                    'anchor': [128, 240]}

for who in ['hero', 'minsu']:
    source = SOURCES[who]
    with Image.open(source) as im:
        w, h = im.size
    cells = [(i*w//4, 0, (i+1)*w//4, h) for i in range(4)]
    boxes = [bounds(source, c) for c in cells]
    factor = min(224/max(b[3]-b[1] for b in boxes), 224/max(b[2]-b[0] for b in boxes))
    for state, cell in zip(['idle','walk-a','walk-b','attack'], cells):
        export(f'characters/{who}/{state}', source, cell, factor)

# Hand inspected sheet regions: wide props intentionally cross grid lines.
props = {
 'bed':(8,150,320,310), 'table':(320,115,638,310),
 'target':(680,20,915,313), 'door':(975,5,1254,310),
 'board':(5,325,319,621), 'bench':(319,405,680,621),
 'mailbox':(700,315,880,625), 'plant':(970,315,1240,625),
 'bike':(0,635,354,930), 'bag':(370,690,615,930),
 'desk':(618,690,936,920), 'shop':(935,625,1254,930),
 'gate':(3,940,402,1227), 'press':(401,988,740,1245),
 'bus':(741,919,880,1248), 'mat':(905,998,1254,1205),
}
for name, cell in props.items():
    export(f'props/{name}', SOURCES['props'], cell)

export('props/photo', SOURCES['photo'])

for name in ['boss','champ','friend','neighbor','uncle','sprinter','folder','globe','alien','alien_champ']:
    export(f'characters/{name}/idle', SOURCES['npc-'+name])

for name in ['yard','home','alley','square','center','lobby','schoolfront']:
    path = OUT / 'backgrounds' / (name+'.png')
    path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(['magick', SOURCES[name], '-resize', '256x256^', '-gravity', 'center',
                    '-extent', '256x256', '-strip', 'PNG32:'+str(path)], check=True)
    records['backgrounds/'+name] = {'src': str(path.relative_to(ROOT))}

(OUT/'manifest.json').write_text(json.dumps(records, indent=2)+'\n')
(ROOT/'art-manifest.js').write_text("'use strict';\nwindow.ART_MANIFEST="+json.dumps(records, separators=(',',':'))+';\n')
print(f'Exported {len(records)} individual 256x256 PNGs')
