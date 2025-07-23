#!/usr/bin/env python3
"""
Simple map image optimizer for PetrRun
Reduces file size while maintaining visual quality for web use
"""

from PIL import Image
import os
import sys

def optimize_map_image(input_path="public/UCI_map.png", output_path=None):
    """
    Optimize the map image for web use
    """
    if output_path is None:
        name, ext = os.path.splitext(input_path)
        output_path = f"{name}_optimized{ext}"
    
    if not os.path.exists(input_path):
        print(f"❌ Image not found: {input_path}")
        return False
    
    print(f"🔍 Processing: {input_path}")
    
    try:
        # Open and analyze the image
        with Image.open(input_path) as img:
            original_size = os.path.getsize(input_path)
            print(f"📏 Original size: {img.size} ({original_size / 1024 / 1024:.1f} MB)")
            
            # Convert to RGB if necessary (removes alpha channel)
            if img.mode in ('RGBA', 'LA'):
                # Create white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'RGBA':
                    background.paste(img, mask=img.split()[-1])  # Use alpha as mask
                else:
                    background.paste(img)
                img = background
                print("🔄 Converted RGBA to RGB with white background")
            elif img.mode != 'RGB':
                img = img.convert('RGB')
                print(f"🔄 Converted {img.mode} to RGB")
            
            # Resize if too large (optional - uncomment if needed)
            # max_dimension = 2000
            # if max(img.size) > max_dimension:
            #     ratio = max_dimension / max(img.size)
            #     new_size = tuple(int(dim * ratio) for dim in img.size)
            #     img = img.resize(new_size, Image.Resampling.LANCZOS)
            #     print(f"📏 Resized to: {img.size}")
            
            # Save with optimized settings
            save_kwargs = {
                'format': 'JPEG',  # JPEG is much smaller than PNG for photos
                'quality': 85,     # Good balance of quality vs size
                'optimize': True,  # Enable optimization
                'progressive': True,  # Progressive JPEG loads faster
            }
            
            # If you want to keep PNG format (larger but lossless):
            # save_kwargs = {
            #     'format': 'PNG',
            #     'optimize': True,
            #     'compress_level': 9
            # }
            
            img.save(output_path, **save_kwargs)
            
            # Report results
            optimized_size = os.path.getsize(output_path)
            compression_ratio = (1 - optimized_size / original_size) * 100
            
            print(f"✅ Optimized image saved: {output_path}")
            print(f"📉 Size reduction: {original_size / 1024 / 1024:.1f} MB → {optimized_size / 1024 / 1024:.1f} MB")
            print(f"📊 Compression: {compression_ratio:.1f}% smaller")
            
            return True
            
    except Exception as e:
        print(f"❌ Error processing image: {e}")
        return False

def main():
    """Main function with command line support"""
    if len(sys.argv) > 1:
        input_path = sys.argv[1]
        output_path = sys.argv[2] if len(sys.argv) > 2 else None
    else:
        input_path = "public/UCI_map.png"
        output_path = "public/UCI_map_optimized.jpg"
    
    print("🗺️ PetrRun Map Image Optimizer")
    print("=" * 40)
    
    if optimize_map_image(input_path, output_path):
        print("\n✅ Optimization complete!")
        print("\n💡 Next steps:")
        print("1. Test the optimized image in your game")
        print("2. If quality is good, replace the original")
        print("3. Update the image path in your code if needed")
        
        if output_path.endswith('.jpg'):
            print("\n⚠️  Note: Image was converted to JPEG")
            print("   Update your code to use the new file extension")
    else:
        print("\n❌ Optimization failed!")

if __name__ == "__main__":
    main() 