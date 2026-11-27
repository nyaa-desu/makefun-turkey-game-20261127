// The renderer: one dusk palette, lamp glow and dust over every frame.
// Draws the farm, the kitchen, the turkey, the farmer, the dog and the cat,
// then the HUD, the side panel and the bottom bar — no region left empty.
import {
  CANVAS_HEIGHT, CANVAS_WIDTH, CHARACTERS, GROUND_Y, HUD_BOTTOM, HUD_TOP,
  PALETTE, PANEL_X, STAGES, TOOLS, TOTAL_DISTANCE, TURKEY_X,
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const PX_PER_M = 14;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 'bold'} ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

/** Warm lamp glow: a radial wash of light over a point. */
function lampGlow(ctx, x, y, radius, alpha) {
  const g = ctx.createRadialGradient(x, y, 4, x, y, radius);
  g.addColorStop(0, `rgba(255, 210, 122, ${alpha})`);
  g.addColorStop(1, 'rgba(255, 210, 122, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function drawSky(ctx, state) {
  const g = ctx.createLinearGradient(0, HUD_TOP, 0, GROUND_Y);
  g.addColorStop(0, PALETTE.skyTop);
  g.addColorStop(0.55, PALETTE.skyMid);
  g.addColorStop(1, PALETTE.skyLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, HUD_TOP, PANEL_X, GROUND_Y - HUD_TOP);
  // Low sun and a few early stars.
  ctx.fillStyle = PALETTE.sun;
  ctx.beginPath();
  ctx.arc(820, 300, 34, 0, Math.PI * 2);
  ctx.fill();
  lampGlow(ctx, 820, 300, 190, 0.5);
  ctx.fillStyle = 'rgba(255,243,214,0.85)';
  for (let i = 0; i < 14; i += 1) {
    const sx = (i * 173) % PANEL_X;
    const sy = HUD_TOP + 14 + ((i * 61) % 90);
    ctx.fillRect(sx, sy, 2, 2);
  }
  // Distant birds heading home for the night.
  ctx.strokeStyle = 'rgba(36,20,35,0.8)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    const bx = ((i * 260 + 120 - state.distance * PX_PER_M * 0.15) % (PANEL_X + 200) + PANEL_X + 200) % (PANEL_X + 200) - 100;
    const by = HUD_TOP + 110 + i * 26;
    ctx.beginPath();
    ctx.moveTo(bx - 8, by);
    ctx.quadraticCurveTo(bx, by - 6, bx + 8, by);
    ctx.stroke();
  }
}

function drawHills(ctx, state) {
  const off = (state.distance * PX_PER_M * 0.25) % 700;
  ctx.fillStyle = PALETTE.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 70);
  for (let x = -700; x <= PANEL_X + 700; x += 140) ctx.quadraticCurveTo(x + 70 - off, GROUND_Y - 150, x + 140 - off, GROUND_Y - 70);
  ctx.lineTo(PANEL_X, GROUND_Y);
  ctx.lineTo(0, GROUND_Y);
  ctx.fill();
  ctx.fillStyle = PALETTE.hillNear;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 30);
  for (let x = -700; x <= PANEL_X + 700; x += 180) ctx.quadraticCurveTo(x + 90 - ((state.distance * PX_PER_M * 0.5) % 700), GROUND_Y - 80, x + 180 - ((state.distance * PX_PER_M * 0.5) % 700), GROUND_Y - 30);
  ctx.lineTo(PANEL_X, GROUND_Y);
  ctx.lineTo(0, GROUND_Y);
  ctx.fill();
}

function drawBarn(ctx, state) {
  // Two barns a half-cycle apart, so one is almost always in frame.
  drawOneBarn(ctx, 120 - ((state.distance * PX_PER_M) % 1400));
  drawOneBarn(ctx, 120 - (((state.distance * PX_PER_M) + 700) % 1400));
}

function drawOneBarn(ctx, bx) {
  if (bx < -260 || bx > PANEL_X) return;
  ctx.fillStyle = PALETTE.barn;
  ctx.fillRect(bx, GROUND_Y - 150, 200, 150);
  ctx.fillStyle = PALETTE.barnRoof;
  ctx.beginPath();
  ctx.moveTo(bx - 12, GROUND_Y - 150);
  ctx.lineTo(bx + 100, GROUND_Y - 210);
  ctx.lineTo(bx + 212, GROUND_Y - 150);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd27a';
  ctx.fillRect(bx + 78, GROUND_Y - 96, 44, 60);
  ctx.strokeStyle = '#5e1f16';
  ctx.lineWidth = 3;
  ctx.strokeRect(bx + 78, GROUND_Y - 96, 44, 60);
  ctx.beginPath();
  ctx.moveTo(bx + 78, GROUND_Y - 96);
  ctx.lineTo(bx + 122, GROUND_Y - 36);
  ctx.moveTo(bx + 122, GROUND_Y - 96);
  ctx.lineTo(bx + 78, GROUND_Y - 36);
  ctx.stroke();
  lampGlow(ctx, bx + 100, GROUND_Y - 66, 130, 0.35);
}

function drawGround(ctx, state) {
  const g = ctx.createLinearGradient(0, GROUND_Y, 0, HUD_BOTTOM);
  g.addColorStop(0, PALETTE.groundTop);
  g.addColorStop(1, PALETTE.ground);
  ctx.fillStyle = g;
  ctx.fillRect(0, GROUND_Y, PANEL_X, HUD_BOTTOM - GROUND_Y);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(PANEL_X, GROUND_Y);
  ctx.stroke();
  // Fence posts scrolling past.
  const off = (state.distance * PX_PER_M) % 90;
  ctx.fillStyle = PALETTE.fence;
  for (let x = -off; x < PANEL_X; x += 90) {
    ctx.fillRect(x, GROUND_Y - 34, 8, 34);
    ctx.fillRect(x - 4, GROUND_Y - 40, 16, 8);
  }
  ctx.fillRect(0, GROUND_Y - 26, PANEL_X, 5);
}

function drawKitchen(ctx, state) {
  // Stage 4: inside the farmhouse kitchen — warm oven glow, hanging pans, dusk window.
  ctx.fillStyle = '#3a1f16';
  ctx.fillRect(0, HUD_TOP, PANEL_X, GROUND_Y - HUD_TOP);
  ctx.fillStyle = '#5a2c1c';
  ctx.fillRect(0, GROUND_Y - 8, PANEL_X, HUD_BOTTOM - GROUND_Y + 8);
  // Window with the last of the dusk.
  ctx.fillStyle = '#2b1a3a';
  ctx.fillRect(60, HUD_TOP + 40, 180, 150);
  ctx.fillStyle = '#ff7a3c';
  ctx.fillRect(70, HUD_TOP + 130, 160, 60);
  ctx.strokeStyle = '#241423';
  ctx.lineWidth = 6;
  ctx.strokeRect(60, HUD_TOP + 40, 180, 150);
  ctx.beginPath();
  ctx.moveTo(150, HUD_TOP + 40);
  ctx.lineTo(150, HUD_TOP + 190);
  ctx.moveTo(60, HUD_TOP + 115);
  ctx.lineTo(240, HUD_TOP + 115);
  ctx.stroke();
  // Hanging copper pans.
  for (let i = 0; i < 4; i += 1) {
    const px = 330 + i * 90;
    ctx.strokeStyle = '#8a5a2a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, HUD_TOP + 30);
    ctx.lineTo(px, HUD_TOP + 62);
    ctx.stroke();
    ctx.fillStyle = '#c98a4b';
    ctx.beginPath();
    ctx.arc(px, HUD_TOP + 92, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a4a21';
    ctx.beginPath();
    ctx.arc(px, HUD_TOP + 92, 18, 0, Math.PI * 2);
    ctx.fill();
  }
  // The oven, glowing, at the right of the kitchen.
  const ox = 880;
  ctx.fillStyle = '#241423';
  ctx.fillRect(ox, GROUND_Y - 190, 140, 190);
  ctx.fillStyle = '#ff7a2a';
  ctx.fillRect(ox + 14, GROUND_Y - 170, 112, 90);
  ctx.fillStyle = '#ffd23d';
  ctx.fillRect(ox + 24, GROUND_Y - 160, 92, 70);
  ctx.fillStyle = '#8a2f23';
  ctx.fillRect(ox + 14, GROUND_Y - 66, 112, 66);
  lampGlow(ctx, ox + 70, GROUND_Y - 120, 260, 0.55);
  text(ctx, 'THE OVEN', ox + 70, GROUND_Y - 200, 15, '#ffd23d', 'center');
  // The table, set for one — with an empty platter and a place card.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(380, GROUND_Y - 92, 260, 14);
  ctx.fillRect(396, GROUND_Y - 78, 12, 78);
  ctx.fillRect(612, GROUND_Y - 78, 12, 78);
  ctx.fillStyle = '#fff3d6';
  ctx.beginPath();
  ctx.ellipse(510, GROUND_Y - 98, 58, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.ellipse(510, GROUND_Y - 100, 40, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(492, GROUND_Y - 150, 36, 22);
  ctx.fillStyle = '#241423';
  text(ctx, 'GIBLET', 510, GROUND_Y - 136, 9, '#241423', 'center');
  text(ctx, 'DO NOT EAT', 510, GROUND_Y - 128, 7, '#241423', 'center');
  // A string of garlic and herbs hanging by the window.
  ctx.strokeStyle = '#8a6a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(280, HUD_TOP + 30);
  ctx.lineTo(280, HUD_TOP + 110);
  ctx.stroke();
  ctx.fillStyle = '#fff3d6';
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(280, HUD_TOP + 60 + i * 20, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  // Tiled floor lines.
  ctx.strokeStyle = 'rgba(255,243,214,0.12)';
  ctx.lineWidth = 1;
  for (let x = 0; x < PANEL_X; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x, HUD_BOTTOM);
    ctx.stroke();
  }
}

function drawCornfield(ctx, state) {
  const off = (state.distance * PX_PER_M) % 70;
  for (let x = -off; x < PANEL_X; x += 70) {
    const h = 90 + ((x * 37) % 40);
    ctx.strokeStyle = '#5a7a2a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x + 8, GROUND_Y - h);
    ctx.stroke();
    ctx.fillStyle = '#e8b64c';
    ctx.beginPath();
    ctx.ellipse(x + 14, GROUND_Y - h + 22, 7, 16, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPumpkins(ctx, state) {
  const off = (state.distance * PX_PER_M) % 130;
  for (let x = -off; x < PANEL_X; x += 130) {
    const s = 0.8 + ((x * 13) % 10) / 25;
    ctx.fillStyle = '#ff7a2a';
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y - 14 * s, 26 * s, 18 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d95f14';
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y - 14 * s, 12 * s, 18 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a7a2a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y - 30 * s);
    ctx.quadraticCurveTo(x + 8, GROUND_Y - 42 * s, x + 16, GROUND_Y - 34 * s);
    ctx.stroke();
  }
}

/** Giblet the turkey: fan tail, brown body, red wattle, running legs. */
function drawTurkey(ctx, x, y, run, dashing, hiding, disguise) {
  ctx.save();
  ctx.translate(x, y);
  if (hiding) {
    // Tucked into the hay: just a tail fan and an eye peeking out.
    ctx.fillStyle = '#e8b64c';
    ctx.beginPath();
    ctx.ellipse(0, -14, 34, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a4a21';
    for (let i = -2; i <= 2; i += 1) {
      ctx.save();
      ctx.rotate(i * 0.28);
      ctx.beginPath();
      ctx.ellipse(0, -34, 7, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(14, -18, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#241423';
    ctx.beginPath();
    ctx.arc(15, -18, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  const legSwing = run ? Math.sin(run * 14) * 10 : 0;
  // Tail fan.
  for (let i = -2; i <= 2; i += 1) {
    ctx.save();
    ctx.rotate(i * 0.32);
    ctx.fillStyle = i % 2 === 0 ? '#b5651d' : '#d98e32';
    ctx.beginPath();
    ctx.ellipse(-16, -46, 9, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a4a21';
    ctx.beginPath();
    ctx.ellipse(-16, -62, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Legs.
  ctx.strokeStyle = '#e8a34c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-4, -8);
  ctx.lineTo(-4 + legSwing, 0);
  ctx.moveTo(6, -8);
  ctx.lineTo(6 - legSwing, 0);
  ctx.stroke();
  // Body.
  ctx.fillStyle = disguise > 0 ? '#c9a227' : '#7a4a21';
  ctx.beginPath();
  ctx.ellipse(0, -26, 26, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a5a2a';
  ctx.beginPath();
  ctx.ellipse(2, -22, 18, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing.
  ctx.fillStyle = '#5e3418';
  ctx.beginPath();
  ctx.ellipse(dashing ? 8 : -2, -28, 14, 9, dashing ? -0.7 : -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Neck and head.
  ctx.fillStyle = '#a85a3a';
  ctx.fillRect(16, -52, 9, 26);
  ctx.fillStyle = '#c98a6b';
  ctx.beginPath();
  ctx.arc(22, -56, 11, 0, Math.PI * 2);
  ctx.fill();
  // Beak, wattle, eye.
  ctx.fillStyle = '#ffd23d';
  ctx.beginPath();
  ctx.moveTo(30, -58);
  ctx.lineTo(42, -54);
  ctx.lineTo(30, -50);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.ellipse(28, -44, 4, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#241423';
  ctx.beginPath();
  ctx.arc(25, -59, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Farmer Bram Cobb: straw hat, denim overalls, red shirt — net in the yard, knife in the kitchen. */
function drawFarmer(ctx, x, y, run, mode, stage) {
  ctx.save();
  ctx.translate(x, y);
  const swing = run ? Math.sin(run * 12) * 9 : 0;
  ctx.strokeStyle = '#241423';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-6, -34);
  ctx.lineTo(-6 + swing, 0);
  ctx.moveTo(6, -34);
  ctx.lineTo(6 - swing, 0);
  ctx.stroke();
  // Overalls and shirt.
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(-14, -72, 28, 26);
  ctx.fillStyle = '#3a5a7a';
  ctx.fillRect(-14, -52, 28, 20);
  ctx.fillRect(-14, -52, 8, 38);
  ctx.fillRect(6, -52, 8, 38);
  // Arm reaching forward with the tool.
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(10, -66);
  ctx.lineTo(30, -58);
  ctx.stroke();
  if (stage === 3) {
    // The carving knife, glinting.
    ctx.fillStyle = '#e8ecf4';
    ctx.beginPath();
    ctx.moveTo(30, -62);
    ctx.lineTo(58, -70);
    ctx.lineTo(58, -62);
    ctx.lineTo(30, -54);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#241423';
    ctx.fillRect(24, -62, 8, 8);
  } else {
    // The net.
    ctx.strokeStyle = '#8a5a2a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(44, -58, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,243,214,0.7)';
    ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(44 + i * 8, -72);
      ctx.lineTo(44 + i * 8, -44);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(30, -58 + i * 8);
      ctx.lineTo(58, -58 + i * 8);
      ctx.stroke();
    }
  }
  // Head, beard, straw hat.
  ctx.fillStyle = '#e8b98a';
  ctx.beginPath();
  ctx.arc(0, -82, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d9d9d9';
  ctx.beginPath();
  ctx.ellipse(0, -72, 10, 5, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#d9b36a';
  ctx.beginPath();
  ctx.ellipse(0, -90, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-10, -104, 20, 14);
  ctx.fillStyle = '#241423';
  ctx.beginPath();
  ctx.arc(5, -84, 2, 0, Math.PI * 2);
  ctx.fill();
  if (mode === 'sneeze') {
    text(ctx, 'ACHOO!', 10, -116, 13, '#fff3d6', 'left');
  } else if (mode === 'corner') {
    text(ctx, 'CORNERED!', 10, -116, 13, '#ff4d3d', 'left');
  }
  ctx.restore();
}

/** Biscuit the beagle: low, fast, nose to the ground. */
function drawDog(ctx, x, y, run, sniffing) {
  ctx.save();
  ctx.translate(x, y);
  const swing = run ? Math.sin(run * 16) * 7 : 0;
  ctx.strokeStyle = '#5e3418';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-14, -10);
  ctx.lineTo(-14 + swing, 0);
  ctx.moveTo(14, -10);
  ctx.lineTo(14 - swing, 0);
  ctx.stroke();
  ctx.fillStyle = '#c98a4b';
  ctx.beginPath();
  ctx.ellipse(0, -18, 24, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath();
  ctx.ellipse(-6, -20, 12, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // Head down, sniffing.
  ctx.fillStyle = '#c98a4b';
  ctx.beginPath();
  ctx.arc(sniffing ? 30 : 26, sniffing ? -10 : -24, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath();
  ctx.ellipse(20, -28, 5, 10, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#241423';
  ctx.beginPath();
  ctx.arc(sniffing ? 38 : 34, sniffing ? -10 : -24, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Tail wagging.
  ctx.strokeStyle = '#c98a4b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-24, -24);
  ctx.quadraticCurveTo(-32, -34, -28, -38);
  ctx.stroke();
  if (sniffing) text(ctx, 'SNIFF SNIFF', 0, -44, 11, '#ffd23d', 'center');
  ctx.restore();
}

/** Tabitha the barn cat: a grey shadow that pounces. */
function drawCat(ctx, x, y, pounce) {
  ctx.save();
  ctx.translate(x, y);
  const stretch = pounce > 11.4 ? 1.3 : 1;
  ctx.scale(stretch, 1);
  ctx.fillStyle = '#8a8a9a';
  ctx.beginPath();
  ctx.ellipse(0, -12, 18, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20, -20, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, -26);
  ctx.lineTo(16, -34);
  ctx.lineTo(20, -27);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(22, -27);
  ctx.lineTo(26, -34);
  ctx.lineTo(28, -26);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8a8a9a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, -14);
  ctx.quadraticCurveTo(-30, -24, -26, -32);
  ctx.stroke();
  ctx.fillStyle = '#7ddc6a';
  ctx.beginPath();
  ctx.arc(22, -21, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Telegraph: a "!" over the cat while she winds up to pounce.
  if (pounce > 10.5) {
    text(ctx, '!', x, y - 52, 22, '#ff4d3d', 'center');
  }
}

function drawObstacle(ctx, x, kind, t) {
  if (kind === 'fence') {
    ctx.fillStyle = PALETTE.fence;
    ctx.fillRect(x - 4, GROUND_Y - 52, 8, 52);
    ctx.fillRect(x + 18, GROUND_Y - 52, 8, 52);
    ctx.fillRect(x - 8, GROUND_Y - 48, 38, 6);
    ctx.fillRect(x - 8, GROUND_Y - 28, 38, 6);
  } else if (kind === 'crate') {
    ctx.fillStyle = '#8a5a2a';
    ctx.fillRect(x - 18, GROUND_Y - 36, 36, 36);
    ctx.strokeStyle = '#5e3418';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 18, GROUND_Y - 36, 36, 36);
    ctx.beginPath();
    ctx.moveTo(x - 18, GROUND_Y - 36);
    ctx.lineTo(x + 18, GROUND_Y);
    ctx.moveTo(x + 18, GROUND_Y - 36);
    ctx.lineTo(x - 18, GROUND_Y);
    ctx.stroke();
  } else if (kind === 'knife') {
    // The carving knife swoops low across the ground — jump it or be carved.
    const drop = Math.sin(t * 0.002 + x) * 5;
    ctx.save();
    ctx.translate(x, GROUND_Y - 46 + drop);
    ctx.rotate(0.5);
    ctx.fillStyle = '#e8ecf4';
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(9, 8);
    ctx.lineTo(-9, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#241423';
    ctx.fillRect(-4, 8, 8, 14);
    ctx.restore();
    ctx.fillStyle = '#ff4d3d';
    text(ctx, '!', x, GROUND_Y - 92 + drop, 18, '#ff4d3d', 'center');
  } else if (kind === 'flame') {
    const flick = Math.sin(t * 0.02 + x) * 6;
    ctx.fillStyle = '#ff7a2a';
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y - 26, 16 + flick * 0.3, 26 + flick, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd23d';
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y - 18, 9, 16 + flick * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    lampGlow(ctx, x, GROUND_Y - 26, 90, 0.4);
  } else if (kind === 'pin') {
    ctx.fillStyle = '#c0c8d8';
    ctx.save();
    ctx.translate(x, GROUND_Y - 8);
    ctx.rotate(Math.sin(t * 0.01 + x) * 0.4);
    ctx.fillRect(-4, -34, 8, 34);
    ctx.beginPath();
    ctx.ellipse(0, -36, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (kind === 'puddle') {
    ctx.fillStyle = 'rgba(120, 160, 220, 0.55)';
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y + 2, 30, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPickup(ctx, x, tool, t, bob) {
  const y = GROUND_Y - 52 + Math.sin(t * 0.003 + bob) * 5;
  lampGlow(ctx, x, y, 46, 0.35);
  ctx.fillStyle = tool.color;
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#241423';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#241423';
  const label = { corn: 'C', feather: 'F', pumpkin: 'P', lantern: 'L', gravy: 'G', wishbone: 'W', hay: 'H', pepper: '!', horseshoe: 'U' }[tool.id] || '?';
  text(ctx, label, x, y + 5, 14, '#241423', 'center');
}

function drawHideSpot(ctx, x, kind, used) {
  if (kind === 'haystack') {
    ctx.fillStyle = used ? '#8a6a2a' : PALETTE.hay;
    ctx.beginPath();
    ctx.moveTo(x - 34, GROUND_Y);
    ctx.quadraticCurveTo(x, GROUND_Y - 74, x + 34, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b98a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 18, GROUND_Y - 20);
    ctx.quadraticCurveTo(x, GROUND_Y - 54, x + 18, GROUND_Y - 20);
    ctx.stroke();
  } else if (kind === 'barrel') {
    ctx.fillStyle = '#8a5a2a';
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y - 26, 20, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5e3418';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y - 36, 20, 7, 0, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x, GROUND_Y - 16, 20, 7, 0, 0, Math.PI);
    ctx.stroke();
  } else if (kind === 'bush') {
    ctx.fillStyle = '#4a6a2a';
    ctx.beginPath();
    ctx.arc(x - 14, GROUND_Y - 16, 16, 0, Math.PI * 2);
    ctx.arc(x + 10, GROUND_Y - 22, 18, 0, Math.PI * 2);
    ctx.arc(x + 24, GROUND_Y - 12, 12, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#8a5a2a';
    ctx.fillRect(x - 20, GROUND_Y - 40, 40, 40);
    ctx.strokeStyle = '#5e3418';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 20, GROUND_Y - 40, 40, 40);
  }
  if (!used) {
    ctx.fillStyle = '#7ddc6a';
    text(ctx, 'HIDE ↓', x, GROUND_Y - 82, 12, '#7ddc6a', 'center');
  }
}

function drawTopHud(ctx, state, best) {
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_TOP);
  ctx.fillStyle = PALETTE.panelEdge;
  ctx.fillRect(0, HUD_TOP - 3, CANVAS_WIDTH, 3);
  text(ctx, 'GIBLET\u2019S GREAT ESCAPE', 16, 26, 20, PALETTE.cream);
  text(ctx, 'Maple Hollow Farm \u00b7 Thanksgiving dusk', 16, 48, 12, '#d9a06a');
  // Score, distance, lives, stage, timer — the run at a glance.
  text(ctx, `SCORE ${Math.floor(state.score)}`, 420, 28, 20, PALETTE.cream);
  text(ctx, `BEST ${Math.max(best, Math.floor(state.score))}`, 420, 50, 11, '#d9a06a');
  const dist = Math.min(TOTAL_DISTANCE, Math.floor(state.distance));
  text(ctx, `DISTANCE ${dist} / ${TOTAL_DISTANCE} m`, 620, 28, 20, PALETTE.cream);
  text(ctx, `STAGE ${state.stage + 1}/4 \u00b7 ${STAGES[state.stage].name}`, 620, 50, 11, '#d9a06a');
  // Lives as hearts.
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i < state.lives ? '#ff4d6a' : 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.arc(880 + i * 22, 24, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  text(ctx, `LIVES ${state.lives}`, 878, 50, 11, '#d9a06a');
  // Dinner countdown.
  const mins = Math.floor(state.timeLeft / 60);
  const secs = Math.floor(state.timeLeft % 60);
  const timeColor = state.timeLeft < 30 ? '#ff4d3d' : PALETTE.cream;
  text(ctx, `DINNER IN ${mins}:${String(secs).padStart(2, '0')}`, 990, 28, 18, timeColor);
  text(ctx, state.timeLeft < 30 ? 'THE OVEN IS HOT!' : 'escape before dinner', 990, 50, 11, timeColor);
}

function drawSidePanel(ctx, state) {
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(PANEL_X, HUD_TOP, CANVAS_WIDTH - PANEL_X, HUD_BOTTOM - HUD_TOP);
  ctx.fillStyle = PALETTE.panelEdge;
  ctx.fillRect(PANEL_X, HUD_TOP, 3, HUD_BOTTOM - HUD_TOP);
  let y = HUD_TOP + 26;
  text(ctx, 'ESCAPE PLAN', PANEL_X + 16, y, 15, PALETTE.panelEdge);
  y += 22;
  STAGES.forEach((s, i) => {
    const done = i < state.stage;
    const now = i === state.stage;
    ctx.fillStyle = done ? '#7ddc6a' : now ? '#ffd23d' : 'rgba(255,243,214,0.4)';
    ctx.beginPath();
    ctx.arc(PANEL_X + 24, y - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, `${done ? '✓' : now ? '▶' : '·'} ${i + 1}. ${s.name}`, PANEL_X + 38, y, 13, done ? '#7ddc6a' : now ? '#ffd23d' : 'rgba(255,243,214,0.65)');
    y += 22;
  });
  text(ctx, `PROGRESS ${Math.floor(state.distance)}/${TOTAL_DISTANCE} m`, PANEL_X + 16, y + 4, 12, PALETTE.cream);
  y += 24;
  // Progress bar to the forest gate.
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, PANEL_X + 16, y, 228, 12, 6);
  ctx.fill();
  ctx.fillStyle = '#7ddc6a';
  roundRect(ctx, PANEL_X + 16, y, 228 * Math.min(1, state.distance / TOTAL_DISTANCE), 12, 6);
  ctx.fill();
  y += 36;
  // Tools: all nine, with counts.
  text(ctx, 'TOOLS 9', PANEL_X + 16, y, 15, PALETTE.panelEdge);
  y += 18;
  TOOLS.forEach((tool) => {
    const n = state.toolCounts[tool.id] || 0;
    ctx.fillStyle = tool.color;
    ctx.beginPath();
    ctx.arc(PANEL_X + 24, y - 4, 6, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, `${tool.name}  ×${n}`, PANEL_X + 38, y, 12, n > 0 ? PALETTE.cream : 'rgba(255,243,214,0.45)');
    y += 16;
  });
  y += 6;
  // Pursuers: Bram's gap, Biscuit's sniff, the oven's heat.
  text(ctx, 'PURSUERS 5', PANEL_X + 16, y, 15, PALETTE.panelEdge);
  y += 16;
  const gapFrac = 1 - state.farmer.gap / 42;
  text(ctx, `BRAM ${state.farmer.mode.toUpperCase()}`, PANEL_X + 16, y, 12, state.farmer.gap < 8 ? '#ff4d3d' : PALETTE.cream);
  y += 12;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, PANEL_X + 16, y, 228, 10, 5);
  ctx.fill();
  ctx.fillStyle = state.farmer.gap < 8 ? '#ff4d3d' : '#ffd23d';
  roundRect(ctx, PANEL_X + 16, y, 228 * gapFrac, 10, 5);
  ctx.fill();
  text(ctx, `gap ${state.farmer.gap.toFixed(1)} m`, PANEL_X + 16, y + 20, 11, '#d9a06a');
  y += 28;
  text(ctx, `BISCUIT sniff ${Math.round(state.dog.sniff * 100)}%`, PANEL_X + 16, y, 12, state.dog.sniff > 0.6 ? '#ff4d3d' : PALETTE.cream);
  y += 14;
  text(ctx, `TABITHA pounce ${state.stage >= 2 ? 'READY' : 'asleep'}`, PANEL_X + 16, y, 12, PALETTE.cream);
  y += 14;
  text(ctx, 'OVEN + KNIFE in the kitchen', PANEL_X + 16, y, 12, PALETTE.cream);
  y += 16;
  // Event log: the farm talks, one short line each, clipped at the panel's bottom.
  text(ctx, 'THE FARM SAYS', PANEL_X + 16, y, 13, PALETTE.panelEdge);
  y += 16;
  state.log.slice(0, 3).forEach((entry) => {
    if (y > HUD_BOTTOM - 8) return;
    const who = CHARACTERS[entry.speaker] ? CHARACTERS[entry.speaker].name.split(' ')[0].toUpperCase() : entry.speaker.toUpperCase();
    let line = `${who}: ${entry.text}`;
    if (line.length > 32) line = line.slice(0, 31) + '…';
    text(ctx, line, PANEL_X + 16, y, 11, PALETTE.cream);
    y += 15;
  });
}

function drawBottomBar(ctx, state) {
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(0, HUD_BOTTOM, CANVAS_WIDTH, CANVAS_HEIGHT - HUD_BOTTOM);
  ctx.fillStyle = PALETTE.panelEdge;
  ctx.fillRect(0, HUD_BOTTOM, CANVAS_WIDTH, 3);
  text(ctx, '← → surge   SPACE jump   ↓ hide   SHIFT dash   P pause   M mute', 16, HUD_BOTTOM + 28, 14, PALETTE.cream);
  text(ctx, `COMBO x${state.combo}  ·  BEST COMBO x${state.bestCombo}`, 16, HUD_BOTTOM + 52, 12, '#d9a06a');
  // Stamina bar.
  text(ctx, 'STAMINA', 640, HUD_BOTTOM + 28, 13, PALETTE.cream);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, 730, HUD_BOTTOM + 16, 220, 14, 7);
  ctx.fill();
  ctx.fillStyle = state.stamina > 25 ? PALETTE.stamina : '#ff4d3d';
  roundRect(ctx, 730, HUD_BOTTOM + 16, 220 * (state.stamina / 100), 14, 7);
  ctx.fill();
  if (state.turkey.shield) text(ctx, '🛡 PUMPKIN SHIELD', 980, HUD_BOTTOM + 28, 13, '#ff7a2a');
  if (state.turkey.luck > 0) text(ctx, '🍀 2x SCORE', 980, HUD_BOTTOM + 52, 13, '#c0c8d8');
  if (state.turkey.disguise > 0) text(ctx, '🌾 HAY DISGUISE', 1140, HUD_BOTTOM + 28, 12, '#e8b64c');
}

function drawFeedback(ctx, state) {
  state.feedback.forEach((fb, i) => {
    const alpha = Math.min(1, fb.t);
    ctx.globalAlpha = alpha;
    text(ctx, fb.text, TURKEY_X + 40, 200 + i * 30, 20, fb.color, 'left');
    ctx.globalAlpha = 1;
  });
  if (state.bannerT > 0) {
    ctx.globalAlpha = Math.min(1, state.bannerT);
    text(ctx, state.banner, PANEL_X / 2, 130, 30, '#ffd23d', 'center');
    ctx.globalAlpha = 1;
  }
}

function drawTitle(ctx, state, best) {
  drawSky(ctx, state);
  drawHills(ctx, state);
  drawBarn(ctx, state);
  drawGround(ctx, state);
  drawTurkey(ctx, TURKEY_X - 60, GROUND_Y, 1.2, false, false, 0);
  drawFarmer(ctx, TURKEY_X - 220, GROUND_Y, 1.2, 'chase', 0);
  drawDog(ctx, TURKEY_X - 300, GROUND_Y, 1.2, false);
  // Title card.
  ctx.fillStyle = 'rgba(36,20,35,0.82)';
  roundRect(ctx, 180, 110, 920, 300, 16);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 3;
  roundRect(ctx, 180, 110, 920, 300, 16);
  ctx.stroke();
  text(ctx, 'GIBLET\u2019S GREAT ESCAPE', 640, 168, 44, '#ffd23d', 'center');
  text(ctx, 'outrun Farmer Bram through Maple Hollow Farm at dusk', 640, 204, 18, PALETTE.cream, 'center');
  text(ctx, '4 stages · 12 hiding spots · 9 tools · 5 pursuers · 3 lives', 640, 236, 17, '#7ddc6a', 'center');
  text(ctx, 'Bram wants Thanksgiving dinner. Biscuit wants the chase. Tabitha wants a drumstick.', 640, 272, 14, '#d9a06a', 'center');
  text(ctx, 'Henrietta the hen says: hide in the hay, grab the corn, and DO NOT stop for the oven.', 640, 296, 14, '#d9a06a', 'center');
  text(ctx, 'PRESS ENTER OR CLICK TO RUN', 640, 348, 20, '#fff3d6', 'center');
  text(ctx, '← → surge · SPACE jump · ↓ hide at haystacks, barrels & bushes · SHIFT dash', 640, 382, 14, PALETTE.cream, 'center');
  if (best > 0) text(ctx, `BEST SCORE ${best}`, 640, 440, 16, '#ffd23d', 'center');
  ctx.fillStyle = 'rgba(36,20,35,0.75)';
  roundRect(ctx, 330, 452, 620, 30, 15);
  ctx.fill();
  text(ctx, 'Escape 2,400 m before dinner is served — the oven is already warm.', 640, 472, 13, '#d9a06a', 'center');
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(20,10,20,0.72)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  text(ctx, 'PAUSED', CANVAS_WIDTH / 2, 330, 44, PALETTE.cream, 'center');
  text(ctx, 'Giblet is catching his breath. Press P or Enter to keep running.', CANVAS_WIDTH / 2, 372, 16, '#d9a06a', 'center');
}

function drawOver(ctx, state, best) {
  ctx.fillStyle = 'rgba(20,10,20,0.78)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const escaped = state.escaped;
  text(ctx, escaped ? 'ESCAPED!' : state.dinnerServed ? 'DINNER IS SERVED…' : 'CAUGHT!', CANVAS_WIDTH / 2, 150, 52, escaped ? '#7ddc6a' : '#ff4d3d', 'center');
  text(
    ctx,
    escaped
      ? 'Giblet bursts through the back door and into the forest. Bram is left holding an empty plate.'
      : state.dinnerServed
        ? 'The timer ran out and the oven won. Bram is already reaching for the carving knife.'
        : 'Bram finally got his bird — this time. Giblet is already planning the next run.',
    CANVAS_WIDTH / 2, 192, 16, PALETTE.cream, 'center',
  );
  const rows = [
    ['SCORE', String(Math.floor(state.score))],
    ['BEST', String(Math.max(best, Math.floor(state.score)))],
    ['DISTANCE', `${Math.floor(state.distance)} / ${TOTAL_DISTANCE} m`],
    ['STAGES CLEARED', state.escaped ? '4 / 4' : `${state.stage} / 4`],
    ['TOOLS GRABBED', `${state.stats.tools} / 9 kinds`],
    ['HIDES', String(state.stats.hides)],
    ['JUMPS', String(state.stats.jumps)],
    ['BEST COMBO', `x${state.bestCombo}`],
    ['CLOSE CALLS', String(state.stats.closeCalls)],
    ['TIMES SPOTTED', String(state.stats.spotted)],
    ['LIVES LEFT', String(Math.max(0, state.lives))],
  ];
  let y = 240;
  rows.forEach(([k, v]) => {
    text(ctx, k, 470, y, 15, '#d9a06a');
    text(ctx, v, 810, y, 15, PALETTE.cream, 'right');
    y += 26;
  });
  text(ctx, 'PRESS ENTER OR CLICK TO RUN AGAIN', CANVAS_WIDTH / 2, y + 30, 20, '#ffd23d', 'center');
  text(ctx, 'Every run re-deals the farm: new fences, new corn, new hiding spots.', CANVAS_WIDTH / 2, y + 58, 13, '#d9a06a', 'center');
}

export function createRenderer(canvas) {
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');

  function draw(state, screen, best, time) {
    ctx.save();
    if (state.shake > 0) {
      ctx.translate((Math.random() - 0.5) * state.shake * 24, (Math.random() - 0.5) * state.shake * 24);
    }
    const t = state.turkey;
    if (screen === SCREEN_TITLE) {
      drawTitle(ctx, state, best);
      drawTopHud(ctx, state, best);
      drawBottomBar(ctx, state);
      ctx.restore();
      return;
    }
    // The world, by stage.
    if (state.stage === 3) drawKitchen(ctx, state);
    else {
      drawSky(ctx, state);
      drawHills(ctx, state);
      if (state.stage === 0) drawBarn(ctx, state);
      if (state.stage === 1) drawCornfield(ctx, state);
      if (state.stage === 2) drawPumpkins(ctx, state);
      drawGround(ctx, state);
    }
    // Hiding spots, pickups, obstacles — everything within view.
    for (const spot of state.spots) {
      const sx = TURKEY_X + (spot.at - state.distance) * PX_PER_M;
      if (sx > -80 && sx < PANEL_X + 80) drawHideSpot(ctx, sx, spot.kind, spot.used);
    }
    for (const pk of state.pickups) {
      if (pk.taken) continue;
      const px = TURKEY_X + (pk.at - state.distance) * PX_PER_M;
      if (px > -40 && px < PANEL_X + 40) drawPickup(ctx, px, pk.tool, time, pk.bob);
    }
    for (const ob of state.obstacles) {
      if (ob.passed || ob.hit) continue;
      const ox = TURKEY_X + (ob.at - state.distance) * PX_PER_M;
      if (ox > -60 && ox < PANEL_X + 60) drawObstacle(ctx, ox, ob.kind, time);
    }
    // The forest gate at the end of the run.
    const gateX = TURKEY_X + (TOTAL_DISTANCE - state.distance) * PX_PER_M;
    if (gateX > -80 && gateX < PANEL_X + 80) {
      ctx.fillStyle = '#2a4a2a';
      ctx.fillRect(gateX - 10, GROUND_Y - 150, 20, 150);
      ctx.fillStyle = '#3a6a3a';
      ctx.beginPath();
      ctx.ellipse(gateX, GROUND_Y - 160, 60, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      lampGlow(ctx, gateX, GROUND_Y - 140, 140, 0.4);
      text(ctx, 'FOREST GATE — FREEDOM', gateX, GROUND_Y - 210, 14, '#7ddc6a', 'center');
    }
    // Dust and feathers.
    for (const p of state.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
    }
    ctx.globalAlpha = 1;
    // The cast, in depth order: cat, dog, farmer, turkey.
    if (state.stage >= 2) drawCat(ctx, TURKEY_X + 420, GROUND_Y - 6, state.cat.pounce);
    drawDog(ctx, TURKEY_X - state.farmer.gap * PX_PER_M - 60, GROUND_Y, time / 1000, state.turkey.hiding);
    drawFarmer(ctx, TURKEY_X - state.farmer.gap * PX_PER_M, GROUND_Y, time / 1000, state.farmer.mode, state.stage);
    if (t.invuln > 0 && Math.floor(time / 120) % 2 === 0) {
      // Blinking while invulnerable: a fair, visible grace period.
    } else {
      drawTurkey(ctx, TURKEY_X, t.y, time / 1000, t.dash > 0, t.hiding, t.disguise);
    }
    if (t.shield) {
      ctx.strokeStyle = 'rgba(255,122,42,0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(TURKEY_X, t.y - 28, 44, 0, Math.PI * 2);
      ctx.stroke();
    }
    drawFeedback(ctx, state);
    drawTopHud(ctx, state, best);
    drawSidePanel(ctx, state);
    drawBottomBar(ctx, state);
    if (screen === SCREEN_PAUSED) drawPaused(ctx);
    if (screen === SCREEN_OVER) drawOver(ctx, state, best);
    ctx.restore();
  }

  return { draw };
}
