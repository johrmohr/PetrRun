// Game-related type definitions

export interface GameMarker {
  position: [number, number];
  popup?: string;
  type?:
    | "player"
    | "checkpoint"
    | "obstacle"
    | "treasure"
    | "enemy"
    | "default";
  color?: string;
  id?: string;
}

export interface Player {
  position: [number, number];
  health: number;
  score: number;
  inventory: string[];
  level: number;
}

export interface Dropsite {
  id: string;
  name: string;
  photo: string;
  location: [number, number];
  difficulty: "easy" | "medium" | "hard";
  description: string;
}
