import { useState, useCallback } from 'react';

const STORAGE_KEY = 'signal-hop-high-score';

function readHighScore(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function useHighScore() {
  const [highScore, setHighScore] = useState(readHighScore);

  const updateHighScore = useCallback((score: number) => {
    const current = readHighScore();
    if (score > current) {
      try {
        localStorage.setItem(STORAGE_KEY, String(score));
      } catch {
        // localStorage may be full or disabled
      }
      setHighScore(score);
      return true;
    }
    return false;
  }, []);

  return { highScore, updateHighScore };
}
