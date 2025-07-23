# PetrRun - Project Memory & Documentation

## 🎯 Project Overview

**PetrRun** is an interactive location-based game built for the 2025 Summer GitHub/UCI Hackathon. The game combines campus exploration with gamified elements, featuring UCI's beloved mascot Petr the Anteater in various themed adventures.

### Core Concept
- **Interactive Campus Explorer**: Players navigate through UC Irvine's campus on a custom high-resolution map
- **Location-Based Challenges**: Find specific campus locations using visual clues and navigation
- **Sticker Collection System**: Interactive "peelable" stickers with physics-based animations
- **Multiple Game Modes**: From casual exploration to timed location-finding challenges

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 7.0.4 with Hot Module Replacement
- **Styling**: Tailwind CSS 4.1.11 with custom animations
- **3D Graphics**: Three.js (0.178.0) with React Three Fiber
- **Maps**: Custom static image-based map system + Leaflet integration
- **Animations**: GSAP 3.13.0 with Draggable plugin
- **Routing**: React Router 7.7.0

### Backend/Tools Stack
- **Python**: 3.12+ with NumPy, Pillow, and Requests
- **Image Processing**: Custom scripts for map tile downloading and optimization
- **Asset Management**: Static file serving through Vite

---

## 📁 Project Structure

```
PetrRun/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── GameMap.tsx      # Static image-based game map with WASD controls & zoom
│   │   ├── ZoomSlider.tsx   # Interactive zoom control component
│   │   ├── ImagePreloader.tsx # Image loading component with progress
│   │   ├── Map.tsx          # Leaflet-based interactive map
│   │   ├── AdvancedMap.tsx  # Enhanced Leaflet map with game elements
│   │   ├── StickerPeel.tsx  # Physics-based peelable stickers
│   │   └── GameBoy.tsx      # (Empty - future Game Boy aesthetic component)
│   ├── pages/
│   │   └── Game.tsx         # Main location-finding game
│   ├── hooks/
│   │   └── useImageDimensions.ts # Hook for dynamic image dimension detection
│   ├── utils/
│   │   ├── constants.ts     # Game configuration and location data
│   │   ├── types.ts         # TypeScript type definitions
│   │   └── imageOptimizer.ts # Image loading and caching utilities
│   ├── App.tsx              # Landing page with sticker showcase
│   ├── main.tsx             # Application entry point with routing
│   ├── index.css            # Global styles and animations
│   └── Game.tsx             # (Empty - legacy file)
├── public/
│   ├── Locations/           # 6 campus location reference photos
│   ├── stickers/            # 3 Petr-themed sticker images
│   └── UCI_map.png          # High-resolution campus map (2000x1600px)
├── Python Scripts/
│   ├── UCIMAPSCRIPT.py      # Map tile downloader from UCI's mapping service
│   ├── imageReducer.py      # Advanced image compression and whitespace removal
│   └── main.py              # Simple entry point
└── Configuration Files      # Standard web project setup
```

---

## 🎮 Game Components & Features

### 1. Landing Page (`App.tsx`)
- **Interactive Sticker Showcase**: 4 draggable, physics-based stickers
- **Navigation Hub**: Links to main game and demo mode
- **Visual Design**: Clean, centered layout with scattered interactive elements

### 2. Main Game (`pages/Game.tsx`)
- **Game Flow**: Start → Countdown → Playing → Victory → Results
- **Location Challenge System**: 
  - Random dropsite selection from 6 predefined locations
  - Visual clues with difficulty ratings (easy/medium/hard)
  - Pixel-perfect collision detection (100px radius)
- **Timer System**: Real-time performance tracking
- **WASD Movement**: Smooth player character movement with map following

### 3. Demo Mode (`pages/GameDemo.tsx`)
- **Interactive Dashboard**: Real-time player stats and game log
- **Multiple Game Elements**: 
  - Checkpoints (health restoration)
  - Treasures (score points)
  - Enemies (health damage)
  - Obstacles (minor damage)
- **Visual Settings**: Dark mode, 2.5D effects, game styling toggles
- **Game Mechanics**: Inventory system, health management, scoring

### 4. Map Systems

#### Static Game Map (`components/GameMap.tsx`)
- **Dynamic Image Handling**: Automatically detects actual image dimensions to prevent stretching
- **Aspect Ratio Preservation**: Maintains proper proportions regardless of source image size
- **Interactive Zoom System**: 
  - Zoom slider with visual feedback (0.5x - 4x range)
  - Mouse wheel zoom support
  - Keyboard shortcuts (+/- for zoom, 0 for reset)
  - Zoom level persistence via localStorage
- **Camera System**: Dynamic following with zoom and translation
- **WASD Controls**: Responsive keyboard movement with bounds checking
- **Click Interaction**: Position selection with coordinate transformation
- **Player Visualization**: Trombone Petr character with animations
- **Loading States**: Shows preparation screen while detecting image dimensions

#### Leaflet Integration (`components/Map.tsx` & `AdvancedMap.tsx`)
- **Interactive Elements**: Markers, popups, circles, polylines
- **Custom Styling**: Game-themed marker designs
- **Event Handling**: Click events and marker interactions
- **Multiple Marker Types**: Player, checkpoint, treasure, enemy, obstacle

### 5. Zoom Control System (`components/ZoomSlider.tsx`)
- **Interactive Slider**: Visual zoom control with progress indicator
- **Multiple Input Methods**:
  - Slider drag and click
  - Mouse wheel scrolling
  - Keyboard shortcuts (+/- for zoom, 0 for reset)
  - Dedicated zoom in/out buttons
- **Smart Features**:
  - Zoom level persistence via localStorage
  - Real-time zoom level display with descriptive labels (Far/Normal/Close/Very Close)
  - Reset to default functionality
  - Range: 0.5x to 4x zoom
- **Visual Feedback**: Custom styled slider with hover effects and smooth transitions

### 6. Sticker System (`components/StickerPeel.tsx`)
- **Physics Simulation**: GSAP-powered drag and drop
- **Visual Effects**: 
  - Dynamic lighting with SVG filters
  - Shadow and highlight effects
  - Peeling animations with CSS transforms
- **Touch Support**: Mobile-optimized interactions
- **Customization**: Rotation, positioning, lighting intensity

---

## 🗺️ Game World & Assets

### Campus Locations (Dropsites)
The game features 6 carefully selected UCI campus locations:

1. **Space Exploration Center** (Medium)
   - Coordinates: [800, 600]
   - Theme: Space Explorer Petr
   
2. **The Purple Monument** (Hard)
   - Coordinates: [1200, 400] 
   - Theme: Thanos Petr
   
3. **Trombone Performance Stage** (Easy)
   - Coordinates: [600, 1000]
   - Theme: Musical Petr
   
4. **Central Park Gazebo** (Medium)
   - Coordinates: [1000, 800]
   - Description: Heart of campus
   
5. **The Engineering Spire** (Hard)
   - Coordinates: [1400, 300]
   - Description: Tallest campus structure
   
6. **Student Hub Commons** (Easy)
   - Coordinates: [700, 1200]
   - Description: Student gathering place

### Visual Assets
- **Reference Photos**: 6 high-quality location images in `/public/Locations/`
- **Character Stickers**: 3 themed Petr variants in `/public/stickers/`
- **Campus Map**: Ultra high-resolution (2000x1600) map in `/public/UCI_map.png`

---

## 🛠️ Python Utilities

### Map Generation (`UCIMAPSCRIPT.py`)
- **Tile System**: Downloads map tiles from UCI's Concept3D service
- **Concurrent Processing**: Multi-threaded tile downloading
- **Custom Coordinates**: Zoom level 18 optimization for game performance
- **Quality Control**: High-resolution tile merging and optimization

### Image Processing (`imageReducer.py`)
- **Whitespace Removal**: Intelligent content detection and cropping
- **Compression**: Advanced quality vs size optimization
- **Batch Processing**: Multi-threaded image optimization
- **Format Conversion**: PNG to JPEG with transparency handling

### Map Optimization (`optimize_map_image.py`)
- **Web Optimization**: Reduces large map files for web deployment
- **Quality Preservation**: Maintains visual fidelity while reducing size
- **Format Conversion**: Smart conversion between PNG/JPEG based on content
- **Batch Processing**: Handles multiple image sizes and formats

---

## 🎯 Development Configuration

### Vite Configuration
- **React Integration**: Latest React compiler with Fast Refresh
- **Path Aliases**: `@/` for clean imports
- **Tailwind Integration**: JIT compilation
- **TypeScript Support**: Full type checking

### Package Dependencies
**Core Runtime:**
- React 19.1.0 ecosystem
- Three.js for 3D capabilities
- Leaflet for map interactions
- GSAP for animations

**Development:**
- TypeScript 5.8.3
- ESLint with React hooks support
- Vite with React plugin

---

## 🚀 Getting Started

### Installation & Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Game Controls
**Movement:**
- `WASD` keys - Move player character around the map

**Zoom Control:**
- `Mouse Wheel` - Smooth zoom in/out
- `+ / =` key - Zoom in
- `- / _` key - Zoom out  
- `0` key - Reset to default zoom (2.5x)
- Zoom slider - Drag or click to adjust zoom level

**Game Interaction:**
- `Mouse Click` - Select starting position / interact with map elements

### Python Tools
```bash
# Install Python dependencies
pip install numpy pillow requests

# Generate new map tiles
python UCIMAPSCRIPT.py

# Optimize images
python imageReducer.py
```

---

## 🎯 Game Mechanics Deep Dive

### Location Finding Challenge
1. **Random Selection**: Game picks from 6 predefined campus locations
2. **Visual Clue**: Player receives reference photo and description
3. **Navigation**: Use WASD to move around the campus map
4. **Discovery**: Get within 100 pixels of target location
5. **Timing**: Performance tracked with millisecond precision

### Interactive Elements
- **Collision Detection**: Pixel-perfect distance calculations
- **Camera Following**: Dynamic viewport adjustment
- **State Management**: Phase-based game progression
- **User Feedback**: Real-time UI updates and animations

### Demo Mode Features
- **Live Statistics**: Health, score, inventory tracking
- **Interactive Markers**: Click-to-interact game objects
- **Environmental Effects**: Dynamic lighting and visual modes
- **Game Log**: Real-time event tracking and display

---

## 🔮 Future Enhancement Opportunities

### Planned Features
- **GameBoy Component**: Retro aesthetic game frame
- **Multiplayer Support**: Competitive location finding
- **Achievement System**: Campus exploration badges
- **Social Features**: Leaderboards and sharing
- **AR Integration**: Mobile camera overlay
- **Expanded Map**: Full campus coverage with indoor maps

### Technical Improvements
- **Progressive Web App**: Offline capability
- **Performance Optimization**: Texture atlasing, sprite batching
- **Mobile Optimization**: Touch-first interaction design
- **Accessibility**: Screen reader support, keyboard navigation

---

## 📋 Current Development Status

### Completed ✅
- ✅ Interactive sticker system with physics
- ✅ Static map-based navigation game
- ✅ Location challenge system with 6 campus spots
- ✅ Demo mode with game mechanics
- ✅ Custom map generation pipeline
- ✅ Image optimization tools
- ✅ Responsive design and animations

### Recently Fixed ✅
- ✅ **Large Map Loading Issue**: Implemented image preloader with loading screen
- ✅ **Removed Demo Page**: Cleaned up navigation by removing unused map demo
- ✅ **Performance Optimizations**: Added CSS optimizations and image caching utilities
- ✅ **Fixed Map Stretching**: Implemented proper aspect ratio handling with dynamic image dimensions
- ✅ **Dynamic Coordinate System**: Map now adapts to actual image dimensions instead of hardcoded values
- ✅ **Added Zoom Control**: Interactive zoom slider with mouse wheel, keyboard shortcuts, and persistence

### In Progress 🚧
- 🚧 Game balancing and difficulty tuning
- 🚧 Visual polish and UI refinements
- 🚧 Performance optimization for mobile

### Future Development 🔮
- 🔮 Multiplayer functionality
- 🔮 Expanded campus coverage
- 🔮 Achievement and progression systems
- 🔮 Mobile app deployment

---

## 🏆 Hackathon Context

This project was specifically created for the **2025 Summer GitHub/UCI Hackathon**, combining:
- **Campus Pride**: Showcasing UC Irvine's beautiful campus
- **Technical Innovation**: Advanced web technologies and game mechanics  
- **User Engagement**: Interactive, fun gameplay that connects students to their campus
- **Mascot Integration**: Creative use of Petr the Anteater in multiple themed scenarios

The project demonstrates full-stack development skills, creative problem-solving, and deep integration with campus culture and geography. 

---

## 📝 Recent Changes

### Double Loading Fix (Latest)
- **Problem**: Map image was being loaded twice - once by ImagePreloader and again by useImageDimensions hook in GameMap
- **Symptom**: Loading screen showed 100% but then "Preparing map..." appeared, causing additional delay
- **Solution**: Enhanced ImagePreloader to capture image dimensions during initial load using render prop pattern
- **Impact**: Eliminated second loading delay, map appears immediately after progress bar completes
- **Files Modified**:
  - `src/components/ImagePreloader.tsx`: Added ImageDimensions interface, modified to use render prop pattern with dimensions
  - `src/components/GameMap.tsx`: Removed useImageDimensions hook dependency, now accepts dimensions as props
  - `src/pages/Game.tsx`: Updated to use new ImagePreloader render prop pattern
- **Technical Details**: 
  - ImagePreloader now captures img.naturalWidth/naturalHeight on load
  - GameMap receives pre-calculated dimensions instead of loading image again
  - Browser cache was not sufficient due to different loading contexts

### Character Size Enhancement
- **Updated**: Petr character display size in GameMap component
- **Change**: Increased from 32px × 32px (w-8 h-8) to 64px × 64px (w-16 h-16)
- **Impact**: Makes the player character more prominent and visible during gameplay 