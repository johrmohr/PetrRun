export const stickerUrls = [
  "/stickers/Space-Explorr-Petr.png",
  "/stickers/Thanos.png",
  "/stickers/Trombone_petr.png",
  "/stickers/Trombone_petr.png",
];

// Available drop sites for random selection (pixel coordinates [x, y])
export const DROPSITES = [
  {
    id: "space-explorr",
    name: "Space Exploration Center",
    photo: "/stickers/Space-Explorr-Petr.png",
    location: [2000, 1319] as [number, number], // Scaled from [800, 600] for 5000x3517 map
    difficulty: "medium",
    description: "The iconic space exploration center where Petr dreams of the stars"
  },
  {
    id: "thanos-statue",
    name: "The Purple Monument", 
    photo: "/stickers/Thanos.png",
    location: [3000, 879] as [number, number], // Scaled from [1200, 400] for 5000x3517 map
    difficulty: "hard",
    description: "A mysterious purple structure that appeared overnight"
  },
  {
    id: "music-pavilion",
    name: "Trombone Performance Stage",
    photo: "/stickers/Trombone_petr.png", 
    location: [1500, 2198] as [number, number], // Scaled from [600, 1000] for 5000x3517 map
    difficulty: "easy",
    description: "Where Petr practices his musical talents"
  },
  {
    id: "aldrich-park",
    name: "Central Park Gazebo",
    photo: "/stickers/Space-Explorr-Petr.png", // Reusing for now
    location: [2500, 1758] as [number, number], // Scaled from [1000, 800] for 5000x3517 map
    difficulty: "medium",
    description: "The heart of campus where students gather"
  },
  {
    id: "engineering-tower",
    name: "The Engineering Spire", 
    photo: "/stickers/Thanos.png", // Reusing for now
    location: [3500, 659] as [number, number], // Scaled from [1400, 300] for 5000x3517 map
    difficulty: "hard", 
    description: "The tallest structure visible from across campus"
  },
  {
    id: "student-center",
    name: "Student Hub Commons",
    photo: "/stickers/Trombone_petr.png", // Reusing for now
    location: [1750, 2638] as [number, number], // Scaled from [700, 1200] for 5000x3517 map
    difficulty: "easy",
    description: "Where Petrs fuel up between classes"
  }
] as const;

export const DROP_RADIUS = 100; // Increased for larger map (was 50)

// Game constants and configuration
export const GAME_CONFIG = {
  MAP: {
    DEFAULT_CENTER: [2500, 1758] as [number, number], // Mathematical center of 5000x3517 campus map
    DEFAULT_ZOOM: 18, // Not used for static image, kept for compatibility
    MIN_ZOOM: 15,
    MAX_ZOOM: 20,
    GAME_BOUNDS: undefined, // No bounds for static image
  },
  PLAYER: {
    SPEED: 300, // pixels per second (increased for larger map)
    SIZE: 24,
    MOVE_DISTANCE: 25, // Movement distance in pixels for WASD (increased for larger map)
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
