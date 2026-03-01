interface RulesProps {
  onStart: () => void;
  theme: 'dark' | 'light';
}

export default function Rules({ onStart, theme }: RulesProps) {
  return (
    <div className={`signal-hop-overlay signal-hop-overlay--${theme}`}>
      <div className="signal-hop-overlay__card">
        <h1 className="signal-hop-overlay__title">Signal Hop</h1>
        <p className="signal-hop-overlay__subtitle">Keep the network alive as long as possible</p>

        <div className="signal-hop-overlay__rules">
          <div className="signal-hop-overlay__rule">
            <span className="signal-hop-overlay__rule-num">1</span>
            <span>You are the bright node. Tap or click connected nodes to hop to them.</span>
          </div>
          <div className="signal-hop-overlay__rule">
            <span className="signal-hop-overlay__rule-num">2</span>
            <span>Every node has a countdown timer. When it hits zero, the node dies.</span>
          </div>
          <div className="signal-hop-overlay__rule">
            <span className="signal-hop-overlay__rule-num">3</span>
            <span>Hopping to a node resets its timer.</span>
          </div>
          <div className="signal-hop-overlay__rule">
            <span className="signal-hop-overlay__rule-num">4</span>
            <span>Dead nodes sever connections. If all your neighbors die, game over.</span>
          </div>
          <div className="signal-hop-overlay__rule">
            <span className="signal-hop-overlay__rule-num">5</span>
            <span>The network decays faster as time passes.</span>
          </div>
        </div>

        <p className="signal-hop-overlay__tip">
          Tip: Plan your route. Don't just save the nearest dying node. Think 2-3 hops ahead.
        </p>

        <button className="signal-hop-overlay__btn" onClick={onStart}>
          Begin
        </button>
      </div>
    </div>
  );
}
