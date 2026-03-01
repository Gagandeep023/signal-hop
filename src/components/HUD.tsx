import type { GameState } from '../types';

interface HUDProps {
  state: GameState;
  onShowRules: () => void;
  theme: 'dark' | 'light';
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function HUD({ state, onShowRules, theme }: HUDProps) {
  const aliveNodes = state.nodes.filter((n) => n.alive).length;
  const totalNodes = state.nodes.length;

  return (
    <div className={`signal-hop-hud signal-hop-hud--${theme}`}>
      <div className="signal-hop-hud__stat">
        <span className="signal-hop-hud__label">Score</span>
        <span className="signal-hop-hud__value">{state.score}</span>
      </div>
      <div className="signal-hop-hud__stat">
        <span className="signal-hop-hud__label">Time</span>
        <span className="signal-hop-hud__value">{formatTime(state.elapsed)}</span>
      </div>
      <div className="signal-hop-hud__stat">
        <span className="signal-hop-hud__label">Nodes</span>
        <span className="signal-hop-hud__value">{aliveNodes}/{totalNodes}</span>
      </div>
      <button
        className="signal-hop-hud__help"
        onClick={onShowRules}
        aria-label="Show rules"
        title="How to play"
      >
        ?
      </button>
    </div>
  );
}
