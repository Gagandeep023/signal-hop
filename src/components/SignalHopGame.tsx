import { useState, useCallback, useRef } from 'react';
import type { GameState, SignalHopProps } from '../types';
import { createInitialState, tick, hop } from '../engine/state';
import { useGameLoop } from '../hooks/useGameLoop';
import { useHighScore } from '../hooks/useHighScore';
import GameCanvas from './GameCanvas';
import HUD from './HUD';
import Rules from './Rules';
import GameOver from './GameOver';

const RULES_SEEN_KEY = 'signal-hop-rules-seen';

function hasSeenRules(): boolean {
  try {
    return localStorage.getItem(RULES_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markRulesSeen(): void {
  try {
    localStorage.setItem(RULES_SEEN_KEY, '1');
  } catch {
    // ignore
  }
}

export default function SignalHopGame({ theme = 'dark', onGameOver }: SignalHopProps) {
  const [state, setState] = useState<GameState>(() => {
    const initial = createInitialState();
    if (hasSeenRules()) {
      return { ...initial, phase: 'playing' };
    }
    return initial;
  });

  const [showRules, setShowRules] = useState(!hasSeenRules());
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const { highScore, updateHighScore } = useHighScore();
  const gameOverFiredRef = useRef(false);

  const handleTick = useCallback((delta: number) => {
    setState((prev) => {
      const next = tick(prev, delta);
      if (next.phase === 'over' && prev.phase !== 'over') {
        // Handled in effect-like way via state comparison
      }
      return next;
    });
  }, []);

  useGameLoop(handleTick, state.phase === 'playing');

  // Check for game over transition
  if (state.phase === 'over' && !gameOverFiredRef.current) {
    gameOverFiredRef.current = true;
    const isNew = updateHighScore(state.score);
    setIsNewHighScore(isNew);
    onGameOver?.(state.score);
  }

  const handleNodeTap = useCallback((nodeId: string) => {
    setState((prev) => hop(prev, nodeId));
  }, []);

  const handleStart = useCallback(() => {
    markRulesSeen();
    setShowRules(false);
    setState((prev) => ({ ...prev, phase: 'playing' }));
  }, []);

  const handleRetry = useCallback(() => {
    gameOverFiredRef.current = false;
    setIsNewHighScore(false);
    const newState = createInitialState();
    setState({ ...newState, phase: 'playing' });
  }, []);

  const handleShowRules = useCallback(() => {
    setShowRules(true);
  }, []);

  const handleCloseRules = useCallback(() => {
    setShowRules(false);
    if (state.phase === 'rules') {
      markRulesSeen();
      setState((prev) => ({ ...prev, phase: 'playing' }));
    }
  }, [state.phase]);

  return (
    <div className={`signal-hop-game signal-hop-game--${theme}`}>
      <GameCanvas state={state} onNodeTap={handleNodeTap} theme={theme} />

      {state.phase === 'playing' && (
        <HUD state={state} onShowRules={handleShowRules} theme={theme} />
      )}

      {showRules && state.phase !== 'over' && (
        <Rules
          onStart={state.phase === 'rules' ? handleStart : handleCloseRules}
          theme={theme}
        />
      )}

      {state.phase === 'over' && (
        <GameOver
          score={state.score}
          elapsed={state.elapsed}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          nodesLost={state.nodesLost}
          totalNodes={state.nodes.length}
          onRetry={handleRetry}
          theme={theme}
        />
      )}
    </div>
  );
}
