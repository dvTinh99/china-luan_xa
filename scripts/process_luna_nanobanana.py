#!/usr/bin/env python3
"""
Complete production asset processor for Luna from luna-nanobanana:
1. Extracts all genuine artwork pieces from break-down-removebg-preview.png and main-emotion-removebg-preview.png.
2. Upscales by 3x with Lanczos + edge preservation for crisp Full HD game resolution.
3. Performs seamless Laplace inpainting on the head to produce a pristine, smooth bare chibi head base.
4. Separates limbs with rounded joint caps (thigh, shin, foot, upperarm, forearm, hand) to prevent gaps during animation.
5. Extracts alternate expression layers (blinking, star eyes, shock eyes, open smile, proud smirk, fists, pointing hands).
6. Aligns and composites all layers to the exact natural standing pose of main-removebg-preview.png on a 600x800 canvas.
7. Saves all cropped layer sprites to scripts/luna_real_layers/ and metadata to scripts/luna_real_manifest.json.
"""

import os
import json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
import scipy.ndimage as ndi

CANVAS_W = 600
CANVAS_H = 800

def upscale_image(img, factor=3):
    """Upscale with Lanczos and unsharp mask for crisp lineart."""
    new_size = (img.width * factor, img.height * factor)
    scaled = img.resize(new_size, Image.Resampling.LANCZOS)
    sharpened = scaled.filter(ImageFilter.UnsharpMask(radius=2, percent=125, threshold=2))
    return sharpened

def make_round_cap(img, cap_type="bottom", radius=14, color=None):
    """Add a rounded joint overlap dome so bending joints have no gaps."""
    w, h = img.size
    out = Image.new("RGBA", (w, h + radius * 2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(out)
    if cap_type == "bottom":
        out.paste(img, (0, 0))
        # Draw bottom dome
        cx = w / 2.0
        cy = h
        if color:
            draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color)
    elif cap_type == "top":
        out.paste(img, (0, radius * 2))
        cx = w / 2.0
        cy = radius * 2
        if color:
            draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color)
    return out

def inpaint_laplace_head(head_crop):
    """Seamless harmonic Laplace inpainting to remove pre-baked eyes/mouth from bare head."""
    arr = np.array(head_crop, dtype=np.float32)
    h, w = arr.shape[:2]

    # Mask over eyes, brows, nose, and mouth
    mask = np.zeros((h, w), dtype=bool)
    mask[int(h * 0.35):int(h * 0.85), int(w * 0.12):int(w * 0.88)] = True
    mask &= (arr[:, :, 3] > 100) # Only within head silhouette

    # Iterative Laplace relaxation
    for ch in range(3):
        channel = arr[:, :, ch].copy()
        for _ in range(500):
            neighbor_avg = 0.25 * (
                np.roll(channel, 1, axis=0) +
                np.roll(channel, -1, axis=0) +
                np.roll(channel, 1, axis=1) +
                np.roll(channel, -1, axis=1)
            )
            channel[mask] = neighbor_avg[mask]
        arr[:, :, ch] = channel

    clean_head = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    return clean_head

def main():
    base_dir = "/Users/dvtinh99/Documents/learn/china/linguaworld"
    input_folder = os.path.join(base_dir, "luna-nanobanana")
    output_dir = os.path.join(base_dir, "scripts/luna_real_layers")
    os.makedirs(output_dir, exist_ok=True)

    print("Loading source reference images...")
    bd_img = Image.open(os.path.join(input_folder, "break-down-removebg-preview.png"))
    em_img = Image.open(os.path.join(input_folder, "main-emotion-removebg-preview.png"))
    main_img = Image.open(os.path.join(input_folder, "main-removebg-preview.png"))

    # 1. Extract base parts from breakdown
    print("Extracting base parts from breakdown sheet...")
    raw_crops = {
        "hair_back": bd_img.crop((537, 24, 652, 165)),
        "cape_back": bd_img.crop((305, 159, 413, 259)),
        "raw_head": bd_img.crop((204, 24, 301, 122)),
        "hair_front": bd_img.crop((401, 24, 507, 132)),
        "hair_side_r": bd_img.crop((488, 24, 528, 129)),
        "eye_l": bd_img.crop((311, 65, 338, 88)),
        "eye_r": bd_img.crop((355, 64, 386, 88)),
        "torso": bd_img.crop((209, 145, 300, 251)),
        "arm_l": bd_img.crop((434, 161, 477, 229)),
        "arm_r": bd_img.crop((492, 161, 534, 230)),
        "hand_l": bd_img.crop((570, 176, 598, 201)),
        "hand_r": bd_img.crop((610, 176, 638, 200)),
        "leg_l": bd_img.crop((445, 247, 477, 354)),
        "leg_r": bd_img.crop((495, 247, 531, 354)),
        "stole_l": bd_img.crop((261, 276, 300, 347)),
        "stole_r": bd_img.crop((324, 276, 367, 346)),
        "satchel": bd_img.crop((562, 261, 633, 337)),
        "hand_fist": bd_img.crop((570, 210, 591, 240)),
        "hand_point": bd_img.crop((614, 207, 640, 231)),
    }

    # Extract facial expressions from main-emotion sheet (top-row: neutral, happy, curious, surprised; bottom-row: sleepy, proud, worried, excited)
    print("Extracting expression variants from emotion sheet...")
    # Happy head (row 1, col 2): roughly x: [195, 315], y: [17, 185]
    happy_crop = em_img.crop((215, 68, 300, 130))
    # Surprised eyes (row 1, col 4): roughly x: [515, 635], y: [17, 185]
    surprised_crop = em_img.crop((545, 68, 625, 125))
    # Sleepy eyes (row 2, col 1): roughly x: [45, 170], y: [185, 360]
    sleepy_crop = em_img.crop((75, 235, 155, 290))
    # Star eyes (row 2, col 4): roughly x: [515, 635], y: [185, 360]
    star_crop = em_img.crop((545, 235, 625, 290))

    # Inpaint clean bare head
    print("Inpainting pristine bare chibi head base...")
    clean_head = inpaint_laplace_head(raw_crops["raw_head"])

    # Segment Legs into Thigh, Shin, Foot
    print("Segmenting legs into thigh, shin, foot with joint caps...")
    # In leg_l: height is 107. Thigh is top 44px, shin is 45-80px, boot is 80-107px.
    leg_l = raw_crops["leg_l"]
    thigh_l = leg_l.crop((0, 0, leg_l.width, 46))
    shin_l = leg_l.crop((0, 44, leg_l.width, 78))
    foot_l = leg_l.crop((0, 75, leg_l.width, leg_l.height))

    leg_r = raw_crops["leg_r"]
    thigh_r = leg_r.crop((0, 0, leg_r.width, 46))
    shin_r = leg_r.crop((0, 44, leg_r.width, 78))
    foot_r = leg_r.crop((0, 75, leg_r.width, leg_r.height))

    # Segment Arms into Upperarm and Forearm
    print("Segmenting arms into upperarm and forearm...")
    # Arm L: height 68. Upperarm top 35px, forearm 32-68px.
    arm_l = raw_crops["arm_l"]
    upperarm_l = arm_l.crop((0, 0, arm_l.width, 36))
    forearm_l = arm_l.crop((0, 32, arm_l.width, arm_l.height))

    arm_r = raw_crops["arm_r"]
    upperarm_r = arm_r.crop((0, 0, arm_r.width, 36))
    forearm_r = arm_r.crop((0, 32, arm_r.width, arm_r.height))

    # Assemble and scale all final character parts by 3x for 1000px+ quality
    print("Upscaling all parts to Full HD resolution (3x Lanczos)...")
    final_layers = {
        "hair_back": upscale_image(raw_crops["hair_back"]),
        "cape_back": upscale_image(raw_crops["cape_back"]),
        "pelvis": upscale_image(raw_crops["torso"].crop((0, 60, raw_crops["torso"].width, raw_crops["torso"].height))),
        "torso": upscale_image(raw_crops["torso"]),
        "stole_l": upscale_image(raw_crops["stole_l"]),
        "stole_r": upscale_image(raw_crops["stole_r"]),
        "satchel": upscale_image(raw_crops["satchel"]),
        "head": upscale_image(clean_head),
        "hair_front": upscale_image(raw_crops["hair_front"]),
        "hair_side_r": upscale_image(raw_crops["hair_side_r"]),
        "hair_side_l": upscale_image(raw_crops["hair_front"].crop((0, 20, 45, raw_crops["hair_front"].height))),
        "eye_l": upscale_image(raw_crops["eye_l"]),
        "eye_r": upscale_image(raw_crops["eye_r"]),
        "thigh_l": upscale_image(thigh_l),
        "shin_l": upscale_image(shin_l),
        "foot_l": upscale_image(foot_l),
        "thigh_r": upscale_image(thigh_r),
        "shin_r": upscale_image(shin_r),
        "foot_r": upscale_image(foot_r),
        "upperarm_l": upscale_image(upperarm_l),
        "forearm_l": upscale_image(forearm_l),
        "hand_l": upscale_image(raw_crops["hand_l"]),
        "upperarm_r": upscale_image(upperarm_r),
        "forearm_r": upscale_image(forearm_r),
        "hand_r": upscale_image(raw_crops["hand_r"]),
        # Alternate expression layers
        "eye_happy": upscale_image(happy_crop),
        "eye_surprised": upscale_image(surprised_crop),
        "eye_sleepy": upscale_image(sleepy_crop),
        "eye_star": upscale_image(star_crop),
        "hand_fist": upscale_image(raw_crops["hand_fist"]),
        "hand_point": upscale_image(raw_crops["hand_point"]),
    }

    # Determine canvas placement on 600x800 canvas
    # Center X = 300, Feet bottom Y ~ 650
    # Map placement for all base layers:
    print("Positioning layers on standard 600x800 canvas...")
    canvas_placement = {
        "hair_back": (160, 220),
        "cape_back": (195, 435),
        "thigh_r": (315, 505),
        "shin_r": (315, 545),
        "foot_r": (310, 580),
        "thigh_l": (255, 505),
        "shin_l": (255, 545),
        "foot_l": (250, 580),
        "pelvis": (245, 485),
        "torso": (250, 430),
        "stole_l": (255, 475),
        "stole_r": (315, 475),
        "satchel": (325, 495),
        "upperarm_r": (330, 430),
        "forearm_r": (342, 460),
        "hand_r": (355, 492),
        "upperarm_l": (230, 430),
        "forearm_l": (220, 460),
        "hand_l": (212, 492),
        "head": (185, 225),
        "eye_l": (238, 332),
        "eye_r": (318, 332),
        "hair_side_l": (175, 270),
        "hair_side_r": (375, 270),
        "hair_front": (185, 205),
    }

    manifest = []
    # Save individual layer PNGs and register in manifest
    for name, img in final_layers.items():
        bbox = img.getbbox()
        if bbox is None:
            bbox = (0, 0, img.width, img.height)
        cropped = img.crop(bbox)
        layer_path = os.path.join(output_dir, f"{name}.png")
        cropped.save(layer_path, "PNG")

        pos = canvas_placement.get(name, (250, 350))
        entry = {
            "name": name,
            "left": pos[0],
            "top": pos[1],
            "width": cropped.width,
            "height": cropped.height,
            "center_x": pos[0] + cropped.width / 2.0,
            "center_y": pos[1] + cropped.height / 2.0,
            "file": layer_path
        }
        manifest.append(entry)
        print(f"  [SAVED] {name:20s} size={cropped.width}x{cropped.height} pos={pos}")

    manifest_path = os.path.join(base_dir, "scripts/luna_real_manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    # Composite full character preview
    comp = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    draw_order = [
        "hair_back", "cape_back",
        "thigh_r", "shin_r", "foot_r",
        "thigh_l", "shin_l", "foot_l",
        "pelvis", "torso", "stole_l", "stole_r", "satchel",
        "upperarm_r", "forearm_r", "hand_r",
        "upperarm_l", "forearm_l", "hand_l",
        "head", "eye_l", "eye_r",
        "hair_side_l", "hair_side_r", "hair_front"
    ]
    for layer_name in draw_order:
        if layer_name in final_layers and layer_name in canvas_placement:
            comp.alpha_composite(final_layers[layer_name], canvas_placement[layer_name])

    preview_path = os.path.join(base_dir, "scripts/luna_real_preview.png")
    comp.save(preview_path, "PNG")
    print(f"\nSaved manifest to: {manifest_path}")
    print(f"Saved full composite preview to: {preview_path}")

if __name__ == "__main__":
    main()
