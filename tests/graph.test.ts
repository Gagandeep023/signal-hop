import { describe, it, expect } from 'vitest';
import { generateGraph } from '../src/engine/graph';
import { INITIAL_NODE_COUNT, MIN_NODE_SPACING, EDGE_PADDING } from '../src/engine/constants';

describe('generateGraph', () => {
  it('produces the correct number of nodes', () => {
    const { nodes } = generateGraph();
    expect(nodes.length).toBeLessThanOrEqual(INITIAL_NODE_COUNT);
    expect(nodes.length).toBeGreaterThanOrEqual(5); // reasonable minimum
  });

  it('produces nodes with unique IDs', () => {
    const { nodes } = generateGraph();
    const ids = nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps all nodes within bounds (0-1)', () => {
    const { nodes } = generateGraph();
    for (const node of nodes) {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(1);
      expect(node.y).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeLessThanOrEqual(1);
    }
  });

  it('respects minimum spacing between nodes', () => {
    const { nodes } = generateGraph();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        expect(dist).toBeGreaterThanOrEqual(MIN_NODE_SPACING - 0.001);
      }
    }
  });

  it('gives every node at least 1 neighbor', () => {
    const { nodes } = generateGraph();
    for (const node of nodes) {
      expect(node.neighbors.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('produces a fully connected graph', () => {
    const { nodes } = generateGraph();
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // BFS from first node should reach all nodes
    const visited = new Set<string>();
    const queue = [nodes[0].id];
    visited.add(nodes[0].id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const node = nodeMap.get(current)!;
      for (const neighborId of node.neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      }
    }

    expect(visited.size).toBe(nodes.length);
  });

  it('produces edges that match node neighbor lists', () => {
    const { nodes, edges } = generateGraph();
    // Each edge should correspond to a neighbor relationship
    for (const [aId, bId] of edges) {
      const a = nodes.find((n) => n.id === aId)!;
      const b = nodes.find((n) => n.id === bId)!;
      expect(a.neighbors).toContain(bId);
      expect(b.neighbors).toContain(aId);
    }
  });

  it('initializes nodes with correct timer values', () => {
    const { nodes } = generateGraph();
    for (const node of nodes) {
      expect(node.alive).toBe(true);
      expect(node.timer).toBe(node.maxTimer);
      expect(node.timer).toBeGreaterThan(0);
    }
  });

  it('accepts a custom node count', () => {
    const { nodes } = generateGraph(6);
    expect(nodes.length).toBeLessThanOrEqual(6);
    expect(nodes.length).toBeGreaterThanOrEqual(3);
  });
});
