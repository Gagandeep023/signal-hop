import { useRef, useEffect, useCallback } from 'react';
import type { GameState, GameNode } from '../types';
import { NODE_RADIUS } from '../engine/constants';
import { getReachableNodes } from '../engine/logic';
import { useInput } from '../hooks/useInput';

interface GameCanvasProps {
  state: GameState;
  onNodeTap: (nodeId: string) => void;
  theme: 'dark' | 'light';
}

const COLORS = {
  dark: {
    bg: '#0a0a0a',
    edge: 'rgba(100, 255, 218, 0.15)',
    edgeDying: 'rgba(255, 100, 100, 0.1)',
    nodeStroke: '#333333',
    nodeFill: '#1a1a1a',
    currentGlow: '#64ffda',
    currentFill: '#0d3d32',
    timerHigh: '#64ffda',
    timerMid: '#ffd700',
    timerLow: '#ff4444',
    reachablePulse: 'rgba(100, 255, 218, 0.3)',
    text: '#e0e0e0',
    deadFade: 'rgba(255, 255, 255, 0.05)',
  },
  light: {
    bg: '#f5f5f5',
    edge: 'rgba(0, 150, 136, 0.2)',
    edgeDying: 'rgba(255, 80, 80, 0.15)',
    nodeStroke: '#cccccc',
    nodeFill: '#ffffff',
    currentGlow: '#009688',
    currentFill: '#e0f2f1',
    timerHigh: '#009688',
    timerMid: '#ff8f00',
    timerLow: '#d32f2f',
    reachablePulse: 'rgba(0, 150, 136, 0.3)',
    text: '#333333',
    deadFade: 'rgba(0, 0, 0, 0.05)',
  },
};

function getTimerColor(ratio: number, colors: typeof COLORS.dark): string {
  if (ratio > 0.5) return colors.timerHigh;
  if (ratio > 0.25) return colors.timerMid;
  return colors.timerLow;
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  node: GameNode,
  isCurrent: boolean,
  isReachable: boolean,
  colors: typeof COLORS.dark,
  canvasWidth: number,
  canvasHeight: number,
  pulsePhase: number
) {
  const x = node.x * canvasWidth;
  const y = node.y * canvasHeight;
  const r = NODE_RADIUS;

  if (!node.alive) return;

  // Reachable pulse
  if (isReachable) {
    const pulseR = r + 4 + Math.sin(pulsePhase) * 3;
    ctx.beginPath();
    ctx.arc(x, y, pulseR, 0, Math.PI * 2);
    ctx.fillStyle = colors.reachablePulse;
    ctx.fill();
  }

  // Current node glow
  if (isCurrent) {
    ctx.beginPath();
    ctx.arc(x, y, r + 6, 0, Math.PI * 2);
    ctx.strokeStyle = colors.currentGlow;
    ctx.lineWidth = 2;
    ctx.shadowColor = colors.currentGlow;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Node body
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = isCurrent ? colors.currentFill : colors.nodeFill;
  ctx.fill();
  ctx.strokeStyle = isCurrent ? colors.currentGlow : colors.nodeStroke;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Timer arc
  if (!isCurrent) {
    const ratio = node.maxTimer > 0 ? node.timer / node.maxTimer : 0;
    const timerColor = getTimerColor(ratio, colors);
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + Math.PI * 2 * ratio;

    ctx.beginPath();
    ctx.arc(x, y, r - 3, startAngle, endAngle);
    ctx.strokeStyle = timerColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.lineCap = 'butt';
  }

  // Timer text
  if (!isCurrent && node.timer < node.maxTimer) {
    const ratio = node.maxTimer > 0 ? node.timer / node.maxTimer : 0;
    ctx.fillStyle = getTimerColor(ratio, colors);
    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.timer.toFixed(1), x, y);
  }

  // Current node indicator
  if (isCurrent) {
    ctx.fillStyle = colors.currentGlow;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function GameCanvas({ state, onNodeTap, theme }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef(0);
  const sizeRef = useRef({ width: 600, height: 600 });

  const colors = COLORS[theme];
  const reachable = getReachableNodes(state);
  const reachableIds = new Set(reachable.map((n) => n.id));

  // Resize handler
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const size = Math.min(width, height);
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        sizeRef.current = { width: size * dpr, height: size * dpr };
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = sizeRef.current;
    pulseRef.current += 0.05;

    // Clear
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);

    // Draw edges
    for (const [aId, bId] of state.edges) {
      const a = state.nodes.find((n) => n.id === aId);
      const b = state.nodes.find((n) => n.id === bId);
      if (!a || !b) continue;
      if (!a.alive || !b.alive) continue;

      const ax = a.x * width;
      const ay = a.y * height;
      const bx = b.x * width;
      const by = b.y * height;

      const dying = a.timer / a.maxTimer < 0.25 || b.timer / b.maxTimer < 0.25;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = dying ? colors.edgeDying : colors.edge;
      ctx.lineWidth = dying ? 1 : 1.5;
      ctx.stroke();
    }

    // Draw nodes
    for (const node of state.nodes) {
      drawNode(
        ctx,
        node,
        node.id === state.currentNodeId,
        reachableIds.has(node.id),
        colors,
        width,
        height,
        pulseRef.current
      );
    }

    // Draw dead node markers (faded X)
    for (const node of state.nodes) {
      if (node.alive) continue;
      const x = node.x * width;
      const y = node.y * height;
      const r = NODE_RADIUS * 0.5;

      ctx.strokeStyle = colors.deadFade;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - r, y - r);
      ctx.lineTo(x + r, y + r);
      ctx.moveTo(x + r, y - r);
      ctx.lineTo(x - r, y + r);
      ctx.stroke();
    }
  }, [state, colors, reachableIds]);

  // Request animation frame for rendering
  useEffect(() => {
    let raf: number;
    const loop = () => {
      render();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [render]);

  const { handlePointerDown } = useInput({
    canvasRef,
    nodes: state.nodes,
    reachableIds,
    canvasWidth: sizeRef.current.width,
    canvasHeight: sizeRef.current.height,
    onNodeTap,
  });

  return (
    <div ref={containerRef} className="signal-hop-canvas-container">
      <canvas
        ref={canvasRef}
        className="signal-hop-canvas"
        onPointerDown={handlePointerDown}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
