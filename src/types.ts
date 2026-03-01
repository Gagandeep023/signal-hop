export interface GameNode {
  id: string;
  x: number;
  y: number;
  timer: number;
  maxTimer: number;
  alive: boolean;
  neighbors: string[];
}

export interface GameState {
  nodes: GameNode[];
  edges: [string, string][];
  currentNodeId: string;
  score: number;
  hops: number;
  phase: 'rules' | 'playing' | 'over';
  difficulty: number;
  elapsed: number;
  nodesLost: number;
}

export interface SignalHopProps {
  theme?: 'dark' | 'light';
  onGameOver?: (score: number) => void;
}
