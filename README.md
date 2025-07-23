# PetrRun
2025 Summer GitHub/UCI Hackathon - Interactive Campus Location Game

## 🎮 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Optimize Map Image (if needed)**
   ```bash
   python optimize_map_image.py
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Game**
   Navigate to `http://localhost:3000` and click "🎮 Start Game"

## 🚀 Recent Improvements

- ✅ **Fixed Loading Issues**: Added image preloader with progress bar
- ✅ **Streamlined Navigation**: Removed unnecessary demo page  
- ✅ **Fixed Map Stretching**: Dynamic aspect ratio handling prevents distortion
- ✅ **Added Interactive Zoom**: Slider, mouse wheel, and keyboard shortcuts
- ✅ **Performance Optimized**: CSS animations and image caching
- ✅ **Better UX**: Loading screen with Petr animations

## 📋 For Full Documentation

See `project-memory.md` for comprehensive project documentation.

## 🛠️ Image Optimization

If your map image is too large (~100MB+), run:
```bash
python optimize_map_image.py public/UCI_map.png public/UCI_map_optimized.jpg
```

This will create a web-optimized version that's much smaller while maintaining visual quality.
