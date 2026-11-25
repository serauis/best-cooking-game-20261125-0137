// Dapur Ibu: game state and rules — orders, chopping, cooking, plating, serving.
import {
  CANVAS_W, CANVAS_H, SHIFT_SECONDS, RUSH_START, RUSH_END, BIRTHDAY_START,
  RECIPES, INGREDIENTS, LAYOUT, PLAYER, NEIGHBOURS, MEMORIES, recipeById,
} from './config.js';

export const PHASE = { TITLE: 'title', PLAY: 'play', DONE: 'done' };

function rand(a, b) { return a + Math.random() * (b - a); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export class GameState {
  constructor(theme, seed) {
    this.theme = theme;
    this.phase = PHASE.TITLE;
    this.time = 0;               // seconds since shift started
    this.timeLeft = SHIFT_SECONDS;
    this.score = 0;
    this.served = 0;
    this.expired = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.money = 0;
    this.orders = [];
    this.orderSeq = 0;
    this.spawnTimer = 2.5;
    this.rushAnnounced = false;
    this.birthdayAnnounced = false;
    this.banner = null;          // { text, sub, t }
    this.toast = null;           // { text, t }
    this.player = {
      x: CANVAS_W / 2, y: 560, r: PLAYER.r, // open floor below the assembly counter
      dir: 1, moving: false, carry: [], // carry: [{kind:'ing', id, state}] or {kind:'plate', items:[]}
    };
    this.board = { item: null, progress: 0, need: 1.6 };   // cutting board
    this.stove = [
      { item: null, progress: 0, need: 5 },
      { item: null, progress: 0, need: 5 },
    ];
    this.counterPlate = null;    // plate resting on the assembly counter
    this.neighbour = pick(NEIGHBOURS);
    this.neighbourTimer = 0;
    this.particles = [];
    this.frozen = false;         // screenshots: freeze the scene
    this.rngSeed = seed || 1;
    this.lastMemory = '';
    this.endReason = '';
  }

  start() {
    this.phase = PHASE.PLAY;
    this.time = 0;
    this.timeLeft = SHIFT_SECONDS;
    this.showBanner('Selamat pagi, Nak!', 'Warung Ibu Sari buka — masak dengan hati.');
  }

  showBanner(text, sub) { this.banner = { text, sub: sub || '', t: 0 }; }
  showToast(text) { this.toast = { text, t: 0 }; }

  update(dt, input, sfx) {
    if (this.phase === PHASE.TITLE) {
      if (input.consumeInteract() || input.consumeEnter()) { this.start(); sfx.startMusic(); sfx.bell(); }
      return;
    }
    if (this.phase === PHASE.DONE) {
      if (input.consumeInteract() || input.consumeEnter()) this.resetRun();
      return;
    }
    if (this.frozen) return;
    this.time += dt;
    this.timeLeft = Math.max(0, SHIFT_SECONDS - this.time);
    if (this.banner) { this.banner.t += dt; if (this.banner.t > 3.2) this.banner = null; }
    if (this.toast) { this.toast.t += dt; if (this.toast.t > 4) this.toast = null; }

    // Rush hour and the birthday finale.
    if (!this.rushAnnounced && this.time >= RUSH_START && this.time < RUSH_END) {
      this.rushAnnounced = true;
      this.showBanner('JAM MAKAN SIANG — RUSH!', 'Tetangga berdatangan, pesanan makin cepat!');
      sfx.rush();
    }
    if (!this.birthdayAnnounced && this.time >= BIRTHDAY_START) {
      this.birthdayAnnounced = true;
      this.showBanner("Makan Malam Ulang Tahun Ibu", 'Pesanan emas — nilai ganda, untuk Ibu.');
      sfx.rush();
    }

    // Move the cook.
    const mv = input.moveVector();
    const p = this.player;
    p.moving = mv.x !== 0 || mv.y !== 0;
    if (p.moving) {
      p.dir = mv.x !== 0 ? Math.sign(mv.x) : p.dir;
      const nx = p.x + mv.x * PLAYER.speed * dt;
      const ny = p.y + mv.y * PLAYER.speed * dt;
      const cx = this.clampMove(nx, p.y, p.r);
      if (cx !== null) p.x = cx;
      const cy = this.clampMove(p.x, ny, p.r);
      if (cy !== null) p.y = cy;
    }

    // Orders spawn faster during rush.
    const interval = this.time >= RUSH_START && this.time < RUSH_END ? 9 : 14;
    const maxOrders = this.time >= RUSH_START && this.time < RUSH_END ? 4 : 3;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.orders.length < maxOrders) {
      this.spawnOrder();
      this.spawnTimer = interval * rand(0.7, 1.2);
    }

    // Order timers tick down.
    for (const o of this.orders) o.left -= dt;
    const lost = this.orders.filter((o) => o.left <= 0);
    for (const o of lost) {
      this.orders.splice(this.orders.indexOf(o), 1);
      this.expired++;
      this.combo = 0;
      this.showToast(`Pesanan ${o.recipe.name} hangus — tetangga kecewa.`);
      sfx.fail();
    }

    // Neighbour at the pass changes now and then.
    this.neighbourTimer -= dt;
    if (this.neighbourTimer <= 0) {
      this.neighbour = pick(NEIGHBOURS);
      this.neighbourTimer = rand(9, 16);
    }

    // Cooking progresses on its own.
    for (const b of this.stove) {
      if (b.item) {
        b.progress += dt;
        if (b.progress >= b.need && !b.item.cooked) {
          b.item.cooked = true;
          b.item.state = 'cooked';
          sfx.cookDone();
          this.burst(b.x, b.y, '#ffb703');
        }
        if (b.progress >= b.need + 8 && !b.item.burnt) {
          b.item.burnt = true;
          b.item.state = 'burnt';
          sfx.fail();
        }
      }
    }

    // Particles.
    for (const pt of this.particles) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.life -= dt; }
    this.particles = this.particles.filter((pt) => pt.life > 0);

    // Interact.
    if (input.consumeInteract()) this.interact(sfx);

    // Shift ends.
    if (this.timeLeft <= 0) {
      this.phase = PHASE.DONE;
      this.endReason = this.score >= 800
        ? 'Ibu pasti bangga. Warungnya ramai, resepnya hidup lagi.'
        : 'Warung tutup — tapi resep Ibu tetap menunggu besok.';
      sfx.serve();
    }
  }

  resetRun() {
    const fresh = new GameState(this.theme, this.rngSeed);
    Object.assign(this, fresh);
    this.phase = PHASE.TITLE;
  }

  // ---- movement collision: keep the cook out of stations and walls ----
  clampMove(nx, ny, r) {
    const solids = this.solids();
    for (const s of solids) {
      if (nx > s.x - r && nx < s.x + s.w + r && ny > s.y - r && ny < s.y + s.h + r) {
        return null; // caller keeps old coordinate
      }
    }
    return Math.max(LAYOUT.floor.x + r, Math.min(LAYOUT.floor.x + LAYOUT.floor.w - r, nx));
  }

  solids() {
    const L = LAYOUT;
    const list = [];
    for (const c of L.crates) list.push({ x: c.x, y: c.y, w: L.crateW, h: L.crateH });
    list.push(L.board, L.stove, L.plates, L.trash, L.pass, L.sink, L.counter);
    list.push({ x: L.orders.x, y: L.orders.y, w: L.orders.w, h: L.orders.h });
    list.push({ x: L.book.x, y: L.book.y, w: L.book.w, h: L.book.h });
    return list;
  }

  // The player position after clamping needs both axes; helper used by update.
  // (update calls clampMove per axis with the other axis already moved.)

  spawnOrder() {
    const recipe = pick(RECIPES);
    const golden = this.time >= BIRTHDAY_START;
    this.orders.push({
      id: ++this.orderSeq,
      recipe,
      left: golden ? 75 : rand(48, 68),
      max: golden ? 75 : 68,
      golden,
      neighbour: pick(NEIGHBOURS),
    });
    this.showToast(`${recipe.name} dipesan — ${recipe.blurb}`);
  }

  nearestStation() {
    const p = this.player;
    const cx = p.x, cy = p.y;
    const dist = (r) => {
      const dx = Math.max(r.x - cx, 0, cx - (r.x + r.w));
      const dy = Math.max(r.y - cy, 0, cy - (r.y + r.h));
      return Math.hypot(dx, dy);
    };
    let best = null, bestD = 78;
    for (const c of LAYOUT.crates) {
      const r = { x: c.x, y: c.y, w: LAYOUT.crateW, h: LAYOUT.crateH };
      const d = dist(r);
      if (d < bestD) { bestD = d; best = { kind: 'crate', id: c.id, rect: r }; }
    }
    const named = [
      ['board', LAYOUT.board], ['stove', LAYOUT.stove], ['plates', LAYOUT.plates],
      ['trash', LAYOUT.trash], ['pass', LAYOUT.pass], ['sink', LAYOUT.sink],
      ['counter', LAYOUT.counter],
    ];
    for (const [kind, r] of named) {
      const d = dist(r);
      if (d < bestD) { bestD = d; best = { kind, rect: r }; }
    }
    return best;
  }

  interact(sfx) {
    const st = this.nearestStation();
    if (!st) return;
    const p = this.player;
    const handsFull = p.carry.length >= 3;

    if (st.kind === 'crate') {
      if (handsFull) { this.showToast('Tangan penuh! Letakkan dulu.'); sfx.fail(); return; }
      p.carry.push({ kind: 'ing', id: st.id, state: 'raw' });
      sfx.pickup();
      return;
    }
    if (st.kind === 'plates') {
      if (handsFull) { this.showToast('Tangan penuh!'); sfx.fail(); return; }
      p.carry.push({ kind: 'plate', items: [] });
      sfx.pickup();
      return;
    }
    if (st.kind === 'trash') {
      if (p.carry.length) { p.carry.pop(); sfx.place(); }
      else if (this.counterPlate) { this.counterPlate = null; sfx.place(); }
      return;
    }
    if (st.kind === 'board') {
      const held = p.carry[p.carry.length - 1];
      if (this.board.item) {
        // Chop what's on the board.
        if (INGREDIENTS[this.board.item.id].prep !== 'chop') {
          this.showToast('Bahan ini tidak perlu dipotong.');
          return;
        }
        this.board.progress += 0.55;
        sfx.chop();
        this.burst(this.board.x + 75, this.board.y + 40, '#7fb069');
        if (this.board.progress >= this.board.need) {
          this.board.item.state = 'chopped';
          if (!handsFull) {
            p.carry.push(this.board.item);
            this.board.item = null;
            this.board.progress = 0;
            sfx.chopDone();
            this.showToast(`${INGREDIENTS[p.carry[p.carry.length - 1].id].name} sudah dipotong rapi.`);
          } else {
            this.board.progress = this.board.need;
            this.showToast('Sudah terpotong — tanganmu penuh!');
          }
        }
        return;
      }
      if (held && held.kind === 'ing' && INGREDIENTS[held.id].prep === 'chop' && held.state === 'raw') {
        this.board.item = p.carry.pop();
        this.board.progress = 0;
        sfx.place();
        return;
      }
      if (held && held.kind === 'ing') {
        this.showToast(`${INGREDIENTS[held.id].name} tidak perlu dipotong — langsung masak saja.`);
      }
      return;
    }
    if (st.kind === 'stove') {
      const held = p.carry[p.carry.length - 1];
      const burner = this.stove.find((b) => !b.item) || this.stove[0];
      if (burner.item && burner.item.cooked && !handsFull) {
        p.carry.push(burner.item);
        burner.item = null;
        burner.progress = 0;
        sfx.pickup();
        return;
      }
      if (held && held.kind === 'ing' && INGREDIENTS[held.id].prep === 'cook' && held.state === 'raw') {
        const free = this.stove.find((b) => !b.item);
        if (!free) { this.showToast('Kompor penuh!'); sfx.fail(); return; }
        free.item = p.carry.pop();
        free.progress = 0;
        sfx.sizzle();
        return;
      }
      if (held && held.kind === 'ing') {
        this.showToast(`${INGREDIENTS[held.id].name} perlu dipotong dulu di talenan.`);
      }
      return;
    }
    if (st.kind === 'counter') {
      const held = p.carry[p.carry.length - 1];
      // Put a plate down, or add an ingredient to the plate on the counter.
      if (this.counterPlate) {
        if (held && held.kind === 'ing' && held.state !== 'raw') {
          this.counterPlate.items.push(held.id);
          p.carry.pop();
          sfx.place();
          this.checkDishComplete();
        } else if (held && held.kind === 'ing') {
          this.showToast('Bahan mentah belum bisa disajikan — olah dulu!');
          sfx.fail();
        } else if (held && held.kind === 'plate') {
          this.showToast('Sudah ada piring di meja rakit.');
        } else {
          // Pick the plate back up.
          if (!handsFull) { p.carry.push(this.counterPlate); this.counterPlate = null; sfx.pickup(); }
        }
        return;
      }
      if (held && held.kind === 'plate') {
        this.counterPlate = p.carry.pop();
        sfx.place();
        return;
      }
      if (held && held.kind === 'ing') {
        this.showToast('Ambil piring dulu, baru rakit hidangan di sini.');
      }
      return;
    }
    if (st.kind === 'pass') {
      const held = p.carry[p.carry.length - 1];
      if (held && held.kind === 'plate') {
        this.servePlate(held, sfx);
        return;
      }
      if (this.counterPlate && this.counterPlate.items.length) {
        this.showToast('Bawa piringnya ke jendela saji dulu (ambil dari meja).');
        return;
      }
      this.showToast('Jendela saji: serahkan piring hidangan yang sudah lengkap.');
      return;
    }
    if (st.kind === 'sink') {
      // Wash a burnt item back to usable, or clear a plate.
      const held = p.carry[p.carry.length - 1];
      if (held && held.kind === 'ing' && held.state === 'burnt') {
        p.carry.pop();
        sfx.place();
        this.showToast('Dibuang — Ibu tidak pernah menyajikan yang gosong.');
        return;
      }
      if (held && held.kind === 'plate' && held.items.length) {
        held.items = [];
        sfx.place();
        this.showToast('Piring dicuci bersih, siap dirakit lagi.');
      }
      return;
    }
  }

  checkDishComplete() {
    const plate = this.counterPlate;
    if (!plate) return;
    for (const r of RECIPES) {
      if (r.needs.length === plate.items.length && r.needs.every((n) => plate.items.includes(n))) {
        plate.dish = r.id;
        this.showToast(`${r.name} selesai dirakit! Antar ke jendela saji.`);
        return;
      }
    }
  }

  servePlate(plate, sfx) {
    const p = this.player;
    if (!plate.dish) {
      this.showToast('Piring ini belum jadi hidangan lengkap — cek buku resep Ibu.');
      sfx.fail();
      return;
    }
    const recipe = recipeById(plate.dish);
    const order = this.orders.find((o) => o.recipe.id === recipe.id);
    p.carry.pop();
    if (!order) {
      this.showToast(`${recipe.name} tidak ada yang memesan — tapi tetap hangat disajikan.`);
      this.score += 20;
      sfx.place();
      return;
    }
    this.orders.splice(this.orders.indexOf(order), 1);
    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const timeBonus = Math.round((order.left / order.max) * 50);
    const mult = order.golden ? 2 : 1;
    const pts = (recipe.price + timeBonus) * mult + (this.combo - 1) * 10;
    this.score += pts;
    this.money += recipe.price * mult;
    this.served++;
    this.lastMemory = recipe.memory;
    this.showToast(`✦ ${recipe.name} tersaji! +${pts} — ${recipe.memory}`);
    this.burst(LAYOUT.pass.x + 64, LAYOUT.pass.y + 80, '#ffb703');
    sfx.serve();
  }

  burst(x, y, color) {
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x, y, vx: rand(-90, 90), vy: rand(-140, -20),
        life: rand(0.4, 0.9), color,
      });
    }
  }
}
