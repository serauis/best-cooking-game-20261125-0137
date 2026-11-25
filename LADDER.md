# Ladder — Dapur Ibu (best-cooking-game-20261125-0137)

16 candidates, judged pairwise locally against the 5 printed judge criteria
(1 = complete game in screenshots, 2 = fun & depth, 3 = feel & polish,
4 = look & originality, 5 = structure). Scores are 1–5 per criterion.
**Winner = highest LOW (lowest criterion score), not highest mean** — a
candidate that loses badly on any one criterion is out. Tie-break: the
highest score on criterion 1 (the most important), then criterion 4.

All candidates share one parameterized game core (`game/src/`); they differ
only in visual theme (palette) and staged moment. Every screenshot is a real
render of the game's own code, taken with `tools/shots.mjs` (headless
Chrome, 1280×720, `?shot=…&theme=…&seed=1`).

## Scores

| Candidate | C1 complete | C2 fun/depth | C3 feel | C4 look | C5 structure | LOW | Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| **warung-cover ★ WINNER** | 5 | 4 | 5 | 5 | 4 | **4** | 4.6 |
| warung-chop | 4 | 4 | 4 | 5 | 4 | 4 | 4.2 |
| warung-stove | 4 | 4 | 5 | 5 | 4 | 4 | 4.4 |
| warung-serve | 4 | 4 | 5 | 5 | 4 | 4 | 4.4 |
| morning-cover | 5 | 4 | 5 | 4 | 4 | 4 | 4.4 |
| morning-chop | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| morning-stove | 4 | 4 | 5 | 4 | 4 | 4 | 4.2 |
| morning-serve | 4 | 4 | 5 | 4 | 4 | 4 | 4.2 |
| dusk-cover | 5 | 4 | 4 | 4 | 4 | 4 | 4.2 |
| dusk-chop | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| dusk-stove | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| dusk-serve | 4 | 4 | 4 | 4 | 4 | 4 | 4.0 |
| modern-cover | 5 | 4 | 5 | 3 | 4 | 3 | 4.2 |
| modern-chop | 4 | 4 | 4 | 3 | 4 | 3 | 3.8 |
| modern-stove | 4 | 4 | 5 | 3 | 4 | 3 | 4.0 |
| modern-serve | 4 | 4 | 5 | 3 | 4 | 3 | 4.0 |

## Why the winner won

- **Cover staging beats every other staging on C1 (5 vs 4).** Only the
  cover shows all six required elements in one frame at a glance: kitchen,
  order board, ingredients on the counter, one dish mid-assembly on the
  assembly counter, the shift timer, and a plate ready to serve (a cooked
  dish on the stove marked MATANG). Chop/stove/serve each show only part of
  the loop, so they cap at C1 = 4.
- **Warung theme beats morning and dusk on C4 (5 vs 4).** Warm wood is the
  most distinctive look of the four and the only one that matches the
  emotional story (a small family warung, Ibu's handwritten recipe book).
  Morning is bright but generic; dusk is moody but the timer and order
  board read less punchy at thumbnail size (C3 = 4).
- **Modern is out on LOW.** Clean and readable, but generic — C4 = 3, the
  lowest LOW in the ladder, so it loses despite a strong C1/C3.
- **Structure (C5 = 4) is identical across candidates** — same split files
  (`config`, `state`, `render`, `input`, `audio`, `shots`, `main`), each
  with one clear job.

## Shipped set (warung theme)

1. `1-cover.jpg` — cover: mid-assembly plate + rush toast + full board.
2. `2-chop.jpg` — chopping at the board, plate started on the counter.
3. `3-stove.jpg` — cooking at the stove during the lunch rush.
4. `4-serve.jpg` — serving a finished Nasi Goreng Ibu at the pass, combo ×5.

Candidate renders are kept under `tools/ladder/` for reference.
