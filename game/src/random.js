// Seeded random numbers: the same seed always builds the same farm, so a screenshot
// staged from a seed is the same frame every time it is taken.
export function createRandom(seed) {
  let state = (seed >>> 0) || 1;
  return {
    next() {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    },
    range(min, max) {
      return min + this.next() * (max - min);
    },
    int(min, max) {
      return Math.floor(this.range(min, max + 1));
    },
    pick(list) {
      return list[Math.floor(this.next() * list.length)];
    },
  };
}
