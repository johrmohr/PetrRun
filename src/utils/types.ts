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

export interface GamePath {
  positions: [number, number][];
  color?: string;
  weight?: number;
  id?: string;
}

export interface GameArea {
  center: [number, number];
  radius: number;
  color?: string;
  fillColor?: string;
  popup?: string;
  id?: string;
}

export interface Player {
  position: [number, number];
  health: number;
  score: number;
  inventory: string[];
  level: number;
}

export interface GameState {
  player: Player;
  markers: GameMarker[];
  paths: GamePath[];
  areas: GameArea[];
  gameMode: "exploration" | "combat" | "puzzle" | "racing";
  isPaused: boolean;
  timeElapsed: number;
}

export interface MapSettings {
  center: [number, number];
  zoom: number;
  darkMode: boolean;
  enable2_5D: boolean;
  gameStyle: boolean;
  bounds?: [[number, number], [number, number]];
}

export interface GameEvent {
  type:
    | "player_move"
    | "marker_click"
    | "area_enter"
    | "area_exit"
    | "item_collect";
  data: Record<string, unknown>;
  timestamp: number;
}

// Sticker types (keeping existing functionality)
export interface Sticker {
  id: string;
  url: string;
  position: { x: number; y: number };
  scale?: number;
  rotation?: number;
}

export interface Dropsite {
  id: string;
  name: string;
  photo: string;
  location: [number, number];
  difficulty: "easy" | "medium" | "hard";
  description: string;
}

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
  sprite?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface GameMapProps {
  center: [number, number];
  zoom?: number;
  height?: string;
  width?: string;
  markers?: GameMarker[];
  playerPosition?: [number, number];
  onMapClick?: (position: { x: number; y: number }) => void;
  onPlayerMove?: (newPosition: [number, number]) => void;
  imageDimensions: ImageDimensions;
  gamePhase?: string;
}
