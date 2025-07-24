// Game-specific types and phases
export type GamePhase = "start" | "countdown" | "reveal" | "playing" | "victory" | "results";

export interface GameState {
  phase: GamePhase;
  playerPosition: [number, number] | null;
  timer: number;
  startTime: number | null;
  countdown: number;
}

export interface GameActions {
  setPhase: (phase: GamePhase) => void;
  setPlayerPosition: (position: [number, number] | null) => void;
  setTimer: (timer: number) => void;
  setStartTime: (time: number | null) => void;
  setCountdown: (count: number) => void;
}
