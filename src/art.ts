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
  dust: `<path d="M30 52 Q24 86 50 86 Q76 86 70 52 Z" fill="#8e5bd6" stroke="#5a3392" stroke-width="3" stroke-linejoin="round"/>
          <path d="M30 52 Q50 44 70 52" fill="none" stroke="#5a3392" stroke-width="3"/>
          <path d="M34 50 L40 40 M66 50 L60 40" stroke="#ffd23f" stroke-width="4" stroke-linecap="round"/>
          <ellipse cx="42" cy="68" rx="5" ry="8" fill="#fff" opacity=".3"/>
          <path d="M50 8 L54 20 L66 24 L54 28 L50 40 L46 28 L34 24 L46 20 Z" fill="#ffd23f" stroke="#b58a00" stroke-width="2" stroke-linejoin="round"/>
          <path d="M78 26 L80 32 L86 34 L80 36 L78 42 L76 36 L70 34 L76 32 Z" fill="#ffd23f" stroke="#b58a00" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="24" cy="30" r="3.5" fill="#ffd23f"/><circle cx="84" cy="56" r="2.5" fill="#ffd23f"/>`,
  bed: ORTHO_BED,
  zoomies: `<circle cx="50" cy="50" r="30" fill="#ffd23f" stroke="#b58a00" stroke-width="3"/>
          <path d="M14 40 H40 M10 50 H36 M14 60 H40" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
          <path d="M60 40 L76 50 L60 60 Z" fill="#b58a00"/>`,
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
          <ellipse cx="40" cy="50" rx="8" ry="4" fill="#9a7050"/><ellipse cx="62" cy="60" rx="6" ry="3" fill="#9a7050"/>`,
  yarn: `<circle cx="50" cy="52" r="32" fill="#e86aa6" stroke="#a83a72" stroke-width="3"/>
          <path d="M24 40 C40 30 64 30 80 44 M20 56 C40 44 66 46 82 62 M28 74 C44 62 64 64 74 78 M44 22 C34 40 34 64 42 82" fill="none" stroke="#a83a72" stroke-width="3" stroke-linecap="round"/>
          <path d="M78 74 C88 82 90 90 84 94" fill="none" stroke="#a83a72" stroke-width="3" stroke-linecap="round"/>`,
};

/** A fallen autumn leaf (the leaves goal). */
BOOSTER_ICONS.leaves = `<path d="M50 10 L58 30 L78 22 L70 44 L90 48 L72 62 L78 80 L56 72 L50 90 L44 72 L22 80 L28 62 L10 48 L30 44 L22 22 L42 30 Z" fill="#e8892f" stroke="#a8501a" stroke-width="3" stroke-linejoin="round"/>
          <path d="M50 30 V92 M50 52 L66 40 M50 64 L34 52" fill="none" stroke="#a8501a" stroke-width="3" stroke-linecap="round"/>`;
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
  for (let i = 0; i < 12; i++) {
    const a = (i * 30) * Math.PI / 180;
    spikes += `M${(cx + Math.cos(a) * r * 0.7).toFixed(1)} ${(cy + Math.sin(a) * r * 0.7).toFixed(1)} L${(cx + Math.cos(a) * r * 1.35).toFixed(1)} ${(cy + Math.sin(a) * r * 1.35).toFixed(1)} `;
  }
  return `<path d="${spikes}" stroke="#6b5a1e" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#9a8a2e" stroke="#6b5a1e" stroke-width="2.4"/><circle cx="${cx - r * 0.3}" cy="${cy - r * 0.3}" r="${r * 0.28}" fill="#c9b64a"/>`;
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
