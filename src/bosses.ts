// Area bosses: the last level of every area has someone guarding it. The boss sits on a
// 2x2 block of the board; pieces fall straight past it. Every match right beside it (and
// every power-up that blasts into it) knocks its health down, and every few moves it throws
// its own nuisance onto the board. Chase it off to win.
import type { BossId } from './levels';

export interface BossInfo {
  name: string;
  /** Said when the level starts. */
  hello: string;
  /** Said when it throws something. */
  throws: string[];
  /** Said when Micah chases it off. */
  bye: string;
  /** What it throws: a piece of junk (with its JUNK_ITEMS index), a soap bubble, or a parcel. */
  attack: { kind: 'junk'; items: number[] } | { kind: 'bubble' } | { kind: 'box' };
  svg: string;
}

const OUT = 'stroke="#3b2a1e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
const THIN = 'stroke="#3b2a1e" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

/** Two cartoon eyes with a glint; `mood` tilts the brows. */
const eyes = (x1: number, x2: number, y: number, r = 9, mood: 'cross' | 'smug' | 'none' = 'cross') => `
  <circle cx="${x1}" cy="${y}" r="${r}" fill="#fff" ${THIN}/><circle cx="${x2}" cy="${y}" r="${r}" fill="#fff" ${THIN}/>
  <circle class="pupil" cx="${x1 + 2}" cy="${y + 1}" r="${r * 0.5}" fill="#1d1a2e"/><circle class="pupil" cx="${x2 + 2}" cy="${y + 1}" r="${r * 0.5}" fill="#1d1a2e"/>
  <circle cx="${x1 + 4}" cy="${y - 2}" r="${r * 0.2}" fill="#fff"/><circle cx="${x2 + 4}" cy="${y - 2}" r="${r * 0.2}" fill="#fff"/>
  ${mood === 'none' ? '' : mood === 'cross'
    ? `<path d="M${x1 - r - 2} ${y - r - 6} L${x1 + r} ${y - r + 1} M${x2 + r + 2} ${y - r - 6} L${x2 - r} ${y - r + 1}" ${OUT}/>`
    : `<path d="M${x1 - r} ${y - r - 2} Q${x1} ${y - r - 8} ${x1 + r} ${y - r - 3} M${x2 - r} ${y - r - 3} Q${x2} ${y - r - 8} ${x2 + r} ${y - r - 2}" fill="none" ${OUT}/>`}`;

const RACCOON = `
  <g class="boss-tail"><path d="M132 150 C168 150 190 124 182 96 C176 76 156 80 160 98 C164 116 150 128 128 128 Z" fill="#8f949c" ${OUT}/>
    <path d="M170 86 C178 88 182 96 182 102 L164 108 C162 100 162 92 170 86 Z M150 128 C158 124 163 118 166 112 L178 116 C174 128 166 136 156 140 Z" fill="#3f434a"/></g>
  <ellipse cx="100" cy="182" rx="56" ry="10" fill="#000" opacity=".18"/>
  <path d="M52 176 C44 140 52 104 100 102 C148 104 156 140 148 176 Z" fill="#9aa0a8" ${OUT}/>
  <path d="M74 176 C70 150 78 128 100 128 C122 128 130 150 126 176 Z" fill="#d9dde2"/>
  <path d="M34 58 L40 18 L70 40 Z M166 58 L160 18 L130 40 Z" fill="#9aa0a8" ${OUT}/>
  <path d="M44 46 L46 28 L60 40 Z M156 46 L154 28 L140 40 Z" fill="#3f434a"/>
  <path d="M26 80 C26 44 60 30 100 30 C140 30 174 44 174 80 C174 110 140 122 100 122 C60 122 26 110 26 80 Z" fill="#9aa0a8" ${OUT}/>
  <path d="M30 78 C40 60 64 58 100 70 C136 58 160 60 170 78 C162 96 136 96 100 86 C64 96 38 96 30 78 Z" fill="#2c2f35"/>
  <path d="M74 98 C84 92 116 92 126 98 C124 114 112 120 100 120 C88 120 76 114 74 98 Z" fill="#eef0f3"/>
  ${eyes(72, 128, 76, 11, 'smug')}
  <ellipse cx="100" cy="100" rx="9" ry="6" fill="#1d1a2e"/>
  <path d="M88 110 Q100 118 112 110" fill="none" ${THIN}/>
  <path d="M94 112 L96 118 L100 113 L104 118 L106 112" fill="#fff" ${THIN} stroke-width="2"/>
  <g class="boss-arm"><path d="M58 140 C46 132 36 134 34 146 C34 156 46 158 56 150 Z" fill="#9aa0a8" ${OUT}/>
    <path d="M22 126 H44 V150 C44 156 48 158 52 160 L50 170 C40 170 32 166 30 156 Z" fill="#fff4e6" ${THIN} transform="rotate(-18 36 148)"/>
    <path d="M22 126 H44 V134 H22 Z" fill="#e8352f" ${THIN} transform="rotate(-18 36 148)"/></g>
  <path d="M136 152 C150 146 160 150 158 160 C156 168 144 168 136 162 Z" fill="#9aa0a8" ${OUT}/>`;

const SQUIRREL = `
  <g class="boss-tail"><path d="M118 168 C170 172 196 130 188 86 C182 50 150 30 128 44 C112 54 120 76 138 74 C156 72 162 92 154 112 C146 134 126 140 112 138 Z" fill="#c8662a" ${OUT}/>
    <path d="M150 52 C166 58 176 74 178 92 M162 120 C170 108 172 96 170 84" fill="none" stroke="#e89a5a" stroke-width="6" stroke-linecap="round"/></g>
  <ellipse cx="96" cy="184" rx="50" ry="9" fill="#000" opacity=".18"/>
  <path d="M54 178 C46 144 58 112 96 110 C134 112 144 144 136 178 Z" fill="#d97a38" ${OUT}/>
  <path d="M74 178 C70 154 80 134 96 134 C112 134 122 154 118 178 Z" fill="#f5d9b0"/>
  <path d="M50 44 C44 20 58 10 66 24 L70 40 Z M142 44 C148 20 134 10 126 24 L122 40 Z" fill="#d97a38" ${OUT}/>
  <path d="M56 36 C54 26 58 22 62 28 Z M136 36 C138 26 134 22 130 28 Z" fill="#f2b08a"/>
  <path d="M34 82 C34 48 62 32 96 32 C130 32 158 48 158 82 C158 112 130 124 96 124 C62 124 34 112 34 82 Z" fill="#d97a38" ${OUT}/>
  <path d="M60 96 C66 84 84 84 96 92 C108 84 126 84 132 96 C128 116 112 122 96 122 C80 122 64 116 60 96 Z" fill="#f5d9b0"/>
  ${eyes(72, 120, 70, 12, 'cross')}
  <ellipse cx="96" cy="96" rx="7" ry="5" fill="#3b2a1e"/>
  <path d="M84 104 Q96 112 108 104" fill="none" ${THIN}/>
  <path d="M90 106 H102 V118 H90 Z" fill="#fff" ${THIN} stroke-width="2.5"/><path d="M96 106 V118" stroke="#3b2a1e" stroke-width="2"/>
  <path d="M52 98 L30 92 M52 104 L30 106 M140 98 L162 92 M140 104 L162 106" stroke="#3b2a1e" stroke-width="2.5" stroke-linecap="round"/>
  <g class="boss-arm"><path d="M70 150 C58 144 54 132 64 128 C74 126 80 136 82 146 Z" fill="#d97a38" ${OUT}/>
    <g transform="translate(36 112) rotate(-20)"><ellipse cx="14" cy="22" rx="12" ry="17" fill="#8a5a33" ${THIN}/>
      <path d="M4 14 L24 14 M3 22 L25 22 M5 30 L23 30" stroke="#5e3d24" stroke-width="2.5"/><path d="M14 4 V-4" ${THIN}/></g></g>
  <path d="M112 146 C124 140 132 132 124 128 C116 124 108 134 106 144 Z" fill="#d97a38" ${OUT}/>`;

const TUB = `
  <g class="boss-bubbles" fill="#e9f7ff" stroke="#7fb8d9" stroke-width="3">
    <circle cx="42" cy="40" r="16"/><circle cx="70" cy="22" r="12"/><circle cx="104" cy="30" r="18"/><circle cx="140" cy="20" r="11"/><circle cx="162" cy="42" r="15"/>
    <circle cx="36" cy="40" r="4" fill="#fff" stroke="none"/><circle cx="98" cy="24" r="5" fill="#fff" stroke="none"/><circle cx="158" cy="36" r="4" fill="#fff" stroke="none"/>
  </g>
  <ellipse cx="100" cy="188" rx="74" ry="9" fill="#000" opacity=".18"/>
  <path d="M42 160 L32 186 M158 160 L168 186" stroke="#c9a227" stroke-width="9" stroke-linecap="round"/>
  <circle cx="32" cy="186" r="7" fill="#e6c14a" ${THIN}/><circle cx="168" cy="186" r="7" fill="#e6c14a" ${THIN}/>
  <path d="M16 74 H184 C184 140 160 170 100 170 C40 170 16 140 16 74 Z" fill="#fdfdfd" ${OUT}/>
  <path d="M24 92 C30 142 56 160 100 160" fill="none" stroke="#d6e6f0" stroke-width="8" stroke-linecap="round"/>
  <path d="M10 64 H190 V78 H10 Z" fill="#ffffff" ${OUT}/>
  <path d="M30 64 C30 52 44 46 54 54 C60 42 78 42 82 54 C90 44 108 44 112 56 C120 46 138 46 142 56 C150 48 166 50 170 64 Z" fill="#e9f7ff" stroke="#7fb8d9" stroke-width="3"/>
  <path d="M168 64 V34 C168 24 178 20 184 26" fill="none" stroke="#c9a227" stroke-width="6" stroke-linecap="round"/>
  <path d="M178 26 H192 V34 H178 Z" fill="#e6c14a" ${THIN}/>
  ${eyes(72, 128, 108, 13, 'cross')}
  <path d="M80 140 Q100 128 120 140" fill="none" ${OUT}/>
  <g class="boss-arm" transform="translate(38 36)"><path d="M6 26 C2 14 10 4 22 6 C30 8 32 16 30 22 L40 20 L36 30 C30 34 14 36 6 26 Z" fill="#ffd23a" ${THIN}/>
    <circle cx="22" cy="14" r="2.6" fill="#1d1a2e"/><path d="M30 20 L40 20 L34 26 Z" fill="#f28c28" ${THIN} stroke-width="2"/></g>`;

const POSTBOX = `
  <ellipse cx="100" cy="190" rx="44" ry="8" fill="#000" opacity=".18"/>
  <path d="M84 150 H116 V188 H84 Z" fill="#5e6670" ${OUT}/>
  <path d="M30 84 C30 40 60 18 100 18 C140 18 170 40 170 84 V156 H30 Z" fill="#2f6fd0" ${OUT}/>
  <path d="M42 84 C42 48 66 30 100 30" fill="none" stroke="#6fa3ec" stroke-width="7" stroke-linecap="round"/>
  <path d="M30 156 H170 V164 H30 Z" fill="#244f96" ${OUT}/>
  <g class="boss-arm"><path d="M170 100 H184 V48 H164" fill="none" stroke="#3b2a1e" stroke-width="5" stroke-linejoin="round"/>
    <path d="M164 34 H196 V56 H164 Z" fill="#e8352f" ${OUT}/></g>
  ${eyes(74, 126, 72, 14, 'cross')}
  <path d="M60 110 H140 C140 128 124 136 100 136 C76 136 60 128 60 110 Z" fill="#1d1a2e" ${OUT}/>
  <g transform="rotate(-8 100 112)"><path d="M70 100 H130 V122 H70 Z" fill="#fff8e8" ${THIN}/>
    <path d="M70 100 L100 114 L130 100" fill="none" ${THIN}/><rect x="118" y="103" width="8" height="8" fill="#e8352f"/></g>
  <path d="M68 112 L76 120 M132 112 L124 120" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
  <text x="100" y="152" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#cfe0fb" letter-spacing="2">MAIL</text>`;

export const BOSSES: Record<BossId, BossInfo> = {
  raccoon: {
    name: 'Rocky the raccoon',
    hello: 'Rocky the raccoon is guarding the way. Match right beside him to chase him off!',
    throws: ['Rocky threw a sock!', 'Rocky is cleaning out Noah’s Ark again.', 'More junk from Rocky!'],
    bye: 'Rocky ran back to Noah’s Ark!',
    attack: { kind: 'junk', items: [0, 1, 3, 4, 5, 6] },
    svg: RACCOON,
  },
  squirrel: {
    name: 'the fence squirrel',
    hello: 'SQUIRREL! It’s sitting right on the board. Match beside it to chase it off!',
    throws: ['The squirrel threw a pinecone!', 'Pinecone incoming!', 'The squirrel is laughing at Micah.'],
    bye: 'The squirrel ran up a tree. Micah wins!',
    attack: { kind: 'junk', items: [2] },
    svg: SQUIRREL,
  },
  tub: {
    name: 'the bathtub',
    hello: 'Uh oh. Bath time. Match beside the tub to chase it off!',
    throws: ['The tub blew a bubble!', 'Suds everywhere!', 'Not the bath! Anything but the bath!'],
    bye: 'No bath today! Micah stays muddy.',
    attack: { kind: 'bubble' },
    svg: TUB,
  },
  postbox: {
    name: 'the mailbox',
    hello: 'The mailbox is here. Micah has some barking to do! Match beside it to chase it off.',
    throws: ['The mailbox spat out a parcel!', 'You’ve got mail!', 'Another parcel. Micah barks at it.'],
    bye: 'The mailbox gave up. Micah barked it away!',
    attack: { kind: 'box' },
    svg: POSTBOX,
  },
};

export const bossSvg = (who: BossId, cls = 'boss-art') => `<svg class="${cls}" viewBox="0 0 200 200" aria-hidden="true">${BOSSES[who].svg}</svg>`;
