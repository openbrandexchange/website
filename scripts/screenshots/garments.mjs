// Flat product illustrations for the fictional Kestrel Outfitters fixtures.
//
// The spec's fixture images are colour swatches with the file name printed on them: right for
// tests, unreadable in a marketing screenshot. For the website screenshots only, every fixture
// image is redrawn as a simple, clearly illustrated garment in the fixture colour (same file
// name, same 1200×1500 size). The admin-ui and its data are not changed.

const COLORS = {
  NVY: '#233052',
  OAT: '#d8cbb1',
  BLK: '#232326',
  OLV: '#5d6140',
  RST: '#a44a2c',
  WHT: '#f3f1ec',
  IND: '#2f3f6e',
  COG: '#8e5a2c',
  YLW: '#e2b224',
};

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => {
  const [x, y] = [hex(a), hex(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
const shade = (c, t) => mix(c, '#000000', t);
const tint = (c, t) => mix(c, '#ffffff', t);

/** Garment shapes, drawn on a 1200×1500 canvas. Each returns SVG markup for one view. */
const shapes = {
  sweater(c, view) {
    const body = `M455 355 Q600 ${view === 'back' ? 380 : 445} 745 355 L900 405 Q975 430 1005 500 L1075 1060 L985 1085 L925 640 L918 1150 L282 1150 L275 640 L215 1085 L125 1060 L195 500 Q225 430 300 405 Z`;
    return `
      <path d="${body}" fill="${c}"/>
      <path d="${body}" fill="url(#sheen)"/>
      <path d="M282 1100 L918 1100 L918 1150 L282 1150 Z" fill="${shade(c, 0.12)}"/>
      <path d="M985 1085 L1075 1060 L1068 1010 L979 1034 Z M215 1085 L125 1060 L132 1010 L221 1034 Z" fill="${shade(c, 0.12)}"/>
      ${view === 'back' ? `<path d="M455 355 Q600 380 745 355" stroke="${shade(c, 0.18)}" stroke-width="22" fill="none"/>` : `<path d="M455 355 Q600 445 745 355" stroke="${shade(c, 0.18)}" stroke-width="26" fill="none"/>`}
      <path d="M275 640 L282 1100 M925 640 L918 1100" stroke="${shade(c, 0.1)}" stroke-width="4" fill="none"/>
      ${ribs(282, 918, 1106, 1146, c)}`;
  },
  jacket(c, view) {
    const body = `M455 350 Q600 400 745 350 L905 400 Q980 425 1010 500 L1080 1065 L990 1090 L930 650 L925 1170 L275 1170 L270 650 L210 1090 L120 1065 L190 500 Q220 425 295 400 Z`;
    const front = `
      <path d="M455 350 L540 470 L600 420 L660 470 L745 350 L720 330 L600 380 L480 330 Z" fill="${shade(c, 0.22)}"/>
      <path d="M600 420 L600 1170" stroke="${shade(c, 0.3)}" stroke-width="10"/>
      <rect x="330" y="820" width="200" height="190" rx="10" fill="${shade(c, 0.08)}"/>
      <path d="M322 820 L538 820 L538 880 Q430 905 322 880 Z" fill="${shade(c, 0.18)}"/>
      <rect x="670" y="820" width="200" height="190" rx="10" fill="${shade(c, 0.08)}"/>
      <path d="M662 820 L878 820 L878 880 Q770 905 662 880 Z" fill="${shade(c, 0.18)}"/>
      ${[560, 700, 840, 980].map((y) => `<circle cx="630" cy="${y}" r="9" fill="${tint(c, 0.35)}"/>`).join('')}`;
    const back = `<path d="M270 560 Q600 600 930 560" stroke="${shade(c, 0.2)}" stroke-width="6" fill="none"/><path d="M455 350 Q600 400 745 350 L730 330 Q600 372 470 330 Z" fill="${shade(c, 0.22)}"/>`;
    return `
      <path d="${body}" fill="${c}"/>
      <path d="${body}" fill="url(#sheen)"/>
      <path d="M990 1090 L1080 1065 L1073 1020 L983 1043 Z M210 1090 L120 1065 L127 1020 L217 1043 Z" fill="${shade(c, 0.18)}"/>
      ${view === 'back' ? back : front}`;
  },
  tee(c, view) {
    const body = `M470 360 Q600 ${view === 'back' ? 385 : 440} 730 360 L880 410 L1045 590 L950 690 L895 630 L900 1150 L300 1150 L305 630 L250 690 L155 590 L320 410 Z`;
    return `
      <path d="${body}" fill="${c}"/>
      <path d="${body}" fill="url(#sheen)"/>
      <path d="M470 360 Q600 ${view === 'back' ? 385 : 440} 730 360" stroke="${shade(c, 0.16)}" stroke-width="18" fill="none"/>
      <path d="M950 690 L1045 590 L1030 574 L936 672 Z M250 690 L155 590 L170 574 L264 672 Z" fill="${shade(c, 0.1)}"/>
      <path d="M300 1118 L900 1118" stroke="${shade(c, 0.12)}" stroke-width="4"/>`;
  },
  jeans(c, view) {
    const legs = `M385 300 L815 300 L840 1260 L640 1260 L600 640 L560 1260 L360 1260 Z`;
    return `
      <path d="${legs}" fill="${c}"/>
      <path d="${legs}" fill="url(#sheen)"/>
      <rect x="385" y="300" width="430" height="62" fill="${shade(c, 0.15)}"/>
      ${[430, 530, 670, 770].map((x) => `<rect x="${x - 9}" y="296" width="18" height="74" rx="4" fill="${shade(c, 0.25)}"/>`).join('')}
      ${
        view === 'back'
          ? `<path d="M420 430 L560 430 L555 590 L490 620 L425 590 Z M640 430 L780 430 L775 590 L710 620 L645 590 Z" fill="none" stroke="#c9a15a" stroke-width="5" stroke-dasharray="14 9"/>`
          : `<path d="M600 362 L600 640" stroke="${shade(c, 0.28)}" stroke-width="6"/><path d="M400 380 Q470 470 540 400 M800 380 Q730 470 660 400" stroke="#c9a15a" stroke-width="5" stroke-dasharray="14 9" fill="none"/><circle cx="600" cy="331" r="13" fill="#c9a15a"/>`
      }
      <path d="M362 1225 L562 1225 M638 1225 L838 1225" stroke="#c9a15a" stroke-width="5" stroke-dasharray="14 9"/>`;
  },
  jeansDetail(c) {
    let weave = '';
    for (let i = -1500; i < 1500; i += 26) weave += `<path d="M${i} 0 L${i + 1500} 1500" stroke="${tint(c, 0.08)}" stroke-width="7"/>`;
    return `
      <rect x="0" y="0" width="1200" height="1500" fill="${c}"/>
      ${weave}
      <path d="M220 360 L980 360 L960 1040 L600 1160 L240 1040 Z" fill="${shade(c, 0.08)}"/>
      <path d="M250 390 L950 390 L932 1015 L600 1125 L268 1015 Z" fill="none" stroke="#c9a15a" stroke-width="9" stroke-dasharray="26 16"/>
      <circle cx="260" cy="380" r="30" fill="#b08a4a"/><circle cx="260" cy="380" r="14" fill="#8a6a36"/>
      <circle cx="940" cy="380" r="30" fill="#b08a4a"/><circle cx="940" cy="380" r="14" fill="#8a6a36"/>`;
  },
  bag(c, view) {
    if (view === 'side') {
      return `
        <path d="M430 620 Q600 540 770 620 L800 1120 L400 1120 Z" fill="${c}"/>
        <path d="M430 620 Q600 540 770 620 L800 1120 L400 1120 Z" fill="url(#sheen)"/>
        <ellipse cx="600" cy="860" rx="150" ry="170" fill="${shade(c, 0.12)}"/>
        <path d="M600 560 L600 380" stroke="${shade(c, 0.35)}" stroke-width="30" stroke-linecap="round"/>`;
    }
    if (view === 'inside') {
      return `
        <rect x="200" y="470" width="800" height="560" rx="120" fill="${c}"/>
        <rect x="270" y="530" width="660" height="440" rx="80" fill="#3a3430"/>
        <rect x="330" y="600" width="240" height="160" rx="16" fill="#4a423c"/>
        <path d="M270 750 L930 750" stroke="#c9a15a" stroke-width="10"/>`;
    }
    const body = `M220 700 Q220 610 320 610 L880 610 Q980 610 980 700 L980 1060 Q980 1120 920 1120 L280 1120 Q220 1120 220 1060 Z`;
    return `
      <path d="M380 640 Q380 360 600 360 Q820 360 820 640" stroke="${shade(c, 0.3)}" stroke-width="34" fill="none" stroke-linecap="round"/>
      <path d="${body}" fill="${c}"/>
      <path d="${body}" fill="url(#sheen)"/>
      <path d="M240 660 L960 660" stroke="#c9a15a" stroke-width="12"/>
      <rect x="560" y="640" width="36" height="70" rx="8" fill="#b08a4a"/>
      <path d="M300 760 L300 1080 M900 760 L900 1080" stroke="${shade(c, 0.22)}" stroke-width="8" stroke-dasharray="18 12"/>
      <rect x="420" y="820" width="360" height="200" rx="18" fill="${shade(c, 0.1)}"/>`;
  },
  beanie(c) {
    return `
      <path d="M300 900 Q300 420 600 420 Q900 420 900 900 Z" fill="${c}"/>
      <path d="M300 900 Q300 420 600 420 Q900 420 900 900 Z" fill="url(#sheen)"/>
      ${Array.from({ length: 12 }, (_, i) => `<path d="M${340 + i * 47} 890 Q${345 + i * 40} 560 ${600 + (i - 5.5) * 12} 450" stroke="${shade(c, 0.12)}" stroke-width="5" fill="none"/>`).join('')}
      <rect x="280" y="860" width="640" height="200" rx="26" fill="${shade(c, 0.1)}"/>
      ${ribs(290, 910, 875, 1045, shade(c, 0.1), 24)}
      <rect x="520" y="920" width="160" height="80" rx="6" fill="${tint(c, 0.75)}"/>`;
  },
  shorts(c, view) {
    const body = `M360 420 L840 420 L890 980 L640 1000 L600 700 L560 1000 L310 980 Z`;
    return `
      <path d="${body}" fill="${c}"/>
      <path d="${body}" fill="url(#sheen)"/>
      <rect x="360" y="420" width="480" height="70" rx="10" fill="${shade(c, 0.2)}"/>
      ${view === 'back' ? `<rect x="660" y="560" width="130" height="110" rx="10" fill="${shade(c, 0.12)}"/>` : `<path d="M580 490 L570 560 M620 490 L630 560" stroke="${tint(c, 0.6)}" stroke-width="6"/><path d="M322 900 L560 925 M878 900 L640 925" stroke="${tint(c, 0.35)}" stroke-width="8"/>`}`;
  },
  shell(c, view) {
    const body = `M445 400 L905 420 Q980 445 1010 520 L1080 1075 L990 1100 L930 670 L925 1180 L275 1180 L270 670 L210 1100 L120 1075 L190 520 Q220 445 295 420 Z`;
    const hood = `M420 430 Q400 230 600 210 Q800 230 780 430 Q700 470 600 470 Q500 470 420 430 Z`;
    return `
      <path d="${hood}" fill="${shade(c, 0.08)}"/>
      <path d="${body}" fill="${c}"/>
      <path d="${body}" fill="url(#sheen)"/>
      ${
        view === 'back'
          ? `<path d="M270 600 Q600 640 930 600" stroke="${shade(c, 0.15)}" stroke-width="6" fill="none"/>`
          : `<path d="M480 300 Q600 250 720 300 L700 440 Q600 470 500 440 Z" fill="${shade(c, 0.35)}"/>
             <path d="M600 440 L600 1180" stroke="${shade(c, 0.4)}" stroke-width="12"/>
             <path d="M330 760 L500 700 M870 760 L700 700" stroke="${shade(c, 0.3)}" stroke-width="10" stroke-linecap="round"/>`
      }
      <path d="M990 1100 L1080 1075 L1073 1030 L983 1053 Z M210 1100 L120 1075 L127 1030 L217 1053 Z" fill="${shade(c, 0.2)}"/>`;
  },
  model(c) {
    // An abstract figure for the (fictional) AI-generated model image of the tee.
    return `
      <circle cx="600" cy="300" r="120" fill="#c9a88c"/>
      <rect x="560" y="400" width="80" height="80" fill="#c09d80"/>
      <path d="M430 470 Q600 530 770 470 L905 520 L1010 760 L920 800 L860 660 L860 1260 L340 1260 L340 660 L280 800 L190 760 L295 520 Z" fill="${c}"/>
      <path d="M430 470 Q600 530 770 470 L905 520 L1010 760 L920 800 L860 660 L860 1260 L340 1260 L340 660 L280 800 L190 760 L295 520 Z" fill="url(#sheen)"/>
      <path d="M190 760 L280 800 L300 1160 L230 1170 Z M1010 760 L920 800 L900 1160 L970 1170 Z" fill="#c09d80"/>`;
  },
};

function ribs(x1, x2, y1, y2, c, step = 18) {
  let out = '';
  for (let x = x1 + step / 2; x < x2; x += step) out += `<path d="M${x} ${y1} L${x} ${y2}" stroke="${shade(c, 0.22)}" stroke-width="3"/>`;
  return out;
}

const productShape = {
  'KO-1001': 'sweater',
  'KO-1002': 'jacket',
  'KO-1003': 'tee',
  'KO-1004': 'jeans',
  'KO-1005': 'bag',
  'KO-1006': 'beanie',
  'KT-2001': 'shorts',
  'KT-2002': 'shell',
};

/** SVG for a fixture file name such as KO-1001_NVY_2_back.png. */
export function garmentSvg(file) {
  const m = /^([A-Z]{2}-\d{4})_([A-Z]{3})_(\d+)_(\w+)\.png$/.exec(file);
  if (!m) throw new Error(`unexpected fixture name ${file}`);
  const [, style, code, , view] = m;
  const color = COLORS[code] ?? '#777777';
  let shape = productShape[style] ?? 'tee';
  if (style === 'KO-1004' && view === 'detail') shape = 'jeansDetail';
  if (view === 'model') shape = 'model';
  const bg = view === 'model' ? '#e4e1da' : '#efede8';
  const art = shapes[shape](color, view);
  const full = shape === 'jeansDetail';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
  <defs>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.14"/>
    </linearGradient>
    <radialGradient id="bg" cx="0.5" cy="0.42" r="0.75">
      <stop offset="0" stop-color="${tint(bg, 0.5)}"/>
      <stop offset="1" stop-color="${bg}"/>
    </radialGradient>
    <radialGradient id="floor" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#000000" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="1500" fill="url(#bg)"/>
  ${full ? '' : '<ellipse cx="600" cy="1290" rx="430" ry="46" fill="url(#floor)"/>'}
  ${art}
</svg>`;
}
