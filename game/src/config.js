// Dapur Ibu — Warung Ibu Sari: configuration, themes, recipes, neighbours.
// All names, art and music are original. No commercial game is copied.
export const CANVAS_W = 1280;
export const CANVAS_H = 720;
export const SHIFT_SECONDS = 180;
export const RUSH_START = 90;
export const RUSH_END = 150;
export const BIRTHDAY_START = 160;

// Four visual themes for the ladder. Same kitchen, same game — different light.
export const THEMES = {
  warung: {
    label: 'Warung Kayu Hangat',
    floor: '#c89b62', floorDark: '#b3854f', wall: '#8a5a33', wallTop: '#6f4526',
    counter: '#a06a35', counterTop: '#c98f4e', board: '#e8c98a', hud: '#3d2412',
    text: '#fff3dd', accent: '#ffb703', pass: '#f4e3c2', ticket: '#fff8e7', label: '#2b1d0e',
  },
  morning: {
    label: 'Pagi Pasar Cerah',
    floor: '#e8c98f', floorDark: '#d9b878', wall: '#4f9d69', wallTop: '#3b7d52',
    counter: '#7fb069', counterTop: '#a7c957', board: '#f2e3b3', hud: '#1d4d2b',
    text: '#fffbe8', accent: '#ff7b00', pass: '#fff3d6', ticket: '#fffdf2', label: '#2b1d0e',
  },
  dusk: {
    label: 'Senja Lampion',
    floor: '#7a4a3a', floorDark: '#66402f', wall: '#3a2a4a', wallTop: '#2c1f38',
    counter: '#5d3a4a', counterTop: '#8a5a6b', board: '#e8c98a', hud: '#241726',
    text: '#ffe9c9', accent: '#ff9e4f', pass: '#f4d9b0', ticket: '#fff3dd', label: '#ffe9c9',
  },
  modern: {
    label: 'Dapur Modern Bersih',
    floor: '#b8c4cc', floorDark: '#a2b0bb', wall: '#3e5c76', wallTop: '#2f4858',
    counter: '#748cab', counterTop: '#a3b8cc', board: '#f0ead8', hud: '#1d3557',
    text: '#f1faee', accent: '#e63946', pass: '#eef3f6', ticket: '#ffffff', label: '#1d3557',
  },
};

export const INGREDIENTS = {
  nasi:   { name: 'Nasi',    prep: 'cook', color: '#f5f0dc', dark: '#d8cf9f', icon: 'rice' },
  ayam:   { name: 'Ayam',    prep: 'cook', color: '#f2b880', dark: '#c98a4e', icon: 'drumstick' },
  telur:  { name: 'Telur',   prep: 'cook', color: '#ffe9a8', dark: '#e8c25e', icon: 'egg' },
  sayur:  { name: 'Sayur',   prep: 'chop', color: '#7fb069', dark: '#4f7d3a', icon: 'leaf' },
  mie:    { name: 'Mie',     prep: 'cook', color: '#f7c948', dark: '#d9a521', icon: 'noodle' },
  cabai:  { name: 'Cabai',   prep: 'chop', color: '#e63946', dark: '#a31f2d', icon: 'chilli' },
  pisang: { name: 'Pisang',  prep: 'chop', color: '#ffe066', dark: '#d9b13b', icon: 'banana' },
};

// A recipe is a set of ingredients, each already in its prepared form.
export const RECIPES = [
  {
    id: 'nasi-goreng', name: 'Nasi Goreng Ibu', price: 120,
    needs: ['nasi', 'telur', 'cabai'],
    memory: 'Ibu selalu menumis bawang dulu sampai harum, baru nasinya masuk.',
    blurb: 'Nasi, telur, cabai — resep pertama Ibu.',
  },
  {
    id: 'soto-ayam', name: 'Soto Ayam', price: 150,
    needs: ['ayam', 'mie', 'sayur'],
    memory: 'Kuah soto Ibu bening tapi hangatnya sampai ke hati.',
    blurb: 'Ayam, mie, sayur — hangat untuk yang rindu rumah.',
  },
  {
    id: 'gado-gado', name: 'Gado-Gado', price: 110,
    needs: ['sayur', 'telur', 'cabai'],
    memory: 'Ibu bilang gado-gado itu rukun: semua bahan jadi satu.',
    blurb: 'Sayur, telur, cabai — ramai dalam satu piring.',
  },
  {
    id: 'mie-ayam', name: 'Mie Ayam', price: 130,
    needs: ['mie', 'ayam'],
    memory: 'Mie ayam hari Minggu, setelah Ibu pulang dari pasar.',
    blurb: 'Mie dan ayam — cepat, hangat, selalu habis.',
  },
  {
    id: 'bubur-ayam', name: 'Bubur Ayam', price: 140,
    needs: ['nasi', 'ayam', 'sayur'],
    memory: 'Bubur Ibu untuk yang sedang tidak enak badan.',
    blurb: 'Nasi, ayam, sayur — bubur penenang hati.',
  },
  {
    id: 'pisang-goreng', name: 'Pisang Goreng', price: 90,
    needs: ['pisang', 'telur'],
    memory: 'Pisang goreng sore hari, teman teh melati Ibu.',
    blurb: 'Pisang dan telur — manis penutup yang sederhana.',
  },
];

export const NEIGHBOURS = [
  { name: 'Pak Budi', color: '#4a7c59', quote: 'Nasi goreng Ibu Sari, ya!' },
  { name: 'Bu Ratna', color: '#b56576', quote: 'Sotonya satu, Nak, yang hangat!' },
  { name: 'Mbak Dewi', color: '#6d597a', quote: 'Gado-gadonya pedas sedikit saja.' },
  { name: 'Pak Slamet', color: '#355070', quote: 'Mie ayam dua, buat anakku juga.' },
  { name: 'Kak Ani', color: '#9c6644', quote: 'Bubur ayamnya, seperti buatan Ibu.' },
  { name: 'Om Joko', color: '#7f4f24', quote: 'Pisang goreng, masih hangat kan?' },
];

export const MEMORIES = [
  'Ibu selalu bilang: masak dengan hati, Nak.',
  'Resep ini Ibu tulis tangan di buku kecilnya.',
  'Tetangga dulu antre di depan warung Ibu setiap sore.',
  'Bau tumisan ini, bau rumah.',
  'Ibu tersenyum setiap kali piring kembali kosong.',
];

// Kitchen layout, in canvas pixels. Top-down view.
export const LAYOUT = {
  hudH: 56,
  // Ingredient crates along the top wall.
  crates: [
    { id: 'nasi', x: 336, y: 68 }, { id: 'ayam', x: 448, y: 68 },
    { id: 'telur', x: 560, y: 68 }, { id: 'sayur', x: 672, y: 68 },
    { id: 'mie', x: 784, y: 68 }, { id: 'cabai', x: 896, y: 68 },
    { id: 'pisang', x: 1008, y: 68 },
  ],
  crateW: 96, crateH: 64,
  board: { x: 352, y: 208, w: 150, h: 110 },       // cutting board
  stove: { x: 560, y: 208, w: 230, h: 110 },       // two burners
  plates: { x: 848, y: 208, w: 120, h: 110 },      // plate stack
  trash: { x: 1024, y: 208, w: 96, h: 110 },
  pass: { x: 1136, y: 208, w: 128, h: 210 },       // serving pass (right)
  sink: { x: 352, y: 400, w: 150, h: 96 },         // sink (wash / reset plate)
  counter: { x: 560, y: 400, w: 230, h: 96 },      // assembly counter
  book: { x: 16, y: 392, w: 288, h: 312 },         // Ibu's recipe book (left)
  orders: { x: 16, y: 64, w: 288, h: 312 },        // order board (left)
  floor: { x: 320, y: 56, w: 944, h: 656 },
};

export const PLAYER = { r: 22, speed: 260 };

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

export function ingredientName(id) {
  return INGREDIENTS[id] ? INGREDIENTS[id].name : id;
}
