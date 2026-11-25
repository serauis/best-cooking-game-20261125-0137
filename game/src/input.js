// Dapur Ibu: keyboard + mouse input. WASD/arrows move, E/Space/click interact.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, clicked: false, down: false };
    this.interactPressed = false;
    this.anyKey = false;
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (!e.repeat) {
        this.anyKey = true;
        if (e.key === 'e' || e.key === 'E' || e.key === ' ') this.interactPressed = true;
        if (e.key === 'm' || e.key === 'M') this.mutePressed = true;
        if (e.key === 'Enter') this.enterPressed = true;
      }
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    });
    canvas.addEventListener('mousedown', (e) => {
      this.mouse.down = true;
      this.mouse.clicked = true;
      this.anyKey = true;
    });
    window.addEventListener('mouseup', () => { this.mouse.down = false; });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  moveVector() {
    let x = 0, y = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    if (x && y) { x *= 0.7071; y *= 0.7071; }
    return { x, y };
  }

  consumeInteract() {
    const v = this.interactPressed || this.mouse.clicked;
    this.interactPressed = false;
    this.mouse.clicked = false;
    return v;
  }

  consumeEnter() {
    const v = this.enterPressed;
    this.enterPressed = false;
    return v;
  }

  consumeMute() {
    const v = this.mutePressed;
    this.mutePressed = false;
    return v;
  }
}
