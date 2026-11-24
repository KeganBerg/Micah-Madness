// Yoshi the chinchilla: Grace's chinchilla and Micah's best small friend.
// Drawn from photos of the real Yoshi: a standard grey chinchilla with dark
// salt-and-pepper ticking on her crown and back, a darker stripe down her nose,
// pale rings round big shiny black eyes, a cream chin, chest and paws, huge
// round ears (grey outside, peachy inside) and long dark-and-white whiskers.
// Drawn facing the viewer, feet at (0,0), about 50 units tall and 42 wide.

const FUR = '#8e949b';
const FUR_DARK = '#4b5158';
const TICK = '#5f656d';
const PALE = '#b9bec4';
const CREAM = '#ece3d4';
const EAR_IN = '#c99d90';

/** Short dark flecks: the "ticked" look of real chinchilla fur. */
const flecks = (pts: [number, number, number][]) =>
  pts.map(([x, y, a]) => `<path d="M${x} ${y} l${(Math.cos(a) * 2.6).toFixed(2)} ${(Math.sin(a) * 2.6).toFixed(2)}"/>`).join('');

const body = `
  <g class="yoshi-tail"><path d="M10 -6 C30 -4 35 -24 27 -34 C22 -40 13 -37 16 -30 C19 -24 17 -17 10 -16 Z" fill="${TICK}" stroke="${FUR_DARK}" stroke-width="1.6" stroke-linejoin="round"/>
  <circle cx="22" cy="-37" r="5" fill="${TICK}" stroke="${FUR_DARK}" stroke-width="1.4"/><circle cx="17" cy="-34.5" r="3.8" fill="${TICK}"/>
  <path d="M15 -25 q4 3 2 7 M19 -29 q3 4 1 8 M24 -33 q2 3 0 6" stroke="#3b4046" stroke-width="1" fill="none" opacity=".6" stroke-linecap="round"/></g>
  <ellipse cx="0" cy="-14" rx="17" ry="14" fill="${FUR}" stroke="${FUR_DARK}" stroke-width="1.6"/>
  <g stroke="${TICK}" stroke-width="1.1" stroke-linecap="round" opacity=".85">${flecks([[-14, -18, 1.9], [-12, -12, 1.7], [-15, -8, 1.5], [12, -19, 1.2], [14, -13, 1.4], [11, -7, 1.6], [-10, -22, 2.1], [10, -23, 1]])}</g>
  <path d="M-9 -3 C-11 -12 -7 -20 0 -21 C7 -20 11 -12 9 -3 Z" fill="${CREAM}"/>
  <ellipse cx="-7" cy="-1" rx="5" ry="2.7" fill="${CREAM}" stroke="${FUR_DARK}" stroke-width="1.2"/>
  <ellipse cx="7" cy="-1" rx="5" ry="2.7" fill="${CREAM}" stroke="${FUR_DARK}" stroke-width="1.2"/>
  <ellipse cx="-3.4" cy="-15.5" rx="2.3" ry="2.6" fill="#d8cfc0" stroke="${FUR_DARK}" stroke-width=".9"/>
  <ellipse cx="3.4" cy="-15.5" rx="2.3" ry="2.6" fill="#d8cfc0" stroke="${FUR_DARK}" stroke-width=".9"/>
  <g transform="rotate(-24 -11 -43)"><ellipse cx="-11" cy="-43" rx="8.6" ry="10.4" fill="${FUR}" stroke="${FUR_DARK}" stroke-width="1.6"/>
    <ellipse cx="-11" cy="-42.4" rx="6" ry="7.8" fill="${EAR_IN}"/><path d="M-11 -36 q-1.4 -5 .6 -10" stroke="#c08878" stroke-width=".8" fill="none" opacity=".7"/></g>
  <g transform="rotate(24 11 -43)"><ellipse cx="11" cy="-43" rx="8.6" ry="10.4" fill="${FUR}" stroke="${FUR_DARK}" stroke-width="1.6"/>
    <ellipse cx="11" cy="-42.4" rx="6" ry="7.8" fill="${EAR_IN}"/><path d="M11 -36 q1.4 -5 -.6 -10" stroke="#c08878" stroke-width=".8" fill="none" opacity=".7"/></g>
  <ellipse cx="0" cy="-29" rx="14.5" ry="12" fill="${FUR}" stroke="${FUR_DARK}" stroke-width="1.6"/>
  <path d="M-12.6 -33.5 C-10 -40 10 -40 12.6 -33.5 C8 -36 4 -35.5 2 -33 L1.8 -25.6 L-1.8 -25.6 L-2 -33 C-4 -35.5 -8 -36 -12.6 -33.5 Z" fill="${TICK}"/>
  <g stroke="#454b52" stroke-width="1" stroke-linecap="round" opacity=".8">${flecks([[-8, -37.5, 0.4], [-3, -39, 0.2], [3, -38.8, -0.2], [7.5, -37, -0.5], [-11, -31, 1.7], [11, -31, 1.4]])}</g>
  <ellipse cx="-6.2" cy="-30.2" rx="4.9" ry="4.6" fill="${PALE}"/>
  <ellipse cx="6.2" cy="-30.2" rx="4.9" ry="4.6" fill="${PALE}"/>
  <path d="M-9.5 -25.5 C-9 -21 -4 -18.6 0 -18.6 C4 -18.6 9 -21 9.5 -25.5 C6 -23.6 3 -24.4 0 -24 C-3 -24.4 -6 -23.6 -9.5 -25.5 Z" fill="${CREAM}"/>
  <g class="yoshi-eyes">
    <circle cx="-6.2" cy="-30.4" r="3.7" fill="#121216"/><circle cx="6.2" cy="-30.4" r="3.7" fill="#121216"/>
    <ellipse cx="-5" cy="-31.9" rx="1.5" ry="1.1" fill="#fff"/><ellipse cx="7.4" cy="-31.9" rx="1.5" ry="1.1" fill="#fff"/>
    <circle cx="-7.4" cy="-29" r=".6" fill="#fff" opacity=".8"/><circle cx="5" cy="-29" r=".6" fill="#fff" opacity=".8"/>
  </g>
  <path d="M-1.6 -25.6 Q0 -24.6 1.6 -25.6 Q0 -23.6 -1.6 -25.6 Z" fill="#9c7a7c"/>
  <path d="M-2.2 -22.4 Q-1.1 -21.4 0 -22.4 Q1.1 -21.4 2.2 -22.4" stroke="#5a4a50" stroke-width=".8" fill="none" stroke-linecap="round"/>
  <g stroke-linecap="round" fill="none">
    <path d="M-3 -24.2 Q-12 -27 -21 -27.5 M-3 -23.2 Q-13 -22.6 -22 -20.5 M3 -24.2 Q12 -27 21 -27.5 M3 -23.2 Q13 -22.6 22 -20.5" stroke="#2c3036" stroke-width=".55" opacity=".8"/>
    <path d="M-3 -23.7 Q-12 -25 -19.5 -24 M-3 -22.6 Q-11 -20 -17 -16.5 M3 -23.7 Q12 -25 19.5 -24 M3 -22.6 Q11 -20 17 -16.5" stroke="#fff" stroke-width=".55" opacity=".85"/>
  </g>`;

/** Yoshi, drawn from photos of the real Yoshi. */
export const YOSHI = body;

/** Things Yoshi "says" (really, things that happen) when you tap her on the map. */
export const YOSHI_LINES = [
  'Yoshi! Grace’s chinchilla came along for the walk.',
  'Yoshi did a happy popcorn jump. Micah tried it too. It went less well.',
  'Yoshi is the softest thing Micah has ever sniffed. She sneezed.',
  'Micah and Yoshi touched noses. Best friends, officially.',
  'Yoshi took a dust bath. Micah would like one too. (No.)',
  'Yoshi is tiny, round and in charge.',
];

/** Lines for when Micah comes over to see Yoshi in the yard. */
export const YOSHI_YARD = [
  'Yoshi rolled in her dust bath. Micah supervised.',
  'Popcorn! Yoshi bounced straight up. Micah barked in support.',
  'Micah and Yoshi touched noses. Grace would be proud.',
  'Yoshi nibbled a hay stick. Micah wanted it. Yoshi said no.',
  'Yoshi is fluffier than Micah. Micah has decided not to mind.',
];
