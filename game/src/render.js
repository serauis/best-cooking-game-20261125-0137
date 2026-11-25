// Dapur Ibu: every pixel is drawn in code — kitchen, food, neighbours, HUD.
// No external images, no fonts beyond the system sans stack.
import {
  CANVAS_W, CANVAS_H, THEMES, INGREDIENTS, RECIPES, LAYOUT,
  ingredientName, recipeById,
} from './config.js';
import { PHASE } from './state.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  themeOf(state) { return THEMES[state.theme] || THEMES.warung; }

  render(state, input) {
    const ctx = this.ctx;
    const T = this.themeOf(state);
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    this.drawFloor(ctx, T);
    this.drawOrderBoard(ctx, state, T);
    this.drawRecipeBook(ctx, state, T);
    this.drawCrates(ctx, state, T);
    this.drawBoard(ctx, state, T);
    this.drawStove(ctx, state, T);
    this.drawPlates(ctx, state, T);
    this.drawTrash(ctx, state, T);
    this.drawPass(ctx, state, T);
    this.drawSink(ctx, state, T);
    this.drawCounter(ctx, state, T);
    this.drawParticles(ctx, state);
    if (state.phase !== PHASE.TITLE) this.drawPlayer(ctx, state, T);
    this.drawHUD(ctx, state, T);
    this.drawBanner(ctx, state, T);
    this.drawToast(ctx, state, T);
    if (state.phase === PHASE.TITLE) this.drawTitle(ctx, state, T);
    if (state.phase === PHASE.DONE) this.drawDone(ctx, state, T);
    this.drawHint(ctx, state, T, input);
  }

  // ---- kitchen shell ----
  drawFloor(ctx, T) {
    const L = LAYOUT;
    ctx.fillStyle = T.wall;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = T.wallTop;
    ctx.fillRect(0, 0, CANVAS_W, 8);
    // Floor tiles.
    ctx.fillStyle = T.floor;
    ctx.fillRect(L.floor.x, L.floor.y, L.floor.w, L.floor.h);
    ctx.strokeStyle = T.floorDark;
    ctx.lineWidth = 2;
    for (let x = L.floor.x; x <= L.floor.x + L.floor.w; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, L.floor.y); ctx.lineTo(x, L.floor.y + L.floor.h); ctx.stroke();
    }
    for (let y = L.floor.y; y <= L.floor.y + L.floor.h; y += 80) {
      ctx.beginPath(); ctx.moveTo(L.floor.x, y); ctx.lineTo(L.floor.x + L.floor.w, y); ctx.stroke();
    }
    // Left wall panels.
    ctx.fillStyle = T.wallTop;
    ctx.fillRect(0, LAYOUT.hudH, 312, CANVAS_H - LAYOUT.hudH);
    // Warm string lights along the top of the kitchen.
    const lights = ['#ffb703', '#ff6b6b', '#7fb069', '#4cc9f0'];
    for (let i = 0; i < 12; i++) {
      const x = 340 + i * 78;
      ctx.fillStyle = lights[i % 4];
      ctx.beginPath(); ctx.arc(x, 64, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.moveTo(x - 39, 56); ctx.quadraticCurveTo(x, 70, x + 39, 56); ctx.stroke();
    }
  }

  stationBase(ctx, r, T, label) {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    this.rrect(ctx, r.x + 3, r.y + 5, r.w, r.h, 10); ctx.fill();
    ctx.fillStyle = T.counter;
    this.rrect(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
    ctx.fillStyle = T.counterTop;
    this.rrect(ctx, r.x, r.y, r.w, 14, 7); ctx.fill();
    ctx.fillStyle = T.label || '#2b1d0e';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, r.x + r.w / 2, r.y + r.h - 8);
  }

  rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ---- ingredient icons (vector, drawn fresh each time) ----
  drawIngredientIcon(ctx, id, x, y, s) {
    const ing = INGREDIENTS[id];
    const c = ing.color, d = ing.dark;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s / 32, s / 32);
    if (ing.icon === 'rice') {
      ctx.fillStyle = '#e8e0c8'; ctx.beginPath(); ctx.ellipse(0, 6, 15, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, 2, 13, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = d; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * 4, -2 + (i % 2) * 3, 1.6, 0, Math.PI * 2); ctx.fill(); }
    } else if (ing.icon === 'drumstick') {
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(-2, -2, 11, 9, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff3dd'; ctx.beginPath(); ctx.arc(10, 8, 3.4, 0, Math.PI * 2); ctx.arc(13, 4, 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = d; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(6, 4); ctx.lineTo(11, 7); ctx.stroke();
    } else if (ing.icon === 'egg') {
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, 0, 10, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = d; ctx.beginPath(); ctx.ellipse(2, 4, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
    } else if (ing.icon === 'leaf') {
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, 0, 13, 8, -0.6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = d; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-11, 7); ctx.quadraticCurveTo(0, -2, 11, -7); ctx.stroke();
      ctx.fillStyle = '#8ac926'; ctx.beginPath(); ctx.arc(-6, -6, 3, 0, Math.PI * 2); ctx.fill();
    } else if (ing.icon === 'noodle') {
      ctx.strokeStyle = c; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(-12, i * 7);
        ctx.bezierCurveTo(-6, i * 7 - 6, 0, i * 7 + 6, 12, i * 7); ctx.stroke();
      }
      ctx.strokeStyle = d; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-12, -7); ctx.lineTo(12, -7); ctx.stroke();
    } else if (ing.icon === 'chilli') {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-12, 4);
      ctx.quadraticCurveTo(-4, -10, 10, -8); ctx.quadraticCurveTo(13, -2, 6, 4);
      ctx.quadraticCurveTo(-4, 10, -12, 4); ctx.fill();
      ctx.strokeStyle = '#4f7d3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(10, -8); ctx.quadraticCurveTo(14, -13, 12, -15); ctx.stroke();
    } else if (ing.icon === 'banana') {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-13, -6);
      ctx.quadraticCurveTo(-2, 14, 13, -2); ctx.quadraticCurveTo(14, 4, 8, 8);
      ctx.quadraticCurveTo(-4, 18, -13, -6); ctx.fill();
      ctx.fillStyle = d; ctx.beginPath(); ctx.arc(-12, -7, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  drawCarried(ctx, item, x, y, s) {
    if (item.kind === 'plate') {
      this.drawPlate(ctx, x, y, s, item.items, item.dish);
    } else {
      this.drawIngredientIcon(ctx, item.id, x, y, s);
      if (item.state === 'chopped') {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - s / 2, y - s / 2); ctx.lineTo(x + s / 2, y + s / 2); ctx.stroke();
      }
      if (item.state === 'cooked') {
        ctx.fillStyle = 'rgba(255,183,3,0.9)';
        ctx.beginPath(); ctx.arc(x + s / 3, y - s / 3, 4, 0, Math.PI * 2); ctx.fill();
      }
      if (item.state === 'burnt') {
        ctx.fillStyle = 'rgba(20,10,5,0.85)';
        ctx.beginPath(); ctx.arc(x, y, s / 2.4, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  drawPlate(ctx, x, y, s, items, dishId) {
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath(); ctx.ellipse(x, y, s / 2, s / 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#adb5bd'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(x, y, s / 3.2, s / 4.4, 0, 0, Math.PI * 2); ctx.stroke();
    if (dishId) {
      const r = recipeById(dishId);
      ctx.fillStyle = '#2b1d0e';
      ctx.font = `bold ${Math.max(9, s / 5)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('✓', x, y + 4);
      return;
    }
    if (items && items.length) {
      items.forEach((id, i) => {
        const a = (i / Math.max(1, items.length)) * Math.PI * 2 - Math.PI / 2;
        this.drawIngredientIcon(ctx, id, x + Math.cos(a) * s / 5, y + Math.sin(a) * s / 6, s / 2.6);
      });
    }
  }

  // ---- stations ----
  drawCrates(ctx, state, T) {
    for (const c of LAYOUT.crates) {
      const r = { x: c.x, y: c.y, w: LAYOUT.crateW, h: LAYOUT.crateH };
      this.stationBase(ctx, r, T, INGREDIENTS[c.id].name);
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      this.rrect(ctx, r.x + 8, r.y + 18, r.w - 16, 26, 6); ctx.fill();
      this.drawIngredientIcon(ctx, c.id, r.x + r.w / 2, r.y + 31, 30);
    }
  }

  drawBoard(ctx, state, T) {
    const r = LAYOUT.board;
    this.stationBase(ctx, r, T, 'TALENAN — potong (E)');
    ctx.fillStyle = T.board;
    this.rrect(ctx, r.x + 14, r.y + 16, r.w - 28, 52, 8); ctx.fill();
    ctx.strokeStyle = '#b3854f'; ctx.lineWidth = 2;
    this.rrect(ctx, r.x + 14, r.y + 16, r.w - 28, 52, 8); ctx.stroke();
    if (state.board.item) {
      this.drawIngredientIcon(ctx, state.board.item.id, r.x + r.w / 2, r.y + 42, 34);
      if (state.board.progress > 0) {
        const w = r.w - 36;
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(r.x + 18, r.y + 74, w, 10);
        ctx.fillStyle = '#7fb069';
        ctx.fillRect(r.x + 18, r.y + 74, w * Math.min(1, state.board.progress / state.board.need), 10);
      }
    } else {
      ctx.fillStyle = 'rgba(43,29,14,0.55)';
      ctx.font = '11px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('taruh sayur / cabai', r.x + r.w / 2, r.y + 44);
    }
  }

  drawStove(ctx, state, T) {
    const r = LAYOUT.stove;
    this.stationBase(ctx, r, T, 'KOMPOR — masak (E)');
    state.stove.forEach((b, i) => {
      const bx = r.x + 18 + i * 105;
      const by = r.y + 20;
      ctx.fillStyle = '#22223b';
      ctx.beginPath(); ctx.ellipse(bx + 42, by + 24, 42, 26, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#4a4e69'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(bx + 42, by + 24, 34, 19, 0, 0, Math.PI * 2); ctx.stroke();
      if (b.item) {
        const hot = b.progress > 0 && !b.item.cooked;
        if (hot) {
          ctx.fillStyle = Math.random() > 0.5 ? '#ff9e00' : '#ff6b35';
          ctx.beginPath(); ctx.arc(bx + 42, by + 8, 5, 0, Math.PI * 2); ctx.fill();
        }
        this.drawIngredientIcon(ctx, b.item.id, bx + 42, by + 24, 30);
        if (b.item.burnt) {
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.beginPath(); ctx.ellipse(bx + 42, by + 24, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = 'bold 11px system-ui, sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('GOSONG!', bx + 42, by + 28);
        } else if (!b.item.cooked) {
          const w = 76;
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.fillRect(bx + 4, by + 56, w, 9);
          ctx.fillStyle = '#ff9e00';
          ctx.fillRect(bx + 4, by + 56, w * Math.min(1, b.progress / b.need), 9);
        } else {
          ctx.fillStyle = '#7fb069'; ctx.font = 'bold 12px system-ui, sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('MATANG ✓', bx + 42, by + 66);
        }
      }
    });
  }

  drawPlates(ctx, state, T) {
    const r = LAYOUT.plates;
    this.stationBase(ctx, r, T, 'PIRING');
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === 0 ? '#ffffff' : '#e9ecef';
      ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, r.y + 34 + i * 9, 34, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#adb5bd'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, r.y + 34 + i * 9, 34, 9, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(43,29,14,0.6)'; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('ambil piring (E)', r.x + r.w / 2, r.y + 82);
  }

  drawTrash(ctx, state, T) {
    const r = LAYOUT.trash;
    this.stationBase(ctx, r, T, 'SAMPAH');
    ctx.fillStyle = '#495057';
    this.rrect(ctx, r.x + 28, r.y + 20, 40, 48, 6); ctx.fill();
    ctx.fillStyle = '#343a40';
    this.rrect(ctx, r.x + 22, r.y + 14, 52, 10, 4); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('×', r.x + r.w / 2, r.y + 48);
  }

  drawPass(ctx, state, T) {
    const r = LAYOUT.pass;
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    this.rrect(ctx, r.x + 3, r.y + 5, r.w, r.h, 10); ctx.fill();
    ctx.fillStyle = T.pass;
    this.rrect(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
    ctx.fillStyle = '#2b1d0e'; ctx.font = 'bold 13px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('JENDELA SAJI', r.x + r.w / 2, r.y + 18);
    // Neighbour waiting at the window.
    const n = state.neighbour;
    const nx = r.x + r.w / 2, ny = r.y + 78;
    ctx.fillStyle = n.color;
    ctx.beginPath(); ctx.arc(nx, ny - 18, 20, 0, Math.PI * 2); ctx.fill(); // head
    ctx.fillStyle = '#f4d9b0';
    ctx.beginPath(); ctx.arc(nx, ny - 18, 15, 0, Math.PI * 2); ctx.fill(); // face
    ctx.fillStyle = '#2b1d0e';
    ctx.beginPath(); ctx.arc(nx - 5, ny - 20, 2, 0, Math.PI * 2); ctx.arc(nx + 5, ny - 20, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(nx, ny - 12, 5, 0, Math.PI); ctx.stroke();
    ctx.fillStyle = n.color;
    this.rrect(ctx, nx - 22, ny + 2, 44, 34, 8); ctx.fill(); // body
    ctx.fillStyle = '#2b1d0e'; ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText(n.name, nx, ny + 52);
    ctx.font = 'italic 11px system-ui, sans-serif';
    ctx.fillStyle = '#5a4632';
    this.wrapText(ctx, `"${n.quote}"`, nx, ny + 70, r.w - 12, 13);
    // A ready plate glows here when one is being served.
    if (state.counterPlate && state.counterPlate.dish) {
      ctx.fillStyle = 'rgba(255,183,3,0.25)';
      this.rrect(ctx, r.x + 8, r.y + r.h - 46, r.w - 16, 36, 8); ctx.fill();
      ctx.fillStyle = '#7f4f24'; ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText('Siap disajikan!', nx, r.y + r.h - 24);
    }
  }

  drawSink(ctx, state, T) {
    const r = LAYOUT.sink;
    this.stationBase(ctx, r, T, 'WASTAFEL — cuci piring');
    ctx.fillStyle = '#a8dadc';
    this.rrect(ctx, r.x + 18, r.y + 18, r.w - 36, 44, 8); ctx.fill();
    ctx.strokeStyle = '#457b9d'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(r.x + r.w / 2, r.y + 18); ctx.lineTo(r.x + r.w / 2, r.y + 8);
    ctx.lineTo(r.x + r.w / 2 + 22, r.y + 8); ctx.stroke();
    ctx.fillStyle = '#457b9d';
    ctx.beginPath(); ctx.arc(r.x + r.w / 2 + 22, r.y + 12, 3, 0, Math.PI * 2); ctx.fill();
  }

  drawCounter(ctx, state, T) {
    const r = LAYOUT.counter;
    this.stationBase(ctx, r, T, 'MEJA RAKIT — susun hidangan');
    if (state.counterPlate) {
      this.drawPlate(ctx, r.x + r.w / 2, r.y + 46, 64, state.counterPlate.items, state.counterPlate.dish);
      if (state.counterPlate.dish) {
        ctx.fillStyle = '#2b7a2b'; ctx.font = 'bold 13px system-ui, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(`${recipeById(state.counterPlate.dish).name} ✓ SIAP`, r.x + r.w / 2, r.y + 70);
      } else {
        ctx.fillStyle = '#5a4632'; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('tambah bahan sesuai resep Ibu', r.x + r.w / 2, r.y + 70);
      }
    } else {
      ctx.fillStyle = 'rgba(43,29,14,0.55)'; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('letakkan piring di sini', r.x + r.w / 2, r.y + 46);
    }
  }

  // ---- left panels ----
  drawOrderBoard(ctx, state, T) {
    const r = LAYOUT.orders;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    this.rrect(ctx, r.x + 3, r.y + 4, r.w, r.h, 10); ctx.fill();
    ctx.fillStyle = T.ticket;
    this.rrect(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
    ctx.fillStyle = '#2b1d0e'; ctx.font = 'bold 16px system-ui, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('📋 PAPAN PESANAN', r.x + 12, r.y + 24);
    ctx.strokeStyle = '#d8cf9f'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(r.x + 12, r.y + 32); ctx.lineTo(r.x + r.w - 12, r.y + 32); ctx.stroke();
    if (!state.orders.length) {
      ctx.fillStyle = '#8a7a5a'; ctx.font = '13px system-ui, sans-serif';
      ctx.fillText('Belum ada pesanan…', r.x + 12, r.y + 60);
      ctx.fillText('tetangga sebentar lagi datang.', r.x + 12, r.y + 80);
    }
    state.orders.forEach((o, i) => {
      const y = r.y + 44 + i * 66;
      const urgent = o.left < 15;
      ctx.fillStyle = o.golden ? '#fff3b0' : (urgent ? '#ffe0e0' : '#fffdf2');
      this.rrect(ctx, r.x + 8, y, r.w - 16, 58, 8); ctx.fill();
      ctx.strokeStyle = o.golden ? '#ffb703' : (urgent ? '#e63946' : '#d8cf9f');
      ctx.lineWidth = 2;
      this.rrect(ctx, r.x + 8, y, r.w - 16, 58, 8); ctx.stroke();
      ctx.fillStyle = '#2b1d0e'; ctx.font = 'bold 13px system-ui, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText((o.golden ? '★ ' : '') + o.recipe.name, r.x + 16, y + 18);
      ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = '#6b5a44';
      ctx.fillText(o.recipe.needs.map(ingredientName).join(' + '), r.x + 16, y + 34);
      ctx.fillText(`untuk ${o.neighbour.name}`, r.x + 16, y + 49);
      // Timer bar.
      const frac = Math.max(0, o.left / o.max);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(r.x + r.w - 66, y + 10, 50, 8);
      ctx.fillStyle = urgent ? '#e63946' : (frac > 0.5 ? '#7fb069' : '#ffb703');
      ctx.fillRect(r.x + r.w - 66, y + 10, 50 * frac, 8);
      ctx.fillStyle = '#2b1d0e'; ctx.font = 'bold 11px system-ui, sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(`${Math.ceil(o.left)} dtk`, r.x + r.w - 16, y + 48);
      ctx.textAlign = 'left';
    });
  }

  drawRecipeBook(ctx, state, T) {
    const r = LAYOUT.book;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    this.rrect(ctx, r.x + 3, r.y + 4, r.w, r.h, 10); ctx.fill();
    ctx.fillStyle = '#f7ead0';
    this.rrect(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
    ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 2;
    this.rrect(ctx, r.x + 6, r.y + 6, r.w - 12, r.h - 12, 6); ctx.stroke();
    ctx.fillStyle = '#6b3f1d'; ctx.font = 'bold 15px system-ui, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('📖 Buku Resep Ibu', r.x + 14, r.y + 28);
    ctx.font = 'italic 12px system-ui, sans-serif'; ctx.fillStyle = '#8a6a42';
    ctx.fillText('ditulis tangan, penuh cinta', r.x + 14, r.y + 46);
    let y = r.y + 70;
    for (const rec of RECIPES) {
      ctx.fillStyle = '#2b1d0e'; ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText(rec.name, r.x + 14, y);
      ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = '#6b5a44';
      ctx.fillText(rec.needs.map(ingredientName).join(' + '), r.x + 14, y + 14);
      y += 32;
    }
    // Ibu's framed photo + memory line.
    const py = r.y + r.h - 62;
    ctx.fillStyle = '#fff'; ctx.fillRect(r.x + 14, py, 44, 48);
    ctx.fillStyle = '#b56576';
    ctx.beginPath(); ctx.arc(r.x + 36, py + 20, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4d9b0';
    ctx.beginPath(); ctx.arc(r.x + 36, py + 20, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6b3f1d'; ctx.beginPath(); ctx.arc(r.x + 36, py + 14, 8, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#b56576'; this.rrect(ctx, r.x + 24, py + 32, 24, 12, 4); ctx.fill();
    ctx.fillStyle = '#6b3f1d'; ctx.font = 'italic 12px system-ui, sans-serif';
    const mem = state.lastMemory || '“Masak dengan hati, Nak.” — Ibu Sari';
    this.wrapText(ctx, mem, r.x + 68, py + 16, r.w - 82, 15);
  }

  // ---- player ----
  drawPlayer(ctx, state, T) {
    const p = state.player;
    const bob = p.moving ? Math.sin(Date.now() / 90) * 2 : 0;
    ctx.save();
    ctx.translate(p.x, p.y + bob);
    // Shadow.
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 20, 20, 7, 0, 0, Math.PI * 2); ctx.fill();
    // Body: apron + shirt.
    ctx.fillStyle = '#e63946';
    ctx.beginPath(); ctx.arc(0, 4, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath(); ctx.ellipse(0, 8, 13, 12, 0, 0, Math.PI * 2); ctx.fill();
    // Head + chef hat.
    ctx.fillStyle = '#f4d9b0';
    ctx.beginPath(); ctx.arc(0, -16, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(0, -26, 13, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-11, -30, 22, 8);
    ctx.fillStyle = '#2b1d0e';
    ctx.beginPath(); ctx.arc(-4 * p.dir, -16, 1.8, 0, Math.PI * 2); ctx.arc(4 * p.dir, -16, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -11, 4, 0, Math.PI); ctx.stroke();
    // Hands carrying items above the head.
    p.carry.forEach((item, i) => {
      const ox = (i - (p.carry.length - 1) / 2) * 30;
      this.drawCarried(ctx, item, ox, -44, 26);
    });
    ctx.restore();
    // Interaction hint ring on the nearest station.
    const st = state.nearestStation ? state.nearestStation() : null;
    if (st && state.phase === PHASE.PLAY) {
      ctx.strokeStyle = 'rgba(255,183,3,0.95)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      this.rrect(ctx, st.rect.x - 4, st.rect.y - 4, st.rect.w + 8, st.rect.h + 8, 12);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  drawParticles(ctx, state) {
    for (const pt of state.particles) {
      ctx.globalAlpha = Math.max(0, pt.life);
      ctx.fillStyle = pt.color;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ---- HUD, banners, screens ----
  drawHUD(ctx, state, T) {
    ctx.fillStyle = T.hud;
    ctx.fillRect(0, 0, CANVAS_W, LAYOUT.hudH);
    ctx.fillStyle = T.text;
    ctx.font = 'bold 22px system-ui, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('🍳 WARUNG IBU SARI', 16, 34);
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('Dapur Ibu — masak resep Ibu untuk tetangga', 16, 52);
    // Shift timer (the timer you can feel).
    const mm = Math.floor(state.timeLeft / 60);
    const ss = Math.floor(state.timeLeft % 60);
    const low = state.timeLeft < 30;
    ctx.fillStyle = low ? '#ff6b6b' : T.text;
    ctx.font = 'bold 26px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`⏱ ${mm}:${String(ss).padStart(2, '0')}`, 640, 34);
    const frac = state.timeLeft / 180;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(520, 42, 240, 7);
    ctx.fillStyle = low ? '#ff6b6b' : '#ffb703';
    ctx.fillRect(520, 42, 240 * frac, 7);
    // Score, combo, served.
    ctx.fillStyle = T.text; ctx.textAlign = 'right';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(`★ ${state.score}`, 1264, 30);
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(`Rp ${state.money}  •  tersaji ${state.served}  •  kombo ×${state.combo}`, 1264, 50);
    if (state.combo >= 2) {
      ctx.fillStyle = '#ffb703';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText(`KOMBO ×${state.combo}!`, 1080, 30);
    }
    ctx.textAlign = 'left';
  }

  drawBanner(ctx, state, T) {
    if (!state.banner) return;
    const a = state.banner.t < 0.3 ? state.banner.t / 0.3 : (state.banner.t > 2.6 ? (3.2 - state.banner.t) / 0.6 : 1);
    ctx.globalAlpha = Math.max(0, Math.min(1, a));
    ctx.fillStyle = 'rgba(30,16,6,0.88)';
    this.rrect(ctx, 340, 250, 600, 84, 14); ctx.fill();
    ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 3;
    this.rrect(ctx, 340, 250, 600, 84, 14); ctx.stroke();
    ctx.fillStyle = '#ffe9c9'; ctx.font = 'bold 26px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(state.banner.text, 640, 286);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText(state.banner.sub, 640, 312);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  drawToast(ctx, state, T) {
    if (!state.toast) return;
    ctx.globalAlpha = Math.max(0, Math.min(1, 4 - state.toast.t));
    ctx.fillStyle = 'rgba(30,16,6,0.85)';
    const w = Math.min(760, ctx.measureText(state.toast.text).width + 40);
    this.rrect(ctx, (CANVAS_W - w) / 2, CANVAS_H - 66, w, 34, 10); ctx.fill();
    ctx.fillStyle = '#ffe9c9'; ctx.font = '14px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(state.toast.text, CANVAS_W / 2, CANVAS_H - 44);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  drawHint(ctx, state, T, input) {
    if (state.phase !== PHASE.PLAY) return;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(320, CANVAS_H - 30, 944, 30);
    ctx.fillStyle = '#fff3dd'; ctx.font = '13px system-ui, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('Gerak: WASD / panah   •   Ambil & olah: E / klik   •   M: bisu   •   Ambil bahan → potong/masak → rakit di piring → sajikan', 332, CANVAS_H - 11);
  }

  drawTitle(ctx, state, T) {
    ctx.fillStyle = 'rgba(20,10,4,0.72)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#ffe9c9'; ctx.textAlign = 'center';
    ctx.font = 'bold 54px system-ui, sans-serif';
    ctx.fillText('🍳 DAPUR IBU', CANVAS_W / 2, 190);
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillStyle = '#ffb703';
    ctx.fillText('Warung Ibu Sari', CANVAS_W / 2, 232);
    ctx.fillStyle = '#ffe9c9'; ctx.font = '17px system-ui, sans-serif';
    this.wrapText(ctx, 'Ibu sudah tiada, tapi resepnya masih hidup di buku kecil ini. Setiap sore, tetangga datang rindu masakan Ibu — dan kini giliranmu yang memasak untuk mereka.', CANVAS_W / 2, 280, 640, 24);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText('Ambil bahan di peti → potong di talenan / masak di kompor → rakit di piring → sajikan di jendela.', CANVAS_W / 2, 400);
    ctx.fillText('Selesaikan pesanan sebelum waktunya habis. Shift 3 menit — jam makan siang makin ramai!', CANVAS_W / 2, 426);
    const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 400);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#ffb703'; ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('▶  Klik atau tekan Enter untuk mulai memasak', CANVAS_W / 2, 500);
    ctx.globalAlpha = 1;
    ctx.font = '13px system-ui, sans-serif'; ctx.fillStyle = '#cbb693';
    ctx.fillText('WASD / panah untuk bergerak  •  E / klik untuk berinteraksi  •  M untuk bisu', CANVAS_W / 2, 540);
    ctx.textAlign = 'left';
  }

  drawDone(ctx, state, T) {
    ctx.fillStyle = 'rgba(20,10,4,0.78)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#ffe9c9'; ctx.textAlign = 'center';
    ctx.font = 'bold 40px system-ui, sans-serif';
    ctx.fillText('Warung Tutup — Terima Kasih, Nak', CANVAS_W / 2, 170);
    ctx.font = 'italic 18px system-ui, sans-serif'; ctx.fillStyle = '#ffb703';
    this.wrapText(ctx, state.endReason, CANVAS_W / 2, 210, 640, 26);
    ctx.fillStyle = '#ffe9c9'; ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText(`Skor akhir: ${state.score}   •   Hidangan tersaji: ${state.served}   •   Kombo terbaik: ×${state.bestCombo}`, CANVAS_W / 2, 300);
    ctx.font = '17px system-ui, sans-serif';
    ctx.fillText(`Uang hari ini: Rp ${state.money}   •   Pesanan hangus: ${state.expired}`, CANVAS_W / 2, 336);
    const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 400);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#ffb703'; ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('▶  Klik untuk masak lagi besok', CANVAS_W / 2, 420);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  wrapText(ctx, text, x, y, maxW, lineH) {
    const words = String(text).split(' ');
    let line = '';
    const align = ctx.textAlign;
    const cx = align === 'center' ? x : x;
    let yy = y;
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, cx, yy);
        line = w;
        yy += lineH;
      } else line = test;
    }
    if (line) ctx.fillText(line, cx, yy);
    return yy;
  }
}
