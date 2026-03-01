import type { GameState, GameNode } from '../types';
import { DIFFICULTY_RAMP_INTERVAL, TIMER_REDUCTION_PER_RAMP, BASE_TIMER, MIN_TIMER } from './constants';

export function getReachableNodes(state: GameState): GameNode[] {
  const current = state.nodes.find((n) => n.id === state.currentNodeId);
  if (!current) return [];

  return state.nodes.filter(
    (n) => n.alive && n.id !== state.currentNodeId && current.neighbors.includes(n.id)
  );
}

export function isGameOver(state: GameState): boolean {
  const current = state.nodes.find((n) => n.id === state.currentNodeId);
  if (!current || !current.alive) return true;

  return getReachableNodes(state).length === 0;
}

export function getDifficultyMultiplier(elapsed: number): number {
  return Math.floor(elapsed / DIFFICULTY_RAMP_INTERVAL);
}

export function getTimerForDifficulty(elapsed: number): number {
  const ramps = getDifficultyMultiplier(elapsed);
  return Math.max(MIN_TIMER, BASE_TIMER - ramps * TIMER_REDUCTION_PER_RAMP);
}

export function canHop(state: GameState, targetNodeId: string): boolean {
  const current = state.nodes.find((n) => n.id === state.currentNodeId);
  if (!current) return false;

  const target = state.nodes.find((n) => n.id === targetNodeId);
  if (!target || !target.alive) return false;

  return current.neighbors.includes(targetNodeId);
}
