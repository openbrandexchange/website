"""Generate the OBX brand kit from the two masters.

Usage (from the website repo root, after `npm ci` so the fonts exist):
    python3 brand/src/build.py brand/src/mark-master.svg brand/src/icon-master.svg brand
Needs: python3 + fonttools + brotli, hb-shape (harfbuzz), rsvg-convert (librsvg).
All text is converted to outlines, so the outputs have no font dependency.
"""
import os, re, sys, subprocess, json
sys.path.insert(0, os.path.dirname(__file__))
import shape

MARK_SRC, ICON_SRC, OUT = sys.argv[1:4]

# ---- colours -------------------------------------------------------------
BLUE = '#1f3bd6'        # Blueprint (primary)
BLUE_DARK = '#8fa2ff'   # Blueprint on dark backgrounds
INK = '#111111'
PAPER = '#f7f6f2'
NIGHT = '#111110'       # site dark surface
NIGHT_FG = '#f4f2ec'
MUTED = '#5f5d57'
NIGHT_MUTED = '#a9a59b'

def read_path(p):
    s = open(p).read()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', s).group(1).split()]
    d = ' '.join(re.search(r'\sd="([^"]+)"', s, re.S).group(1).split())
    return vb, d

MVB, MD = read_path(MARK_SRC)   # horizontal label (w x 28)
IVB, ID = read_path(ICON_SRC)   # square icon
MW, MH = MVB[2], MVB[3]

def w(path, s):
    path = os.path.join(OUT, path); os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w').write(s); return path

def svg(wd, ht, body, title, extra=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(wd)} {fmt(ht)}" width="{fmt(wd)}" height="{fmt(ht)}" role="img" aria-label="{title}"{extra}>'
            f'<title>{title}</title>{body}</svg>\n')

def fmt(v): return ('%.2f' % v).rstrip('0').rstrip('.')

def mark_g(x, y, h, fill, d=MD, vbh=MH):
    k = h / vbh
    return f'<path transform="translate({fmt(x)} {fmt(y)}) scale({("%.5f" % k).rstrip("0").rstrip(".")})" fill="{fill}" fill-rule="evenodd" d="{d}"/>'

def png(src, dst, wd, ht=None):
    cmd = ['rsvg-convert', '-w', str(wd)] + (['-h', str(ht)] if ht else []) + ['-o', os.path.join(OUT, dst), src]
    subprocess.run(cmd, check=True)

# ---- lockup geometry -----------------------------------------------------
# Wordmark cap height = OBX letter height (16/28 of label height); baseline on letter baseline.
LET_TOP, LET_BOT = 6 / 28, 22 / 28
def lockup(x, y, h, mark_fill, text_fill):
    cap_ratio = shape.capheight('inter', 700, 1)
    size = h * (LET_BOT - LET_TOP) / cap_ratio
    tx = x + MW * h / MH + h * 0.42
    d, tw = shape.text('inter', 700, 'Open Brand Exchange', size, tx, y + h * LET_BOT, track=-0.01)
    body = mark_g(x, y, h, mark_fill) + f'<path fill="{text_fill}" d="{d}"/>'
    return body, (tx + tw) - x

THEMES = {
    'light': dict(bg=PAPER, mark=BLUE, fg=INK, muted=MUTED),
    'dark': dict(bg=NIGHT, mark=BLUE_DARK, fg=NIGHT_FG, muted=NIGHT_MUTED),
}
MONO = {'black': INK, 'white': PAPER}

files = []
def add(p): files.append(os.path.relpath(p, OUT)); return p

# ---- masters: mark, icon, lockup ------------------------------------------
for name, fill in [('', BLUE), ('-dark', BLUE_DARK), ('-mono-black', INK), ('-mono-white', PAPER)]:
    add(w(f'logo/obx-mark{name}.svg', svg(MW, MH, mark_g(0, 0, MH, fill), 'Open Brand Exchange')))
    add(w(f'logo/obx-icon{name}.svg', svg(IVB[2], IVB[3], mark_g(0, 0, IVB[3], fill, ID, IVB[3]), 'Open Brand Exchange')))
    tfill = {'': INK, '-dark': NIGHT_FG, '-mono-black': INK, '-mono-white': PAPER}[name]
    body, lw = lockup(0, 0, 28, fill, tfill)
    add(w(f'logo/obx-logo{name}.svg', svg(lw, 28, body, 'Open Brand Exchange')))

# ---- favicon --------------------------------------------------------------
fav = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(IVB[2])} {fmt(IVB[3])}">'
       f'<style>path{{fill:{BLUE}}}@media (prefers-color-scheme:dark){{path{{fill:{BLUE_DARK}}}}}</style>'
       f'<path fill-rule="evenodd" d="{ID}"/></svg>\n')
fs = add(w('favicon/favicon.svg', fav))
static_icon = w('favicon/_icon-static.svg', svg(IVB[2], IVB[3], mark_g(0, 0, IVB[3], BLUE, ID, IVB[3]), 'OBX'))
png(static_icon, 'favicon/favicon-32.png', 32); add(os.path.join(OUT, 'favicon/favicon-32.png'))
# apple-touch / 512: opaque paper tile, icon at 72 %
for size, nm in [(180, 'apple-touch-icon-180.png'), (512, 'icon-512.png')]:
    inner = size * 0.72; off = (size - inner) / 2
    t = w(f'favicon/_tile-{size}.svg', svg(size, size, f'<rect width="{size}" height="{size}" fill="{PAPER}"/>' + mark_g(off, off, inner, BLUE, ID, IVB[3]), 'OBX'))
    png(t, f'favicon/{nm}', size); add(os.path.join(OUT, f'favicon/{nm}'))
    os.remove(t)
os.remove(static_icon)

# ---- avatar ---------------------------------------------------------------
# Full-bleed Blueprint square, paper label, letters show the blue through.
def avatar(bg, label, nm):
    S = 1000; lw = 780; lh = lw * MH / MW
    body = f'<rect width="{S}" height="{S}" fill="{bg}"/>' + mark_g((S - lw) / 2, (S - lh) / 2, lh, label)
    p = add(w(f'avatar/{nm}.svg', svg(S, S, body, 'Open Brand Exchange')))
    png(p, f'avatar/{nm}.png', S); add(os.path.join(OUT, f'avatar/{nm}.png'))
avatar(BLUE, PAPER, 'obx-avatar')
avatar(INK, PAPER, 'obx-avatar-mono')

# ---- README banners -------------------------------------------------------
REPOS = json.load(open(os.path.join(os.path.dirname(__file__), 'repos.json')))
TAGLINE = 'The open protocol between brands and retailers'
def banner(theme, repo=None):
    t = THEMES[theme]; W, H = 1280, 320; h = 84
    body = f'<rect width="{W}" height="{H}" fill="{t["bg"]}"/>'
    lb, lw = lockup(80, (H - h) / 2 - 18, h, t['mark'], t['fg'])
    body += lb
    d, _ = shape.text('mono', 500, TAGLINE, 22, 80 + MW * h / MH + h * 0.42 + 2, (H - h) / 2 - 18 + h + 46, track=0)
    body += f'<path fill="{t["muted"]}" d="{d}"/>'
    if repo:
        d, rw = shape.text('mono', 600, repo, 30, W - 80, (H - h) / 2 - 18 + h * LET_BOT, anchor='end')
        body += f'<path fill="{t["mark"]}" d="{d}"/>'
    # baseline rule, like the site's label style
    body += f'<rect x="0" y="{H - 8}" width="{W}" height="8" fill="{t["mark"]}"/>'
    nm = f'banner/obx-banner{"-" + repo if repo else ""}-{theme}'
    p = add(w(nm + '.svg', svg(W, H, body, f'Open Brand Exchange{" " + repo if repo else ""}')))
    png(p, nm + '@2x.png', 2 * W); add(os.path.join(OUT, nm + '@2x.png'))
for th in THEMES:
    banner(th)
    for r in REPOS: banner(th, r)

# ---- social previews ------------------------------------------------------
def wrap(text, size, maxw, weight=450):
    words, lines, cur = text.split(), [], ''
    for word in words:
        trial = (cur + ' ' + word).strip()
        if shape.text('inter', weight, trial, size, 0, 0)[1] > maxw and cur:
            lines.append(cur); cur = word
        else: cur = trial
    lines.append(cur); return lines

def social(repo, desc):
    t = THEMES['light']; W, H = 1280, 640; M = 88
    body = f'<rect width="{W}" height="{H}" fill="{t["bg"]}"/>'
    lb, _ = lockup(M, M - 8, 52, t['mark'], t['fg']); body += lb
    size = 112
    d, rw = shape.text('inter', 700, repo, size, M, 330, track=-0.025)
    body += f'<path fill="{t["fg"]}" d="{d}"/>'
    y = 400
    for line in wrap(desc, 36, W - 2 * M - 40)[:3]:
        d, _ = shape.text('inter', 450, line, 36, M, y); body += f'<path fill="{t["muted"]}" d="{d}"/>'; y += 48
    d, _ = shape.text('mono', 500, f'github.com/openbrandexchange/{repo}', 22, M, H - M + 6)
    body += f'<path fill="{t["fg"]}" d="{d}"/>'
    d, _ = shape.text('mono', 500, 'openbrandexchange.com', 22, W - M, H - M + 6, anchor='end')
    body += f'<path fill="{t["muted"]}" d="{d}"/>'
    body += f'<rect x="0" y="{H - 16}" width="{W}" height="16" fill="{t["mark"]}"/>'
    nm = f'social/obx-social-{repo}'
    p = add(w(nm + '.svg', svg(W, H, body, f'{repo} - Open Brand Exchange')))
    png(p, nm + '.png', W); add(os.path.join(OUT, nm + '.png'))
for r, desc in REPOS.items(): social(r, desc)

print('\n'.join(sorted(files)))
