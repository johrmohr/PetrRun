export const stickerUrls = [
  "/stickers/Space-Explorr-Petr.png",
  "/stickers/Thanos.png",
  "/stickers/Trombone_petr.png",
  "/stickers/Trombone_petr.png",
];

// Available drop sites for random selection (pixel coordinates [x, y])
export const DROPSITES = [
  {
    id: "university-club",
    name: "University Club",
    photo: "/Locations/University_Club.png",
    location: [100, 100] as [number, number], // Placeholder coordinates
    difficulty: "medium",
    description: "A popular spot for faculty and staff gatherings, known for its elegant setting."
  },
  {
    id: "student-center-tables",
    name: "Student Center Tables",
    photo: "/Locations/Student_Center_Tables.png",
    location: [200, 200] as [number, number], // Placeholder coordinates
    difficulty: "easy",
    description: "The bustling heart of campus where students meet, eat, and study together."
  },
  {
    id: "social-science-plaza",
    name: "Social Science Plaza",
    photo: "/Locations/Social_Science_Plaza.png",
    location: [300, 300] as [number, number], // Placeholder coordinates
    difficulty: "medium",
    description: "A scenic plaza surrounded by academic buildings and lively student activity."
  },
  {
    id: "humanities-bridge",
    name: "Humanities Bridge",
    photo: "/Locations/Humanities_Bridge.png",
    location: [400, 400] as [number, number], // Placeholder coordinates
    difficulty: "hard",
    description: "An iconic bridge connecting the humanities buildings, offering great views."
  },
  {
    id: "bio-sci-garden",
    name: "Biological Sciences Garden",
    photo: "/Locations/Bio_Sci_Garden.png",
    location: [500, 500] as [number, number], // Placeholder coordinates
    difficulty: "medium",
    description: "A lush garden area perfect for quiet study and enjoying nature."
  },
  {
    id: "back-of-sci-lib",
    name: "Back of Science Library",
    photo: "/Locations/Back_of_Sci_Lib.png",
    location: [600, 600] as [number, number], // Placeholder coordinates
    difficulty: "hard",
    description: "A hidden spot behind the Science Library, favored by those seeking solitude."
  }
] as const;

export const DROP_RADIUS = 50; // pixels, adjust as needed

// Game constants and configuration
export const GAME_CONFIG = {
  MAP: {
    DEFAULT_CENTER: [500, 400] as [number, number], // Center of image (assuming ~1000x800 image)
    DEFAULT_ZOOM: 18, // Not used for static image, kept for compatibility
    MIN_ZOOM: 15,
    MAX_ZOOM: 20,
    GAME_BOUNDS: undefined, // No bounds for static image
  },
  PLAYER: {
    SPEED: 100, // pixels per second
    SIZE: 24,
    MOVE_DISTANCE: 10, // Movement distance in pixels for WASD
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

// List of location images for random selection
export const LOCATION_IMAGES = [
  "/Locations/University_Club.png",
  "/Locations/Student_Center_Tables.png",
  "/Locations/Social_Science_Plaza.png",
  "/Locations/Humanities_Bridge.png",
  "/Locations/Bio_Sci_Garden.png",
  "/Locations/Back_of_Sci_Lib.png",
];

// Function to select a random location image
export function selectRandomLocationImage() {
  const idx = Math.floor(Math.random() * LOCATION_IMAGES.length);
  return LOCATION_IMAGES[idx];
}
