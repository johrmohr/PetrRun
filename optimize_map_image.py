#!/usr/bin/env python3
"""
PNG Image Reducer Script for PetrRun
Reduces PNG file size while maintaining PNG format and quality
Supports multiple optimization strategies for maximum compression
"""

from PIL import Image, ImageOps
import os
import sys

# Increase PIL's image size limits for large maps
Image.MAX_IMAGE_PIXELS = None  # Remove the limit entirely

def optimize_png_image(input_path="public/UCI_map.png", output_path=None, strategy="balanced", target_mb=None):
    """
    Optimize the PNG image for web use while maintaining PNG format
    
    Args:
        input_path: Path to input PNG image
        output_path: Path for optimized output (auto-generated if None)
        strategy: Optimization strategy ('aggressive', 'balanced', 'conservative', 'targeted')
        target_mb: Target file size in MB (only used with 'targeted' strategy)
    """
    if output_path is None:
        name, ext = os.path.splitext(input_path)
        if strategy == "targeted" and target_mb:
            output_path = f"{name}_under{target_mb}mb{ext}"
        else:
            output_path = f"{name}_optimized{ext}"
    
    if not os.path.exists(input_path):
        print(f"❌ Image not found: {input_path}")
        return False
    
    print(f"🔍 Processing: {input_path}")
    print(f"🎯 Strategy: {strategy}")
    if strategy == "targeted" and target_mb:
        print(f"🎯 Target size: Under {target_mb} MB")
    
    try:
        # Open and analyze the image
        print("📖 Loading image... (this may take a moment for large files)")
        with Image.open(input_path) as img:
            original_size = os.path.getsize(input_path)
            print(f"📏 Original size: {img.size} ({original_size / 1024 / 1024:.1f} MB)")
            print(f"🎨 Original mode: {img.mode}")
            
            # Check if image is extremely large
            total_pixels = img.size[0] * img.size[1]
            if total_pixels > 50_000_000:  # 50 million pixels
                print(f"⚠️ Very large image detected ({total_pixels:,} pixels)")
                if strategy != "targeted":
                    print("  Applying additional size reduction for web optimization")
            
            # Apply optimization strategy
            if strategy == "aggressive":
                optimized_img = apply_aggressive_optimization(img)
            elif strategy == "conservative":  
                optimized_img = apply_conservative_optimization(img)
            elif strategy == "targeted":
                optimized_img = apply_targeted_optimization(img, target_mb or 30)
            else:  # balanced (default)
                optimized_img = apply_balanced_optimization(img)
            
            # PNG optimization settings based on strategy
            save_kwargs = get_png_save_settings(strategy)
            
            # Save the optimized image
            print("💾 Saving optimized image...")
            optimized_img.save(output_path, **save_kwargs)
            
            # Report results
            optimized_size = os.path.getsize(output_path)
            compression_ratio = (1 - optimized_size / original_size) * 100
            
            print(f"✅ Optimized PNG saved: {output_path}")
            print(f"📉 Size reduction: {original_size / 1024 / 1024:.1f} MB → {optimized_size / 1024 / 1024:.1f} MB")
            print(f"📊 Compression: {compression_ratio:.1f}% smaller")
            
            # Check if we met the target
            if strategy == "targeted" and target_mb:
                if optimized_size / 1024 / 1024 <= target_mb:
                    print(f"🎯 ✅ Target achieved! File is under {target_mb} MB")
                else:
                    print(f"🎯 ⚠️ Target missed. File is {optimized_size / 1024 / 1024:.1f} MB (target: {target_mb} MB)")
                    print("    Try 'aggressive' strategy for smaller size")
            
            return True
            
    except Exception as e:
        print(f"❌ Error processing image: {e}")
        return False

def apply_aggressive_optimization(img):
    """
    Aggressive optimization - maximum compression, some quality loss acceptable
    """
    print("🔥 Applying aggressive optimization:")
    
    # For very large images, resize more aggressively
    total_pixels = img.size[0] * img.size[1]
    if total_pixels > 50_000_000:  # 50+ million pixels
        max_dimension = 1500  # More aggressive for very large images
        print(f"  • Very large image detected, using max dimension: {max_dimension}px")
    else:
        max_dimension = 1800  # Slightly reduce from original 2000px
    
    # Resize if too large
    if max(img.size) > max_dimension:
        ratio = max_dimension / max(img.size)
        new_size = tuple(int(dim * ratio) for dim in img.size)
        print(f"  • Resizing from {img.size} to {new_size}")
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    # Convert RGBA to RGB with white background (removes alpha channel)
    if img.mode in ('RGBA', 'LA'):
        print("  • Removing alpha channel (white background)")
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'RGBA':
            background.paste(img, mask=img.split()[-1])
        else:
            background.paste(img)
        img = background
    elif img.mode != 'RGB':
        print(f"  • Converting {img.mode} to RGB")
        img = img.convert('RGB')
    
    # Reduce colors using quantization
    print("  • Reducing color palette to 256 colors")
    img = img.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
    img = img.convert('RGB')
    
    return img

def apply_balanced_optimization(img):
    """
    Balanced optimization - good compression with maintained quality
    """
    print("⚖️ Applying balanced optimization:")
    
    # For very large images, apply some resizing
    total_pixels = img.size[0] * img.size[1]
    if total_pixels > 50_000_000:  # 50+ million pixels
        max_dimension = 1800  # Reasonable size for web use
        print(f"  • Large image detected, using max dimension: {max_dimension}px")
    else:
        max_dimension = 2000  # Keep original size for smaller images
    
    # Resize if necessary
    if max(img.size) > max_dimension:
        ratio = max_dimension / max(img.size)
        new_size = tuple(int(dim * ratio) for dim in img.size)
        print(f"  • Resizing from {img.size} to {new_size}")
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    # Handle alpha channel more carefully
    if img.mode in ('RGBA', 'LA'):
        print("  • Converting RGBA to RGB with smart background")
        # Use the most common edge color as background instead of pure white
        background_color = get_dominant_edge_color(img)
        background = Image.new('RGB', img.size, background_color)
        if img.mode == 'RGBA':
            background.paste(img, mask=img.split()[-1])
        else:
            background.paste(img)
        img = background
    elif img.mode != 'RGB':
        print(f"  • Converting {img.mode} to RGB")
        img = img.convert('RGB')
    
    return img

def apply_conservative_optimization(img):
    """
    Conservative optimization - minimal compression, maximum quality preservation
    """
    print("🛡️ Applying conservative optimization:")
    
    # Even conservative mode should handle extremely large images
    total_pixels = img.size[0] * img.size[1]
    if total_pixels > 100_000_000:  # 100+ million pixels - must resize
        max_dimension = 2000
        print(f"  • Image too large for web use, resizing to max {max_dimension}px")
        if max(img.size) > max_dimension:
            ratio = max_dimension / max(img.size)
            new_size = tuple(int(dim * ratio) for dim in img.size)
            print(f"  • Resizing from {img.size} to {new_size}")
            img = img.resize(new_size, Image.Resampling.LANCZOS)
    else:
        print("  • Preserving original dimensions")
    
    # Only convert if absolutely necessary
    if img.mode == 'LA':
        print("  • Converting LA to RGB")
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img)
        img = background
    elif img.mode not in ('RGB', 'RGBA'):
        print(f"  • Converting {img.mode} to RGB")
        img = img.convert('RGB')
    
    return img

def apply_targeted_optimization(img, target_mb):
    """
    Targeted optimization - aims for specific file size while preserving quality
    """
    print(f"🎯 Applying targeted optimization (under {target_mb} MB):")
    
    original_pixels = img.size[0] * img.size[1]
    
    # Calculate target dimensions based on compression ratio needed
    # More conservative approach to get closer to target size
    if target_mb <= 10:
        max_dimension = 2500  # Aggressive for very small targets
        print(f"  • Using aggressive compression, max dimension: {max_dimension}px")
    elif target_mb <= 30:
        # For 30MB target from ~112MB original, be less aggressive
        max_dimension = 5000  # Much larger to preserve more quality
        print(f"  • Using light compression, max dimension: {max_dimension}px")
    elif target_mb <= 50:
        # For 50MB target, minimal compression needed
        max_dimension = 6500
        print(f"  • Using minimal compression, max dimension: {max_dimension}px")
    else:
        max_dimension = max(img.size)  # Keep original size
        print("  • Keeping original dimensions")
    
    # Resize only if necessary
    if max(img.size) > max_dimension:
        ratio = max_dimension / max(img.size)
        new_size = tuple(int(dim * ratio) for dim in img.size)
        print(f"  • Resizing from {img.size} to {new_size}")
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    else:
        print(f"  • Keeping original size: {img.size}")
    
    # Handle alpha channel more carefully - keep quality high
    if img.mode in ('RGBA', 'LA'):
        print("  • Converting RGBA to RGB (preserving quality)")
        # Use smart background detection for better quality
        background_color = get_dominant_edge_color(img)
        background = Image.new('RGB', img.size, background_color)
        if img.mode == 'RGBA':
            background.paste(img, mask=img.split()[-1])
        else:
            background.paste(img)
        img = background
    elif img.mode != 'RGB':
        print(f"  • Converting {img.mode} to RGB")
        img = img.convert('RGB')
    
    # No color quantization for targeted optimization - preserve full color depth
    print("  • Preserving full color depth")
    
    return img

def get_dominant_edge_color(img):
    """
    Extract the most common color from image edges to use as background
    """
    try:
        # Sample pixels from edges
        width, height = img.size
        edge_pixels = []
        
        # Sample fewer pixels for very large images to avoid performance issues
        step_x = max(1, width // 50)  # Sample every Nth pixel
        step_y = max(1, height // 50)
        
        # Top and bottom edges
        for x in range(0, width, step_x):
            if img.mode == 'RGBA':
                edge_pixels.extend([img.getpixel((x, 0))[:3], img.getpixel((x, height-1))[:3]])
            else:
                edge_pixels.extend([img.getpixel((x, 0)), img.getpixel((x, height-1))])
        
        # Left and right edges  
        for y in range(0, height, step_y):
            if img.mode == 'RGBA':
                edge_pixels.extend([img.getpixel((0, y))[:3], img.getpixel((width-1, y))[:3]])
            else:
                edge_pixels.extend([img.getpixel((0, y)), img.getpixel((width-1, y))])
        
        # Find most common color
        from collections import Counter
        most_common = Counter(edge_pixels).most_common(1)
        if most_common:
            return most_common[0][0]
    except:
        pass
    
    return (255, 255, 255)  # Default to white

def get_png_save_settings(strategy):
    """
    Get PNG save settings based on optimization strategy
    """
    if strategy == "aggressive":
        return {
            'format': 'PNG',
            'optimize': True,
            'compress_level': 9,  # Maximum compression
        }
    elif strategy == "conservative":
        return {
            'format': 'PNG', 
            'optimize': True,
            'compress_level': 6,  # Moderate compression
        }
    elif strategy == "targeted":
        return {
            'format': 'PNG',
            'optimize': True,
            'compress_level': 9,  # High compression but preserve quality
        }
    else:  # balanced
        return {
            'format': 'PNG',
            'optimize': True,
            'compress_level': 9,  # High compression
        }

def main():
    """Main function with command line support"""
    # Parse command line arguments
    input_path = "public/UCI_map.png"
    output_path = None
    strategy = "balanced"
    target_mb = None
    
    if len(sys.argv) > 1:
        input_path = sys.argv[1]
    if len(sys.argv) > 2:
        output_path = sys.argv[2]
    if len(sys.argv) > 3:
        strategy = sys.argv[3].lower()
        if strategy not in ["aggressive", "balanced", "conservative", "targeted"]:
            print("⚠️ Invalid strategy. Using 'balanced' instead.")
            strategy = "balanced"
    if len(sys.argv) > 4:
        try:
            target_mb = int(sys.argv[4])
        except ValueError:
            print("⚠️ Invalid target MB value. Using default (30MB) instead.")
            target_mb = 30
    
    if output_path is None:
        name, ext = os.path.splitext(input_path)
        if strategy == "targeted" and target_mb:
            output_path = f"{name}_under{target_mb}mb{ext}"
        else:
            output_path = f"{name}_optimized{ext}"
    
    print("🗺️ PetrRun PNG Image Reducer")
    print("=" * 50)
    print(f"📁 Input: {input_path}")
    print(f"💾 Output: {output_path}")
    print(f"🎯 Strategy: {strategy}")
    if strategy == "targeted" and target_mb:
        print(f"🎯 Target size: Under {target_mb} MB")
    print()
    
    # Show strategy descriptions
    strategies = {
        "aggressive": "Maximum compression, some quality loss (best file size)",
        "balanced": "Good compression with maintained quality (recommended)", 
        "conservative": "Minimal compression, maximum quality (largest file size)",
        "targeted": "Aims for specific file size while preserving quality"
    }
    print(f"ℹ️ {strategy.title()}: {strategies[strategy]}")
    print()
    
    if optimize_png_image(input_path, output_path, strategy, target_mb):
        print("\n✅ PNG optimization complete!")
        print("\n💡 Next steps:")
        print("1. Test the optimized image in your game")
        print("2. If quality is good, replace the original file")
        print("3. If file is still too large, try 'aggressive' strategy")
        print("\n🔧 Usage tips:")
        print("• python optimize_map_image.py [input] [output] [strategy] [target_mb]")
        print("• Strategies: aggressive, balanced, conservative, targeted")
        print("• Example: python optimize_map_image.py public/UCI_map.png public/UCI_map_small.png aggressive 30")
    else:
        print("\n❌ Optimization failed!")
        sys.exit(1)

if __name__ == "__main__":
    main() 