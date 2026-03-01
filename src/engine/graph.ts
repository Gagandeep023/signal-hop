import type { GameNode } from '../types';
import { INITIAL_NODE_COUNT, MIN_NODE_SPACING, BASE_TIMER, EDGE_PADDING } from './constants';

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function generateNodePositions(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  let attempts = 0;
  const maxAttempts = count * 100;

  while (positions.length < count && attempts < maxAttempts) {
    const x = EDGE_PADDING + Math.random() * (1 - 2 * EDGE_PADDING);
    const y = EDGE_PADDING + Math.random() * (1 - 2 * EDGE_PADDING);
    const candidate = { x, y };

    const tooClose = positions.some((p) => distance(p, candidate) < MIN_NODE_SPACING);
    if (!tooClose) {
      positions.push(candidate);
    }
    attempts++;
  }

  return positions;
}

function getNearestNeighbors(
  nodeIndex: number,
  positions: { x: number; y: number }[],
  maxNeighbors: number
): number[] {
  const distances = positions
    .map((p, i) => ({ index: i, dist: distance(positions[nodeIndex], p) }))
    .filter((d) => d.index !== nodeIndex)
    .sort((a, b) => a.dist - b.dist);

  return distances.slice(0, maxNeighbors).map((d) => d.index);
}

function bfsConnected(adjacency: Set<number>[], start: number, nodeCount: number): Set<number> {
  const visited = new Set<number>();
  const queue = [start];
  visited.add(start);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of adjacency[current]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return visited;
}

function ensureConnected(adjacency: Set<number>[], nodeCount: number): void {
  const visited = bfsConnected(adjacency, 0, nodeCount);

  if (visited.size === nodeCount) return;

  const unvisited = Array.from({ length: nodeCount }, (_, i) => i).filter((i) => !visited.has(i));

  for (const node of unvisited) {
    let closest = -1;
    let closestInVisited = -1;
    let minDist = Infinity;

    for (const v of visited) {
      // Find the closest visited node to bridge
      // We don't have positions here, so just connect to any visited node
      // This will be called with position-aware logic below
      if (!adjacency[node].has(v)) {
        closest = node;
        closestInVisited = v;
        minDist = 0;
        break;
      }
    }

    if (closest !== -1 && closestInVisited !== -1) {
      adjacency[closest].add(closestInVisited);
      adjacency[closestInVisited].add(closest);
      visited.add(closest);
    }
  }
}

export function generateGraph(nodeCount: number = INITIAL_NODE_COUNT): {
  nodes: GameNode[];
  edges: [string, string][];
} {
  const positions = generateNodePositions(nodeCount);
  const actualCount = positions.length;

  const nodes: GameNode[] = positions.map((pos, i) => ({
    id: `node-${i}`,
    x: pos.x,
    y: pos.y,
    timer: BASE_TIMER,
    maxTimer: BASE_TIMER,
    alive: true,
    neighbors: [],
  }));

  // Build adjacency using proximity
  const adjacency: Set<number>[] = Array.from({ length: actualCount }, () => new Set<number>());

  for (let i = 0; i < actualCount; i++) {
    const neighborCount = 2 + Math.floor(Math.random() * 3); // 2-4 neighbors
    const nearest = getNearestNeighbors(i, positions, neighborCount);

    for (const j of nearest) {
      adjacency[i].add(j);
      adjacency[j].add(i);
    }
  }

  // Ensure full connectivity
  const visited = bfsConnected(adjacency, 0, actualCount);
  if (visited.size < actualCount) {
    // Bridge disconnected components with position-aware connections
    for (let i = 0; i < actualCount; i++) {
      if (visited.has(i)) continue;

      let bestVisited = 0;
      let bestDist = Infinity;
      for (const v of visited) {
        const d = distance(positions[i], positions[v]);
        if (d < bestDist) {
          bestDist = d;
          bestVisited = v;
        }
      }

      adjacency[i].add(bestVisited);
      adjacency[bestVisited].add(i);
      visited.add(i);
    }
  }

  // Convert adjacency to edges and neighbor lists
  const edgeSet = new Set<string>();
  const edges: [string, string][] = [];

  for (let i = 0; i < actualCount; i++) {
    for (const j of adjacency[i]) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([nodes[i].id, nodes[j].id]);
      }
      nodes[i].neighbors.push(nodes[j].id);
    }
  }

  // Deduplicate neighbor lists
  for (const node of nodes) {
    node.neighbors = [...new Set(node.neighbors)];
  }

  return { nodes, edges };
}
