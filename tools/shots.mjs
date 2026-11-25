// Dapur Ibu: screenshot driver (T20). Serves game/ on a port, opens each
// ?shot= staging in headless Chrome, screenshots at 1280x720.
// Usage: node tools/shots.mjs [outdir] [port]
// Reads shots.json (name + query) for the shipped set; with --ladder it
// renders every theme x staging candidate into ladder/ for judging.
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = fileURLToPath(new URL('..', import.meta.url));
const outdir = resolve(process.argv[2] || join(here, 'screenshots'));
const port = Number(process.argv[3] || 8091);
const ladderMode = process.argv.includes('--ladder');
const chromePath = process.env.CHROME_PATH ||
  '/home/hatch/.cache/puppeteer/chrome/linux-157.0.8103.78/chrome-linux64/chrome';

const shots = ladderMode
  ? (() => {
      const list = [];
      for (const theme of ['warung', 'morning', 'dusk', 'modern']) {
        for (const shot of ['cover', 'chop', 'stove', 'serve']) {
          list.push({ name: `${theme}-${shot}.jpg`, query: `?shot=${shot}&theme=${theme}&seed=1` });
        }
      }
      return list;
    })()
  : JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8'));

mkdirSync(outdir, { recursive: true });

const server = spawn('node', ['serve.ts', '--port', String(port)], { cwd: here, stdio: 'pipe' });
await new Promise((res, rej) => {
  server.stdout.on('data', (d) => { if (String(d).includes('http')) res(); });
  server.stderr.on('data', () => {});
  setTimeout(res, 4000);
});

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1280,720'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('PAGE ERROR:', String(e).slice(0, 300)));
page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE:', m.text().slice(0, 300)); });

for (const s of shots) {
  const url = `http://127.0.0.1:${port}/index.html${s.query}`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise((r) => setTimeout(r, 900));
  const path = join(outdir, s.name);
  // Screenshot the canvas element only, so the page's note bar below it
  // never leaks into the frame.
  const canvasEl = await page.$('#game');
  await canvasEl.screenshot({ path, type: 'jpeg', quality: 82 });
  console.log('shot', s.name, url);
}
await browser.close();
server.kill();
console.log('done:', shots.length, 'shots in', outdir);
