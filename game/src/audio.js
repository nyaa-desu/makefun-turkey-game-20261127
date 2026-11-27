// WebAudio sound effects, synthesised in code — no audio files, no network.
// A tiny synth: short oscillator blips shaped into gobbles, boings, chimes and alarms.
export function createAudio() {
  let ctx = null;
  let enabled = true;
  let musicTimer = null;

  function context() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    const ac = context();
    if (!ac || !enabled) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), ac.currentTime + dur);
    gain.gain.setValueAtTime(vol || 0.12, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }

  function gobble() {
    tone(320, 0.09, 'square', 0.10, 180);
    setTimeout(() => tone(260, 0.08, 'square', 0.10, 150), 90);
    setTimeout(() => tone(380, 0.12, 'square', 0.10, 200), 180);
  }

  function jump() { tone(280, 0.16, 'sine', 0.10, 620); }
  function pickup() { tone(660, 0.10, 'triangle', 0.12); setTimeout(() => tone(990, 0.14, 'triangle', 0.12), 70); }
  function dash() { tone(180, 0.22, 'sawtooth', 0.07, 720); }
  function spotted() { tone(520, 0.14, 'square', 0.12, 760); setTimeout(() => tone(520, 0.14, 'square', 0.12, 760), 160); }
  function hit() { tone(140, 0.25, 'sawtooth', 0.16, 60); }
  function caught() { tone(220, 0.5, 'sawtooth', 0.14, 55); }
  function hide() { tone(440, 0.18, 'sine', 0.08, 220); }
  function found() { tone(880, 0.2, 'square', 0.12, 440); }
  function stageClear() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.12), i * 110)); }
  function escaped() { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'triangle', 0.13), i * 130)); }

  // A slow dusk waltz under the game: three low notes, looping, barely there.
  function startMusic() {
    if (musicTimer) return;
    const notes = [196, 247, 294, 247];
    let i = 0;
    musicTimer = setInterval(() => {
      if (enabled) tone(notes[i % notes.length], 0.9, 'sine', 0.03);
      i += 1;
    }, 450);
  }

  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }

  return {
    gobble, jump, pickup, dash, spotted, hit, caught, hide, found, stageClear, escaped,
    startMusic, stopMusic,
    toggle() { enabled = !enabled; return enabled; },
    get enabled() { return enabled; },
    unlock() { context(); },
  };
}
