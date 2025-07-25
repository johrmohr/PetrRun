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
    photo: "/Locations/Bio_Sci_Garden.png",
    location: [2000, 819] as [number, number], // Scaled from [800, 600] for 5000x3517 map
    difficulty: "medium",
    description:
      "The iconic space exploration center where Petr dreams of the stars",
  },
  {
    id: "thanos-statue",
    name: "Social Science Plaza",
    photo: "/Locations/Social_Science_Plaza.png",
    location: [2825, 1225] as [number, number], // Scaled from [1200, 400] for 5000x3517 map
    difficulty: "hard",
    description: "A mysterious purple structure that appeared overnight",
  },
  {
    id: "music-pavilion",
    name: "Trombone Performance Stage",
    photo: "/Locations/Humanities_Bridge.png",
    location: [1500, 2198] as [number, number], // Scaled from [600, 1000] for 5000x3517 map
    difficulty: "easy",
    description: "Where Petr practices his musical talents",
  },
  {
    id: "aldrich-park",
    name: "University Club",
    photo: "/Locations/University_Club.png",
    location: [2438, 1709] as [number, number], // Scaled from [1000, 800] for 5000x3517 map
    difficulty: "medium",
    description: "The heart of campus where students gather",
  },
  {
    id: "engineering-tower",
    name: "Back of Science Library",
    photo: "/Locations/Back_of_Sci_Lib.png",
    location: [1856, 1358] as [number, number], // Scaled from [1400, 300] for 5000x3517 map
    difficulty: "hard",
    description: "The tallest structure visible from across campus",
  },
  {
    id: "student-center",
    name: "Student Center",
    photo: "/Locations/Student_Center_Tables.png",
    location: [2466, 953] as [number, number], // Scaled from [700, 1200] for 5000x3517 map
    difficulty: "easy",
    description: "Where Petrs fuel up between classes",
  },
] as const;

export const DROP_RADIUS = 30; // Increased for larger map (was 50)

// Game constants and configuration
export const GAME_CONFIG = {
  MAP: {
    DEFAULT_CENTER: [2400, 1300] as [number, number], // Mathematical center of 5000x3517 campus map
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
