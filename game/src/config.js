// GIBLET'S GREAT ESCAPE — config: the world, its people and its rules.
// Setting: Maple Hollow Farm, a dusk-lit Thanksgiving farm at the edge of the woods.
// The turkey Giblet runs 2,400 m from the farmyard, through the cornfield and the
// pumpkin patch, into the farmhouse kitchen and out the back door to the forest.
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const STEP = 1 / 60;
export const BEST_KEY = 'giblet-best-score';

// The play field: the HUD top bar, the right side panel and the bottom bar frame it.
export const HUD_TOP = 64;
export const HUD_BOTTOM = 648;
export const PANEL_X = 1020;
export const GROUND_Y = 560;
export const TURKEY_X = 320;

// One dusk palette for everything: burnt-orange sky, purple shadow, warm lamp glow.
export const PALETTE = {
  skyTop: '#2b1a3a',
  skyMid: '#7a2f4d',
  skyLow: '#ff7a3c',
  sun: '#ffd27a',
  hillFar: '#4a2440',
  hillNear: '#33203a',
  ground: '#4a2c1a',
  groundTop: '#6b4423',
  barn: '#8a2f23',
  barnRoof: '#5e1f16',
  hay: '#e8b64c',
  hayDark: '#b98a2e',
  fence: '#7a5230',
  cream: '#fff3d6',
  ink: '#241423',
  panel: 'rgba(36, 20, 35, 0.88)',
  panelEdge: '#e8b64c',
  danger: '#ff4d3d',
  ok: '#7ddc6a',
  stamina: '#ffd23d',
};

// The people of Maple Hollow Farm, each with one line of behaviour.
export const CHARACTERS = {
  giblet: { name: 'Giblet', role: 'the turkey', line: 'Not today. Not ever. I am NOT dinner.' },
  bram: { name: 'Farmer Bram Cobb', role: 'the farmer', line: "Get back here, dinner! That bird owes me a feast!" },
  biscuit: { name: 'Biscuit', role: 'the beagle', line: '*sniff sniff* — I smell feathers. FEATHERS!' },
  tabitha: { name: 'Tabitha', role: 'the barn cat', line: 'Mrrp. The big bird is mine. All mine.' },
  henrietta: { name: 'Henrietta', role: 'the hen', line: 'Hide in the hay, quick! He never checks the third stack!' },
};

// Four stages, each 600 m, each harder than the last.
export const STAGES = [
  { name: 'FARMYARD', sub: 'Stage 1 of 4 — the coop door', length: 600, speed: 6.0, gapDrain: 1.2, pursuers: ['bram', 'biscuit'] },
  { name: 'CORNFIELD', sub: 'Stage 2 of 4 — the tall corn', length: 600, speed: 6.8, gapDrain: 1.5, pursuers: ['bram', 'biscuit'] },
  { name: 'PUMPKIN PATCH', sub: 'Stage 3 of 4 — Tabitha joins the hunt', length: 600, speed: 7.6, gapDrain: 1.8, pursuers: ['bram', 'biscuit', 'tabitha'] },
  { name: 'FARMHOUSE KITCHEN', sub: 'Stage 4 of 4 — the oven is warm', length: 600, speed: 8.4, gapDrain: 2.1, pursuers: ['bram', 'biscuit', 'tabitha'] },
];
export const TOTAL_DISTANCE = 2400;
export const DINNER_SECONDS = 360;
export const LIVES = 3;

// Nine tools. Every one is a real pickup in the world, counted on the side panel.
export const TOOLS = [
  { id: 'corn', name: 'Corn Cob', effect: '+50 pts', color: '#ffd23d' },
  { id: 'feather', name: 'Tail Feather', effect: 'dash refill', color: '#ff9a3d' },
  { id: 'pumpkin', name: 'Pumpkin Shield', effect: 'blocks 1 hit', color: '#ff7a2a' },
  { id: 'lantern', name: 'Barn Lantern', effect: 'reveals pickups', color: '#ffe9a8' },
  { id: 'gravy', name: 'Gravy Boat', effect: 'stamina full', color: '#c98a4b' },
  { id: 'wishbone', name: 'Wishbone', effect: '+1 life', color: '#fff3d6' },
  { id: 'hay', name: 'Hay Disguise', effect: 'hide anywhere 5s', color: '#e8b64c' },
  { id: 'pepper', name: 'Pepper Bomb', effect: 'farmer sneezes', color: '#8a2f23' },
  { id: 'horseshoe', name: 'Horseshoe', effect: '2x score 10s', color: '#c0c8d8' },
];

// Twelve hiding spots, three per stage: haystacks, barrels, bushes and crates.
export const HIDE_SPOTS = [
  { stage: 0, kind: 'haystack', at: 150 }, { stage: 0, kind: 'barrel', at: 320 }, { stage: 0, kind: 'bush', at: 480 },
  { stage: 1, kind: 'bush', at: 760 }, { stage: 1, kind: 'haystack', at: 950 }, { stage: 1, kind: 'crate', at: 1120 },
  { stage: 2, kind: 'barrel', at: 1330 }, { stage: 2, kind: 'bush', at: 1520 }, { stage: 2, kind: 'haystack', at: 1690 },
  { stage: 3, kind: 'crate', at: 1930 }, { stage: 3, kind: 'barrel', at: 2120 }, { stage: 3, kind: 'haystack', at: 2260 },
];

// Five pursuers: the farmer, the beagle, the cat, the oven and the carving knife.
export const PURSUERS = ['bram', 'biscuit', 'tabitha', 'oven', 'knife'];
