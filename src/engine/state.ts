import type { GameState } from '../types';
import { generateGraph } from './graph';
import { isGameOver, canHop, getTimerForDifficulty } from './logic';

export function createInitialState(): GameState {
  const { nodes, edges } = generateGraph();

  // Pick a random starting node
  const startIndex = Math.floor(Math.random() * nodes.length);
  const currentNodeId = nodes[startIndex].id;

  return {
    nodes,
    edges,
    currentNodeId,
    score: 0,
    hops: 0,
    phase: 'rules',
    difficulty: 0,
    elapsed: 0,
    nodesLost: 0,
  };
}

export function tick(state: GameState, deltaSeconds: number): GameState {
  if (state.phase !== 'playing') return state;

  const elapsed = state.elapsed + deltaSeconds;
  let nodesLost = state.nodesLost;

  const nodes = state.nodes.map((node) => {
    if (!node.alive) return node;
    if (node.id === state.currentNodeId) return node;

    const newTimer = node.timer - deltaSeconds;
    if (newTimer <= 0) {
      nodesLost++;
      return { ...node, timer: 0, alive: false };
    }
    return { ...node, timer: newTimer };
  });

  const newState: GameState = {
    ...state,
    nodes,
    elapsed,
    nodesLost,
    difficulty: Math.floor(elapsed / 45),
  };

  if (isGameOver(newState)) {
    return { ...newState, phase: 'over' };
  }

  return newState;
}

export function hop(state: GameState, targetNodeId: string): GameState {
  if (state.phase !== 'playing') return state;
  if (!canHop(state, targetNodeId)) return state;

  const timerValue = getTimerForDifficulty(state.elapsed);

  const nodes = state.nodes.map((node) => {
    if (node.id === targetNodeId) {
      return { ...node, timer: timerValue, maxTimer: timerValue };
    }
    return node;
  });

  const newState: GameState = {
    ...state,
    nodes,
    currentNodeId: targetNodeId,
    score: state.score + 1,
    hops: state.hops + 1,
  };

  if (isGameOver(newState)) {
    return { ...newState, phase: 'over' };
  }

  return newState;
}
