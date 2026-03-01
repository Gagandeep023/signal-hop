import { describe, it, expect } from 'vitest';
import { createInitialState, tick, hop } from '../src/engine/state';

describe('createInitialState', () => {
  it('returns a valid initial state', () => {
    const state = createInitialState();
    expect(state.phase).toBe('rules');
    expect(state.score).toBe(0);
    expect(state.hops).toBe(0);
    expect(state.elapsed).toBe(0);
    expect(state.nodesLost).toBe(0);
    expect(state.nodes.length).toBeGreaterThan(0);
    expect(state.edges.length).toBeGreaterThan(0);
  });

  it('places player on an existing node', () => {
    const state = createInitialState();
    const currentNode = state.nodes.find((n) => n.id === state.currentNodeId);
    expect(currentNode).toBeDefined();
    expect(currentNode!.alive).toBe(true);
  });
});

describe('tick', () => {
  it('does nothing when phase is not playing', () => {
    const state = createInitialState();
    const result = tick(state, 1);
    expect(result.elapsed).toBe(0);
  });

  it('decreases timers of alive non-current nodes', () => {
    let state = createInitialState();
    state = { ...state, phase: 'playing' };

    const before = state.nodes
      .filter((n) => n.id !== state.currentNodeId)
      .map((n) => n.timer);

    const result = tick(state, 1);
    const after = result.nodes
      .filter((n) => n.id !== result.currentNodeId)
      .map((n) => n.timer);

    for (let i = 0; i < before.length; i++) {
      expect(after[i]).toBeLessThan(before[i]);
    }
  });

  it('does not decrease the current node timer', () => {
    let state = createInitialState();
    state = { ...state, phase: 'playing' };

    const currentBefore = state.nodes.find((n) => n.id === state.currentNodeId)!.timer;
    const result = tick(state, 1);
    const currentAfter = result.nodes.find((n) => n.id === result.currentNodeId)!.timer;

    expect(currentAfter).toBe(currentBefore);
  });

  it('kills nodes when timer reaches zero', () => {
    let state = createInitialState();
    state = { ...state, phase: 'playing' };

    // Set all non-current nodes to very low timer
    state = {
      ...state,
      nodes: state.nodes.map((n) =>
        n.id === state.currentNodeId ? n : { ...n, timer: 0.01, maxTimer: 5 }
      ),
    };

    const result = tick(state, 0.1);
    const deadNodes = result.nodes.filter((n) => !n.alive && n.id !== state.currentNodeId);
    expect(deadNodes.length).toBeGreaterThan(0);
  });

  it('increments elapsed time', () => {
    let state = createInitialState();
    state = { ...state, phase: 'playing' };

    const result = tick(state, 0.5);
    expect(result.elapsed).toBeCloseTo(0.5);
  });

  it('sets phase to over when stranded', () => {
    let state = createInitialState();
    state = { ...state, phase: 'playing' };

    // Kill all nodes except current
    state = {
      ...state,
      nodes: state.nodes.map((n) =>
        n.id === state.currentNodeId ? n : { ...n, timer: 0.001, maxTimer: 5 }
      ),
    };

    const result = tick(state, 1);
    expect(result.phase).toBe('over');
  });
});

describe('hop', () => {
  it('does nothing when phase is not playing', () => {
    const state = createInitialState();
    const current = state.nodes.find((n) => n.id === state.currentNodeId)!;
    const neighbor = current.neighbors[0];
    const result = hop(state, neighbor);
    expect(result.currentNodeId).toBe(state.currentNodeId);
  });

  it('moves player to a valid neighbor', () => {
    let state = createInitialState();
    state = { ...state, phase: 'playing' };

    const current = state.nodes.find((n) => n.id === state.currentNodeId)!;
    const neighborId = current.neighbors[0];

    const result = hop(state, neighborId);
    expect(result.currentNodeId).toBe(neighborId);
    expect(result.score).toBe(1);
    expect(result.hops).toBe(1);
  });

  it('resets the target node timer', () => {
    let state = createInitialState();
    state = { ...state, phase: 'playing' };

    // Decrease a neighbor's timer first
    const current = state.nodes.find((n) => n.id === state.currentNodeId)!;
    const neighborId = current.neighbors[0];

    state = {
      ...state,
      nodes: state.nodes.map((n) =>
        n.id === neighborId ? { ...n, timer: 1 } : n
      ),
    };

    const result = hop(state, neighborId);
    const hoppedNode = result.nodes.find((n) => n.id === neighborId)!;
    expect(hoppedNode.timer).toBeGreaterThan(1);
  });

  it('rejects hop to non-neighbor', () => {
    let state = createInitialState();
    state = { ...state, phase: 'playing' };

    const current = state.nodes.find((n) => n.id === state.currentNodeId)!;
    const nonNeighbor = state.nodes.find(
      (n) => n.id !== state.currentNodeId && !current.neighbors.includes(n.id)
    );

    if (nonNeighbor) {
      const result = hop(state, nonNeighbor.id);
      expect(result.currentNodeId).toBe(state.currentNodeId);
      expect(result.score).toBe(0);
    }
  });

  it('rejects hop to dead node', () => {
    let state = createInitialState();
    state = { ...state, phase: 'playing' };

    const current = state.nodes.find((n) => n.id === state.currentNodeId)!;
    const neighborId = current.neighbors[0];

    // Kill the neighbor
    state = {
      ...state,
      nodes: state.nodes.map((n) =>
        n.id === neighborId ? { ...n, alive: false } : n
      ),
    };

    const result = hop(state, neighborId);
    expect(result.currentNodeId).toBe(state.currentNodeId);
  });
});
