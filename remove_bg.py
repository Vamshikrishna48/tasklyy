import sys
import subprocess

try:
    from PIL import Image, ImageDraw
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw

def process_image(input_path, output_path, tolerance=40):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    temp_img = img.convert("RGB")
    bg_color = (255, 0, 255) # magenta
    
    # Flood fill from all edges to make sure we get the whole background
    points = [(x, 0) for x in range(width)] + \
             [(x, height-1) for x in range(width)] + \
             [(0, y) for y in range(height)] + \
             [(width-1, y) for y in range(height)]
             
    for xy in points:
        current_color = temp_img.getpixel(xy)
        # If it's close to white
        if sum(current_color) > 700:
            ImageDraw.floodfill(temp_img, xy, bg_color, thresh=tolerance)

    data = img.getdata()
    temp_data = temp_img.getdata()
    
    new_data = []
    for original, temp in zip(data, temp_data):
        if temp == bg_color:
            new_data.append((255, 255, 255, 0)) # fully transparent
        else:
            # We want to remove the white halo (anti-aliased pixels on the edge)
            # If the pixel is very close to white, we can reduce its alpha
            r, g, b, a = original
            whiteness = (r + g + b) / 3.0
            if whiteness > 240 and original != (255,255,255,255) and temp != bg_color:
                # the inside checkmark is white, so this might make the inside checkmark semi-transparent!
                pass
            new_data.append(original)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved {output_path}")

if __name__ == "__main__":
    process_image("public/taskly-logo.jpeg", "public/taskly-logo.png")
