import micahUrl from './assets/micah.png';

// Hand-drawn SVG art for Micah Madness. All original, drawn in a 100x100 box.

export interface KindInfo {
  name: string;
  plural: string;
  color: string;
  svg: string;
}

const bone = `
<g transform="rotate(-30 50 50)">
  <rect x="26" y="41" width="48" height="18" rx="6" fill="#f6e7c8" stroke="#a8803f" stroke-width="3"/>
  <circle cx="24" cy="40" r="11" fill="#f6e7c8" stroke="#a8803f" stroke-width="3"/>
  <circle cx="24" cy="60" r="11" fill="#f6e7c8" stroke="#a8803f" stroke-width="3"/>
  <circle cx="76" cy="40" r="11" fill="#f6e7c8" stroke="#a8803f" stroke-width="3"/>
  <circle cx="76" cy="60" r="11" fill="#f6e7c8" stroke="#a8803f" stroke-width="3"/>
  <rect x="27" y="44" width="46" height="12" fill="#f6e7c8"/>
  <path d="M28 53 H72 V57.5 H28 Z" fill="#e4cb98"/>
  <path d="M15.5 63 A9 9 0 0 0 32.5 63 A11 11 0 0 1 15.5 63 Z M67.5 63 A9 9 0 0 0 84.5 63 A11 11 0 0 1 67.5 63 Z" fill="#e4cb98"/>
  <circle cx="16.5" cy="62" r="2.2" fill="#e4cb98"/><circle cx="83.5" cy="62" r="2.2" fill="#e4cb98"/>
  <path d="M30 46.5 h36" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>
  <path d="M17 37 A8 8 0 0 1 23 32" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>
  <path d="M69 37 A8 8 0 0 1 75 32" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>
  <circle cx="40" cy="51" r="1.2" fill="#c9a96c"/><circle cx="55" cy="49.5" r="1" fill="#c9a96c"/><circle cx="62" cy="52" r="1.2" fill="#c9a96c"/>
</g>`;

const ball = `
<circle cx="50" cy="50" r="34" fill="#cde33b" stroke="#7a8a14" stroke-width="3"/>
<path d="M82.5 40 A34 34 0 0 1 40 82.5 A44 44 0 0 0 82.5 40 Z" fill="#a3b91f"/>
<path d="M22 32 C40 42 40 58 22 68" fill="none" stroke="#d6dbc4" stroke-width="7" stroke-linecap="round"/>
<path d="M78 32 C60 42 60 58 78 68" fill="none" stroke="#d6dbc4" stroke-width="7" stroke-linecap="round"/>
<path d="M22 32 C40 42 40 58 22 68" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>
<path d="M78 32 C60 42 60 58 78 68" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>
<g fill="#e4f27a" opacity=".9"><circle cx="46" cy="24" r="1.3"/><circle cx="54" cy="30" r="1.1"/><circle cx="48" cy="40" r="1.2"/><circle cx="52" cy="56" r="1.1"/><circle cx="45" cy="66" r="1.3"/><circle cx="20" cy="50" r="1.1"/></g>
<g fill="#8fa31a" opacity=".7"><circle cx="70" cy="62" r="1.2"/><circle cx="56" cy="74" r="1.1"/><circle cx="64" cy="48" r="1"/><circle cx="80" cy="52" r="1.1"/></g>
<ellipse cx="38" cy="29" rx="8" ry="4" transform="rotate(-25 38 29)" fill="#fff" opacity=".6"/>
<circle cx="29" cy="38" r="2" fill="#fff" opacity=".5"/>`;

const paw = `
<path d="M50 47 C38 47 29 56 30 67 C31 76 40 80 50 78 C60 80 69 76 70 67 C71 56 62 47 50 47 Z" fill="#8e5bd6" stroke="#4f2a86" stroke-width="3" stroke-linejoin="round"/>
<path d="M32 70 C36 77 44 79 50 77.5 C57 79 65 77 68.5 70 C62 74 56 73 50 74 C44 73 38 74 32 70 Z" fill="#6c3fb5"/>
<ellipse cx="27" cy="42" rx="8" ry="10" transform="rotate(-18 27 42)" fill="#8e5bd6" stroke="#4f2a86" stroke-width="3"/>
<ellipse cx="41" cy="29" rx="8" ry="10" transform="rotate(-6 41 29)" fill="#8e5bd6" stroke="#4f2a86" stroke-width="3"/>
<ellipse cx="59" cy="29" rx="8" ry="10" transform="rotate(6 59 29)" fill="#8e5bd6" stroke="#4f2a86" stroke-width="3"/>
<ellipse cx="73" cy="42" rx="8" ry="10" transform="rotate(18 73 42)" fill="#8e5bd6" stroke="#4f2a86" stroke-width="3"/>
<path d="M22 46 Q26 51 32 48 M36 33 Q41 38 46 34 M54 34 Q59 38 64 33 M68 48 Q74 51 78 46" fill="none" stroke="#6c3fb5" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="24.5" cy="38" rx="2.6" ry="3.6" transform="rotate(-18 24.5 38)" fill="#fff" opacity=".55"/>
<ellipse cx="39" cy="25" rx="2.6" ry="3.6" transform="rotate(-6 39 25)" fill="#fff" opacity=".55"/>
<ellipse cx="57" cy="25" rx="2.6" ry="3.6" transform="rotate(6 57 25)" fill="#fff" opacity=".55"/>
<ellipse cx="71" cy="38" rx="2.6" ry="3.6" transform="rotate(18 71 38)" fill="#fff" opacity=".55"/>
<ellipse cx="42" cy="57" rx="8" ry="4" transform="rotate(-15 42 57)" fill="#fff" opacity=".4"/>
<circle cx="53" cy="55" r="1.8" fill="#fff" opacity=".4"/>`;

const bowl = `
<ellipse cx="50" cy="46" rx="33" ry="10" fill="#17599a"/>
<g stroke="#5a3214" stroke-width="1.2">
<circle cx="30" cy="45" r="5" fill="#8a5428"/><circle cx="70" cy="45" r="5" fill="#8a5428"/>
<circle cx="39" cy="41" r="5.5" fill="#a86b35"/><circle cx="61" cy="41" r="5.5" fill="#a86b35"/>
<circle cx="50" cy="38" r="6" fill="#b87a3e"/><circle cx="44" cy="46" r="5" fill="#94592a"/><circle cx="57" cy="46" r="5" fill="#94592a"/>
</g>
<g fill="#e3ad73"><circle cx="48" cy="35.5" r="1.6"/><circle cx="37.5" cy="39" r="1.4"/><circle cx="59.5" cy="39" r="1.4"/><circle cx="28.5" cy="43.5" r="1.1"/><circle cx="68.5" cy="43.5" r="1.1"/></g>
<path d="M16 46 L24 74 Q50 84 76 74 L84 46 Q50 58 16 46 Z" fill="#2f8fe0" stroke="#124b85" stroke-width="3" stroke-linejoin="round"/>
<path d="M68 54 L64 79 Q71 77.5 75 75 L81 53 Q75 54.5 68 54 Z" fill="#2274c2"/>
<path d="M19 49 Q50 61 81 49" fill="none" stroke="#8fd0ff" stroke-width="3.5" stroke-linecap="round"/>
<path d="M26 74.5 Q50 83 74 74.5" fill="none" stroke="#17599a" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
<path d="M24 58 L28 71" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
<text x="50" y="74" text-anchor="middle" font-size="13" font-weight="900" fill="#fff" stroke="#17599a" stroke-width="1" paint-order="stroke" font-family="sans-serif">M</text>`;

const lobster = `
<path d="M42 82 L36 92 Q50 96 64 92 L58 82 Z" fill="#c92a25" stroke="#9c1d19" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M50 84 V93 M43 84 L40 92 M57 84 L60 92" stroke="#9c1d19" stroke-width="1.6" opacity=".7"/>
<path d="M36 50 L27 47 M35 58 L26 58 M36 66 L28 70 M64 50 L73 47 M65 58 L74 58 M64 66 L72 70" stroke="#9c1d19" stroke-width="3" stroke-linecap="round"/>
<path d="M44 31 C40 20 32 12 22 10 M56 31 C60 20 68 12 78 10" fill="none" stroke="#9c1d19" stroke-width="2" stroke-linecap="round"/>
<path d="M50 30 C36 30 34 50 36 62 C38 76 46 84 50 84 C54 84 62 76 64 62 C66 50 64 30 50 30 Z" fill="#e8352f" stroke="#9c1d19" stroke-width="3"/>
<path d="M57 32 C63 38 64 50 63 62 C62 72 56 80 52 83 C56 76 58 66 58 56 C58 46 58 38 57 32 Z" fill="#c92a25"/>
<path d="M38 52 Q50 56 62 52 M37 62 Q50 66 63 62 M40 72 Q50 76 60 72" fill="none" stroke="#9c1d19" stroke-width="2.5" opacity=".75"/>
<path d="M42 55 Q50 58 56 55.5 M42 65 Q50 68 56 65.5" fill="none" stroke="#ff8a7a" stroke-width="2" stroke-linecap="round" opacity=".8"/>
<path d="M36 40 C24 38 18 28 20 18 C26 24 30 22 30 16 C38 22 38 32 38 38" fill="#e8352f" stroke="#9c1d19" stroke-width="3" stroke-linejoin="round"/>
<path d="M64 40 C76 38 82 28 80 18 C74 24 70 22 70 16 C62 22 62 32 62 38" fill="#e8352f" stroke="#9c1d19" stroke-width="3" stroke-linejoin="round"/>
<path d="M23 23 Q24 30 30 33 M77 23 Q76 30 70 33" fill="none" stroke="#ff8a7a" stroke-width="2" stroke-linecap="round"/>
<circle cx="25" cy="33" r="1.2" fill="#9c1d19"/><circle cx="75" cy="33" r="1.2" fill="#9c1d19"/><circle cx="29" cy="28" r="1" fill="#9c1d19"/><circle cx="71" cy="28" r="1" fill="#9c1d19"/>
<path d="M40 46 Q42 40 47 39" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>
<circle cx="43" cy="36" r="6" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="57" cy="36" r="6" fill="#fff" stroke="#222" stroke-width="2"/>
<circle cx="44" cy="37" r="2.6" fill="#222"/><circle cx="58" cy="37" r="2.6" fill="#222"/>
<circle cx="43" cy="35.6" r=".9" fill="#fff"/><circle cx="57" cy="35.6" r=".9" fill="#fff"/>
<path d="M46 45 Q50 48 54 45" fill="none" stroke="#9c1d19" stroke-width="2" stroke-linecap="round"/>`;

const cap = `
<path d="M20 60 C20 30 80 30 80 60 Z" fill="#ff7a1a" stroke="#a84600" stroke-width="3" stroke-linejoin="round"/>
<path d="M62 38.6 C72 40.5 80 47 80 60 L68 60 C68 51 66 44 62 38.6 Z" fill="#e8640c"/>
<path d="M50 36 V60 M50 37 C39 41 34 49 34 60 M50 37 C61 41 66 49 66 60" fill="none" stroke="#a84600" stroke-width="2" opacity=".55"/>
<path d="M25 58 C25 48 32 42 42 39.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="2.5 3" opacity=".55"/>
<circle cx="41" cy="45" r="1.6" fill="#a84600" opacity=".7"/><circle cx="59" cy="45" r="1.6" fill="#a84600" opacity=".7"/>
<circle cx="50" cy="31" r="4" fill="#ff9a4d" stroke="#a84600" stroke-width="2"/>
<path d="M14 60 H80 C88 60 92 66 88 70 C76 72 34 72 14 66 C10 64 10 60 14 60 Z" fill="#ff8f3d" stroke="#a84600" stroke-width="3" stroke-linejoin="round"/>
<path d="M16 64 C34 69 70 69.5 86 67" fill="none" stroke="#c75a10" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
<path d="M20 62.5 H78" stroke="#fff" stroke-width="1.4" stroke-dasharray="3 3" opacity=".6"/>
<g fill="#fff" opacity=".95"><ellipse cx="50" cy="52.5" rx="4" ry="3.2"/><circle cx="44.5" cy="48" r="1.7"/><circle cx="48" cy="45.5" r="1.7"/><circle cx="52" cy="45.5" r="1.7"/><circle cx="55.5" cy="48" r="1.7"/></g>
<path d="M30 44 Q36 38 44 39" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;

export const KINDS: KindInfo[] = [
  { name: 'Bone', plural: 'Bones', color: '#f6e7c8', svg: bone },
  { name: 'Ball', plural: 'Balls', color: '#cde33b', svg: ball },
  { name: 'Paw', plural: 'Paws', color: '#8e5bd6', svg: paw },
  { name: 'Bowl', plural: 'Bowls', color: '#2f8fe0', svg: bowl },
  { name: 'Lobster', plural: 'Lobsters', color: '#e8352f', svg: lobster },
  { name: 'Cap', plural: 'Caps', color: '#ff7a1a', svg: cap },
];

export { micahUrl };

/** Micah in her lobster costume (the player's own photo cut-out). */
export function micahFace(_opts: { cap?: boolean; lobster?: boolean; tongue?: boolean } = {}): string {
  return `<image href="${micahUrl}" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet"/>`;
}

export function svg(inner: string, cls = ''): string {
  return `<svg viewBox="0 0 100 100" class="${cls}" aria-hidden="true">${inner}</svg>`;
}

/** Micah's orthopedic bed: light blue, with a thick memory-foam cushion. Shared by the shop icon and the yard. */
export const ORTHO_BED = `
<path d="M8 58 C8 44 18 38 30 40 L70 40 C82 38 92 44 92 58 L92 74 Q92 84 80 84 L20 84 Q8 84 8 74 Z" fill="#8cc8ec" stroke="#3a7aa8" stroke-width="3" stroke-linejoin="round"/>
<path d="M18 58 Q18 50 28 50 L72 50 Q82 50 82 58 L82 66 Q82 72 74 72 L26 72 Q18 72 18 66 Z" fill="#eaf6ff" stroke="#3a7aa8" stroke-width="2.5"/>
<path d="M26 62 Q50 68 74 62" fill="none" stroke="#b8dcf2" stroke-width="3" stroke-linecap="round"/>
<circle cx="32" cy="57" r="1.8" fill="#b8dcf2"/><circle cx="50" cy="56" r="1.8" fill="#b8dcf2"/><circle cx="68" cy="57" r="1.8" fill="#b8dcf2"/>
<path d="M14 78 H86" stroke="#3a7aa8" stroke-width="2" opacity=".45"/>`;

/** Booster icons (shop, in-level tools). */
export const BOOSTER_ICONS: Record<string, string> = {
  treat: `<path d="M20 54 Q20 30 50 30 Q80 30 80 54 Q80 78 50 78 Q20 78 20 54Z" fill="#9a6230"/>
          <path d="M20 50 Q20 26 50 26 Q80 26 80 50 Q80 74 50 74 Q20 74 20 50Z" fill="#c98a4b" stroke="#6e4520" stroke-width="3"/>
          <path d="M27 40 Q34 31 46 30" fill="none" stroke="#e8b47a" stroke-width="4" stroke-linecap="round"/>
          <path d="M62 66 Q72 62 75 54" fill="none" stroke="#ad7038" stroke-width="3" stroke-linecap="round"/>
          <path d="M34 44 l4 -3 l4 2 l-1 5 l-5 1 Z M55 37 l4 -2 l4 3 l-2 4 l-5 0 Z M48 55 l5 -2 l3 4 l-3 4 l-5 -1 Z M64 50 l3 -2 l3 3 l-2 3 l-4 0 Z M32 58 l3 -1 l2 3 l-3 2 Z" fill="#5a3415"/>
          <path d="M35 43 l2 -1 M56 37 l2 -1 M49 55 l2 -1" stroke="#9a6a40" stroke-width="1.4" stroke-linecap="round"/>
          <circle cx="44" cy="64" r="1.4" fill="#8a5527"/><circle cx="68" cy="40" r="1.2" fill="#8a5527"/><circle cx="40" cy="34" r="1.1" fill="#8a5527"/>
          <circle cx="84" cy="70" r="2" fill="#c98a4b"/><circle cx="88" cy="64" r="1.3" fill="#c98a4b"/>`,
  squirrel: `<path d="M62 78 C90 70 92 30 70 22 C58 18 52 30 60 38 C70 46 66 60 56 62" fill="#b06a2c" stroke="#6e3e14" stroke-width="3"/>
          <ellipse cx="42" cy="62" rx="16" ry="18" fill="#c27a38" stroke="#6e3e14" stroke-width="3"/>
          <circle cx="36" cy="38" r="12" fill="#c27a38" stroke="#6e3e14" stroke-width="3"/>
          <path d="M30 28 L28 18 L36 26 Z" fill="#c27a38" stroke="#6e3e14" stroke-width="2"/>
          <circle cx="32" cy="36" r="2.5" fill="#222"/><circle cx="25" cy="40" r="2" fill="#5a2d10"/>
          <ellipse cx="44" cy="66" rx="7" ry="9" fill="#f0c48e"/>`,
  leash: `<path d="M20 80 C30 60 30 40 50 34 C70 28 78 40 70 52 C62 64 44 58 50 44" fill="none" stroke="#2f8fe0" stroke-width="7" stroke-linecap="round"/>
          <circle cx="20" cy="80" r="7" fill="#999" stroke="#555" stroke-width="3"/>
          <text x="66" y="84" font-size="26" font-weight="900" fill="#2b9a46" font-family="sans-serif" text-anchor="middle">+5</text>`,
  dust: `<path d="M30 52 Q24 86 50 86 Q76 86 70 52 Z" fill="#8e5bd6" stroke="#5a3392" stroke-width="3" stroke-linejoin="round"/>
          <path d="M30 52 Q50 44 70 52" fill="none" stroke="#5a3392" stroke-width="3"/>
          <path d="M34 50 L40 40 M66 50 L60 40" stroke="#ffd23f" stroke-width="4" stroke-linecap="round"/>
          <ellipse cx="42" cy="68" rx="5" ry="8" fill="#fff" opacity=".3"/>
          <path d="M50 8 L54 20 L66 24 L54 28 L50 40 L46 28 L34 24 L46 20 Z" fill="#ffd23f" stroke="#b58a00" stroke-width="2" stroke-linejoin="round"/>
          <path d="M78 26 L80 32 L86 34 L80 36 L78 42 L76 36 L70 34 L76 32 Z" fill="#ffd23f" stroke="#b58a00" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="24" cy="30" r="3.5" fill="#ffd23f"/><circle cx="84" cy="56" r="2.5" fill="#ffd23f"/>`,
  bed: ORTHO_BED,
  zoomies: `<circle cx="52" cy="53" r="30" fill="#c99400"/>
          <circle cx="50" cy="50" r="30" fill="#ffd23f" stroke="#a87e00" stroke-width="3"/>
          <path d="M71 34 A30 30 0 0 1 54 79.7 A26 26 0 0 0 71 34 Z" fill="#f2b71c"/>
          <path d="M14 40 H40 M8 50 H36 M14 60 H40" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
          <path d="M60 39 L78 50 L60 61 Q57 50 60 39 Z" fill="#a87e00" stroke="#a87e00" stroke-width="2" stroke-linejoin="round"/>
          <path d="M34 28 Q44 22 54 23" fill="none" stroke="#fff6c8" stroke-width="4" stroke-linecap="round"/>`,
  micah: micahFace({ cap: true }),
  bark: `<path d="M50 12 L58 30 L78 22 L72 42 L90 50 L72 58 L78 78 L58 70 L50 88 L42 70 L22 78 L28 58 L10 50 L28 42 L22 22 L42 30 Z" fill="#e8352f" stroke="#a3201c" stroke-width="3" stroke-linejoin="round"/>
          <circle cx="50" cy="50" r="18" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="6 5"/>`,
  // A golden biscuit coin stamped with a paw, so it never reads as a star.
  biscuit: `<circle cx="50" cy="52" r="38" fill="#b9771f"/>
          <circle cx="50" cy="48" r="38" fill="#f2b84b" stroke="#a8691a" stroke-width="3"/>
          <circle cx="50" cy="48" r="29" fill="none" stroke="#d99a32" stroke-width="3" stroke-dasharray="3 5"/>
          <ellipse cx="50" cy="58" rx="12" ry="10" fill="#a8691a"/>
          <ellipse cx="34" cy="44" rx="5.5" ry="7" fill="#a8691a"/><ellipse cx="44" cy="35" rx="5.5" ry="7" fill="#a8691a"/>
          <ellipse cx="56" cy="35" rx="5.5" ry="7" fill="#a8691a"/><ellipse cx="66" cy="44" rx="5.5" ry="7" fill="#a8691a"/>
          <path d="M28 30 Q36 20 48 18" fill="none" stroke="#fff3c8" stroke-width="4" stroke-linecap="round" opacity=".8"/>`,
  mud: `<path d="M14 60 C10 40 30 30 44 36 C54 22 82 28 82 46 C94 52 90 74 72 74 C60 84 32 82 26 74 C14 74 10 66 14 60Z" fill="#7a5233" stroke="#4f331d" stroke-width="3"/>
          <path d="M20 66 C26 72 40 76 52 74 C64 76 78 72 84 62 C86 70 80 75 72 74 C60 84 32 82 26 74 C20 74 18 70 20 66Z" fill="#5e3d24"/>
          <ellipse cx="40" cy="50" rx="9" ry="4.5" fill="#9a7050"/><ellipse cx="62" cy="60" rx="7" ry="3.5" fill="#9a7050"/>
          <path d="M34 48.5 Q38 46 43 47" fill="none" stroke="#e6cdb4" stroke-width="2" stroke-linecap="round"/>
          <circle cx="66" cy="42" r="3" fill="#a8896a" stroke="#4f331d" stroke-width="1.5"/><circle cx="28" cy="62" r="2.2" fill="#a8896a" stroke="#4f331d" stroke-width="1.2"/>
          <circle cx="86" cy="36" r="3" fill="#7a5233"/><circle cx="92" cy="44" r="1.8" fill="#7a5233"/>`,
  yarn: `<circle cx="50" cy="52" r="32" fill="#e86aa6" stroke="#963066" stroke-width="3"/>
          <path d="M72 30 A32 32 0 0 1 54 83.7 A28 28 0 0 0 72 30 Z" fill="#cc4f8c"/>
          <path d="M24 40 C40 30 64 30 80 44 M20 56 C40 44 66 46 82 62 M28 74 C44 62 64 64 74 78 M44 22 C34 40 34 64 42 82" fill="none" stroke="#a83a72" stroke-width="3" stroke-linecap="round"/>
          <path d="M26 46 C42 36 62 36 78 50 M24 64 C42 52 64 54 78 70 M50 21 C42 40 42 62 50 83" fill="none" stroke="#ff9cc8" stroke-width="2" stroke-linecap="round"/>
          <path d="M30 34 Q38 26 48 25" fill="none" stroke="#ffd0e5" stroke-width="3.5" stroke-linecap="round"/>
          <path d="M78 74 C88 82 90 90 84 94" fill="none" stroke="#a83a72" stroke-width="3" stroke-linecap="round"/>`,
};

/** A fallen autumn leaf (the leaves goal). */
BOOSTER_ICONS.leaves = `<path d="M50 10 L58 30 L78 22 L70 44 L90 48 L72 62 L78 80 L56 72 L50 90 L44 72 L22 80 L28 62 L10 48 L30 44 L22 22 L42 30 Z" fill="#e8892f" stroke="#a8501a" stroke-width="3" stroke-linejoin="round"/>
          <path d="M50 10 L58 30 L78 22 L70 44 L90 48 L72 62 L78 80 L56 72 L50 90 Z" fill="#d4741f"/>
          <path d="M50 30 V92 M50 52 L66 40 M50 64 L34 52 M50 42 L38 32 M50 74 L64 64" fill="none" stroke="#a8501a" stroke-width="3" stroke-linecap="round"/>
          <path d="M66 40 L76 30 M34 52 L22 46 M64 64 L74 72" fill="none" stroke="#a8501a" stroke-width="2" stroke-linecap="round"/>
          <path d="M36 26 L42 36" stroke="#ffc27a" stroke-width="2.5" stroke-linecap="round"/>`;
/** A snow drift (mud on winter levels). */
BOOSTER_ICONS.snow = `<path d="M10 74 C12 54 30 46 42 52 C50 34 80 36 84 56 C94 58 94 74 88 78 Z" fill="#ffffff" stroke="#8fb3cc" stroke-width="3" stroke-linejoin="round"/>
          <path d="M30 64 Q42 58 54 64 M60 60 Q70 56 78 62" fill="none" stroke="#cfe2ee" stroke-width="3" stroke-linecap="round"/>
          <path d="M66 14 V34 M57 19 L75 29 M57 29 L75 19" stroke="#8fb3cc" stroke-width="3" stroke-linecap="round"/>`;

/** A soap bubble (the bubbles goal). */
BOOSTER_ICONS.bubbles = `<circle cx="44" cy="54" r="30" fill="#bfeaf7" fill-opacity=".55" stroke="#5fb8d6" stroke-width="3"/>
          <circle cx="74" cy="28" r="14" fill="#bfeaf7" fill-opacity=".55" stroke="#5fb8d6" stroke-width="3"/>
          <path d="M28 42 Q32 32 42 30" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
          <circle cx="70" cy="23" r="3" fill="#fff"/><circle cx="60" cy="70" r="4" fill="#ffb8d9" opacity=".7"/>`;

/** A see-through soap bubble drawn over a soapy cell, so the piece inside still reads. */
/** A delivery parcel on the board. `taped` adds the red tape that takes a second tear. */
export const parcelSVG = (taped: boolean) => `
  <path d="M14 34 L50 20 L86 34 L86 78 L50 92 L14 78 Z" fill="#c98f52" stroke="#6e4a26" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M14 34 L50 48 L86 34 M50 48 V92" fill="none" stroke="#6e4a26" stroke-width="3" stroke-linejoin="round"/>
  <path d="M14 34 L50 48 L50 92 L14 78 Z" fill="#b07a42"/>
  <path d="M32 27 L68 41 V52 L62 49 V43 L32 31 Z" fill="#e6c08a"/>
  <path d="M60 64 l4 -2 l2 3 l-4 2 Z M68 60 l4 -2 l2 3 l-4 2 Z" fill="#6e4a26" opacity=".55"/>
  <ellipse cx="68" cy="70" rx="6" ry="5" fill="#6e4a26" opacity=".55"/>
  ${taped ? `<path d="M14 52 L50 66 L86 52 M30 28 L66 42 L66 86" fill="none" stroke="#e8352f" stroke-width="7" stroke-linejoin="round" opacity=".95"/>
  <path d="M14 52 L50 66 L86 52" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 5" opacity=".7"/>` : ''}`;
BOOSTER_ICONS.boxes = parcelSVG(false);

/** A prickly burr, the kind that comes home in Micah's fur. */
const burrBall = (cx: number, cy: number, r: number) => {
  let spikes = '';
  let hooks = '';
  for (let i = 0; i < 12; i++) {
    const a = (i * 30) * Math.PI / 180;
    const b = a + Math.PI / 12, hx = cx + Math.cos(b) * r * 0.55, hy = cy + Math.sin(b) * r * 0.55;
    hooks += `M${(hx - Math.cos(b + 1.2) * r * 0.12).toFixed(1)} ${(hy - Math.sin(b + 1.2) * r * 0.12).toFixed(1)} L${(hx + Math.cos(b + 1.2) * r * 0.12).toFixed(1)} ${(hy + Math.sin(b + 1.2) * r * 0.12).toFixed(1)} `;
    spikes += `M${(cx + Math.cos(a) * r * 0.7).toFixed(1)} ${(cy + Math.sin(a) * r * 0.7).toFixed(1)} L${(cx + Math.cos(a) * r * 1.35).toFixed(1)} ${(cy + Math.sin(a) * r * 1.35).toFixed(1)} `;
  }
  return `<path d="${spikes}" stroke="#6b5a1e" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#9a8a2e" stroke="#6b5a1e" stroke-width="2.4"/><path d="M${cx + r * 0.95} ${cy + r * 0.3} A${r} ${r} 0 0 1 ${cx - r * 0.3} ${cy + r * 0.95} A${r * 1.2} ${r * 1.2} 0 0 0 ${cx + r * 0.95} ${cy + r * 0.3} Z" fill="#7d6f22"/><path d="${hooks}" fill="none" stroke="#5a4a14" stroke-width="${Math.max(1, r * 0.08).toFixed(1)}" stroke-linecap="round"/><circle cx="${cx - r * 0.3}" cy="${cy - r * 0.3}" r="${r * 0.28}" fill="#c9b64a"/>`;
};
BOOSTER_ICONS.burrs = burrBall(50, 52, 26);
export const BURR_OVERLAY = `<svg viewBox="0 0 100 100" class="burr-art" aria-hidden="true">${burrBall(22, 24, 11)}${burrBall(78, 76, 11)}${burrBall(80, 22, 7)}</svg>`;

export const BUBBLE_OVERLAY = `<svg viewBox="0 0 100 100" class="soap-film" aria-hidden="true">
  <circle cx="50" cy="50" r="44" fill="#d8f4ff" fill-opacity=".38" stroke="#5fc0e4" stroke-width="6"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="#ffb8d9" stroke-width="2" stroke-dasharray="40 240" stroke-dashoffset="-120" opacity=".8"/>
  <path d="M22 40 Q26 24 42 19" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".9"/>
  <circle cx="70" cy="74" r="4" fill="#fff" opacity=".8"/>
</svg>`;

/** Loose strands drawn over a tangled cell; see-through so the piece underneath still reads. */
export const YARN_OVERLAY = `<svg viewBox="0 0 100 100" class="yarn-strands" aria-hidden="true" preserveAspectRatio="none">
  <path d="M-4 22 C30 6 62 40 104 18 M-4 52 C26 34 70 70 104 46 M-4 82 C34 62 66 98 104 76" fill="none" stroke="#e86aa6" stroke-width="7" stroke-linecap="round"/>
  <path d="M18 -4 C6 34 40 62 22 104 M74 -4 C92 36 56 64 80 104" fill="none" stroke="#ff9cc8" stroke-width="6" stroke-linecap="round"/>
</svg>`;

/** Interface icons from the Lucide set (ISC licence), all on a 24px grid at the same stroke weight. */
export const UI = {
  album: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>`,
  paw: `<svg viewBox="0 0 24 24" class="ui-icon paw-icon" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="16" rx="5" ry="4.2"/><ellipse cx="5.5" cy="10.5" rx="2.2" ry="2.8"/><ellipse cx="9.5" cy="6.5" rx="2.2" ry="2.8"/><ellipse cx="14.5" cy="6.5" rx="2.2" ry="2.8"/><ellipse cx="18.5" cy="10.5" rx="2.2" ry="2.8"/></svg>`,
  share: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>`,
  vibrate: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M3 9v6"/><path d="M21 9v6"/></svg>`,
  back: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>`,
  close: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  soundOn: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.4 18.4a9 9 0 0 0 0-12.8"/></svg>`,
  musicOn: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  musicOff: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="m3 3 18 18"/></svg>`,
  soundOff: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  check: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  home: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  gift: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>`,
  shirt: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`,
  bag: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  award: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  star: `<svg viewBox="0 0 24 24" class="star-icon" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M11.5 2.3a.5.5 0 0 1 1 0l2.3 4.7a2.1 2.1 0 0 0 1.6 1.2l5.2.8a.5.5 0 0 1 .3.9l-3.8 3.7a2.1 2.1 0 0 0-.6 1.9l.9 5.2a.5.5 0 0 1-.8.6l-4.6-2.5a2.1 2.1 0 0 0-2 0l-4.6 2.5a.5.5 0 0 1-.8-.6l.9-5.2a2.1 2.1 0 0 0-.6-1.9L1.9 9.9a.5.5 0 0 1 .3-.9l5.2-.8a2.1 2.1 0 0 0 1.6-1.2z"/></svg>`,
};
