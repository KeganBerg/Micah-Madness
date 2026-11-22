// Yoshi the chinchilla: Grace's chinchilla and Micah's best small friend.
// Drawn facing the viewer, feet at (0,0), about 48 units tall and 40 wide.

const FUR = '#a9b3bc';
const FUR_DARK = '#6f7b86';
const BELLY = '#eef1f4';
const EAR_IN = '#f5b9c6';
const BOW = '#e8352f';

/** Yoshi's body without the bow, so callers can add extras on top. */
const body = `
  <g class="yoshi-tail"><path d="M9 -7 C28 -4 34 -22 26 -32 C21 -38 12 -35 15 -29 C19 -23 16 -16 9 -16 Z" fill="${FUR}" stroke="${FUR_DARK}" stroke-width="1.6" stroke-linejoin="round"/>
  <circle cx="21" cy="-35" r="4.6" fill="${FUR}" stroke="${FUR_DARK}" stroke-width="1.4"/><circle cx="16.5" cy="-33" r="3.6" fill="${FUR}"/></g>
  <path d="M14 -24 q4 3 2 7 M18 -27 q3 4 1 8" stroke="${FUR_DARK}" stroke-width="1" fill="none" opacity=".55" stroke-linecap="round"/>
  <ellipse cx="0" cy="-13" rx="15.5" ry="13" fill="${FUR}" stroke="${FUR_DARK}" stroke-width="1.6"/>
  <ellipse cx="0" cy="-9.5" rx="9" ry="8.5" fill="${BELLY}"/>
  <ellipse cx="-6.5" cy="-1" rx="4.6" ry="2.6" fill="${FUR}" stroke="${FUR_DARK}" stroke-width="1.3"/>
  <ellipse cx="6.5" cy="-1" rx="4.6" ry="2.6" fill="${FUR}" stroke="${FUR_DARK}" stroke-width="1.3"/>
  <ellipse cx="-3.2" cy="-15" rx="2.4" ry="3" fill="${FUR}" stroke="${FUR_DARK}" stroke-width="1.1"/>
  <ellipse cx="3.2" cy="-15" rx="2.4" ry="3" fill="${FUR}" stroke="${FUR_DARK}" stroke-width="1.1"/>
  <ellipse cx="-9" cy="-42" rx="6.6" ry="8.4" fill="${FUR}" stroke="${FUR_DARK}" stroke-width="1.6" transform="rotate(-18 -9 -42)"/>
  <ellipse cx="9" cy="-42" rx="6.6" ry="8.4" fill="${FUR}" stroke="${FUR_DARK}" stroke-width="1.6" transform="rotate(18 9 -42)"/>
  <ellipse cx="-9" cy="-41.5" rx="3.8" ry="5.6" fill="${EAR_IN}" transform="rotate(-18 -9 -41.5)"/>
  <ellipse cx="9" cy="-41.5" rx="3.8" ry="5.6" fill="${EAR_IN}" transform="rotate(18 9 -41.5)"/>
  <ellipse cx="0" cy="-28" rx="12.5" ry="11" fill="${FUR}" stroke="${FUR_DARK}" stroke-width="1.6"/>
  <ellipse cx="-6" cy="-23.5" rx="4.6" ry="3.4" fill="${BELLY}" opacity=".9"/>
  <ellipse cx="6" cy="-23.5" rx="4.6" ry="3.4" fill="${BELLY}" opacity=".9"/>
  <ellipse cx="-8.6" cy="-24.6" rx="2" ry="1.2" fill="#ff8fa6" opacity=".55"/>
  <ellipse cx="8.6" cy="-24.6" rx="2" ry="1.2" fill="#ff8fa6" opacity=".55"/>
  <g class="yoshi-eyes">
    <circle cx="-5" cy="-29.5" r="3.3" fill="#1c1c22"/><circle cx="5" cy="-29.5" r="3.3" fill="#1c1c22"/>
    <circle cx="-4" cy="-30.8" r="1.2" fill="#fff"/><circle cx="6" cy="-30.8" r="1.2" fill="#fff"/>
    <circle cx="-6" cy="-28.4" r=".55" fill="#fff"/><circle cx="4" cy="-28.4" r=".55" fill="#fff"/>
  </g>
  <path d="M-1.4 -25.4 Q0 -24.4 1.4 -25.4 Q0 -23.6 -1.4 -25.4 Z" fill="#e8798e"/>
  <path d="M-2.4 -22.6 Q-1.2 -21.4 0 -22.6 Q1.2 -21.4 2.4 -22.6" stroke="#5a4a50" stroke-width=".9" fill="none" stroke-linecap="round"/>
  <path d="M-3 -24 L-15 -26.5 M-3 -23.4 L-15.5 -22.8 M-3 -22.8 L-14 -19.5 M3 -24 L15 -26.5 M3 -23.4 L15.5 -22.8 M3 -22.8 L14 -19.5" stroke="#4a5560" stroke-width=".55" opacity=".7" stroke-linecap="round"/>`;

const bow = `
  <g transform="translate(0 -38.5)">
    <path d="M0 0 L-7 -4 Q-9 0 -7 4 Z M0 0 L7 -4 Q9 0 7 4 Z" fill="${BOW}" stroke="#a3201c" stroke-width="1" stroke-linejoin="round"/>
    <circle cx="0" cy="0" r="2" fill="${BOW}" stroke="#a3201c" stroke-width="1"/>
  </g>`;

/** Yoshi with her little lobster-red bow. */
export const YOSHI = `${body}${bow}`;

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
