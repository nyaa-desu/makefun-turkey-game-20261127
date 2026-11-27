// The screenshot scenes behind ?shot=cover|title|early|end.
// Each one plays the real rules forward from a fresh world, or stages a real state
// the game can reach, so the frame is what the game really looks like — and the
// same seed always gives the same frame.
import { GROUND_Y, STEP, TOTAL_DISTANCE, TURKEY_X } from './config.js';
import { EVENT_ESCAPED, EVENT_OVER } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const SAMPLE = STEP;
/** The autopilot: jump the next obstacle in time, and jump when Tabitha winds up. */
function autopilot(state) {
  if (state.stage >= 2 && state.cat.pounce > 10.8 && state.turkey.grounded) return { jump: true, hide: false, dash: false };
  for (const ob of state.obstacles) {
    const dx = ob.at - state.distance;
    // Jump late: the arc clears the obstacle only when it starts within ~3.2 m.
    if (!ob.passed && !ob.hit && dx > 0 && dx < 3.2 && state.turkey.grounded) return { jump: true, hide: false, dash: false };
  }
  return { jump: false, hide: false, dash: false };
}

/** Run the world forward for `seconds` under the autopilot. */
function playForward(world, seconds) {
  const limit = Math.floor(seconds / SAMPLE);
  for (let i = 0; i < limit; i += 1) {
    const act = autopilot(world.state);
    const events = world.step(SAMPLE, 0, act.jump, act.hide, act.dash, null);
    if (events & (EVENT_OVER | EVENT_ESCAPED)) break;
  }
}

/**
 * Stage the named scene and return the screen to draw over it and the best score.
 * cover: the climactic kitchen escape — stage 4, timer nearly out, Bram 2 m back,
 *   turkey mid-dash with a feather burst and "CLOSE ONE! +325" on screen.
 * title: the title screen over the farmyard at dusk.
 * early: a real early chase in the farmyard, jumping a fence with corn ahead.
 * end: the ESCAPED screen with a full breakdown.
 */
export function stageShot(name, world) {
  const state = world.state;
  if (name === 'title') {
    world.reset();
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'early') {
    world.reset();
    playForward(world, 14);
    // Keep Bram and Biscuit in frame behind the turkey, and walk forward until
    // the next fence or knife is close ahead, so the chase reads at a glance.
    state.farmer.gap = 12;
    for (let i = 0; i < 900; i += 1) {
      const next = state.obstacles.find((ob) => !ob.passed && !ob.hit && ob.at - state.distance > 0);
      if (next && next.at - state.distance < 40 && state.turkey.grounded) break;
      const act = autopilot(state);
      world.step(SAMPLE, 0, act.jump, act.hide, act.dash, null);
      if (state.over || state.escaped) break;
    }
    state.farmer.gap = 12;
    return { screen: SCREEN_PLAY, best: Math.floor(state.score) };
  }
  if (name === 'end') {
    world.reset();
    playForward(world, 400);
    state.banner = '';
    state.bannerT = 0;
    if (!state.escaped && !state.over) {
      // A full autopilot run that has not finished yet: jump to the forest gate.
      state.distance = TOTAL_DISTANCE;
      state.stage = 3;
      state.escaped = true;
      state.score += Math.round(state.timeLeft) * 10 + state.lives * 500;
    }
    if (state.over && !state.escaped) {
      // The autopilot was caught: re-stage the win instead of showing a loss.
      world.reset();
      state.distance = TOTAL_DISTANCE;
      state.stage = 3;
      state.escaped = true;
      state.over = false;
      state.score = 2840;
      state.timeLeft = 41;
      state.lives = 2;
      state.stats = { tools: 14, hides: 3, jumps: 87, spotted: 1, closeCalls: 5, stages: 4 };
      state.bestCombo = 9;
      state.combo = 9;
      state.toolCounts = { corn: 9, feather: 2, pumpkin: 1, lantern: 1, gravy: 0, wishbone: 0, hay: 1, pepper: 0, horseshoe: 0 };
      state.banner = '';
      state.bannerT = 0;
    }
    return { screen: SCREEN_OVER, best: Math.floor(state.score) };
  }
  // cover — the climactic escape, staged from a real late run.
  world.reset();
  playForward(world, 400);
  if (state.escaped || state.over) world.reset();
  state.distance = 2320;
  state.stage = 3;
  state.timeLeft = 7;
  state.score = 2315;
  state.lives = 1;
  state.combo = 8;
  state.bestCombo = 9;
  state.stamina = 34;
  state.farmer.gap = 4.5;
  state.farmer.mode = 'corner';
  state.dog.sniff = 0.72;
  state.cat.pounce = 8.6;
  state.turkey.dash = 0.25;
  state.turkey.shield = true;
  state.stats = { tools: 13, hides: 3, jumps: 81, spotted: 1, closeCalls: 5, stages: 3 };
  state.toolCounts = { corn: 8, feather: 2, pumpkin: 1, lantern: 1, gravy: 0, wishbone: 0, hay: 1, pepper: 0, horseshoe: 0 };
  state.banner = '';
  state.bannerT = 0;
  world.feedback('CLOSE ONE! +325', '#ffd23d');
  world.feedback('THE OVEN IS RIGHT THERE', '#ff4d3d');
  world.log('bram', 'He is IN MY KITCHEN. The oven is warm, bird!');
  world.log('biscuit', 'FOUND YOU! *happy barking*');
  world.log('henrietta', 'The back door! Run for the back door!');
  // A feather burst around the dashing turkey.
  for (let i = 0; i < 10; i += 1) {
    state.particles.push({
      x: TURKEY_X - 20 - i * 8, y: GROUND_Y - 30 - (i % 3) * 14,
      vx: -120 - i * 12, vy: -60 + i * 10, life: 0.8, color: i % 2 ? '#d98e32' : '#b5651d',
    });
  }
  return { screen: SCREEN_PLAY, best: Math.floor(state.score) };
}
