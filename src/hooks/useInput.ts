import { useCallback } from 'react';
import type { GameNode } from '../types';
import { TOUCH_TARGET_RADIUS } from '../engine/constants';

interface UseInputOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  nodes: GameNode[];
  reachableIds: Set<string>;
  canvasWidth: number;
  canvasHeight: number;
  onNodeTap: (nodeId: string) => void;
}

function nodeScreenPosition(
  node: GameNode,
  canvasWidth: number,
  canvasHeight: number
): { sx: number; sy: number } {
  return {
    sx: node.x * canvasWidth,
    sy: node.y * canvasHeight,
  };
}

export function useInput({
  canvasRef,
  nodes,
  reachableIds,
  canvasWidth,
  canvasHeight,
  onNodeTap,
}: UseInputOptions) {
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;

      // Check reachable nodes only
      let closest: { id: string; dist: number } | null = null;

      for (const node of nodes) {
        if (!reachableIds.has(node.id)) continue;

        const { sx, sy } = nodeScreenPosition(node, canvasWidth, canvasHeight);
        const dist = Math.sqrt((px - sx) ** 2 + (py - sy) ** 2);

        if (dist <= TOUCH_TARGET_RADIUS && (!closest || dist < closest.dist)) {
          closest = { id: node.id, dist };
        }
      }

      if (closest) {
        onNodeTap(closest.id);
      }
    },
    [canvasRef, nodes, reachableIds, canvasWidth, canvasHeight, onNodeTap]
  );

  return { handlePointerDown };
}
