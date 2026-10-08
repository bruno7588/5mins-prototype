// figma-conventions audit. Run with use_figma after replacing SECTION_ID.
// Read-only: it changes nothing. Walks frames you built (skips instance internals).
const SECTION_ID = 'SECTION_ID';

const sec = await figma.getNodeByIdAsync(SECTION_ID);
if (!sec) throw new Error('Section not found: ' + SECTION_ID);
let page = sec; while (page.type !== 'PAGE') page = page.parent;
await figma.setCurrentPageAsync(page);

const SCREEN_NAME = /^.+ · \d{2} · .+$/;
const DEFAULT_NAME = /^(Frame|Group|Rectangle|Modal\/Full screen)( \d+)?$/;
// Vector artwork may skip auto-layout.
const ARTWORK = /illustration|icon|confetti|tick|logo|vuesax|io5|bs\//i;
const MAX = 40;

const out = {
  noAutoLayout: [], spacers: [], defaultNames: [], unboundGap: [], unboundPadding: [], unboundRadius: [],
  rawFills: [], rawStrokes: [], unstyledText: [], nonPoppins: [], localNonProposed: [],
  badScreenNames: [], badScreenWidth: [], duplicateScreens: [], counts: { frames: 0, autoLayout: 0, instances: 0, texts: 0 },
};
const push = (list, v) => { if (list.length < MAX) list.push(v); };
const label = n => `${n.name} (${n.id})`;

async function walk(n) {
  if (n.type === 'INSTANCE') {
    out.counts.instances++;
    const mc = await n.getMainComponentAsync();
    if (mc && !mc.remote) {
      const name = mc.parent && mc.parent.type === 'COMPONENT_SET' ? mc.parent.name : mc.name;
      if (!/\(proposed\)/.test(name)) push(out.localNonProposed, `${label(n)} -> ${name}`);
    }
    return; // never audit instance internals
  }
  const bv = n.boundVariables || {};
  if (n.type === 'FRAME' || n.type === 'COMPONENT') {
    out.counts.frames++;
    if (n.name === 'Spacer' || (n.children.length === 0 && /spacer/i.test(n.name))) push(out.spacers, label(n));
    if (DEFAULT_NAME.test(n.name)) push(out.defaultNames, label(n));
    if (n.layoutMode === 'NONE') {
      if (!ARTWORK.test(n.name) && n.children.length > 0) push(out.noAutoLayout, label(n));
    } else {
      out.counts.autoLayout++;
      if (n.itemSpacing && !bv.itemSpacing && n.primaryAxisAlignItems !== 'SPACE_BETWEEN') push(out.unboundGap, `${label(n)} gap=${n.itemSpacing}`);
      for (const p of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) {
        if (n[p] && !bv[p]) { push(out.unboundPadding, `${label(n)} ${p}=${n[p]}`); break; }
      }
    }
    if (typeof n.cornerRadius === 'number' && n.cornerRadius > 0 && !bv.topLeftRadius) push(out.unboundRadius, `${label(n)} r=${n.cornerRadius}`);
  }
  if ('fills' in n && Array.isArray(n.fills)) {
    for (const f of n.fills) if (f.type === 'SOLID' && f.visible !== false && !(f.boundVariables && f.boundVariables.color)) { push(out.rawFills, label(n)); break; }
  }
  if ('strokes' in n && Array.isArray(n.strokes)) {
    for (const f of n.strokes) if (f.type === 'SOLID' && f.visible !== false && !(f.boundVariables && f.boundVariables.color)) { push(out.rawStrokes, label(n)); break; }
  }
  if (n.type === 'TEXT') {
    out.counts.texts++;
    if (!n.textStyleId || n.textStyleId === figma.mixed) push(out.unstyledText, `${label(n)} "${n.characters.slice(0, 30)}"`);
    if (n.fontName !== figma.mixed && n.fontName.family !== 'Poppins') push(out.nonPoppins, `${label(n)} ${n.fontName.family}`);
  }
  if ('children' in n) for (const c of n.children) await walk(c);
}

// Screens: 1536-ish frames directly in the section (or a nested section).
const screens = [];
function collectScreens(parent) {
  for (const c of parent.children) {
    if (c.type === 'SECTION') collectScreens(c);
    else if (c.type === 'FRAME' && c.name !== 'Proposed components' && c.width >= 1200 && c.height >= 700) screens.push(c);
  }
}
collectScreens(sec);
for (const s of screens) {
  if (!SCREEN_NAME.test(s.name)) push(out.badScreenNames, label(s));
  if (Math.round(s.width) !== 1536) push(out.badScreenWidth, `${label(s)} w=${Math.round(s.width)}`);
}
// Identical neighbours in a row: same y, consecutive x, same visible layers and same text.
const sig = s => {
  const all = s.findAll(n => n.visible);
  return all.length + '|' + all.filter(n => n.type === 'TEXT').map(t => t.characters).join('|');
};
const rows = {};
for (const s of screens) (rows[Math.round(s.y)] = rows[Math.round(s.y)] || []).push(s);
for (const row of Object.values(rows)) {
  row.sort((a, b) => a.x - b.x);
  for (let i = 1; i < row.length; i++) if (sig(row[i]) === sig(row[i - 1])) push(out.duplicateScreens, `${label(row[i])} looks like ${label(row[i - 1])}`);
}

for (const c of sec.children) await walk(c);

const summary = Object.fromEntries(Object.entries(out).filter(([k]) => k !== 'counts').map(([k, v]) => [k, v.length]));
return { section: label(sec), screens: screens.length, counts: out.counts, summary, findings: out };
