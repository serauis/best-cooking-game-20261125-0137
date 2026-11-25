# Dapur Ibu — Warung Ibu Sari

[![Best Cooking Game](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/serauis/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/serauis/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/c/best-cooking-game-20261125-0137)

A complete top-down cooking game. You cook your late mother's recipes from
her handwritten recipe book for the neighbours who loved her food — every
served dish warms a memory.

**Play:** WASD / arrow keys to move, E / click to interact, M to mute.
Gather ingredients from the crates, chop them on the cutting board, cook
them on the stove, assemble dishes on plates at the assembly counter, and
serve them at the pass before the order timers run out. Six recipes
(Nasi Goreng Ibu, Soto Ayam, Gado-Gado, Mie Ayam, Bubur Ayam, Pisang
Goreng), a 3-minute shift, a lunch rush, and a golden "Makan Malam Ulang
Tahun Ibu" finale. Score, combos, and Ibu's memories included.

**Run it:** `node serve.ts`, then open http://localhost:8080. No build step,
no network requests — all art is drawn in code on canvas, all sound is
synthesized with WebAudio.

**Screenshots:** taken with `node tools/shots.mjs` (headless Chrome).
`shots.json` lists the staged moments; `LADDER.md` records the 16-candidate
ladder and why the warm-warung cover won.

**Structure:** `game/src/config.js` (themes, recipes, neighbours),
`game/src/state.js` (rules: orders, chopping, cooking, plating, serving),
`game/src/render.js` (all canvas drawing), `game/src/input.js`,
`game/src/audio.js` (synthesized sfx + music), `game/src/shots.js`
(deterministic screenshot staging), `game/src/main.js` (boot + loop).
