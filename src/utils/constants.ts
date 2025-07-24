// Available drop sites for random selection (pixel coordinates [x, y])
export const DROPSITES = [
  {
    id: "space-explorr",
    name: "Space Exploration Center",
    photo: "/stickers/Space-Explorr-Petr.png",
    location: [800, 600] as [number, number], // Updated for 2000x1600 map
    difficulty: "medium",
    description:
      "The iconic space exploration center where Petr dreams of the stars",
  },
  {
    id: "thanos-statue",
    name: "The Purple Monument",
    photo: "/stickers/Thanos.png",
    location: [1200, 400] as [number, number], // Updated for 2000x1600 map
    difficulty: "hard",
    description: "A mysterious purple structure that appeared overnight",
  },
  {
    id: "music-pavilion",
    name: "Trombone Performance Stage",
    photo: "/stickers/Trombone_petr.png",
    location: [600, 1000] as [number, number], // Updated for 2000x1600 map
    difficulty: "easy",
    description: "Where Petr practices his musical talents",
  },
  {
    id: "aldrich-park",
    name: "Central Park Gazebo",
    photo: "/stickers/Space-Explorr-Petr.png", // Reusing for now
    location: [1000, 800] as [number, number], // Updated for 2000x1600 map
    difficulty: "medium",
    description: "The heart of campus where students gather",
  },
  {
    id: "engineering-tower",
    name: "The Engineering Spire",
    photo: "/stickers/Thanos.png", // Reusing for now
    location: [1400, 300] as [number, number], // Updated for 2000x1600 map
    difficulty: "hard",
    description: "The tallest structure visible from across campus",
  },
  {
    id: "student-center",
    name: "Student Hub Commons",
    photo: "/stickers/Trombone_petr.png", // Reusing for now
    location: [700, 1200] as [number, number], // Updated for 2000x1600 map
    difficulty: "easy",
    description: "Where Petrs fuel up between classes",
  },
] as const;

export const DROP_RADIUS = 150; // Pixel radius for drop zones (increased for 2000x1600 map)

// Game constants and configuration - All coordinates in pixels [x, y]
export const GAME_CONFIG = {
  MAP: {
    DEFAULT_CENTER: [1000, 800] as [number, number], // Center of 2000x1600 map
    DEFAULT_ZOOM: 1.5, // Default zoom level for InteractiveMap
    MAP_DIMENSIONS: { width: 2000, height: 1600 }, // Actual UCI map dimensions
  },
} as const;

// Sample game world data - All coordinates converted to pixels [x, y]
export const SAMPLE_GAME_DATA = {
  CHECKPOINTS: [
    {
      position: [800, 400] as [number, number],
      popup: "Checkpoint 1: Aldrich Park",
      color: "#00ff00",
    },
    {
      position: [1200, 600] as [number, number],
      popup: "Checkpoint 2: Student Center",
      color: "#00ff00",
    },
    {
      position: [600, 1000] as [number, number],
      popup: "Checkpoint 3: Engineering Building",
      color: "#00ff00",
    },
  ],
  TREASURES: [
    {
      position: [1400, 300] as [number, number],
      popup: "💎 Rare Crystal",
      color: "#ffd700",
    },
    {
      position: [700, 1200] as [number, number],
      popup: "🏆 Golden Anteater",
      color: "#ffd700",
    },
    {
      position: [1600, 800] as [number, number],
      popup: "💰 UCI Treasure",
      color: "#ffd700",
    },
  ],
  ENEMIES: [
    {
      position: [900, 700] as [number, number],
      popup: "👾 Campus Security",
      color: "#ff4444",
    },
    {
      position: [1100, 500] as [number, number],
      popup: "🤖 Study Bot",
      color: "#ff4444",
    },
  ],
  OBSTACLES: [
    {
      position: [1000, 600] as [number, number],
      popup: "🚧 Construction Zone",
      color: "#ffaa00",
    },
    {
      position: [800, 900] as [number, number],
      popup: "⚠️ Wet Paint Area",
      color: "#ffaa00",
    },
  ],
  PATHS: [
    {
      positions: [
        [600, 800] as [number, number],
        [800, 600] as [number, number],
        [1000, 400] as [number, number],
        [1200, 600] as [number, number],
      ],
      color: "#00ff00",
      weight: 4,
    },
  ],
  AREAS: [
    {
      center: [1000, 800] as [number, number],
      radius: 150,
      color: "#3388ff",
      fillColor: "#3388ff",
      popup: "Safe Zone - Aldrich Park",
    },
  ],
};
