// The living scene behind a level: Micah's own world for the area you're playing in.
// Sky and weather fill the screen behind the board; a little landscape strip sits in the
// space under the item bar, where Micah runs back and forth chasing something, jumping
// over whatever is in her way.
//
// Built for older phones: every moving part is an HTML box animated with transform or
// opacity only (no filters, no shadows), so the browser can slide them on the GPU without
// repainting. The only SVG-internal animation is Micah's legs, a small area.
import { backdropProps } from './scenery';

type Chase = 'butterfly' | 'ball' | 'crab' | 'squirrel' | 'yarn' | 'snowball' | 'frisbee' | 'balloon' | 'frog' | 'firefly' | 'leaf' | 'star';
type Weather = 'snow' | 'rain' | 'confetti' | 'leaves' | 'stars' | '';
type Outfit = 'bandana' | 'cap' | 'lobster' | 'mud' | 'party' | 'scarf' | 'rosette' | 'raincoat' | 'nightcap' | '';

interface Look {
  sky: string;
  far: string;   // distant hills (or the sea at the beach)
  hill: string;  // nearer hills
  ground: string;
  path: string;  // the strip Micah runs along
  speck: [string, string]; // ground texture: dark, light
  sun: 'sun' | 'sunset' | 'moon' | '';
  cloud: string; // '' = no clouds
  weather: Weather;
  chase: Chase;
  outfit: Outfit;
}

/** One look per area, in the order of ZONES in levels.ts. Skies are a shade deeper than the map's so the white cards stand out. */
export const LOOKS: Look[] = [
  { sky: '#8ccff2', far: '#a9dc9a', hill: '#6fb35f', ground: '#7db86a', path: '#dcbf8e', speck: ['#5f9c4f', '#ffffff'], sun: 'sun', cloud: '#ffffff', weather: '', chase: 'butterfly', outfit: 'bandana' },
  { sky: '#f2bf86', far: '#a7cf8a', hill: '#4f914e', ground: '#5c9f5a', path: '#e6dfcf', speck: ['#3f7f40', '#7fbd78'], sun: 'sun', cloud: '#fff4e4', weather: '', chase: 'ball', outfit: 'cap' },
  { sky: '#7fcdee', far: '#2f8fe0', hill: '#58b4ec', ground: '#e9cf98', path: '#f6e6c0', speck: ['#cba762', '#fff6e0'], sun: 'sun', cloud: '#ffffff', weather: '', chase: 'crab', outfit: 'lobster' },
  { sky: '#a5c9ad', far: '#86b07f', hill: '#5e8a55', ground: '#9a7a5a', path: '#c9a679', speck: ['#6f8a3e', '#b49572'], sun: '', cloud: '#eef5ea', weather: '', chase: 'squirrel', outfit: 'mud' },
  { sky: '#b59ae6', far: '#cbb3f1', hill: '#9f84d6', ground: '#d99a8f', path: '#ffe9a8', speck: ['#ffe9a8', '#fff'], sun: '', cloud: '', weather: 'confetti', chase: 'yarn', outfit: 'party' },
  { sky: '#a6cfe8', far: '#e8f2f9', hill: '#cfe2ee', ground: '#e4eff6', path: '#ffffff', speck: ['#c4dae7', '#ffffff'], sun: '', cloud: '#f4f9fc', weather: 'snow', chase: 'snowball', outfit: 'scarf' },
  { sky: '#8fb4e8', far: '#b4d39f', hill: '#6aa35e', ground: '#7fa3d4', path: '#f4efe2', speck: ['#ffffff', '#9fbde6'], sun: 'sun', cloud: '#ffffff', weather: '', chase: 'frisbee', outfit: 'rosette' },
  { sky: '#f4adc4', far: '#ffd3e0', hill: '#ee9db5', ground: '#e7a3b8', path: '#fff3c4', speck: ['#fff3c4', '#fff'], sun: '', cloud: '#fff2f6', weather: 'confetti', chase: 'balloon', outfit: 'party' },
  { sky: '#8799ad', far: '#7d9286', hill: '#5f7a6a', ground: '#6f8a7a', path: '#b9a888', speck: ['#55705f', '#9fc3d6'], sun: '', cloud: '#c3ccd6', weather: 'rain', chase: 'frog', outfit: 'raincoat' },
  { sky: '#f0a46a', far: '#b9806a', hill: '#3a6e37', ground: '#4f8a4b', path: '#d2b98a', speck: ['#3a6e37', '#7a5233'], sun: 'sunset', cloud: '#ffd6b0', weather: '', chase: 'firefly', outfit: 'bandana' },
  { sky: '#f5c07a', far: '#e2a160', hill: '#c97a3a', ground: '#c9884a', path: '#f1d9a8', speck: ['#e07a1f', '#ffc12e'], sun: 'sun', cloud: '#fff1dc', weather: 'leaves', chase: 'leaf', outfit: 'scarf' },
  { sky: '#2e2b6a', far: '#3b3880', hill: '#46448e', ground: '#5b5a9e', path: '#8e8acb', speck: ['#ffffff', '#8e8acb'], sun: 'moon', cloud: '', weather: 'stars', chase: 'star', outfit: 'nightcap' },
];

// ───────────────────────────── Micah, side on ─────────────────────────────

const FUR = '#22252b';
const FUR_FAR = '#15171b';
const MUZZLE = '#8c9198';

/** Outfit layers: drawn under the body (capes, tails), on the body, and on the head. */
function outfit(o: Outfit): { body?: string; over: string; head: string } {
  switch (o) {
    case 'bandana':
      return { over: `<path d="M62 28 L76 30 L70 42 Z" fill="#e8352f"/><circle cx="69" cy="33" r="1.2" fill="#fff"/>`, head: '' };
    case 'cap':
      return { over: '', head: `<path d="M64 12 Q76 -4 90 10 Z" fill="#f08a24"/><path d="M86 9 Q96 8 101 12 L88 13 Z" fill="#d9731a"/><circle cx="77" cy="2" r="2" fill="#d9731a"/>` };
    case 'lobster':
      return {
        body: '#e8352f',
        over: `<path d="M30 30 Q34 44 30 48 M40 26 Q44 42 40 50 M50 26 Q54 42 50 50" stroke="#b8241f" stroke-width="2" fill="none"/>`,
        head: `<path d="M62 20 Q62 2 78 2 Q90 3 92 12 Q80 8 70 16 Z" fill="#e8352f"/>
          <path d="M74 4 Q76 -10 90 -14 M80 5 Q86 -6 98 -6" stroke="#b8241f" stroke-width="2" fill="none" stroke-linecap="round"/>
          <circle cx="76" cy="3" r="2.4" fill="#fff"/><circle cx="76.6" cy="3" r="1.2" fill="#1b1b1b"/>`,
      };
    case 'mud':
      return { over: `<ellipse cx="34" cy="44" rx="5" ry="3" fill="#7a5233"/><ellipse cx="54" cy="46" rx="4" ry="2.5" fill="#7a5233"/><circle cx="44" cy="30" r="2" fill="#7a5233"/>`, head: `<circle cx="70" cy="12" r="1.8" fill="#7a5233"/>` };
    case 'party':
      return { over: '', head: `<path d="M66 8 L74 -16 L84 6 Z" fill="#2f8fe0"/><path d="M68.5 1 L80 -2 M71 -6 L78 -8" stroke="#ffc12e" stroke-width="2.4"/><circle cx="74" cy="-16" r="3" fill="#ffc12e"/>` };
    case 'scarf':
      return { over: `<path d="M60 26 Q70 34 80 28 L80 34 Q70 40 60 32 Z" fill="#e8352f"/><g class="bd-flap"><path d="M64 32 L52 40 L55 44 L66 36 Z" fill="#e8352f"/><path d="M53 41 l-2 3 M56 43 l-2 3" stroke="#e8352f" stroke-width="1.4"/></g>`, head: '' };
    case 'rosette':
      return { over: `<circle cx="70" cy="36" r="5.5" fill="#2f8fe0"/><circle cx="70" cy="36" r="2.6" fill="#ffc12e"/><path d="M68 40 L66 48 M72 40 L74 48" stroke="#2f8fe0" stroke-width="2.4"/>`, head: '' };
    case 'raincoat':
      return {
        body: '#ffc12e',
        over: `<path d="M30 26 V48 M48 24 V50" stroke="#e0a21a" stroke-width="1.5"/>`,
        head: `<path d="M62 22 Q60 2 78 2 Q92 3 92 14 Q82 6 70 18 Z" fill="#ffc12e"/><path d="M90 12 Q96 14 98 18" stroke="#e0a21a" stroke-width="2" fill="none"/>`,
      };
    case 'nightcap':
      return { over: '', head: `<path d="M64 12 Q74 -6 88 8 Z" fill="#2f8fe0"/><path d="M66 8 Q58 -6 50 -2 L52 2 Q60 0 66 12 Z" fill="#2f8fe0"/><circle cx="50" cy="0" r="3.4" fill="#fff"/><path d="M64 12 Q76 6 88 8" stroke="#fff" stroke-width="3" fill="none"/>` };
    default:
      return { over: '', head: '' };
  }
}

/** Micah galloping to the right, feet on y=64. Legs swing from the hip and shoulder. */
export function runnerSVG(o: Outfit): string {
  const fit = outfit(o);
  const body = fit.body ?? FUR;
  const leg = (x: number, y: number, cls: string, fill: string) =>
    `<g transform="translate(${x} ${y})"><g class="bd-leg ${cls}"><rect x="-4" y="-2" width="8.5" height="24" rx="4.2" fill="${fill}"/><ellipse cx="0.5" cy="21" rx="5" ry="3" fill="${fill}"/></g></g>`;
  return `<svg class="bd-runner" viewBox="-6 -22 112 90" width="84" height="68" aria-hidden="true">
    <g class="bd-bob">
      <g transform="translate(22 30)"><g class="bd-tail"><path d="M0 0 Q-10 -6 -14 -18" stroke="${body}" stroke-width="6" fill="none" stroke-linecap="round"/></g></g>
      ${leg(28, 40, 'b2', FUR_FAR)}${leg(64, 40, 'f2', FUR_FAR)}
      <ellipse cx="46" cy="36" rx="27" ry="14" fill="${body}"/>
      ${fit.over}
      ${leg(32, 40, 'b1', FUR)}${leg(68, 40, 'f1', FUR)}
      <g class="bd-head">
        <circle cx="76" cy="18" r="14" fill="${FUR}"/>
        <ellipse cx="90" cy="24" rx="11" ry="7.5" fill="${MUZZLE}"/>
        <ellipse cx="100" cy="21" rx="3.6" ry="3" fill="#111"/>
        <path d="M88 30 Q90 40 95 38 Q96 33 94 30 Z" fill="#ff8fa3"/>
        <circle cx="81" cy="13" r="3" fill="#fff"/><circle cx="82" cy="13" r="1.9" fill="#111"/><circle cx="82.6" cy="12.3" r=".6" fill="#fff"/>
        <g transform="translate(70 8)"><g class="bd-ear"><path d="M0 0 C-8 0 -12 12 -8 20 C-4 21 0 14 3 4 Z" fill="${FUR}" stroke="${FUR_FAR}" stroke-width="1.4"/></g></g>
        ${fit.head}
      </g>
    </g>
  </svg>`;
}

// ───────────────────────────── what she chases ─────────────────────────────

const CHASE: Record<Chase, { svg: string; move: 'hop' | 'flutter' | 'roll' | 'tumble' | 'scuttle' | 'glide'; air: boolean; trail?: string }> = {
  butterfly: { move: 'flutter', air: true, svg: `<g class="bd-wings"><ellipse cx="-5" cy="-3" rx="5" ry="6.5" fill="#ffc12e"/><ellipse cx="5" cy="-3" rx="5" ry="6.5" fill="#ffc12e"/><ellipse cx="-4" cy="4" rx="3.6" ry="3.6" fill="#ff8fb1"/><ellipse cx="4" cy="4" rx="3.6" ry="3.6" fill="#ff8fb1"/></g><rect x="-1" y="-7" width="2" height="13" rx="1" fill="#2b2b2b"/>` },
  ball: { move: 'hop', air: false, svg: `<circle r="8" fill="#cde33b" stroke="#87981c" stroke-width="1.5"/><path d="M-5.5 -5.5 Q-1.5 0 -5.5 5.5 M5.5 -5.5 Q1.5 0 5.5 5.5" stroke="#fff" stroke-width="1.7" fill="none" stroke-linecap="round"/>` },
  crab: { move: 'scuttle', air: false, svg: `<path d="M-9 2 l-5 4 M-8 4 l-4 5 M9 2 l5 4 M8 4 l4 5" stroke="#c42a25" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="10" ry="6.5" fill="#e8352f"/><path d="M-9 -3 Q-16 -8 -12 -13 M9 -3 Q16 -8 12 -13" stroke="#e8352f" stroke-width="2.6" fill="none"/><circle cx="-12" cy="-13" r="3.2" fill="#e8352f"/><circle cx="12" cy="-13" r="3.2" fill="#e8352f"/><circle cx="-3" cy="-6" r="1.8" fill="#fff"/><circle cx="3" cy="-6" r="1.8" fill="#fff"/><circle cx="-3" cy="-6" r=".9" fill="#111"/><circle cx="3" cy="-6" r=".9" fill="#111"/>` },
  squirrel: { move: 'hop', air: false, svg: `<path d="M-6 2 Q-18 -2 -14 -14 Q-8 -20 -4 -12 Q-8 -6 -2 -2 Z" fill="#a8622f"/><ellipse cx="2" cy="1" rx="7" ry="5.5" fill="#c9773a"/><circle cx="8" cy="-4" r="4.2" fill="#c9773a"/><path d="M6 -8 l1 -3 l2 3 Z" fill="#c9773a"/><circle cx="9.5" cy="-5" r="1" fill="#111"/><circle cx="12" cy="-3.5" r=".9" fill="#5b3a1c"/>` },
  yarn: { move: 'roll', air: false, trail: '#8e5bd6', svg: `<circle r="8" fill="#8e5bd6"/><path d="M-6 -5 Q0 0 -6 5 M-2 -8 Q5 0 -2 8 M3 -7 Q8 0 3 7 M-8 0 Q0 -3 8 0" stroke="#6a3fb0" stroke-width="1.3" fill="none"/>` },
  snowball: { move: 'roll', air: false, svg: `<circle r="8" fill="#fff" stroke="#c7dbe8" stroke-width="1.5"/><circle cx="-2.5" cy="-2.5" r="1.4" fill="#dbe9f2"/><circle cx="3" cy="2" r="1.8" fill="#dbe9f2"/>` },
  frisbee: { move: 'glide', air: true, svg: `<ellipse rx="11" ry="4" fill="#e8352f"/><ellipse rx="6.5" ry="2.1" fill="#fff" opacity=".4"/>` },
  balloon: { move: 'flutter', air: true, svg: `<path d="M0 10 Q-4 18 0 26" stroke="#fff" stroke-width="1.2" fill="none"/><ellipse cx="0" cy="-2" rx="9" ry="11" fill="#e8352f"/><path d="M-1.6 9 L1.6 9 L0 7 Z" fill="#e8352f"/><ellipse cx="-3" cy="-6" rx="2.4" ry="3.6" fill="#fff" opacity=".45"/>` },
  frog: { move: 'hop', air: false, svg: `<ellipse cx="0" cy="1" rx="9" ry="6" fill="#5fae4f"/><path d="M-9 4 Q-13 6 -9 7 M9 4 Q13 6 9 7" stroke="#4a9440" stroke-width="2.4" fill="none"/><circle cx="-4" cy="-5" r="3.4" fill="#5fae4f"/><circle cx="4" cy="-5" r="3.4" fill="#5fae4f"/><circle cx="-4" cy="-5.5" r="1.4" fill="#111"/><circle cx="4" cy="-5.5" r="1.4" fill="#111"/><path d="M-3 2 Q0 4 3 2" stroke="#2f6a2a" stroke-width="1" fill="none"/>` },
  firefly: { move: 'flutter', air: true, svg: `<circle r="10" fill="#fff3a0" opacity=".35" class="bd-glow"/><circle r="4.5" fill="#ffe14d"/><ellipse cx="-3" cy="-4" rx="3" ry="2" fill="#fff" opacity=".7"/>` },
  leaf: { move: 'tumble', air: true, svg: `<path d="M-9 0 Q-2 -9 9 0 Q-2 9 -9 0 Z" fill="#e8892f"/><path d="M-9 0 H9" stroke="#b85a1a" stroke-width="1.2"/>` },
  star: { move: 'glide', air: true, trail: '#fff3a0', svg: `<path d="M0 -9 L2.6 -2.8 L9 -2.6 L4 1.6 L5.6 8 L0 4.4 L-5.6 8 L-4 1.6 L-9 -2.6 L-2.6 -2.8 Z" fill="#ffe14d"/>` },
};

function chaseSVG(c: Chase): string {
  const t = CHASE[c];
  // A thread of yarn or a star's tail trails behind it (to the left, since it runs right).
  const trail = !t.trail ? '' : c === 'star'
    ? `<path d="M-6 -2 L-34 -8 L-6 3 Z" fill="${t.trail}" opacity=".7"/>`
    : `<path d="M-6 5 Q-20 9 -30 6 T-52 8" stroke="${t.trail}" stroke-width="1.6" fill="none"/>`;
  return `<span class="bd-chase-art mv-${t.move}">${trail ? `<svg class="bd-trail" viewBox="-56 -14 70 28" width="70" height="28" aria-hidden="true">${trail}</svg>` : ''}<svg class="bd-thing" viewBox="-14 -14 28 28" width="28" height="28" aria-hidden="true" style="overflow:visible">${t.svg}</svg></span>`;
}

// ───────────────────────────── sky and weather ─────────────────────────────

/** A 120px tile as a CSS url(), safe inside a double-quoted style attribute. */
const enc = (s: string, size = 120) =>
  `url(&quot;data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>${s}</svg>`)}&quot;)`;

/** Speckles on the ground below the path, in the ground's own darker and lighter shades. */
const groundTile = (dark: string, light: string) =>
  enc(`<path d='M8 14 q1 -5 -1 -7 M12 14 q0 -6 1.5 -8' stroke='${dark}' stroke-width='1.6' fill='none' stroke-linecap='round'/><circle cx='40' cy='32' r='1.6' fill='${light}'/><path d='M50 52 q1 -5 -1 -7 M54 52 q0 -6 1.5 -8' stroke='${dark}' stroke-width='1.6' fill='none' stroke-linecap='round'/><circle cx='20' cy='50' r='1.3' fill='${dark}'/>`, 64);

function weatherTile(w: Weather): string {
  // Fixed positions so every visit looks the same; each tile is 120px and repeats seamlessly.
  const spots = [[12, 8], [70, 20], [40, 46], [100, 58], [18, 78], [80, 94], [54, 108], [104, 4], [6, 40], [62, 70]];
  switch (w) {
    case 'snow':
      return enc(spots.map(([x, y], i) => `<circle cx='${x}' cy='${y}' r='${1.4 + (i % 3) * 0.8}' fill='#fff' opacity='.9'/>`).join(''));
    case 'rain':
      return enc(spots.map(([x, y]) => `<path d='M${x} ${y} l-2 9' stroke='#e3edf5' stroke-width='1.4' stroke-linecap='round' opacity='.75'/>`).join(''));
    case 'confetti': {
      const c = ['#e8352f', '#ffc12e', '#2f8fe0', '#23925a', '#fff', '#8e5bd6'];
      return enc(spots.map(([x, y], i) => `<rect x='${x}' y='${y}' width='6' height='2.6' rx='1' fill='${c[i % c.length]}' transform='rotate(${(i * 47) % 180} ${x} ${y})'/>`).join(''));
    }
    case 'leaves': {
      const c = ['#e8892f', '#d9541f', '#ffc12e', '#b8401a'];
      return enc(spots.slice(0, 6).map(([x, y], i) => `<path d='M${x - 5} ${y} q4 -5 10 0 q-6 5 -10 0z' fill='${c[i % c.length]}' transform='rotate(${(i * 61) % 180} ${x} ${y})'/>`).join(''));
    }
    case 'stars':
      return enc(spots.map(([x, y], i) => `<circle cx='${x}' cy='${y}' r='${0.8 + (i % 3) * 0.5}' fill='#fff' opacity='${0.5 + (i % 2) * 0.4}'/>`).join(''));
    default:
      return '';
  }
}

const cloud = (c: string) =>
  `<svg viewBox="0 0 90 40" width="90" height="40" aria-hidden="true"><path d="M14 36 Q0 36 2 26 Q4 16 16 18 Q20 4 36 6 Q48 0 58 10 Q72 6 76 18 Q90 18 88 28 Q86 36 74 36 Z" fill="${c}"/></svg>`;

function sky(look: Look): string {
  let s = '';
  if (look.sun === 'sun') s += `<span class="bd-sun"></span>`;
  if (look.sun === 'sunset') s += `<span class="bd-sun bd-sunset"></span>`;
  if (look.sun === 'moon') s += `<span class="bd-sun bd-moon"></span>`;
  if (look.cloud) {
    // Each cloud rides a full-width track so it can drift across any screen width.
    s += [0, 1, 2].map((i) => `<div class="bd-cloud c${i}">${cloud(look.cloud)}</div>`).join('');
  }
  const tile = weatherTile(look.weather);
  if (tile) s += `<div class="bd-weather bd-${look.weather}" style="background-image:${tile}"></div>`;
  if (look.weather === 'stars') s += `<div class="bd-weather bd-twinkle" style="background-image:${tile};background-position:60px 60px"></div>`;
  return s;
}

function hills(look: Look, zone: number): string {
  // The beach gets the sea on the horizon instead of distant hills.
  const far = zone === 2
    ? `<rect x="0" y="22" width="400" height="40" fill="${look.far}"/><path d="M0 24 q12 -5 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0" stroke="#fff" stroke-width="2.5" fill="none" opacity=".8"/>`
    : `<path d="M0 30 Q50 6 110 24 T230 18 T340 22 T400 16 V60 H0 Z" fill="${look.far}"/>`;
  const near = zone === 2 ? '' : `<path d="M0 44 Q70 22 150 40 T300 34 T400 38 V60 H0 Z" fill="${look.hill}"/>`;
  return `<svg class="bd-hills" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">${far}${near}</svg>`;
}

/** The whole backdrop for a level in `zone`. Goes first inside the game screen. */
export function backdropHTML(zone: number): string {
  const look = LOOKS[zone % LOOKS.length];
  const props = backdropProps(zone);
  const xs = [5, 27, 69, 86, 99]; // the middle stays clear for the hurdle
  const back = props.back
    .map((svg, i) => `<svg class="bd-prop" style="left:${xs[i]}%" viewBox="-50 -90 100 92" width="80" height="74" aria-hidden="true">${svg}</svg>`)
    .join('');
  const chase = CHASE[look.chase];
  return `<div class="backdrop" aria-hidden="true" style="--sky:${look.sky};--ground:${look.ground};--path:${look.path}">
    ${sky(look)}
    <div class="bd-land">
      ${hills(look, zone)}
      <div class="bd-ground" style="background-image:${groundTile(...look.speck)}"></div>
      <div class="bd-props">${back}</div>
      <div class="bd-path"></div>
      <svg class="bd-hurdle" viewBox="-30 -40 60 42" width="54" height="38" aria-hidden="true">${props.hurdle}</svg>
      <div class="bd-track bd-lead"><div class="bd-face"><div class="bd-chase${chase.air ? ' air' : ''}">${chaseSVG(look.chase)}</div></div></div>
      <div class="bd-track"><div class="bd-face"><span class="bd-shadow"></span><div class="bd-hop">${runnerSVG(look.outfit)}</div></div></div>
    </div>
  </div>`;
}
