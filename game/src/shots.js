// Dapur Ibu: deterministic staging for screenshots (?shot=...&theme=...&seed=...).
// Each shot sets up a real game state — orders, carried items, a plate
// mid-assembly, timers — then freezes it so the frame is stable.
import { LAYOUT, RECIPES, NEIGHBOURS, recipeById } from './config.js';
import { PHASE } from './state.js';

function order(state, recipeId, left, golden, neighbourIdx) {
  const r = recipeById(recipeId);
  state.orders.push({
    id: ++state.orderSeq, recipe: r,
    left, max: 68, golden: !!golden,
    neighbour: NEIGHBOURS[neighbourIdx % NEIGHBOURS.length],
  });
}

function plateWith(state, dishItems, dishId) {
  state.counterPlate = { kind: 'plate', items: [...dishItems], dish: dishId || null };
}

function carry(state, items) {
  state.player.carry = items;
}

export function applyShot(state, shot) {
  state.phase = PHASE.PLAY;
  state.frozen = true;
  state.time = 62;
  state.timeLeft = 118;
  state.score = 340;
  state.money = 720;
  state.served = 4;
  state.combo = 3;
  state.bestCombo = 3;

  // A lively default order board for every shot.
  order(state, 'nasi-goreng', 41, false, 0);
  order(state, 'soto-ayam', 26, false, 1);
  order(state, 'gado-gado', 52, false, 2);

  if (shot === 'cover') {
    // THE cover: kitchen + order board + ingredients on counter + one dish
    // mid-assembly + timer + a plate ready to serve.
    state.player.x = 700; state.player.y = 372;
    carry(state, [{ kind: 'ing', id: 'cabai', state: 'chopped' }]);
    plateWith(state, ['nasi', 'telur'], null); // mid-assembly: 2 of 3 for Nasi Goreng
    state.board.item = { kind: 'ing', id: 'sayur', state: 'raw' };
    state.board.progress = 0.9;
    state.stove[0].item = { kind: 'ing', id: 'ayam', state: 'raw', cooked: false };
    state.stove[0].progress = 3.2;
    state.stove[1].item = { kind: 'ing', id: 'mie', state: 'cooked', cooked: true };
    state.stove[1].progress = 5;
    state.showToast('✦ Soto Ayam tersaji! +150 — Kuah soto Ibu bening tapi hangatnya sampai ke hati.');
    state.showBanner('JAM MAKAN SIANG — RUSH!', 'Tetangga berdatangan, pesanan makin cepat!');
  } else if (shot === 'chop') {
    state.player.x = 430; state.player.y = 372;
    state.board.item = { kind: 'ing', id: 'cabai', state: 'raw' };
    state.board.progress = 1.1;
    carry(state, [{ kind: 'ing', id: 'sayur', state: 'raw' }]);
    plateWith(state, ['sayur'], null);
    state.showToast('Cabai sudah dipotong rapi.');
  } else if (shot === 'stove') {
    state.player.x = 660; state.player.y = 372;
    state.stove[0].item = { kind: 'ing', id: 'ayam', state: 'raw', cooked: false };
    state.stove[0].progress = 4.4;
    state.stove[1].item = { kind: 'ing', id: 'nasi', state: 'cooked', cooked: true };
    state.stove[1].progress = 5;
    carry(state, [{ kind: 'ing', id: 'mie', state: 'cooked' }]);
    plateWith(state, ['ayam'], null);
    state.time = 100; state.timeLeft = 80;
    state.showBanner('JAM MAKAN SIANG — RUSH!', 'Tetangga berdatangan, pesanan makin cepat!');
  } else if (shot === 'serve') {
    state.player.x = 1120; state.player.y = 360;
    carry(state, [{ kind: 'plate', items: ['nasi', 'telur', 'cabai'], dish: 'nasi-goreng' }]);
    state.combo = 5; state.bestCombo = 5; state.score = 620; state.served = 7;
    state.showToast('✦ Nasi Goreng Ibu tersaji! +190 — Ibu selalu menumis bawang dulu sampai harum.');
  } else if (shot === 'end') {
    state.phase = PHASE.DONE;
    state.score = 1240; state.served = 11; state.bestCombo = 6; state.money = 1820; state.expired = 1;
    state.endReason = 'Ibu pasti bangga. Warungnya ramai, resepnya hidup lagi.';
  } else {
    // 'start' / default: title screen.
    state.phase = PHASE.TITLE;
    state.orders = [];
    state.score = 0; state.served = 0; state.combo = 0; state.money = 0;
  }
  return state;
}
