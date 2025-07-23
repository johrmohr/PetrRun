from PIL import Image
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import os
from typing import Tuple, Optional
import time


def find_content_bounds_parallel(
    img_array: np.ndarray, num_threads: int = 4
) -> Optional[Tuple[int, int, int, int]]:
    """Find bounding box of non-white/non-transparent content using parallel processing"""
    height, width = img_array.shape[:2]

    # Handle different image modes efficiently with better white detection
    if img_array.shape[2] == 4:  # RGBA
        alpha_channel = img_array[:, :, 3]
        rgb_channels = img_array[:, :, :3]
        # More aggressive white detection - consider anything close to white as white
        non_transparent = alpha_channel > 10  # Allow for slight transparency
        not_white = np.any(
            rgb_channels < 240, axis=2
        )  # More aggressive white threshold
        content_pixels = non_transparent & not_white
    elif img_array.shape[2] == 3:  # RGB
        # For RGB, check for white and near-white colors
        content_pixels = np.any(img_array < 240, axis=2)
    else:
        # Grayscale - remove white and near-white
        content_pixels = img_array < 240

    # Quick check if any content exists
    if not np.any(content_pixels):
        return None

    def find_row_bounds(
        start_row: int, end_row: int
    ) -> Tuple[Optional[int], Optional[int]]:
        """Find first and last rows with content in a chunk"""
        chunk = content_pixels[start_row:end_row]
        rows_with_content = np.any(chunk, axis=1)
        if not np.any(rows_with_content):
            return None, None

        first_row = int(np.argmax(rows_with_content)) + start_row
        last_row = (
            len(rows_with_content)
            - 1
            - int(np.argmax(rows_with_content[::-1]))
            + start_row
        )
        return first_row, last_row

    def find_col_bounds(
        start_col: int, end_col: int
    ) -> Tuple[Optional[int], Optional[int]]:
        """Find first and last columns with content in a chunk"""
        chunk = content_pixels[:, start_col:end_col]
        cols_with_content = np.any(chunk, axis=0)
        if not np.any(cols_with_content):
            return None, None

        first_col = int(np.argmax(cols_with_content)) + start_col
        last_col = (
            len(cols_with_content)
            - 1
            - int(np.argmax(cols_with_content[::-1]))
            + start_col
        )
        return first_col, last_col

    # Use parallel processing for large images
    if height > 1000 or width > 1000:
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            # Process rows in chunks
            row_chunk_size = max(1, height // num_threads)
            row_futures = []
            for i in range(0, height, row_chunk_size):
                end_row = min(i + row_chunk_size, height)
                row_futures.append(executor.submit(find_row_bounds, i, end_row))

            # Process columns in chunks
            col_chunk_size = max(1, width // num_threads)
            col_futures = []
            for i in range(0, width, col_chunk_size):
                end_col = min(i + col_chunk_size, width)
                col_futures.append(executor.submit(find_col_bounds, i, end_col))

            # Collect results
            row_results = [f.result() for f in row_futures]
            col_results = [f.result() for f in col_futures]
    else:
        # For smaller images, use simple approach
        rows = np.any(content_pixels, axis=1)
        cols = np.any(content_pixels, axis=0)

        if not np.any(rows) or not np.any(cols):
            return None

        top = int(np.argmax(rows))
        bottom = len(rows) - 1 - int(np.argmax(rows[::-1]))
        left = int(np.argmax(cols))
        right = len(cols) - 1 - int(np.argmax(cols[::-1]))

        return top, bottom, left, right

    # Process parallel results
    valid_row_results = [
        (first, last) for first, last in row_results if first is not None
    ]
    valid_col_results = [
        (first, last) for first, last in col_results if first is not None
    ]

    if not valid_row_results or not valid_col_results:
        return None

    top = min(first for first, _ in valid_row_results)
    bottom = max(last for _, last in valid_row_results)
    left = min(first for first, _ in valid_col_results)
    right = max(last for _, last in valid_col_results)

    return top, bottom, left, right


def find_bounds_chunked(img: Image.Image, chunk_size: int = 2048) -> Optional[Tuple[int, int, int, int]]:
    """Find content bounds by scanning image in chunks to save memory"""
    width, height = img.size
    
    # Sample points across the image to find rough bounds
    sample_points = []
    step = max(1, min(width, height) // 20)  # Sample ~20 points per dimension
    
    print(f"🔍 Sampling image with step size {step}...")
    
    # Sample horizontal strips
    for y in range(0, height, step):
        for x in range(0, width, min(chunk_size, width)):
            x_end = min(x + chunk_size, width)
            chunk = img.crop((x, y, x_end, min(y + step, height)))
            
            if chunk.mode != "RGBA":
                chunk = chunk.convert("RGBA")
            
            chunk_array = np.array(chunk, dtype=np.uint8)  # Use np.array to make it writable
            
            # Check for content in this chunk
            if chunk_array.shape[2] == 4:
                alpha_channel = chunk_array[:, :, 3]
                rgb_channels = chunk_array[:, :, :3]
                non_transparent = alpha_channel > 10
                not_white = np.any(rgb_channels < 240, axis=2)
                has_content = np.any(non_transparent & not_white)
            else:
                has_content = np.any(chunk_array < 240)
            
            if has_content:
                sample_points.append((x, y, x_end - 1, min(y + step - 1, height - 1)))
    
    if not sample_points:
        return None
    
    # Find overall bounds from sample points
    min_x = min(p[0] for p in sample_points)
    min_y = min(p[1] for p in sample_points)
    max_x = max(p[2] for p in sample_points)
    max_y = max(p[3] for p in sample_points)
    
    print(f"📦 Rough bounds found: ({min_x}, {min_y}) to ({max_x}, {max_y})")
    
    return min_x, min_y, max_x, max_y


def reduce_image_whitespace(
    input_path: str,
    output_path: str,
    num_threads: int = 4,
    background_color: tuple = (0, 0, 0, 0),
    chunk_size: int = 2048,
) -> None:
    """Memory-efficient image whitespace reduction for huge images"""
    start_time = time.time()

    # Increase PIL's decompression bomb limit for large images
    Image.MAX_IMAGE_PIXELS = None

    print(f"Loading image: {input_path}")

    # Open the image but don't load it into memory yet
    with Image.open(input_path) as img:
        original_size = img.size
        width, height = original_size

        print(f"Processing huge image of size {original_size} in chunks...")
        
        # For very large images, find bounds by scanning in smaller chunks
        if width * height > 100_000_000:  # > 100M pixels
            print("🔍 Scanning for content bounds in chunks to save memory...")
            
            # Find rough bounds by sampling
            bounds = find_bounds_chunked(img, chunk_size)
            
            if bounds is None:
                print("No content found in image")
                return
            
            left, top, right, bottom = bounds
            print(f"📦 Content bounds: left={left}, top={top}, right={right}, bottom={bottom}")
            
            # Crop the region we actually need
            content_width = right - left + 1
            content_height = bottom - top + 1
            
            print(f"🎯 Cropping to content area: {content_width} x {content_height}")
            
            # Create output image with clean background
            output_img = Image.new("RGBA", (content_width, content_height), background_color)
            
            # Process the content area in chunks
            chunk_rows = max(1, chunk_size)
            chunk_cols = max(1, chunk_size)
            
            for y in range(0, content_height, chunk_rows):
                for x in range(0, content_width, chunk_cols):
                    chunk_right = min(x + chunk_cols, content_width)
                    chunk_bottom = min(y + chunk_rows, content_height)
                    
                    # Calculate absolute coordinates
                    abs_left = left + x
                    abs_top = top + y
                    abs_right = left + chunk_right
                    abs_bottom = top + chunk_bottom
                    
                    # Load only this chunk
                    chunk = img.crop((abs_left, abs_top, abs_right, abs_bottom))
                    
                    # Clean the chunk
                    if chunk.mode != "RGBA":
                        chunk = chunk.convert("RGBA")
                    
                    chunk_array = np.array(chunk, dtype=np.uint8)  # Use np.array to make it writable
                    
                    # Create content mask for this chunk
                    if chunk_array.shape[2] == 4:
                        alpha_channel = chunk_array[:, :, 3]
                        rgb_channels = chunk_array[:, :, :3]
                        non_transparent = alpha_channel > 10
                        not_white = np.any(rgb_channels < 240, axis=2)
                        content_mask = non_transparent & not_white
                    else:
                        content_mask = np.any(chunk_array < 240, axis=2)
                    
                    # Clean background in chunk
                    chunk_array[~content_mask] = background_color
                    
                    # Convert back and paste into output
                    cleaned_chunk = Image.fromarray(chunk_array, "RGBA")
                    output_img.paste(cleaned_chunk, (x, y))
                    
                    print(f"📦 Processed chunk ({x}, {y}) to ({chunk_right}, {chunk_bottom})")
            
            final_img = output_img
            
        else:
            # For smaller images, use the original method
            if img.mode != "RGBA":
                img = img.convert("RGBA")
            
            img_array = np.array(img, dtype=np.uint8)  # Use np.array to make it writable
            bounds = find_content_bounds_parallel(img_array, num_threads)
            
            if bounds is None:
                print("No content found in image")
                return
            
            top, bottom, left, right = bounds
            cleaned_array = img_array.copy()
            
            # Create content mask
            alpha_channel = img_array[:, :, 3]
            rgb_channels = img_array[:, :, :3]
            non_transparent = alpha_channel > 10
            not_white = np.any(rgb_channels < 240, axis=2)
            content_mask = non_transparent & not_white
            
            # Set background to specified color
            cleaned_array[~content_mask] = background_color
            
            # Convert back to PIL Image and crop
            cleaned_img = Image.fromarray(cleaned_array, "RGBA")
            final_img = cleaned_img.crop((left, top, right + 1, bottom + 1))

        # Optimize save parameters for maximum compression
        print("💾 Saving optimized image...")
        save_kwargs: dict = {
            "optimize": True,
            "compress_level": 9,  # Maximum PNG compression
        }

        # Save with optimizations
        final_img.save(output_path, "PNG", **save_kwargs)

    end_time = time.time()
    processing_time = end_time - start_time

    # Calculate compression ratio
    original_file_size = os.path.getsize(input_path)
    compressed_file_size = os.path.getsize(output_path)
    compression_ratio = (1 - compressed_file_size / original_file_size) * 100

    print(f"✅ Processing completed in {processing_time:.2f}s")
    print(f"📏 Original size: {original_size}")
    print(f"📏 Final size: {final_img.size}")
    print(f"💾 File size: {original_file_size:,} → {compressed_file_size:,} bytes")
    print(f"📉 Compression: {compression_ratio:.1f}% reduction")
    print(f"💾 Saved to: {output_path}")


def batch_process_images(
    input_patterns: list[str],
    output_suffix: str = "_reduced",
    num_threads: int = 4,
    background_color: tuple = (0, 0, 0, 0),
) -> None:
    """Process multiple images in batch with clean backgrounds"""
    import glob

    all_files = []
    for pattern in input_patterns:
        all_files.extend(glob.glob(pattern))

    if not all_files:
        print("No files found matching the patterns")
        return

    print(f"Found {len(all_files)} files to process")

    for i, input_file in enumerate(all_files, 1):
        name, ext = os.path.splitext(input_file)
        output_file = f"{name}{output_suffix}{ext}"

        print(f"\n[{i}/{len(all_files)}] Processing: {os.path.basename(input_file)}")
        try:
            reduce_image_whitespace(
                input_file, output_file, num_threads, background_color
            )
        except Exception as e:
            print(f"❌ Error processing {input_file}: {e}")


if __name__ == "__main__":
    # Process single image with transparent background (removes white areas completely)
    reduce_image_whitespace(
        "combined_map.png", "combined_map_reduced.png", background_color=(0, 0, 0, 0)
    )

    # Uncomment below to process multiple images in batch
    # batch_process_images(["*.png", "*.jpg", "*.jpeg"], "_reduced", background_color=(0, 0, 0, 0))

    # Alternative: Use a solid color background instead of transparent
    # reduce_image_whitespace("combined_map.png", "combined_map_solid_bg.png", background_color=(0, 0, 0, 255))
