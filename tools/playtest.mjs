// Dapur Ibu: headless playtest — start, move, pick up an ingredient, check state.
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';

const server = spawn('node', ['serve.ts', '--port', '8092'], { cwd: new URL('..', import.meta.url).pathname, stdio: 'pipe' });
await new Promise((r) => setTimeout(r, 1500));
const browser = await puppeteer.launch({
  executablePath: '/home/hatch/.cache/puppeteer/chrome/linux-157.0.8103.78/chrome-linux64/chrome',
  headless: 'new', args: ['--no-sandbox', '--disable-gpu'],
});
const page = await browser.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
await page.goto('http://127.0.0.1:8092/index.html', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 500));
await page.keyboard.press('Enter');
await new Promise((r) => setTimeout(r, 300));
// Walk left toward the nasi crate (player starts x=640; crates at y~100).
await page.keyboard.down('KeyA');
await new Promise((r) => setTimeout(r, 900));
await page.keyboard.up('KeyA');
await page.keyboard.down('KeyW');
await new Promise((r) => setTimeout(r, 1200));
await page.keyboard.up('KeyW');
await page.keyboard.press('KeyE'); // pick up nearest crate ingredient
await new Promise((r) => setTimeout(r, 300));
const s = await page.evaluate(() => ({
  phase: window.__dapurIbu.state.phase,
  x: Math.round(window.__dapurIbu.state.player.x),
  y: Math.round(window.__dapurIbu.state.player.y),
  carry: window.__dapurIbu.state.player.carry.map((c) => c.id || 'plate'),
  orders: window.__dapurIbu.state.orders.length,
  timeLeft: Math.round(window.__dapurIbu.state.timeLeft),
}));
console.log('STATE', JSON.stringify(s));
console.log('ERRORS', errs.length ? errs.join(' | ') : 'none');
await browser.close();
server.kill();
