// utils/dice.ts
/** Roll n Fudge/Fate dice (each +1, +1, 0, 0, -1, -1), return sum between -n..+n */
export function rollFudgeDice(n = 4): number {
    let total = 0;
    for (let i = 0; i < n; i++) {
      const r = Math.floor(Math.random() * 6);
      total += r < 2 ? -1 : r < 4 ? 0 : 1;
    }
    return total;
  }
  