from PIL import Image, ImageDraw
img = Image.new("RGBA", (100, 100), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.ellipse([10, 10, 90, 90], fill=(245, 217, 196, 255), outline=(73, 53, 47, 255), width=2)
img.save("scripts/test_out.png")
print("Pillow test successful, saved scripts/test_out.png")
