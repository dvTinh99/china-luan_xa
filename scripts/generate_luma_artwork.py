#!/usr/bin/env python3
"""
Generate production-ready layered 2D Anime Chibi Fantasy artwork for Luma (LinguaWorld).
Strictly adheres to CHARACTER_CONCEPT.md, CHIBI_CHARACTER.md, and EQUIPMENT_CONCEPT.md:
- Anime Chibi Fantasy, 2.6 heads tall.
- Soft dark-brown outlines (#49352F), never harsh pure black.
- Soft cel-shading with 2-3 levels (base, warm shadow, gentle highlight).
- Expressive anime chibi eyes with multi-tone sage/amber irises and crisp highlights.
- Full modular parts for base character and interchangeable equipment.
"""

import math
import os
import json
from PIL import Image, ImageDraw, ImageFilter

CANVAS_W = 600
CANVAS_H = 800
SCALE = 2  # 2x supersampling for ultra-crisp antialiasing

def sc(val):
    if isinstance(val, (int, float)):
        return int(round(val * SCALE))
    if isinstance(val, (list, tuple)):
        return tuple(sc(x) for x in val)
    return val

# ── Color Palette ─────────────────────────────────────────────────────────────
OUTLINE = (73, 53, 47, 255)         # #49352F Soft dark brown
OUTLINE_INNER = (92, 61, 46, 255)   # #5C3D2E Subtle inner crease
SKIN_BASE = (245, 217, 196, 255)    # #F5D9C4 Warm anime peach skin
SKIN_SHADOW = (232, 191, 168, 255)  # #E8BFA8 Warm skin shadow
BLUSH = (252, 165, 165, 175)        # #FCA5A5 Soft cheek blush
WHITE = (255, 255, 255, 255)

# Hair (Warm adventurer brown)
HAIR_BASE = (74, 55, 40, 255)       # #4A3728
HAIR_SHADOW = (51, 35, 23, 255)     # #332317
HAIR_HIGHLIGHT = (110, 82, 60, 255) # #6E523C

# Outfits - Explorer Default
TUNIC_BASE = (253, 251, 247, 255)   # #FDFBF7 Warm cream linen
TUNIC_SHADOW = (229, 222, 209, 255) # #E5DED1
JACKET_BASE = (82, 121, 111, 255)   # #52796F Sage green adventurer jacket
JACKET_SHADOW = (53, 79, 82, 255)   # #354F52
JACKET_HIGHLIGHT = (132, 169, 140, 255) # #84A98C
LEATHER_BASE = (139, 90, 43, 255)   # #8B5A2B Oiled travel leather
LEATHER_SHADOW = (92, 61, 30, 255)  # #5C3D1E
GOLD_BASE = (224, 169, 109, 255)    # #E0A96D Brass/gold emblem
GOLD_SHADOW = (176, 125, 75, 255)   # #B07D4B
GOLD_SHINE = (254, 240, 138, 255)   # #FEF08A

# Ranger Outfit Variation
RANGER_LEATHER = (107, 72, 45, 255)
RANGER_LEATHER_SHADOW = (75, 48, 28, 255)
FOREST_GREEN = (45, 106, 79, 255)
FOREST_GREEN_SHADOW = (27, 67, 50, 255)

# Eyes (Sage / Amber fantasy anime eyes)
EYE_SCLERA = (251, 249, 245, 255)
EYE_SCLERA_SHADOW = (226, 217, 204, 255)
IRIS_TOP = (53, 79, 82, 255)        # Deep top lid shadow
IRIS_MID = (82, 121, 111, 255)      # Sage teal
IRIS_LIGHT = (132, 169, 140, 255)   # Luminous lower reflection
PUPIL = (34, 23, 17, 255)           # Soft dark pupil

# Helper: create supersampled drawing canvas
def new_layer():
    img = Image.new("RGBA", (CANVAS_W * SCALE, CANVAS_H * SCALE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    return img, draw

layers = {}

# ── 1. HAIR BACK ──────────────────────────────────────────────────────────────
def draw_hair_back():
    img, draw = new_layer()
    # Flowing adventurer hair behind neck and shoulders
    pts = [
        (220, 350), (190, 400), (185, 460), (200, 520), (230, 545),
        (260, 530), (285, 515), (300, 510), (315, 515), (340, 530),
        (370, 545), (400, 520), (415, 460), (410, 400), (380, 350),
        (300, 340)
    ]
    draw.polygon(sc(pts), fill=HAIR_SHADOW)
    pts_inner = [
        (225, 360), (200, 410), (195, 460), (210, 510), (240, 530),
        (280, 505), (300, 500), (320, 505), (360, 530), (390, 510),
        (405, 460), (400, 410), (375, 360), (300, 350)
    ]
    draw.polygon(sc(pts_inner), fill=HAIR_BASE)
    draw.line(sc(pts), fill=OUTLINE, width=sc(2.5), joint="curve")
    return img

layers["hair_back"] = draw_hair_back()

# ── 2. ACCESSORY BACK (Traveler Cape / Mantle) ─────────────────────────────────
def draw_accessory_back_cape():
    img, draw = new_layer()
    cape_pts = [
        (255, 475), (230, 540), (220, 615), (250, 625), (280, 605),
        (300, 615), (320, 605), (350, 625), (380, 615), (370, 540),
        (345, 475), (300, 480)
    ]
    draw.polygon(sc(cape_pts), fill=JACKET_SHADOW)
    cape_inner = [
        (260, 485), (240, 540), (230, 605), (260, 615), (285, 595),
        (300, 605), (315, 595), (340, 615), (370, 605), (360, 540),
        (340, 485), (300, 490)
    ]
    draw.polygon(sc(cape_inner), fill=JACKET_BASE)
    draw.line(sc(cape_pts), fill=OUTLINE, width=sc(2.2), joint="curve")
    return img

layers["cape_back"] = draw_accessory_back_cape()

# ── 3. PELVIS (Hips / Shorts) ──────────────────────────────────────────────────
def draw_pelvis():
    img, draw = new_layer()
    pts = [
        (255, 560), (250, 595), (275, 615), (300, 605), (325, 615),
        (350, 595), (345, 560)
    ]
    draw.polygon(sc(pts), fill=LEATHER_SHADOW)
    pts_inner = [
        (258, 565), (255, 590), (275, 610), (300, 600), (325, 610),
        (345, 590), (342, 565)
    ]
    draw.polygon(sc(pts_inner), fill=LEATHER_BASE)
    draw.line(sc(pts), fill=OUTLINE, width=sc(2.5), joint="curve")
    draw.rectangle(sc([290, 562, 310, 572]), fill=GOLD_BASE, outline=OUTLINE, width=sc(1.5))
    return img

layers["pelvis"] = draw_pelvis()

# ── 4. LEGS & FEET ─────────────────────────────────────────────────────────────
def draw_thigh(is_left):
    img, draw = new_layer()
    cx = 332 if is_left else 268
    pts = [
        (cx - 16, 590), (cx - 14, 655), (cx + 14, 655), (cx + 16, 590)
    ]
    draw.polygon(sc(pts), fill=SKIN_SHADOW)
    draw.polygon(sc([(cx - 13, 592), (cx - 11, 652), (cx + 11, 652), (cx + 13, 592)]), fill=SKIN_BASE)
    draw.line(sc(pts + [pts[0]]), fill=OUTLINE, width=sc(2.2))
    return img

def draw_shin(is_left):
    img, draw = new_layer()
    cx = 332 if is_left else 268
    pts = [
        (cx - 14, 650), (cx - 13, 705), (cx + 13, 705), (cx + 14, 650)
    ]
    draw.polygon(sc(pts), fill=SKIN_SHADOW)
    draw.polygon(sc([(cx - 11, 652), (cx - 10, 703), (cx + 10, 703), (cx + 11, 652)]), fill=SKIN_BASE)
    draw.line(sc(pts + [pts[0]]), fill=OUTLINE, width=sc(2.2))
    return img

def draw_boot(is_left):
    img, draw = new_layer()
    cx = 335 if is_left else 265
    draw.rounded_rectangle(sc([cx - 18, 692, cx + 18, 708]), radius=sc(4), fill=TUNIC_BASE, outline=OUTLINE, width=sc(2))
    toe_x = cx + 22 if is_left else cx - 22
    boot_pts = [
        (cx - 15, 705), (cx - 15, 735), (toe_x, 735), (toe_x, 725), (cx + 12 if is_left else cx - 12, 715), (cx + 15, 705)
    ]
    draw.polygon(sc(boot_pts), fill=LEATHER_SHADOW)
    draw.polygon(sc([(p[0] * 0.95 + cx * 0.05, p[1] * 0.95 + 715 * 0.05) for p in boot_pts]), fill=LEATHER_BASE)
    draw.line(sc(boot_pts + [boot_pts[0]]), fill=OUTLINE, width=sc(2.5), joint="curve")
    draw.rectangle(sc([cx - 4, 715, cx + 4, 723]), fill=GOLD_BASE, outline=OUTLINE, width=sc(1.2))
    return img

layers["thigh_l"] = draw_thigh(True)
layers["thigh_r"] = draw_thigh(False)
layers["shin_l"] = draw_shin(True)
layers["shin_r"] = draw_shin(False)
layers["foot_l"] = draw_boot(True)
layers["foot_r"] = draw_boot(False)

# ── 5. TORSO (Explorer Tunic & Sage Jacket) ────────────────────────────────────
def draw_torso():
    img, draw = new_layer()
    tunic_pts = [
        (275, 470), (255, 520), (252, 570), (348, 570), (345, 520), (325, 470)
    ]
    draw.polygon(sc(tunic_pts), fill=TUNIC_SHADOW)
    draw.polygon(sc([(p[0] * 0.96 + 300 * 0.04, p[1] * 0.96 + 520 * 0.04) for p in tunic_pts]), fill=TUNIC_BASE)
    draw.line(sc(tunic_pts + [tunic_pts[0]]), fill=OUTLINE, width=sc(2.2))

    lapel_l = [(280, 472), (260, 520), (255, 565), (290, 565), (292, 510)]
    draw.polygon(sc(lapel_l), fill=JACKET_BASE)
    draw.line(sc(lapel_l + [lapel_l[0]]), fill=OUTLINE, width=sc(2))

    lapel_r = [(320, 472), (340, 520), (345, 565), (310, 565), (308, 510)]
    draw.polygon(sc(lapel_r), fill=JACKET_BASE)
    draw.line(sc(lapel_r + [lapel_r[0]]), fill=OUTLINE, width=sc(2))

    belt_rect = [252, 550, 348, 568]
    draw.rectangle(sc(belt_rect), fill=LEATHER_BASE, outline=OUTLINE, width=sc(2))
    draw.rounded_rectangle(sc([288, 547, 312, 571]), radius=sc(3), fill=GOLD_BASE, outline=OUTLINE, width=sc(2))
    draw.rounded_rectangle(sc([293, 552, 307, 566]), radius=sc(2), fill=LEATHER_SHADOW, outline=OUTLINE, width=sc(1))
    return img

layers["torso"] = draw_torso()

# ── 6. NECK ───────────────────────────────────────────────────────────────────
def draw_neck():
    img, draw = new_layer()
    pts = [(288, 445), (288, 480), (312, 480), (312, 445)]
    draw.polygon(sc(pts), fill=SKIN_SHADOW)
    draw.polygon(sc([(291, 448), (291, 477), (309, 477), (309, 448)]), fill=SKIN_BASE)
    draw.line(sc(pts + [pts[0]]), fill=OUTLINE, width=sc(2))
    return img

layers["neck"] = draw_neck()

# ── 7. ARMS & HANDS ───────────────────────────────────────────────────────────
def draw_upperarm(is_left):
    img, draw = new_layer()
    cx = 362 if is_left else 238
    pts = [(cx - 16, 480), (cx - 14, 535), (cx + 14, 535), (cx + 16, 480)]
    draw.polygon(sc(pts), fill=JACKET_SHADOW)
    draw.polygon(sc([(cx - 13, 483), (cx - 11, 532), (cx + 11, 532), (cx + 13, 483)]), fill=JACKET_BASE)
    draw.line(sc(pts + [pts[0]]), fill=OUTLINE, width=sc(2.2))
    draw.line(sc([(cx - 14, 526), (cx + 14, 526)]), fill=OUTLINE, width=sc(1.8))
    return img

def draw_forearm(is_left):
    img, draw = new_layer()
    cx = 372 if is_left else 228
    pts = [(cx - 12, 530), (cx - 10, 585), (cx + 10, 585), (cx + 12, 530)]
    draw.polygon(sc(pts), fill=SKIN_SHADOW)
    draw.polygon(sc([(cx - 9, 532), (cx - 8, 583), (cx + 8, 583), (cx + 9, 532)]), fill=SKIN_BASE)
    draw.line(sc(pts + [pts[0]]), fill=OUTLINE, width=sc(2))
    return img

def draw_hand(is_left):
    img, draw = new_layer()
    cx = 380 if is_left else 220
    thumb_x = cx - 12 if is_left else cx + 12
    draw.ellipse(sc([cx - 12, 582, cx + 12, 612]), fill=SKIN_BASE, outline=OUTLINE, width=sc(2))
    draw.ellipse(sc([thumb_x - 5, 588, thumb_x + 5, 600]), fill=SKIN_BASE, outline=OUTLINE, width=sc(1.8))
    return img

layers["upperarm_l"] = draw_upperarm(True)
layers["upperarm_r"] = draw_upperarm(False)
layers["forearm_l"] = draw_forearm(True)
layers["forearm_r"] = draw_forearm(False)
layers["hand_l"] = draw_hand(True)
layers["hand_r"] = draw_hand(False)

# ── 8. HEAD & FACE ────────────────────────────────────────────────────────────
def draw_head():
    img, draw = new_layer()
    head_box = [195, 275, 405, 455]
    draw.ellipse(sc(head_box), fill=SKIN_SHADOW)
    draw.ellipse(sc([200, 280, 400, 450]), fill=SKIN_BASE)
    draw.ellipse(sc(head_box), outline=OUTLINE, width=sc(2.8))

    draw.ellipse(sc([188, 360, 204, 388]), fill=SKIN_BASE, outline=OUTLINE, width=sc(2))
    draw.ellipse(sc([192, 366, 200, 380]), fill=SKIN_SHADOW)
    draw.ellipse(sc([396, 360, 412, 388]), fill=SKIN_BASE, outline=OUTLINE, width=sc(2))
    draw.ellipse(sc([400, 366, 408, 380]), fill=SKIN_SHADOW)

    draw.ellipse(sc([225, 395, 265, 415]), fill=BLUSH)
    draw.ellipse(sc([238, 401, 244, 407]), fill=WHITE)
    draw.ellipse(sc([335, 395, 375, 415]), fill=BLUSH)
    draw.ellipse(sc([356, 401, 362, 407]), fill=WHITE)
    return img

layers["head"] = draw_head()

def draw_eye(is_left):
    img, draw = new_layer()
    cx = 345 if is_left else 255
    cy = 365
    w, h = 26, 32

    eye_box = [cx - w, cy - h, cx + w, cy + h]
    draw.ellipse(sc(eye_box), fill=EYE_SCLERA, outline=OUTLINE, width=sc(2))
    draw.chord(sc(eye_box), start=180, end=360, fill=EYE_SCLERA_SHADOW)

    iris_box = [cx - w * 0.72, cy - h * 0.85, cx + w * 0.72, cy + h * 0.85]
    draw.ellipse(sc(iris_box), fill=IRIS_TOP)
    draw.chord(sc(iris_box), start=0, end=180, fill=IRIS_MID)
    draw.chord(sc([cx - w * 0.65, cy, cx + w * 0.65, cy + h * 0.8]), start=0, end=180, fill=IRIS_LIGHT)

    draw.ellipse(sc([cx - 6, cy - 8, cx + 6, cy + 8]), fill=PUPIL)
    draw.ellipse(sc([cx + (2 if is_left else -6), cy - 16, cx + (12 if is_left else 4), cy - 6]), fill=WHITE)
    draw.ellipse(sc([cx - (8 if is_left else 2), cy + 4, cx - (3 if is_left else -3), cy + 9]), fill=WHITE)

    lash_pts = [(cx - w - 2, cy - 6), (cx - w * 0.5, cy - h - 3), (cx + w * 0.5, cy - h - 3), (cx + w + 4, cy - 4)]
    draw.line(sc(lash_pts), fill=OUTLINE, width=sc(3.5), joint="curve")
    return img

layers["eye_l"] = draw_eye(True)
layers["eye_r"] = draw_eye(False)

def draw_eyebrow(is_left):
    img, draw = new_layer()
    cx = 345 if is_left else 255
    cy = 325
    pts = [(cx - 20, cy + 3), (cx, cy - 4), (cx + 20, cy + 1)] if is_left else [(cx - 20, cy + 1), (cx, cy - 4), (cx + 20, cy + 3)]
    draw.line(sc(pts), fill=HAIR_BASE, width=sc(3), joint="curve")
    return img

layers["brow_l"] = draw_eyebrow(True)
layers["brow_r"] = draw_eyebrow(False)

def draw_mouth():
    img, draw = new_layer()
    mouth_pts = [(292, 420), (300, 429), (308, 420)]
    draw.polygon(sc(mouth_pts), fill=(217, 83, 79, 255))
    draw.line(sc(mouth_pts + [(292, 420)]), fill=OUTLINE, width=sc(2))
    return img

layers["mouth"] = draw_mouth()

def draw_nose():
    img, draw = new_layer()
    draw.ellipse(sc([298, 396, 302, 400]), fill=OUTLINE_INNER)
    return img

layers["nose"] = draw_nose()

# ── 9. HAIR FRONT & SIDES ─────────────────────────────────────────────────────
def draw_hair_front():
    img, draw = new_layer()
    bangs_pts = [
        (205, 335), (225, 375), (240, 345), (265, 385), (280, 350),
        (300, 390), (320, 350), (335, 385), (360, 345), (375, 375),
        (395, 335), (380, 275), (300, 260), (220, 275)
    ]
    draw.polygon(sc(bangs_pts), fill=HAIR_SHADOW)
    draw.polygon(sc([(p[0] * 0.96 + 300 * 0.04, p[1] * 0.96 + 320 * 0.04) for p in bangs_pts]), fill=HAIR_BASE)
    draw.line(sc(bangs_pts + [bangs_pts[0]]), fill=OUTLINE, width=sc(2.6), joint="curve")

    ahoge_pts = [
        (296, 262), (288, 235), (294, 205), (312, 190), (318, 195),
        (308, 220), (306, 245), (304, 262)
    ]
    draw.polygon(sc(ahoge_pts), fill=HAIR_BASE)
    draw.line(sc(ahoge_pts), fill=OUTLINE, width=sc(2.2), joint="curve")
    draw.line(sc([(235, 310), (275, 315), (325, 315), (365, 310)]), fill=HAIR_HIGHLIGHT, width=sc(3))
    return img

def draw_hair_side(is_left):
    img, draw = new_layer()
    cx = 385 if is_left else 215
    pts = [
        (cx - 15, 330), (cx - 10, 420), (cx + 5, 455), (cx + 15, 420), (cx + 10, 330)
    ] if is_left else [
        (cx - 10, 330), (cx - 15, 420), (cx - 5, 455), (cx + 10, 420), (cx + 15, 330)
    ]
    draw.polygon(sc(pts), fill=HAIR_BASE)
    draw.line(sc(pts + [pts[0]]), fill=OUTLINE, width=sc(2.2), joint="curve")
    return img

layers["hair_front"] = draw_hair_front()
layers["hair_side_l"] = draw_hair_side(True)
layers["hair_side_r"] = draw_hair_side(False)

# ── 10. DEFAULT EQUIPMENT: BERET & SATCHEL ────────────────────────────────────
def draw_hat_adventurer():
    img, draw = new_layer()
    beret_pts = [
        (215, 290), (200, 250), (240, 220), (310, 210), (370, 225),
        (395, 260), (375, 295), (300, 280)
    ]
    draw.polygon(sc(beret_pts), fill=JACKET_SHADOW)
    draw.polygon(sc([(p[0] * 0.95 + 300 * 0.05, p[1] * 0.95 + 255 * 0.05) for p in beret_pts]), fill=JACKET_BASE)
    draw.line(sc(beret_pts + [beret_pts[0]]), fill=OUTLINE, width=sc(2.6), joint="curve")
    draw.ellipse(sc([350, 245, 368, 263]), fill=GOLD_BASE, outline=OUTLINE, width=sc(1.8))
    draw.line(sc([(353, 259), (365, 249)]), fill=GOLD_SHINE, width=sc(1.5))
    return img

def draw_satchel_front():
    img, draw = new_layer()
    strap = [(265, 475), (275, 470), (345, 555), (335, 560)]
    draw.polygon(sc(strap), fill=LEATHER_SHADOW)
    draw.line(sc(strap + [strap[0]]), fill=OUTLINE, width=sc(1.8))
    bag_box = [325, 545, 365, 585]
    draw.rounded_rectangle(sc(bag_box), radius=sc(6), fill=LEATHER_BASE, outline=OUTLINE, width=sc(2.2))
    draw.rectangle(sc([325, 545, 365, 565]), fill=LEATHER_SHADOW, outline=OUTLINE, width=sc(1.8))
    draw.rectangle(sc([340, 560, 350, 570]), fill=GOLD_BASE, outline=OUTLINE, width=sc(1.5))
    return img

layers["hat_adventurer"] = draw_hat_adventurer()
layers["accessory_front_satchel"] = draw_satchel_front()

# ── 11. MODULAR GEAR VARIATIONS ────────────────────────────────────────────────
def draw_hair_short():
    img, draw = new_layer()
    pts = [
        (210, 340), (230, 365), (250, 345), (275, 370), (300, 350),
        (325, 370), (350, 345), (370, 365), (390, 340), (380, 275),
        (300, 260), (220, 275)
    ]
    draw.polygon(sc(pts), fill=HAIR_BASE)
    draw.line(sc(pts + [pts[0]]), fill=OUTLINE, width=sc(2.4), joint="curve")
    return img

def draw_hat_hood():
    img, draw = new_layer()
    pts = [
        (190, 280), (220, 230), (300, 215), (380, 230), (410, 280),
        (390, 340), (360, 370), (300, 360), (240, 370), (210, 340)
    ]
    draw.polygon(sc(pts), fill=RANGER_LEATHER)
    draw.line(sc(pts + [pts[0]]), fill=OUTLINE, width=sc(2.5), joint="curve")
    return img

def draw_outfit_ranger():
    img, draw = new_layer()
    pts = [(265, 470), (245, 520), (242, 570), (358, 570), (355, 520), (335, 470)]
    draw.polygon(sc(pts), fill=FOREST_GREEN)
    draw.line(sc(pts + [pts[0]]), fill=OUTLINE, width=sc(2.2))
    vest_l = [(270, 472), (250, 520), (248, 565), (290, 565), (290, 510)]
    draw.polygon(sc(vest_l), fill=RANGER_LEATHER)
    draw.line(sc(vest_l + [vest_l[0]]), fill=OUTLINE, width=sc(2))
    vest_r = [(330, 472), (350, 520), (352, 565), (310, 565), (310, 510)]
    draw.polygon(sc(vest_r), fill=RANGER_LEATHER)
    draw.line(sc(vest_r + [vest_r[0]]), fill=OUTLINE, width=sc(2))
    return img

def draw_shoes_sandals(is_left):
    img, draw = new_layer()
    cx = 335 if is_left else 265
    toe_x = cx + 20 if is_left else cx - 20
    min_x = min(cx - 14, toe_x)
    max_x = max(cx + 14, toe_x)
    draw.rectangle(sc([min_x, 730, max_x, 738]), fill=LEATHER_SHADOW, outline=OUTLINE, width=sc(2))
    draw.line(sc([(cx - 10, 705), (cx + 8, 732)]), fill=LEATHER_BASE, width=sc(2.5))
    draw.line(sc([(cx + 10, 705), (cx - 8, 732)]), fill=LEATHER_BASE, width=sc(2.5))
    return img

def draw_accessory_scarf():
    img, draw = new_layer()
    scarf_pts = [
        (275, 455), (260, 475), (270, 495), (330, 495), (340, 475), (325, 455)
    ]
    draw.polygon(sc(scarf_pts), fill=(217, 131, 90, 255))
    draw.line(sc(scarf_pts + [scarf_pts[0]]), fill=OUTLINE, width=sc(2.2), joint="curve")
    tail = [(315, 495), (310, 550), (335, 545), (330, 495)]
    draw.polygon(sc(tail), fill=(217, 131, 90, 255))
    draw.line(sc(tail + [tail[0]]), fill=OUTLINE, width=sc(2), joint="curve")
    return img

layers["hair_short"] = draw_hair_short()
layers["hat_hood"] = draw_hat_hood()
layers["outfit_ranger"] = draw_outfit_ranger()
layers["shoes_sandals_l"] = draw_shoes_sandals(True)
layers["shoes_sandals_r"] = draw_shoes_sandals(False)
layers["accessory_front_scarf"] = draw_accessory_scarf()

# ── Save individual cropped layer sprites ─────────────────────────────────────
base_dir = os.path.dirname(os.path.abspath(__file__))
out_dir = os.path.join(base_dir, "luma_layers")
os.makedirs(out_dir, exist_ok=True)
manifest = []

for name, img_scaled in layers.items():
    img = img_scaled.resize((CANVAS_W, CANVAS_H), Image.Resampling.LANCZOS)
    bbox = img.getbbox()
    if not bbox:
        continue
    l = max(0, bbox[0] - 2)
    t = max(0, bbox[1] - 2)
    r = min(CANVAS_W, bbox[2] + 2)
    b = min(CANVAS_H, bbox[3] + 2)
    cropped = img.crop((l, t, r, b))
    png_path = os.path.join(out_dir, f"{name}.png")
    cropped.save(png_path, "PNG")
    manifest.append({
        "name": name,
        "left": l,
        "top": t,
        "width": cropped.width,
        "height": cropped.height,
        "file": png_path
    })

manifest_path = os.path.join(base_dir, "luma_manifest.json")
with open(manifest_path, "w") as f:
    json.dump(manifest, f, indent=2)

print(f"Generated {len(manifest)} layers in {out_dir}")
