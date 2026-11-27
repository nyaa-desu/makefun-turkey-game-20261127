// Keyboard input: arrows/WASD to steady or surge, Space/W/Up to jump,
// S/Down to hide, Shift to dash, Enter to start or restart, P to pause, M to mute.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_MUTE = 4;

export function createInput(canvas) {
  const keys = new Set();
  let actions = 0;

  function onKeyDown(event) {
    const key = event.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) event.preventDefault();
    if (event.repeat) return;
    keys.add(key.length === 1 ? key.toLowerCase() : key);
    if (key === 'Enter' || key === ' ') actions |= ACTION_CONFIRM;
    if (key === 'p' || key === 'P' || key === 'Escape') actions |= ACTION_PAUSE;
    if (key === 'm' || key === 'M') actions |= ACTION_MUTE;
  }

  function onKeyUp(event) {
    const key = event.key;
    keys.delete(key.length === 1 ? key.toLowerCase() : key);
  }

  function onClick() { actions |= ACTION_CONFIRM; }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onClick);

  const held = (...names) => names.some((n) => keys.has(n));

  return {
    // -1 to slow and steady the run, +1 to surge ahead (costs a little stamina).
    surge() { return held('ArrowRight', 'd') ? 1 : held('ArrowLeft', 'a') ? -1 : 0; },
    jumpHeld() { return held(' ', 'ArrowUp', 'w'); },
    hideHeld() { return held('ArrowDown', 's'); },
    dashHeld() { return held('Shift'); },
    takeActions() {
      const out = actions;
      actions = 0;
      return out;
    },
  };
}
