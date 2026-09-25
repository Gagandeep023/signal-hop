# @gagandeep023/signal-hop

A reflex/strategy browser game where you hop between network nodes to keep them alive. Built with Canvas 2D and React.

## How It Works

You control a signal hopping between nodes in a network graph. Each node has a countdown timer. When a timer reaches zero, the node dies and severs all its connections. Hopping to a node resets its timer. The game ends when all your neighboring nodes are dead and you have nowhere to hop.

The network decays faster as time progresses, forcing you to plan routes instead of just saving the nearest dying node.

## Installation

```bash
npm install @gagandeep023/signal-hop
```

## Quick Start

```tsx
import { SignalHop } from '@gagandeep023/signal-hop/frontend';
import '@gagandeep023/signal-hop/frontend/styles.css';

function GamePage() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <SignalHop
        theme="dark"
        onGameOver={(score) => console.log('Score:', score)}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `'dark' \| 'light'` | `'dark'` | Visual theme |
| `onGameOver` | `(score: number) => void` | - | Callback when game ends |

## How to Play

1. You are the bright node. Tap or click connected nodes to hop to them.
2. Every node has a countdown timer. When it hits zero, the node dies.
3. Hopping to a node resets its timer.
4. Dead nodes sever connections. If all your neighbors die, game over.
5. The network decays faster as time passes.

**Tip:** Plan your route. Don't just save the nearest dying node. Think 2-3 hops ahead.

## Development

```bash
git clone https://github.com/Gagandeep023/signal-hop.git
cd signal-hop
npm install
npm test        # run tests
npm run build   # build to dist/
npm run dev     # watch mode
```

## Exports

- `@gagandeep023/signal-hop/frontend` - React component
- `@gagandeep023/signal-hop/types` - TypeScript types
- `@gagandeep023/signal-hop/frontend/styles.css` - Styles

## Requests and feedback

[![Request a feature](https://img.shields.io/badge/request-a%20feature-64ffda)](https://github.com/Gagandeep023/signal-hop/discussions/new?category=ideas)
[![Report a bug](https://img.shields.io/badge/report-a%20bug-cc4444)](https://github.com/Gagandeep023/signal-hop/issues/new?template=bug_report.yml)

Ideas and questions go to Discussions, bugs to Issues.

## License

MIT
