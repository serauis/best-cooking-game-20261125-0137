// Dapur Ibu — Warung Ibu Sari: boot, game loop, mouse-click interaction.
// A complete top-down cooking game: gather, chop, cook, plate, serve.
import { CANVAS_W, CANVAS_H, THEMES } from './config.js';
import { GameState } from './state.js';
import { Renderer } from './render.js';
import { Input } from './input.js';
import { SoundFX } from './audio.js';
import { applyShot } from './shots.js';

const params = new URLSearchParams(location.search);
const themeName = params.get('theme') || 'warung';
const theme = THEMES[themeName] ? themeName : 'warung';
const seed = Number(params.get('seed') || 1);
const shot = params.get('shot') || '';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const state = new GameState(theme, seed);
const renderer = new Renderer(canvas);
const input = new Input(canvas);
const sfx = new SoundFX();

// Mouse: clicking anywhere interacts with the nearest station (Input maps a
// click to interactPressed), so mouse play works with no extra handler here.

if (shot) applyShot(state, shot);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (input.consumeMute()) {
    sfx.muted = !sfx.muted;
    if (sfx.muted) sfx.stopMusic(); else if (state.phase === 'play') sfx.startMusic();
  }
  state.update(dt, input, sfx);
  renderer.render(state, input);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Expose a tiny handle for the screenshot driver / debugging.
window.__dapurIbu = { state, theme };
