# temporary coordinates for testing
# Script is intension is to get the maximum quality map from
# `map.uci.edu` and save it as a single image

# What i notices is as I throttled my wifi, and was at a certain zoom, the URL stayed the same,
# as I zoomed out I noticed that the zoom also changes
# On downloading such a request when inspecting the network tab, I get a small PNG which is a part of the map
# To confirm this I tried with different spots and came to the conclusion that the first part of the URL

# Spacing and Tile size was confusing for me on the map, so I just took a small section and tested


from typing import LiteralString
from PIL.ImageFile import ImageFile
import requests
from PIL import Image
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO

map_id = "463"
tile_set = "463_Map_6811475fe91d4"
zoom_level = "18"  # Reduced from 20 to 18 for smaller file size
base_url: LiteralString = f"https://assets.concept3d.com/assets/{map_id}/{tile_set}/{zoom_level}"

# Adjusted coordinates for zoom level 18 (coordinates scale with zoom level)
top_y = 157100  # Scaled down from zoom 20
bottom_y = 157124  # Smaller area for manageable size

left_x = 45247   # Scaled down from zoom 20  
right_x = 45279  # Smaller area for manageable size


width_tiles: int = right_x - left_x + 1
height_tiles: int = bottom_y - top_y + 1

# Assume each tile is 256x256 pixels (common for map tiles)
tile_size: int = 256
spacing: int = 0  # No spacing between tiles for smaller file size
# Calculate the total width and height of the final image

total_width: int = width_tiles * tile_size
total_height: int = height_tiles * tile_size

# Create the final image with transparent background
final_image: Image.Image = Image.new("RGBA", (total_width, total_height), (0, 0, 0, 0))

def download_tile(i: int, j: int) -> tuple[int, int, Image.Image] | None:
    url = f"{base_url}/{i}/{j}.png"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            tile_image: ImageFile = Image.open(BytesIO(response.content))
            return (i, j, tile_image)
        else:
            print(f"Failed to download {url}")
            return None
    except Exception as e:
        print(f"Error processing {url}: {e}")
        return None

# Generate all tile coordinates
tiles: list[tuple[int, int]] = [
    (i, j) for i in range(left_x, right_x + 1) for j in range(top_y, bottom_y + 1)
]

# Download tiles concurrently
with ThreadPoolExecutor(max_workers=10) as executor:
    futures = {executor.submit(download_tile, i, j): (i, j) for i, j in tiles}

    for future in as_completed(futures):
        result = future.result()
        if result:
            i, j, tile_image = result
            x_pos = (i - left_x) * tile_size
            y_pos = (bottom_y - j) * tile_size
            final_image.paste(tile_image, (x_pos, y_pos))

# Save the final map with compression
final_image.save("combined_map.png", optimize=True, compress_level=6)
print(f"Map saved as combined_map.png")
print(f"Final image dimensions: {final_image.size[0]}x{final_image.size[1]} pixels")
print(f"Total tiles downloaded: {width_tiles}x{height_tiles} = {width_tiles * height_tiles}")
final_image.show()
