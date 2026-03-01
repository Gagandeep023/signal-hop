import { useRef, useEffect, useCallback } from 'react';

export function useGameLoop(
  callback: (deltaSeconds: number) => void,
  active: boolean
) {
  const callbackRef = useRef(callback);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  callbackRef.current = callback;

  const loop = useCallback((time: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
    }

    const delta = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    // Cap delta to prevent huge jumps (e.g. when tab is backgrounded)
    const cappedDelta = Math.min(delta, 0.1);
    callbackRef.current(cappedDelta);

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (!active) {
      lastTimeRef.current = 0;
      return;
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, loop]);
}
