interface GameOverProps {
  score: number;
  elapsed: number;
  highScore: number;
  isNewHighScore: boolean;
  nodesLost: number;
  totalNodes: number;
  onRetry: () => void;
  theme: 'dark' | 'light';
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function GameOver({
  score,
  elapsed,
  highScore,
  isNewHighScore,
  nodesLost,
  totalNodes,
  onRetry,
  theme,
}: GameOverProps) {
  const nodesSaved = totalNodes - nodesLost;

  return (
    <div className={`signal-hop-overlay signal-hop-overlay--${theme}`}>
      <div className="signal-hop-overlay__card">
        <h1 className="signal-hop-overlay__title">Network Lost</h1>

        <div className="signal-hop-gameover__stats">
          <div className="signal-hop-gameover__stat">
            <span className="signal-hop-gameover__stat-label">Score</span>
            <span className="signal-hop-gameover__stat-value">{score}</span>
          </div>
          <div className="signal-hop-gameover__stat">
            <span className="signal-hop-gameover__stat-label">Time Survived</span>
            <span className="signal-hop-gameover__stat-value">{formatTime(elapsed)}</span>
          </div>
          <div className="signal-hop-gameover__stat">
            <span className="signal-hop-gameover__stat-label">Nodes Saved</span>
            <span className="signal-hop-gameover__stat-value">{nodesSaved}/{totalNodes}</span>
          </div>
          <div className="signal-hop-gameover__stat">
            <span className="signal-hop-gameover__stat-label">High Score</span>
            <span className="signal-hop-gameover__stat-value">
              {highScore}
              {isNewHighScore && <span className="signal-hop-gameover__new-hs"> NEW!</span>}
            </span>
          </div>
        </div>

        <button className="signal-hop-overlay__btn" onClick={onRetry}>
          Try Again
        </button>
      </div>
    </div>
  );
}
