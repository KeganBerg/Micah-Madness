// Hand-drawn SVG art for Micah Madness. All original, drawn in a 100x100 box.

export interface KindInfo {
  name: string;
  plural: string;
  color: string;
  svg: string;
}

const bone = `
<g transform="rotate(-30 50 50)">
  <rect x="26" y="41" width="48" height="18" rx="6" fill="#f6e7c8" stroke="#b8925a" stroke-width="3"/>
  <circle cx="24" cy="40" r="11" fill="#f6e7c8" stroke="#b8925a" stroke-width="3"/>
  <circle cx="24" cy="60" r="11" fill="#f6e7c8" stroke="#b8925a" stroke-width="3"/>
  <circle cx="76" cy="40" r="11" fill="#f6e7c8" stroke="#b8925a" stroke-width="3"/>
  <circle cx="76" cy="60" r="11" fill="#f6e7c8" stroke="#b8925a" stroke-width="3"/>
  <rect x="27" y="44" width="46" height="12" fill="#f6e7c8"/>
  <path d="M30 46 h36" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
</g>`;

const ball = `
<circle cx="50" cy="50" r="34" fill="#cde33b" stroke="#87981c" stroke-width="3"/>
<path d="M22 32 C40 42 40 58 22 68" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
<path d="M78 32 C60 42 60 58 78 68" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
<ellipse cx="38" cy="30" rx="8" ry="4" fill="#fff" opacity=".45"/>`;

const paw = `
<ellipse cx="50" cy="63" rx="20" ry="17" fill="#8e5bd6" stroke="#5a3392" stroke-width="3"/>
<ellipse cx="27" cy="42" rx="8" ry="10" fill="#8e5bd6" stroke="#5a3392" stroke-width="3"/>
<ellipse cx="41" cy="29" rx="8" ry="10" fill="#8e5bd6" stroke="#5a3392" stroke-width="3"/>
<ellipse cx="59" cy="29" rx="8" ry="10" fill="#8e5bd6" stroke="#5a3392" stroke-width="3"/>
<ellipse cx="73" cy="42" rx="8" ry="10" fill="#8e5bd6" stroke="#5a3392" stroke-width="3"/>
<ellipse cx="44" cy="58" rx="7" ry="4" fill="#fff" opacity=".35"/>`;

const bowl = `
<ellipse cx="50" cy="44" rx="32" ry="9" fill="#7a4a24"/>
<circle cx="40" cy="41" r="5" fill="#a86b35"/><circle cx="52" cy="39" r="5" fill="#a86b35"/><circle cx="62" cy="42" r="5" fill="#a86b35"/><circle cx="47" cy="45" r="4" fill="#94592a"/>
<path d="M16 46 L24 74 Q50 84 76 74 L84 46 Q50 58 16 46 Z" fill="#2f8fe0" stroke="#17599a" stroke-width="3"/>
<path d="M24 56 Q50 66 76 56" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>
<text x="50" y="74" text-anchor="middle" font-size="12" font-weight="900" fill="#fff" font-family="sans-serif">M</text>`;

const lobster = `
<path d="M50 30 C36 30 34 50 36 62 C38 76 46 84 50 84 C54 84 62 76 64 62 C66 50 64 30 50 30 Z" fill="#e8352f" stroke="#9c1d19" stroke-width="3"/>
<path d="M38 52 h24 M37 62 h26 M40 72 h20" stroke="#9c1d19" stroke-width="2.5" opacity=".7"/>
<path d="M36 40 C24 38 18 28 20 18 C26 24 30 22 30 16 C38 22 38 32 38 38" fill="#e8352f" stroke="#9c1d19" stroke-width="3" stroke-linejoin="round"/>
<path d="M64 40 C76 38 82 28 80 18 C74 24 70 22 70 16 C62 22 62 32 62 38" fill="#e8352f" stroke="#9c1d19" stroke-width="3" stroke-linejoin="round"/>
<circle cx="43" cy="36" r="6" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="57" cy="36" r="6" fill="#fff" stroke="#222" stroke-width="2"/>
<circle cx="44" cy="37" r="2.6" fill="#222"/><circle cx="58" cy="37" r="2.6" fill="#222"/>`;

const cap = `
<path d="M20 60 C20 30 80 30 80 60 Z" fill="#ff7a1a" stroke="#b54d00" stroke-width="3" stroke-linejoin="round"/>
<path d="M50 32 V60" stroke="#b54d00" stroke-width="2.5" opacity=".6"/>
<circle cx="50" cy="31" r="4" fill="#ff9a4d" stroke="#b54d00" stroke-width="2"/>
<path d="M14 60 H80 C88 60 92 66 88 70 C76 72 34 72 14 66 C10 64 10 60 14 60 Z" fill="#ff8f3d" stroke="#b54d00" stroke-width="3" stroke-linejoin="round"/>
<path d="M30 44 Q38 38 46 40" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;

export const KINDS: KindInfo[] = [
  { name: 'Bone', plural: 'Bones', color: '#f6e7c8', svg: bone },
  { name: 'Ball', plural: 'Balls', color: '#cde33b', svg: ball },
  { name: 'Paw', plural: 'Paws', color: '#8e5bd6', svg: paw },
  { name: 'Bowl', plural: 'Bowls', color: '#2f8fe0', svg: bowl },
  { name: 'Lobster', plural: 'Lobsters', color: '#e8352f', svg: lobster },
  { name: 'Cap', plural: 'Caps', color: '#ff7a1a', svg: cap },
];

/** Micah: black dog, grey muzzle, wearing an orange cap. */
export function micahFace(opts: { cap?: boolean; lobster?: boolean; tongue?: boolean } = {}): string {
  const { cap: wearCap = true, lobster: wearLobster = false, tongue = true } = opts;
  const lobsterHood = wearLobster
    ? `<path d="M14 58 C10 22 90 22 86 58 C80 40 20 40 14 58 Z" fill="#e8352f" stroke="#9c1d19" stroke-width="3"/>
       <circle cx="36" cy="22" r="8" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="64" cy="22" r="8" fill="#fff" stroke="#222" stroke-width="2"/>
       <circle cx="37" cy="23" r="3.5" fill="#222"/><circle cx="65" cy="23" r="3.5" fill="#222"/>`
    : '';
  const capSvg = wearCap && !wearLobster
    ? `<path d="M24 36 C24 12 76 12 76 36 Z" fill="#ff7a1a" stroke="#b54d00" stroke-width="3"/>
       <path d="M22 36 H86 C92 36 92 42 86 43 C70 44 40 44 22 41 Z" fill="#ff8f3d" stroke="#b54d00" stroke-width="3" stroke-linejoin="round"/>
       <circle cx="50" cy="15" r="3" fill="#ff9a4d"/>`
    : '';
  return `
  <path d="M22 34 C8 36 6 62 14 72 C20 76 26 66 28 54 Z" fill="#1d1b1f"/>
  <path d="M78 34 C92 36 94 62 86 72 C80 76 74 66 72 54 Z" fill="#1d1b1f"/>
  <ellipse cx="50" cy="52" rx="30" ry="30" fill="#29262b"/>
  <ellipse cx="50" cy="70" rx="17" ry="14" fill="#8d8a90"/>
  <ellipse cx="50" cy="66" rx="12" ry="8" fill="#a7a4aa"/>
  <ellipse cx="50" cy="62" rx="7" ry="5" fill="#111"/>
  <ellipse cx="48" cy="60.5" rx="2.4" ry="1.4" fill="#fff" opacity=".5"/>
  <path d="M50 67 V72 M42 74 Q50 80 58 74" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>
  ${tongue ? '<path d="M46 76 Q50 88 54 76 Z" fill="#f27b9b" stroke="#c24d6e" stroke-width="1.5"/>' : ''}
  <circle cx="38" cy="48" r="6" fill="#4a2d1a"/><circle cx="62" cy="48" r="6" fill="#4a2d1a"/>
  <circle cx="39.5" cy="46" r="2" fill="#fff"/><circle cx="63.5" cy="46" r="2" fill="#fff"/>
  <path d="M32 40 Q36 37 40 39 M60 39 Q64 37 68 40" stroke="#6b686e" stroke-width="2" fill="none" stroke-linecap="round"/>
  ${lobsterHood}${capSvg}`;
}

export function svg(inner: string, cls = ''): string {
  return `<svg viewBox="0 0 100 100" class="${cls}" aria-hidden="true">${inner}</svg>`;
}

/** Booster icons (shop, in-level tools). */
export const BOOSTER_ICONS: Record<string, string> = {
  treat: `<path d="M20 50 Q20 26 50 26 Q80 26 80 50 Q80 74 50 74 Q20 74 20 50Z" fill="#c98a4b" stroke="#7a4f25" stroke-width="3"/>
          <circle cx="38" cy="44" r="4" fill="#7a4f25"/><circle cx="58" cy="40" r="4" fill="#7a4f25"/><circle cx="52" cy="58" r="4" fill="#7a4f25"/><circle cx="66" cy="54" r="3" fill="#7a4f25"/>`,
  squirrel: `<path d="M62 78 C90 70 92 30 70 22 C58 18 52 30 60 38 C70 46 66 60 56 62" fill="#b06a2c" stroke="#6e3e14" stroke-width="3"/>
          <ellipse cx="42" cy="62" rx="16" ry="18" fill="#c27a38" stroke="#6e3e14" stroke-width="3"/>
          <circle cx="36" cy="38" r="12" fill="#c27a38" stroke="#6e3e14" stroke-width="3"/>
          <path d="M30 28 L28 18 L36 26 Z" fill="#c27a38" stroke="#6e3e14" stroke-width="2"/>
          <circle cx="32" cy="36" r="2.5" fill="#222"/><circle cx="25" cy="40" r="2" fill="#5a2d10"/>
          <ellipse cx="44" cy="66" rx="7" ry="9" fill="#f0c48e"/>`,
  leash: `<path d="M20 80 C30 60 30 40 50 34 C70 28 78 40 70 52 C62 64 44 58 50 44" fill="none" stroke="#2f8fe0" stroke-width="7" stroke-linecap="round"/>
          <circle cx="20" cy="80" r="7" fill="#999" stroke="#555" stroke-width="3"/>
          <text x="66" y="84" font-size="26" font-weight="900" fill="#2b9a46" font-family="sans-serif" text-anchor="middle">+5</text>`,
  zoomies: `<circle cx="50" cy="50" r="30" fill="#ffd23f" stroke="#b58a00" stroke-width="3"/>
          <path d="M14 40 H40 M10 50 H36 M14 60 H40" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
          <path d="M60 40 L76 50 L60 60 Z" fill="#b58a00"/>`,
  micah: micahFace({ cap: true }),
  biscuit: `<path d="M50 18 L58 34 L76 30 L70 48 L84 60 L66 66 L64 84 L50 74 L36 84 L34 66 L16 60 L30 48 L24 30 L42 34 Z" fill="#e3a64e" stroke="#94631c" stroke-width="3" stroke-linejoin="round"/>
          <circle cx="44" cy="46" r="3" fill="#94631c"/><circle cx="56" cy="52" r="3" fill="#94631c"/><circle cx="48" cy="60" r="3" fill="#94631c"/>`,
  mud: `<path d="M14 60 C10 40 30 30 44 36 C54 22 82 28 82 46 C94 52 90 74 72 74 C60 84 32 82 26 74 C14 74 10 66 14 60Z" fill="#7a5233" stroke="#4f331d" stroke-width="3"/>
          <ellipse cx="40" cy="50" rx="8" ry="4" fill="#9a7050"/><ellipse cx="62" cy="60" rx="6" ry="3" fill="#9a7050"/>`,
};
