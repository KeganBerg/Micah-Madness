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

Progress is saved in the browser (localStorage).

## Code layout

| File | What it does |
| --- | --- |
| `src/board.ts` | Pure match/cascade/power-up logic (unit tested in `board.test.ts`) |
| `src/main.ts` | Map, modals, game screen, animation and input |
| `src/levels.ts` | Level and zone definitions |
| `src/save.ts` | Progress, biscuits and booster inventory |
| `src/art.ts` | Original SVG art for pieces, boosters and Micah |
| `src/sound.ts` | Tiny synthesized sound effects |

## Deploy

`.github/workflows/pages.yml` publishes `main` to GitHub Pages. Turn it on once in **Settings → Pages → Source: GitHub Actions**.
