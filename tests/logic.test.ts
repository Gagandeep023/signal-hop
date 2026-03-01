import { describe, it, expect } from 'vitest';
import { getReachableNodes, isGameOver, getDifficultyMultiplier, getTimerForDifficulty, canHop } from '../src/engine/logic';
import { createInitialState } from '../src/engine/state';
import { BASE_TIMER, MIN_TIMER, DIFFICULTY_RAMP_INTERVAL } from '../src/engine/constants';
import type { GameState } from '../src/types';

describe('getReachableNodes', () => {
  it('returns alive neighbors of the current node', () => {
    const state = createInitialState();
    const playingState = { ...state, phase: 'playing' as const };
    const reachable = getReachableNodes(playingState);

    const current = state.nodes.find((n) => n.id === state.currentNodeId)!;
    for (const node of reachable) {
      expect(current.neighbors).toContain(node.id);
      expect(node.alive).toBe(true);
      expect(node.id).not.toBe(state.currentNodeId);
    }
  });

  it('excludes dead neighbors', () => {
    let state = createInitialState();
    state = { ...state, phase: 'playing' };

    const current = state.nodes.find((n) => n.id === state.currentNodeId)!;
    const neighborId = current.neighbors[0];

    state = {
      ...state,
      nodes: state.nodes.map((n) =>
        n.id === neighborId ? { ...n, alive: false } : n
      ),
    };

    const reachable = getReachableNodes(state);
    expect(reachable.find((n) => n.id === neighborId)).toBeUndefined();
  });
});

describe('isGameOver', () => {
  it('returns false when alive neighbors exist', () => {
    const state = createInitialState();
    const playingState = { ...state, phase: 'playing' as const };
    expect(isGameOver(playingState)).toBe(false);
  });

  it('returns true when no alive neighbors exist', () => {
    let state = createInitialState();
    const current = state.nodes.find((n) => n.id === state.currentNodeId)!;

    // Kill all neighbors
    state = {
      ...state,
      nodes: state.nodes.map((n) =>
        current.neighbors.includes(n.id) ? { ...n, alive: false } : n
      ),
    };

    expect(isGameOver(state)).toBe(true);
  });

  it('returns true when current node is dead', () => {
    let state = createInitialState();
    state = {
      ...state,
      nodes: state.nodes.map((n) =>
        n.id === state.currentNodeId ? { ...n, alive: false } : n
      ),
    };

    expect(isGameOver(state)).toBe(true);
  });
});

describe('getDifficultyMultiplier', () => {
  it('returns 0 at start', () => {
    expect(getDifficultyMultiplier(0)).toBe(0);
  });

  it('increases after each interval', () => {
    expect(getDifficultyMultiplier(DIFFICULTY_RAMP_INTERVAL)).toBe(1);
    expect(getDifficultyMultiplier(DIFFICULTY_RAMP_INTERVAL * 2)).toBe(2);
    expect(getDifficultyMultiplier(DIFFICULTY_RAMP_INTERVAL * 3)).toBe(3);
  });

  it('stays at same level between intervals', () => {
    expect(getDifficultyMultiplier(DIFFICULTY_RAMP_INTERVAL - 1)).toBe(0);
    expect(getDifficultyMultiplier(DIFFICULTY_RAMP_INTERVAL + 1)).toBe(1);
  });
});

describe('getTimerForDifficulty', () => {
  it('returns base timer at start', () => {
    expect(getTimerForDifficulty(0)).toBe(BASE_TIMER);
  });

  it('decreases over time', () => {
    const later = getTimerForDifficulty(DIFFICULTY_RAMP_INTERVAL * 2);
    expect(later).toBeLessThan(BASE_TIMER);
  });

  it('never goes below minimum', () => {
    const veryLate = getTimerForDifficulty(DIFFICULTY_RAMP_INTERVAL * 100);
    expect(veryLate).toBeGreaterThanOrEqual(MIN_TIMER);
  });
});

describe('canHop', () => {
  it('allows hop to alive neighbor', () => {
    let state = createInitialState();
    state = { ...state, phase: 'playing' };
    const current = state.nodes.find((n) => n.id === state.currentNodeId)!;
    expect(canHop(state, current.neighbors[0])).toBe(true);
  });

  it('rejects hop to dead neighbor', () => {
    let state = createInitialState();
    state = { ...state, phase: 'playing' };

    const current = state.nodes.find((n) => n.id === state.currentNodeId)!;
    const neighborId = current.neighbors[0];

    state = {
      ...state,
      nodes: state.nodes.map((n) =>
        n.id === neighborId ? { ...n, alive: false } : n
      ),
    };

    expect(canHop(state, neighborId)).toBe(false);
  });

  it('rejects hop to non-neighbor', () => {
    let state = createInitialState();
    state = { ...state, phase: 'playing' };

    const current = state.nodes.find((n) => n.id === state.currentNodeId)!;
    const nonNeighbor = state.nodes.find(
      (n) => n.id !== state.currentNodeId && !current.neighbors.includes(n.id)
    );

    if (nonNeighbor) {
      expect(canHop(state, nonNeighbor.id)).toBe(false);
    }
  });
});
