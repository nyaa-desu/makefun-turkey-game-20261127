// The world: Giblet's run, the farmer's hunt, and everything between them.
// Fixed-step update. Distance is the score's spine: 2,400 m from the coop to the forest.
import {
  CHARACTERS, DINNER_SECONDS, GROUND_Y, HIDE_SPOTS, LIVES, STAGES, STEP,
  TOOLS, TOTAL_DISTANCE,
} from './config.js';

export const EVENT_HIT = 1;
export const EVENT_OVER = 2;
export const EVENT_ESCAPED = 4;
export const EVENT_STAGE = 8;

const OBSTACLE_KINDS = ['fence', 'crate', 'knife', 'flame', 'pin', 'puddle'];
const MAX_GAP = 42;
const CATCH_GAP = 0;

/** A seeded obstacle: a fence to jump, a knife to dodge, an oven flame to clear. */
function makeObstacle(rng, at, stage) {
  let kind = rng.pick(OBSTACLE_KINDS);
  if (stage === 3 && rng.next() < 0.45) kind = rng.pick(['flame', 'knife', 'pin']);
  if (stage === 0 && kind === 'flame') kind = 'fence';
  return { at, kind, passed: false, hit: false, wobble: rng.range(0, 6.28) };
}

/** A seeded pickup: one of the nine tools, placed where the turkey can reach it. */
function makePickup(rng, at, stage) {
  const tool = rng.next() < 0.5 ? TOOLS[0] : TOOLS[rng.int(1, TOOLS.length - 1)];
  const rare = tool.id === 'wishbone' && stage < 2;
  return { at, tool: rare ? TOOLS[0] : tool, taken: false, bob: rng.range(0, 6.28) };
}

export function createWorld(rng) {
  const state = freshState();

  function freshState() {
    return {
      distance: 0, score: 0, lives: LIVES, stamina: 100, timeLeft: DINNER_SECONDS,
      stage: 0, combo: 0, bestCombo: 0, over: false, escaped: false, dinnerServed: false,
      turkey: { y: GROUND_Y, vy: 0, grounded: true, hiding: false, hideSpot: null, shield: false, disguise: 0, luck: 0, dash: 0, invuln: 0 },
      farmer: { gap: 30, mode: 'chase', search: 0, sneeze: 0 },
      dog: { sniff: 0, near: false },
      cat: { pounce: 0 },
      obstacles: [], pickups: [], spots: [], particles: [], feedback: [], log: [],
      stats: { tools: 0, hides: 0, jumps: 0, spotted: 0, closeCalls: 0, stages: 0 },
      toolCounts: Object.fromEntries(TOOLS.map((t) => [t.id, 0])),
      banner: '', bannerT: 0, shake: 0,
    };
  }

  function log(speaker, text) {
    state.log.unshift({ speaker, text, t: state.timeLeft });
    if (state.log.length > 5) state.log.length = 5;
  }

  function feedback(text, color) {
    state.feedback.unshift({ text, color: color || '#fff3d6', t: 1.4 });
    if (state.feedback.length > 4) state.feedback.length = 4;
  }

  function burst(x, y, color, n) {
    for (let i = 0; i < (n || 8); i += 1) {
      state.particles.push({ x, y, vx: (rng.next() - 0.5) * 260, vy: -rng.next() * 220 - 40, life: rng.range(0.4, 0.9), color });
    }
  }

  function generate() {
    state.obstacles = [];
    state.pickups = [];
    state.spots = HIDE_SPOTS.map((s) => ({ ...s, used: false }));
    let at = 90;
    while (at < TOTAL_DISTANCE - 40) {
      state.obstacles.push(makeObstacle(rng, at, Math.min(3, Math.floor(at / 600))));
      at += rng.range(42, 78);
    }
    at = 55;
    while (at < TOTAL_DISTANCE - 30) {
      state.pickups.push(makePickup(rng, at, Math.min(3, Math.floor(at / 600))));
      at += rng.range(24, 46);
    }
  }

  function reset() {
    const keep = state;
    Object.assign(state, freshState());
    state.rng = keep.rng;
    generate();
    log('henrietta', CHARACTERS.henrietta.line);
    log('bram', CHARACTERS.bram.line);
    state.banner = 'RUN, GIBLET, RUN!';
    state.bannerT = 2.2;
  }

  function stageOf(distance) {
    return Math.min(3, Math.floor(distance / 600));
  }

  function nearSpot() {
    for (const spot of state.spots) {
      if (!spot.used && Math.abs(spot.at - state.distance) < 14) return spot;
    }
    return null;
  }

  function applyTool(pickup) {
    const tool = pickup.tool;
    state.toolCounts[tool.id] += 1;
    state.stats.tools += 1;
    const mult = state.turkey.luck > 0 ? 2 : 1;
    switch (tool.id) {
      case 'corn': state.score += 50 * mult; feedback('+50 CORN', tool.color); break;
      case 'feather': state.stamina = 100; feedback('DASH REFILLED', tool.color); break;
      case 'pumpkin': state.turkey.shield = true; feedback('PUMPKIN SHIELD!', tool.color); break;
      case 'lantern': state.score += 25 * mult; feedback('LANTERN LIT +25', tool.color); break;
      case 'gravy': state.stamina = 100; feedback('GRAVY! STAMINA FULL', tool.color); break;
      case 'wishbone': state.lives = Math.min(5, state.lives + 1); feedback('+1 LIFE — WISHBONE!', tool.color); break;
      case 'hay': state.turkey.disguise = 5; feedback('HAY DISGUISE 5s', tool.color); break;
      case 'pepper': state.farmer.sneeze = 2.5; state.farmer.gap = Math.min(MAX_GAP, state.farmer.gap + 14); feedback('ACHOO! BRAM SNEEZES', tool.color); break;
      case 'horseshoe': state.turkey.luck = 10; feedback('LUCKY! 2x SCORE 10s', tool.color); break;
      default: break;
    }
  }

  function stumble(kind) {
    const t = state.turkey;
    if (t.invuln > 0) return;
    if (t.shield) {
      t.shield = false;
      feedback('SHIELD SAVED YOU!', '#ff7a2a');
      burst(320, t.y - 30, '#ff7a2a', 10);
      return EVENT_HIT;
    }
    state.lives -= 1;
    state.combo = 0;
    state.farmer.gap = Math.max(6, state.farmer.gap - 9);
    state.shake = 0.4;
    t.invuln = 1.6;
    feedback(kind === 'knife' ? 'THE CARVING KNIFE!' : kind === 'flame' ? 'THE OVEN!' : 'STUMBLED!', '#ff4d3d');
    burst(320, t.y - 30, '#ff4d3d', 12);
    if (state.lives <= 0) {
      state.over = true;
      state.dinnerServed = false;
      return EVENT_OVER;
    }
    return EVENT_HIT;
  }

  function caught() {
    state.lives -= 1;
    state.combo = 0;
    state.stats.spotted += 1;
    state.farmer.gap = 26;
    state.turkey.invuln = 2.0;
    state.turkey.hiding = false;
    state.shake = 0.5;
    feedback('CAUGHT! -1 LIFE', '#ff4d3d');
    burst(320, state.turkey.y - 30, '#ff4d3d', 16);
    log('bram', 'Gotcha! Nearly had you, bird!');
    if (state.lives <= 0) {
      state.over = true;
      return EVENT_OVER;
    }
    return EVENT_HIT;
  }

  /** One fixed step. `move` is -1/0/1 (surge), `jump`, `hide`, `dash` are held keys. */
  function step(dt, move, jump, hide, dash, audio) {
    if (state.over || state.escaped) return 0;
    const t = state.turkey;
    const stage = STAGES[state.stage];
    let events = 0;

    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.over = true;
      state.dinnerServed = true;
      return EVENT_OVER;
    }

    // --- the turkey runs ---
    let speed = stage.speed + move * 0.8;
    if (dash && state.stamina > 0 && !t.hiding) {
      speed += 4.5;
      state.stamina = Math.max(0, state.stamina - 34 * dt);
      t.dash = 0.25;
      if (rng.next() < 0.3) state.particles.push({ x: 300, y: t.y - 8, vx: -140, vy: -30, life: 0.4, color: '#e8b64c' });
    } else {
      state.stamina = Math.min(100, state.stamina + 9 * dt);
      t.dash = Math.max(0, t.dash - dt);
    }
    if (t.disguise > 0) t.disguise -= dt;
    if (t.luck > 0) t.luck -= dt;
    if (t.invuln > 0) t.invuln -= dt;

    // Jump: a real arc, with a little hang time at the top.
    if (jump && t.grounded && !t.hiding) {
      t.vy = -680;
      t.grounded = false;
      state.stats.jumps += 1;
      if (audio) audio.jump();
    }
    if (!t.grounded) {
      t.vy += 1500 * dt;
      t.y += t.vy * dt;
      if (t.y >= GROUND_Y) { t.y = GROUND_Y; t.vy = 0; t.grounded = true; }
    }

    // Hiding: only at a spot (or in disguise), and Biscuit is always sniffing.
    const spot = nearSpot();
    if (hide && (spot || t.disguise > 0) && t.grounded && !t.hiding) {
      t.hiding = true;
      t.hideSpot = spot;
      state.stats.hides += 1;
      if (spot) spot.used = true;
      state.dog.sniff = 0;
      if (audio) audio.hide();
      log('henrietta', 'Stay still. Breathe through your beak.');
    }
    if (t.hiding) {
      if (!hide || state.dog.sniff >= 1) {
        if (state.dog.sniff >= 1) {
          if (audio) audio.found();
          log('biscuit', 'FOUND YOU! *happy barking*');
          events |= caught();
        }
        t.hiding = false;
        t.hideSpot = null;
      } else {
        state.dog.sniff += dt / 3.2;
        state.stamina = Math.min(100, state.stamina + 22 * dt);
      }
    }
    if (state.over) return events | EVENT_OVER;
    state.dog.near = state.farmer.gap < 14;

    if (!t.hiding) state.distance += speed * dt;
    state.score += speed * dt * 0.4 * (t.luck > 0 ? 2 : 1);

    // --- stage changes ---
    const newStage = stageOf(state.distance);
    if (newStage !== state.stage) {
      state.stage = newStage;
      state.stats.stages += 1;
      state.banner = `${STAGES[newStage].name} — ${STAGES[newStage].sub}`;
      state.bannerT = 2.4;
      if (audio) audio.stageClear();
      log('bram', newStage === 3 ? 'He is IN MY KITCHEN. The oven is warm, bird!' : 'He went that way! After him!');
    }

    // --- obstacles: jump them or stumble ---
    for (const ob of state.obstacles) {
      if (ob.passed || ob.hit) continue;
      const dx = ob.at - state.distance;
      if (dx < -8) { ob.passed = true; continue; }
      // The collision zone is narrow (about a turkey wide): the turkey must be
      // in the air as it passes the obstacle, not a full body-length away.
      if (Math.abs(dx) < 1.6) {
        const low = ob.kind === 'puddle' || ob.kind === 'pin';
        const clears = t.y < GROUND_Y - 34 || (low && t.y < GROUND_Y - 18);
        if (!clears && !t.hiding) {
          ob.hit = true;
          events |= stumble(ob.kind);
          if (state.over) return events | EVENT_OVER;
        } else if (clears) {
          ob.passed = true;
          state.combo += 1;
          state.bestCombo = Math.max(state.bestCombo, state.combo);
          const pts = 10 * state.combo * (t.luck > 0 ? 2 : 1);
          state.score += pts;
          if (state.combo >= 3) feedback(`COMBO x${state.combo} +${pts}`, '#7ddc6a');
        }
      }
    }

    // --- pickups ---
    for (const pk of state.pickups) {
      if (pk.taken) continue;
      if (Math.abs(pk.at - state.distance) < 9 && !t.hiding) {
        pk.taken = true;
        if (audio) audio.pickup();
        applyTool(pk);
      }
    }

    // --- the farmer: chases, searches, corners ---
    const f = state.farmer;
    if (f.sneeze > 0) { f.sneeze -= dt; f.mode = 'sneeze'; }
    else if (t.hiding) { f.mode = 'search'; f.search += dt; }
    else if (f.gap < 7) { f.mode = 'corner'; }
    else f.mode = 'chase';
    if (!t.hiding) {
      f.gap += stage.gapDrain * dt * 0.55;
      if (f.mode === 'corner') f.gap -= 3.2 * dt;
      if (state.distance > 0 && state.combo >= 5) f.gap += 0.4 * dt;
      f.gap = Math.max(0, Math.min(MAX_GAP, f.gap));
      if (f.gap <= 3 && !f.closeWarned) {
        f.closeWarned = true;
        state.stats.closeCalls += 1;
        feedback('CLOSE ONE!', '#ffd23d');
        if (audio) audio.spotted();
      }
      if (f.gap > 6) f.closeWarned = false;
      if (f.gap <= 0) {
        if (audio) audio.caught();
        events |= caught();
        if (state.over) return events | EVENT_OVER;
      }
    } else {
      // Hiding buys distance: Bram runs past, then doubles back to search.
      f.gap = Math.min(MAX_GAP, f.gap + 6 * dt);
    }

    // Tabitha pounces in the pumpkin patch: a shadow, then a leap. Jump to dodge.
    if (state.stage >= 2 && !t.hiding) {
      state.cat.pounce += dt;
      if (state.cat.pounce > 12) {
        state.cat.pounce = 0;
        if (t.grounded) {
          events |= stumble('pin');
          log('tabitha', 'Mrrp! Almost had the drumstick!');
          if (state.over) return events | EVENT_OVER;
        } else {
          state.combo += 1;
          feedback('DODGED TABITHA! +' + 10 * state.combo, '#7ddc6a');
        }
      }
    }

    // --- dust, feathers, feedback ---
    if (rng.next() < 0.25 && !t.hiding) {
      state.particles.push({ x: 300 + rng.range(-10, 10), y: GROUND_Y + 4, vx: -60 - rng.next() * 60, vy: -rng.next() * 40, life: 0.5, color: '#c98a4b' });
    }
    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const p = state.particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= dt;
      if (p.life <= 0) state.particles.splice(i, 1);
    }
    for (let i = state.feedback.length - 1; i >= 0; i -= 1) {
      state.feedback[i].t -= dt;
      if (state.feedback[i].t <= 0) state.feedback.splice(i, 1);
    }
    if (state.bannerT > 0) state.bannerT -= dt;
    if (state.shake > 0) state.shake -= dt;

    // --- the forest gate ---
    if (state.distance >= TOTAL_DISTANCE) {
      state.distance = TOTAL_DISTANCE;
      state.escaped = true;
      state.score += Math.round(state.timeLeft) * 10 + state.lives * 500;
      if (audio) audio.escaped();
      return events | EVENT_ESCAPED;
    }
    return events;
  }

  state.rng = rng;
  reset();
  return { state, reset, step, log, feedback };
}
