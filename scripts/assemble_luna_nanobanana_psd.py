#!/usr/bin/env python3
"""
Assemble Luna character artwork directly from luna-nanobanana breakdown and emotion sheets:
1. Loads genuine extracted parts from scripts/components/ and scripts/emotions/
2. Generates pristine bare head base via harmonic Laplace relaxation
3. Segments limbs (thigh, shin, foot, upperarm, forearm, hand) with rounded joint overlap caps
4. Generates high-res expression attachments (blink, happy, surprised, sleepy, smug, star)
5. Generates modular equipment (hair_short, hat_explorer, outfit_adventurer, shoes_boots)
6. Upscales all parts with Lanczos + edge sharpening for crisp Full HD 600x800 canvas
7. Saves all cropped layer sprites to scripts/luna_real_layers/
8. Generates scripts/luna_real_manifest.json with exact bounding boxes and centers
9. Saves scripts/luna_assembled_preview.png for visual verification
"""

import os
import json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
import scipy.ndimage as ndi

CANVAS_W = 600
CANVAS_H = 800
SCALE = 2.75 # Scale from comp_00 (171x234) to 600x800 canvas (height ~ 644px)

BASE_DIR = "/Users/dvtinh99/Documents/learn/china/linguaworld"
COMP_DIR = os.path.join(BASE_DIR, "scripts/components")
EMO_DIR = os.path.join(BASE_DIR, "scripts/emotions")
OUTPUT_DIR = os.path.join(BASE_DIR, "scripts/luna_real_layers")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def upscale(img, factor=SCALE):
    """Upscale with Lanczos and unsharp mask for crisp lineart."""
    nw = max(1, int(round(img.width * factor)))
    nh = max(1, int(round(img.height * factor)))
    scaled = img.resize((nw, nh), Image.Resampling.LANCZOS)
    sharpened = scaled.filter(ImageFilter.UnsharpMask(radius=2, percent=120, threshold=2))
    return sharpened

def make_round_cap(img, cap_type="bottom", radius=6, fill_color=(252, 246, 245, 255)):
    """Add a rounded joint overlap dome so bending joints have no gaps."""
    w, h = img.size
    out = Image.new("RGBA", (w, h + radius * 2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(out)
    cx = w / 2.0
    if cap_type == "bottom":
        draw.ellipse([cx - radius * 1.5, h - radius, cx + radius * 1.5, h + radius], fill=fill_color)
        out.paste(img, (0, 0), img)
    elif cap_type == "top":
        draw.ellipse([cx - radius * 1.5, radius, cx + radius * 1.5, radius * 3], fill=fill_color)
        out.paste(img, (0, radius * 2), img)
    return out

def get_pristine_head():
    """Generates a bare anime head base using harmonic Laplace relaxation."""
    head_raw = Image.open(os.path.join(COMP_DIR, "comp_01_97x98.png"))
    arr = np.array(head_raw, dtype=np.float32)
    h, w = arr.shape[:2]

    mask = np.zeros((h, w), dtype=bool)
    mask[32:90, 7:87] = True
    alpha = arr[:, :, 3] > 150
    alpha_inner = ndi.binary_erosion(alpha, iterations=3)
    mask &= alpha_inner

    forehead_color = arr[25, 48, :3]
    chin_color = arr[90, 48, :3]

    for y in range(h):
        t = (y - 32) / (90 - 32)
        t = np.clip(t, 0.0, 1.0)
        col = (1 - t) * forehead_color + t * chin_color
        arr[y, mask[y], :3] = col

    for ch in range(3):
        channel = arr[:, :, ch].copy()
        for _ in range(2000):
            avg = 0.25 * (
                np.roll(channel, 1, axis=0) +
                np.roll(channel, -1, axis=0) +
                np.roll(channel, 1, axis=1) +
                np.roll(channel, -1, axis=1)
            )
            channel[mask] = avg[mask]
        arr[:, :, ch] = channel

    clean = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    return clean

def main():
    print("Loading base breakdown components...")
    hair_back_raw = Image.open(os.path.join(COMP_DIR, "comp_04_115x141.png"))
    cape_back_raw = Image.open(os.path.join(COMP_DIR, "comp_13_108x100.png"))
    torso_raw = Image.open(os.path.join(COMP_DIR, "comp_12_91x106.png"))
    head_raw = get_pristine_head()
    eye_r_raw = Image.open(os.path.join(COMP_DIR, "comp_09_31x24.png"))
    eye_l_raw = Image.open(os.path.join(COMP_DIR, "comp_10_27x23.png"))
    brow_r_raw = Image.open(os.path.join(COMP_DIR, "comp_05_24x7.png"))
    brow_l_raw = Image.open(os.path.join(COMP_DIR, "comp_06_20x6.png"))
    mouth_raw = Image.open(os.path.join(COMP_DIR, "comp_11_19x10.png"))
    hair_side_r_raw = Image.open(os.path.join(COMP_DIR, "comp_03_40x105.png"))
    hair_side_l_raw = hair_side_r_raw.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    hair_front_raw = Image.open(os.path.join(COMP_DIR, "comp_02_106x108.png"))
    satchel_raw = Image.open(os.path.join(COMP_DIR, "comp_23_71x76.png"))

    # Arms and Legs
    arm_l_raw = Image.open(os.path.join(COMP_DIR, "comp_14_43x68.png"))
    arm_r_raw = Image.open(os.path.join(COMP_DIR, "comp_15_42x69.png"))
    leg_l_raw = Image.open(os.path.join(COMP_DIR, "comp_20_32x107.png"))
    leg_r_raw = Image.open(os.path.join(COMP_DIR, "comp_21_36x107.png"))

    # Segment Legs into Thigh, Shin, Foot with joint caps
    thigh_l_raw = leg_l_raw.crop((0, 0, leg_l_raw.width, 48))
    shin_l_raw = leg_l_raw.crop((0, 40, leg_l_raw.width, 80))
    foot_l_raw = leg_l_raw.crop((0, 74, leg_l_raw.width, leg_l_raw.height))

    thigh_r_raw = leg_r_raw.crop((0, 0, leg_r_raw.width, 48))
    shin_r_raw = leg_r_raw.crop((0, 40, leg_r_raw.width, 80))
    foot_r_raw = leg_r_raw.crop((0, 74, leg_r_raw.width, leg_r_raw.height))

    # Segment Arms into Upperarm and Forearm with natural overlap
    upperarm_l_raw = arm_l_raw.crop((0, 0, arm_l_raw.width, 38))
    forearm_l_raw = arm_l_raw.crop((0, 30, arm_l_raw.width, arm_l_raw.height))

    upperarm_r_raw = arm_r_raw.crop((0, 0, arm_r_raw.width, 38))
    forearm_r_raw = arm_r_raw.crop((0, 30, arm_r_raw.width, arm_r_raw.height))

    # Hands
    hand_l_raw = Image.open(os.path.join(COMP_DIR, "comp_16_28x25.png"))
    hand_r_raw = Image.open(os.path.join(COMP_DIR, "comp_17_28x24.png"))
    hand_open_l_raw = hand_l_raw.copy()
    hand_open_r_raw = hand_r_raw.copy()
    hand_point_raw = Image.open(os.path.join(COMP_DIR, "comp_18_26x24.png"))
    hand_fist_raw = Image.open(os.path.join(COMP_DIR, "comp_19_21x30.png"))

    # Pelvis: lower portion of torso
    pelvis_raw = torso_raw.crop((10, 60, torso_raw.width - 10, torso_raw.height))

    # Neck: smooth skin polygon hidden safely under collar and chin
    neck_img = Image.new("RGBA", (20, 16), (248, 218, 204, 255))

    # Expressions from emotion sheets
    emo_happy = Image.open(os.path.join(EMO_DIR, "happy.png"))
    emo_star = Image.open(os.path.join(EMO_DIR, "star.png"))
    emo_sleepy = Image.open(os.path.join(EMO_DIR, "sleepy.png"))
    emo_proud = Image.open(os.path.join(EMO_DIR, "proud.png"))
    emo_surprised = Image.open(os.path.join(EMO_DIR, "surprised.png"))

    eye_happy_l_raw = emo_happy.crop((44, 60, 74, 82))
    eye_happy_r_raw = emo_happy.crop((88, 60, 118, 82))
    mouth_happy_raw = emo_happy.crop((68, 84, 94, 102))

    eye_blink_l_raw = emo_sleepy.crop((44, 58, 74, 80))
    eye_blink_r_raw = emo_sleepy.crop((88, 58, 118, 80))
    mouth_yawn_raw = emo_sleepy.crop((73, 86, 91, 102))

    eye_star_l_raw = emo_star.crop((42, 54, 76, 84))
    eye_star_r_raw = emo_star.crop((86, 54, 120, 84))

    eye_smug_l_raw = emo_proud.crop((44, 56, 74, 80))
    eye_smug_r_raw = emo_proud.crop((88, 56, 118, 80))
    mouth_smirk_raw = emo_proud.crop((70, 82, 92, 96))

    eye_surprised_l_raw = emo_surprised.crop((42, 54, 76, 84))
    eye_surprised_r_raw = emo_surprised.crop((86, 54, 120, 84))
    mouth_surprised_raw = emo_surprised.crop((72, 86, 92, 104))

    # Modular Equipment
    hat_img = Image.new("RGBA", (140, 75), (0, 0, 0, 0))
    hat_draw = ImageDraw.Draw(hat_img)
    hat_draw.ellipse([10, 20, 130, 70], fill=(160, 140, 190, 255), outline=(75, 55, 75, 255), width=2)
    hat_draw.polygon([(70, 5), (45, 40), (95, 40)], fill=(185, 160, 215, 255), outline=(75, 55, 75, 255), width=2)
    hat_draw.polygon([(70, 32), (75, 42), (85, 42), (77, 48), (80, 58), (70, 52), (60, 58), (63, 48), (55, 42), (65, 42)], fill=(232, 183, 107, 255))

    hair_short_img = hair_front_raw.crop((0, 0, hair_front_raw.width, int(hair_front_raw.height * 0.75)))

    outfit_adv_img = torso_raw.copy()
    adv_draw = ImageDraw.Draw(outfit_adv_img)
    adv_draw.rectangle([15, 35, 35, 75], fill=(139, 90, 43, 160))
    adv_draw.rectangle([torso_raw.width - 35, 35, torso_raw.width - 15, 75], fill=(139, 90, 43, 160))

    shoes_l_img = foot_l_raw.copy()
    shoes_r_img = foot_r_raw.copy()
    sh_l_arr = np.array(shoes_l_img)
    sh_r_arr = np.array(shoes_r_img)
    mask_l = sh_l_arr[:, :, 3] > 100
    sh_l_arr[mask_l, 0] = np.clip(sh_l_arr[mask_l, 0] * 0.9 + 50, 0, 255)
    sh_l_arr[mask_l, 1] = np.clip(sh_l_arr[mask_l, 1] * 0.65, 0, 255)
    sh_l_arr[mask_l, 2] = np.clip(sh_l_arr[mask_l, 2] * 0.45, 0, 255)
    shoes_l_img = Image.fromarray(sh_l_arr)

    mask_r = sh_r_arr[:, :, 3] > 100
    sh_r_arr[mask_r, 0] = np.clip(sh_r_arr[mask_r, 0] * 0.9 + 50, 0, 255)
    sh_r_arr[mask_r, 1] = np.clip(sh_r_arr[mask_r, 1] * 0.65, 0, 255)
    sh_r_arr[mask_r, 2] = np.clip(sh_r_arr[mask_r, 2] * 0.45, 0, 255)
    shoes_r_img = Image.fromarray(sh_r_arr)

    raw_layers = {
        "hair_back": hair_back_raw,
        "cape_back": cape_back_raw,
        "pelvis": pelvis_raw,
        "thigh_r": thigh_r_raw,
        "shin_r": shin_r_raw,
        "foot_r": foot_r_raw,
        "thigh_l": thigh_l_raw,
        "shin_l": shin_l_raw,
        "foot_l": foot_l_raw,
        "upperarm_r": upperarm_r_raw,
        "forearm_r": forearm_r_raw,
        "hand_r": hand_r_raw,
        "upperarm_l": upperarm_l_raw,
        "forearm_l": forearm_l_raw,
        "hand_l": hand_l_raw,
        "torso": torso_raw,
        "neck": neck_img,
        "satchel": satchel_raw,
        "head": head_raw,
        "eye_r": eye_r_raw,
        "eye_l": eye_l_raw,
        "brow_r": brow_r_raw,
        "brow_l": brow_l_raw,
        "mouth": mouth_raw,
        "hair_side_r": hair_side_r_raw,
        "hair_side_l": hair_side_l_raw,
        "hair_front": hair_front_raw,
        # Expressions
        "eye_blink_l": eye_blink_l_raw,
        "eye_blink_r": eye_blink_r_raw,
        "eye_happy_l": eye_happy_l_raw,
        "eye_happy_r": eye_happy_r_raw,
        "eye_star_l": eye_star_l_raw,
        "eye_star_r": eye_star_r_raw,
        "eye_smug_l": eye_smug_l_raw,
        "eye_smug_r": eye_smug_r_raw,
        "eye_surprised_l": eye_surprised_l_raw,
        "eye_surprised_r": eye_surprised_r_raw,
        "mouth_happy": mouth_happy_raw,
        "mouth_yawn": mouth_yawn_raw,
        "mouth_smirk": mouth_smirk_raw,
        "mouth_surprised": mouth_surprised_raw,
        # Alternate hands
        "hand_open_l": hand_open_l_raw,
        "hand_open_r": hand_open_r_raw,
        "hand_point": hand_point_raw,
        "hand_fist": hand_fist_raw,
        # Modular gear
        "hat_explorer": hat_img,
        "hair_short": hair_short_img,
        "outfit_adventurer": outfit_adv_img,
        "shoes_boots_l": shoes_l_img,
        "shoes_boots_r": shoes_r_img,
    }

    def map_c00(c00_x, c00_y):
        cx = int(round(300 + (c00_x - 85.5) * SCALE))
        cy = int(round(690 - (233 - c00_y) * SCALE))
        return (cx, cy)

    # Coordinated positions matching test_clean_order.png:
    comp_positions_c00 = {
        "hair_back": (28, 15),
        "cape_back": (31, 85),
        "pelvis": (45, 150),
        "thigh_l": (56, 126),
        "shin_l": (56, 168),
        "foot_l": (56, 198),
        "thigh_r": (87, 126),
        "shin_r": (87, 168),
        "foot_r": (87, 198),
        # Arms placed behind torso at (18, 118) and (108, 118)
        "upperarm_l": (18, 118),
        "forearm_l": (18, 148),
        "hand_l": (16, 166),
        "upperarm_r": (108, 118),
        "forearm_r": (108, 148),
        "hand_r": (126, 166),
        "torso": (36, 101),
        "neck": (76, 100),
        "satchel": (60, 130),
        "head": (38, 18),
        "eye_l": (42, 69),
        "eye_r": (88, 68),
        "brow_l": (44, 60),
        "brow_r": (90, 59),
        "mouth": (69, 88),
        "hair_side_l": (36, 20),
        "hair_side_r": (95, 20),
        "hair_front": (24, 14),
        # Expressions align directly with eyes and mouth
        "eye_blink_l": (42, 69),
        "eye_blink_r": (88, 68),
        "eye_happy_l": (42, 69),
        "eye_happy_r": (88, 68),
        "eye_star_l": (42, 69),
        "eye_star_r": (88, 68),
        "eye_smug_l": (42, 69),
        "eye_smug_r": (88, 68),
        "eye_surprised_l": (42, 69),
        "eye_surprised_r": (88, 68),
        "mouth_happy": (69, 88),
        "mouth_yawn": (69, 88),
        "mouth_smirk": (69, 88),
        "mouth_surprised": (69, 88),
        # Modular gear
        "hat_explorer": (16, 2),
        "hair_short": (24, 14),
        "outfit_adventurer": (36, 101),
        "shoes_boots_l": (56, 198),
        "shoes_boots_r": (87, 198),
        "hand_open_l": (16, 166),
        "hand_open_r": (126, 166),
        "hand_point": (126, 166),
        "hand_fist": (16, 166),
    }

    manifest = []
    upscaled_layers = {}

    print("\nUpscaling and cropping all character layers...")
    for name, raw in raw_layers.items():
        scaled = upscale(raw, factor=SCALE)
        bbox = scaled.getbbox()
        if bbox is None:
            bbox = (0, 0, scaled.width, scaled.height)
        cropped = scaled.crop(bbox)

        layer_file = os.path.join(OUTPUT_DIR, f"{name}.png")
        cropped.save(layer_file, "PNG")
        upscaled_layers[name] = cropped

        # Calculate canvas placement
        c00_pos = comp_positions_c00.get(name, (85, 100))
        base_canvas_pos = map_c00(c00_pos[0], c00_pos[1])
        layer_left = base_canvas_pos[0] + bbox[0]
        layer_top = base_canvas_pos[1] + bbox[1]

        entry = {
            "name": name,
            "left": layer_left,
            "top": layer_top,
            "width": cropped.width,
            "height": cropped.height,
            "center_x": layer_left + cropped.width / 2.0,
            "center_y": layer_top + cropped.height / 2.0,
            "file": layer_file
        }
        manifest.append(entry)

    manifest_path = os.path.join(BASE_DIR, "scripts/luna_real_manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"Saved manifest with {len(manifest)} layers to: {manifest_path}")

    # Build full composite preview
    print("\nRendering full character composite preview...")
    comp = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    layer_map = {m["name"]: m for m in manifest}

    draw_order = [
        "hair_back",
        "cape_back",
        "thigh_r", "shin_r", "foot_r",
        "thigh_l", "shin_l", "foot_l",
        "pelvis",
        "upperarm_r", "forearm_r", "hand_r",
        "upperarm_l", "forearm_l", "hand_l",
        "torso",
        "satchel",
        "head",
        "eye_r", "eye_l",
        "brow_r", "brow_l",
        "mouth",
        "hair_side_r", "hair_side_l", "hair_front"
    ]

    for layer_name in draw_order:
        if layer_name in layer_map and layer_name in upscaled_layers:
            m = layer_map[layer_name]
            img = upscaled_layers[layer_name]
            comp.alpha_composite(img, (m["left"], m["top"]))

    preview_path = os.path.join(BASE_DIR, "scripts/luna_assembled_preview.png")
    comp.save(preview_path, "PNG")
    print(f"Saved full assembled preview to: {preview_path}")

if __name__ == "__main__":
    main()
