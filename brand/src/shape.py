"""Kerned text -> SVG path via hb-shape + fontTools. Fonts instantiated as static TTFs."""
import json, subprocess, os, functools, tempfile
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
_HERE = os.path.dirname(os.path.abspath(__file__))
_FS = os.environ.get('OBX_FONTSOURCE', os.path.join(_HERE, '..', '..', 'node_modules', '@fontsource-variable'))
SRC = {'inter': os.path.join(_FS, 'inter-tight/files/inter-tight-latin-wght-normal.woff2'),
       'mono': os.path.join(_FS, 'jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2')}
OUT = os.environ.get('OBX_FONT_CACHE', os.path.join(tempfile.gettempdir(), 'obx-brand-fonts'))
os.makedirs(OUT, exist_ok=True)
@functools.lru_cache(None)
def font(fam, w):
    p = f'{OUT}/{fam}-{w}.ttf'
    if not os.path.exists(p):
        f = instantiateVariableFont(TTFont(SRC[fam]), {'wght': float(w)}); f.flavor = None; f.save(p)
    return p, TTFont(p)
def fmt(v): return ('%.2f' % v).rstrip('0').rstrip('.')
def text(fam, w, s, size, x, y, anchor='start', track=0.0):
    """track in em. returns (d, width)"""
    p, f = font(fam, w)
    upm = f['head'].unitsPerEm; k = size / upm
    out = subprocess.run(['hb-shape', p, s, '--output-format=json', '--no-glyph-names'], capture_output=True, text=True, check=True).stdout
    g = json.loads(out)
    total = sum(e['ax'] for e in g) + track * upm * (len(g) - 1)
    width = total * k
    if anchor == 'middle': x -= width / 2
    elif anchor == 'end': x -= width
    order = f.getGlyphOrder(); gs = f.getGlyphSet()
    pen = SVGPathPen(gs, ntos=fmt); cx = 0
    for e in g:
        gs[order[e['g']]].draw(TransformPen(pen, (k, 0, 0, -k, x + (cx + e['dx']) * k, y - e['dy'] * k)))
        cx += e['ax'] + track * upm
    return pen.getCommands(), width
def capheight(fam, w, size):
    p, f = font(fam, w); return f['OS/2'].sCapHeight * size / f['head'].unitsPerEm
