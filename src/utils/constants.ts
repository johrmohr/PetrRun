export const stickerUrls = [
  "/stickers/Space-Explorr-Petr.png",
  "/stickers/Thanos.png",
  "/stickers/Trombone_petr.png",
  "/stickers/Trombone_petr.png",
];

// Game constants and configuration
export const GAME_CONFIG = {
  MAP: {
    DEFAULT_CENTER: [40.7128, -74.006] as [number, number], // NYC coordinates
    DEFAULT_ZOOM: 18, // High zoom for game-like experience
    MIN_ZOOM: 15,
    MAX_ZOOM: 20,
    GAME_BOUNDS: [
      [40.7, -74.02] as [number, number], // Southwest bound
      [40.725, -73.99] as [number, number], // Northeast bound
    ],
  },
  PLAYER: {
    SPEED: 100, // pixels per second
    SIZE: 24,
    MOVE_DISTANCE: 0.0001, // Movement sensitivity for WASD
  },
  MARKERS: {
    CHECKPOINT: {
      COLOR: "#ffff00",
      SIZE: 16,
    },
    TREASURE: {
      COLOR: "#ffa500",
      SIZE: 18,
    },
    ENEMY: {
      COLOR: "#ff1493",
      SIZE: 20,
    },
    OBSTACLE: {
      COLOR: "#ff0000",
      SIZE: 14,
    },
  },
  UI: {
    DARK_MODE: true,
    ENABLE_2_5D: true,
    GAME_STYLE: true,
  },
} as const;

// Sample game world data
export const SAMPLE_GAME_DATA = {
  CHECKPOINTS: [
    {
      position: [40.712, -74.005] as [number, number],
      popup: "Checkpoint 1: City Hall",
    },
    {
      position: [40.714, -74.008] as [number, number],
      popup: "Checkpoint 2: Bridge Entrance",
    },
    {
      position: [40.71, -73.998] as [number, number],
      popup: "Checkpoint 3: Financial District",
    },
  ],
  TREASURES: [
    {
      position: [40.711, -74.003] as [number, number],
      popup: "💎 Rare Diamond",
    },
    {
      position: [40.716, -74.01] as [number, number],
      popup: "🏆 Golden Trophy",
    },
    {
      position: [40.708, -73.996] as [number, number],
      popup: "💰 Treasure Chest",
    },
  ],
  ENEMIES: [
    {
      position: [40.713, -74.007] as [number, number],
      popup: "👾 Enemy Guard",
    },
    {
      position: [40.709, -74.002] as [number, number],
      popup: "🤖 Security Bot",
    },
  ],
  OBSTACLES: [
    {
      position: [40.7115, -74.0045] as [number, number],
      popup: "🚧 Construction Zone",
    },
    {
      position: [40.7145, -74.0085] as [number, number],
      popup: "⚠️ Hazard Area",
    },
  ],
  PATHS: [
    {
      positions: [
        [40.71, -74.006] as [number, number],
        [40.712, -74.005] as [number, number],
        [40.714, -74.008] as [number, number],
      ],
      color: "#00ff00",
      weight: 4,
    },
  ],
  AREAS: [
    {
      center: [40.712, -74.006] as [number, number],
      radius: 50,
      color: "#3388ff",
      fillColor: "#3388ff",
      popup: "Safe Zone",
    },
  ],
};
