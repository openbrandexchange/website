"""Generate the "Works with Open Brand Exchange" / "OBX compatible" badges.

Usage (from the website repo root, after `npm ci` so the fonts exist):
    python3 brand/src/badges.py brand/src/mark-master.svg public/badges
Needs the same tools as build.py: fonttools + brotli, hb-shape, rsvg-convert.
Every badge is drawn in ink and paper only (no accent colour), with all text converted to outlines,
so it looks the same on every site and needs no fonts. One badge for every implementer that passes
the conformance suite: the rules are on the press page (/en/press/).
"""
import math, os, re, sys, subprocess
sys.path.insert(0, os.path.dirname(__file__))
import shape

MARK_SRC, OUT = sys.argv[1:3]
os.makedirs(OUT, exist_ok=True)
s = open(MARK_SRC).read()
MVB = [float(v) for v in re.search(r'viewBox="([^"]+)"', s).group(1).split()]
MD = ' '.join(re.search(r'\sd="([^"]+)"', s, re.S).group(1).split())
MW, MH = MVB[2], MVB[3]

THEMES = {
    'light': dict(bg='#ffffff', line='#111111', fg='#111111', muted='#5f5d57'),
    'dark': dict(bg='#111110', line='#f4f2ec', fg='#f4f2ec', muted='#a9a59b'),
}

def fmt(v): return ('%.2f' % v).rstrip('0').rstrip('.')

def mark(x, y, h, fill):
    return f'<path transform="translate({fmt(x)} {fmt(y)}) scale({h / MH:.5f})" fill="{fill}" fill-rule="evenodd" d="{MD}"/>'

def txt(fam, wt, string, size, x, y, fill, anchor='start', track=0.0):
    d, w = shape.text(fam, wt, string, size, x, y, anchor=anchor, track=track)
    return f'<path fill="{fill}" d="{d}"/>', w

def width_of(fam, wt, string, size, track=0.0):
    return shape.text(fam, wt, string, size, 0, 0, track=track)[1]

def frame(W, H, t):
    return (f'<rect x="0.75" y="0.75" width="{fmt(W - 1.5)}" height="{fmt(H - 1.5)}" rx="2" '
            f'fill="{t["bg"]}" stroke="{t["line"]}" stroke-width="1.5"/>')

def write(name, W, H, body, title):
    path = os.path.join(OUT, name + '.svg')
    open(path, 'w').write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(W)} {fmt(H)}" width="{fmt(W)}" height="{fmt(H)}" '
        f'role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n')
    for k, suffix in [(1, ''), (2, '-2x')]:
        subprocess.run(['rsvg-convert', '-w', str(round(W * k)), '-o', os.path.join(OUT, f'{name}{suffix}.png'), path], check=True)
    print(name, fmt(W), 'x', fmt(H))

KICK = dict(fam='mono', wt=600, size=9.5, track=0.12)   # small caps-style label
def kicker(string, x, y, fill, anchor='start'):
    return txt(KICK['fam'], KICK['wt'], string, KICK['size'], x, y, fill, anchor, KICK['track'])

# kicker above, name below; the second family puts the brand name small and the claim big
VARIANTS = {
    'works-with': ('WORKS WITH', 'Open Brand Exchange', 'Works with Open Brand Exchange'),
    'compatible': ('OPEN BRAND EXCHANGE', 'Compatible', 'Open Brand Exchange compatible'),
}

for key, (small, big, title) in VARIANTS.items():
    for th, t in THEMES.items():
        # horizontal: 56 high
        H, mh, pad = 56, 24, 14
        bigsize = 17 if key == 'works-with' else 20
        tx = pad + MW * mh / MH + 12
        sw = width_of(KICK['fam'], KICK['wt'], small, KICK['size'], KICK['track'])
        bw = width_of('inter', 700, big, bigsize, -0.01)
        W = math.ceil(tx + max(sw, bw) + pad + 2)
        k, _ = kicker(small, tx, 23.5, t['muted'])
        b, _ = txt('inter', 700, big, bigsize, tx, 42, t['fg'], track=-0.01)
        write(f'obx-{key}-{th}', W, H, frame(W, H, t) + mark(pad, (H - mh) / 2, mh, t['fg']) + k + b, title)

        # stacked: mark on top, text centred below
        mh = 32
        bigsize = 15 if key == 'works-with' else 19
        sw = width_of(KICK['fam'], KICK['wt'], small, KICK['size'], KICK['track'])
        bw = width_of('inter', 700, big, bigsize, -0.01)
        W = math.ceil(max(sw, bw, MW * mh / MH) + 36)
        H = 112
        mw = MW * mh / MH
        k, _ = kicker(small, W / 2, 70, t['muted'], 'middle')
        b, _ = txt('inter', 700, big, bigsize, W / 2, 91, t['fg'], 'middle', -0.01)
        write(f'obx-{key}-stacked-{th}', W, H, frame(W, H, t) + mark((W - mw) / 2, 18, mh, t['fg']) + k + b, title)

# square: the mark with one word, for small spaces (app tiles, footers, 48 px and up)
for th, t in THEMES.items():
    S, mh = 96, 30
    mw = MW * mh / MH
    k, _ = kicker('COMPATIBLE', S / 2, 72, t['fg'], 'middle')
    write(f'obx-compatible-square-{th}', S, S, frame(S, S, t) + mark((S - mw) / 2, 22, mh, t['fg']) + k, 'Open Brand Exchange compatible')
