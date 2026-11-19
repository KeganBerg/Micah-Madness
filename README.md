# Micah Madness 🐾

A match-3 puzzle game for dog and animal lovers, starring **Micah**: a black dog with a grey muzzle, an orange cap and a lobster costume.

## Play

```bash
npm install
npm run dev      # open the printed URL (works on phones on the same Wi-Fi with --host)
```

`npm test` runs the board-logic tests. `npm run build` makes a static site in `dist/`.

## How it plays

- **Swap** two neighbouring pieces (drag, or tap one then the other) to line up 3 or more of the same kind.
- **Pieces:** Bones, Tennis Balls, Paws, Food Bowls, Lobster toys and Orange Caps.
- **Power-ups made by matching:**
  - 4 in a row → **Zoomies**: clears its whole row or column.
  - L or T shape → **Big Bark**: clears a 3×3 area.
  - 5 in a row → **Micah**: swap him with any piece to fetch every piece of that kind. Micah + Micah clears the board.
- **Goals:** collect pieces, reach a score, or clean the **mud** off the yard, within a move limit. Stars come from your score.
- **Level path:** 20 levels across five zones (The Backyard, Dog Park, Lobster Beach, Muddy Trails, Costume Party).
- **Items:** earn **biscuits** by winning and spend them in the **Treat Shop**:
  - In-level: **Treat** (Micah eats one piece), **Squirrel!** (shuffle), **Long Leash** (+5 moves).
  - Pre-level: **Zoomies Start** and **Micah Start**.

- **Micah's Yard:** spend the stars you earn on nine decorations for Micah's yard (doghouse, bed, ball pit and more).
- **Daily treat:** a 7-day reward streak. Missing a day starts it over.
- **Win streak:** each win in a row starts the next level with a free Zoomies (up to 3). Losing a level resets it.
- **Victory lap:** spare moves turn into Zoomies that go off when you clear a level.
- **Tips:** levels 1 to 6 each introduce one mechanic with a short tip.

Progress (stars, scores, biscuits, boosters, yard, streaks, sound) saves automatically in the browser's localStorage. Each browser/device keeps its own save. Saves are versioned and migrate forward on updates.

## Why these mechanics

From reviews of popular match and merge games: players stick with games that have a long-term goal beyond single levels (renovation or decoration), regular reasons to return (daily rewards, events), rewards for momentum (streaks), generous pacing with no hard energy timers, and quick teaching of one new idea at a time. Micah Madness has no lives or energy system on purpose, since energy timers are the most criticised feature in the genre.

## Code layout

| File | What it does |
| --- | --- |
| `src/board.ts` | Pure match/cascade/power-up logic (unit tested in `board.test.ts`) |
| `src/main.ts` | Map, modals, game screen, animation and input |
| `src/levels.ts` | Level and zone definitions |
| `src/save.ts` | Versioned save, daily treat and star maths (tested in `save.test.ts`) |
| `src/yard.ts` | Micah's Yard decorations and scene |
| `src/art.ts` | Original SVG art for pieces, boosters and Micah |
| `src/sound.ts` | Tiny synthesized sound effects |

## Deploy

Netlify builds `main` using `netlify.toml` (`npm run build`, publish `dist`) and builds a preview for every pull request. `.github/workflows/pages.yml` also publishes `main` to GitHub Pages.
