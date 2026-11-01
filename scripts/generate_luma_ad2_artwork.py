#!/usr/bin/env python3
"""
Generate Super Deformed (SD) Fantasy Anime Chibi artwork for Luma Art Direction 2.0.
Strictly implements the specification:
- Super Deformed Proportions: ~2.1 heads tall. Head is ~48% of total height.
- Soft Dark Plum outlines (#493747).
- Fantasy Pastel Palette with vibrant accents:
  * Mystic Lavender: #B9A0D9
  * Fantasy Blue: #78A9D9
  * Royal Teal: #579E9B
  * Warm Gold: #E8B76B
  * Rose Pink: #E9A8B9
  * Soft Cream: #F8EBD5
  * Dark Plum Outline: #493747
  * Nature Green: #9CC8A1
  * Warm Skin: #F5D9C4
- Multi-layered anime chibi eyes with deep pupils, dual highlights, and crescent iris glow.
- Modular equipment: default costume, cape, hat, pendant, alternate hair, outfit, boots, and facial expressions.
"""

import math
import os
import json
from PIL import Image, ImageDraw, ImageFilter

CANVAS_W = 600
CANVAS_H = 800
SCALE = 2  # 2x supersampling for high-quality antialiasing

def sc(val):
    if isinstance(val, (int, float)):
        return int(round(val * SCALE))
    if isinstance(val, (list, tuple)):
        return tuple(sc(x) for x in val)
    return val

# ── Palette Definitions ────────────────────────────────────────────────────────
OUTLINE = (73, 55, 71, 255)            # #493747 Dark Plum Outline
OUTLINE_INNER = (105, 78, 102, 255)    # Subtle inner crease plum
SKIN_BASE = (245, 217, 196, 255)       # #F5D9C4 Warm peach skin
SKIN_SHADOW = (232, 191, 168, 255)     # #E8BFA8 Soft skin shadow
BLUSH = (233, 168, 185, 200)           # #E9A8B9 Rosy cheek blush
BLUSH_CORE = (235, 140, 165, 220)
WHITE = (255, 255, 255, 255)

# Hair (Cozy chestnut with subtle lavender undertone)
HAIR_BASE = (82, 60, 75, 255)          # #523C4B Rich plum brown
HAIR_SHADOW = (56, 38, 51, 255)        # #382633
HAIR_HIGHLIGHT = (148, 110, 136, 255)  # #946E88 Soft lavender-plum sheen
HAIR_RING = (232, 183, 107, 180)       # #E8B76B Angel ring golden glow

# Alternate Hair (Soft Golden Blonde)
HAIR2_BASE = (228, 186, 125, 255)
HAIR2_SHADOW = (189, 145, 87, 255)
HAIR2_HIGHLIGHT = (250, 226, 180, 255)

# Outfits - Default Fantasy Explorer
CREAM_TUNIC = (248, 235, 213, 255)     # #F8EBD5 Soft Cream
CREAM_SHADOW = (224, 206, 178, 255)
FANTASY_BLUE = (120, 169, 217, 255)    # #78A9D9 Fantasy Blue
FANTASY_BLUE_SHADOW = (86, 131, 179, 255)
ROYAL_TEAL = (87, 158, 155, 255)       # #579E9B Royal Teal
ROYAL_TEAL_SHADOW = (58, 118, 115, 255)
MYSTIC_LAVENDER = (185, 160, 217, 255) # #B9A0D9 Mystic Lavender
LAVENDER_SHADOW = (148, 122, 181, 255)
LAVENDER_LIGHT = (216, 198, 238, 255)
ROSE_PINK = (233, 168, 185, 255)       # #E9A8B9 Rose Pink
NATURE_GREEN = (156, 200, 161, 255)    # #9CC8A1 Nature Green
WARM_GOLD = (232, 183, 107, 255)       # #E8B76B Warm Gold
GOLD_SHINE = (255, 243, 188, 255)
GOLD_SHADOW = (184, 138, 68, 255)
LEATHER_BASE = (130, 84, 60, 255)
LEATHER_SHADOW = (92, 56, 38, 255)

# Eyes (Multi-layered Fantasy Teal & Blue)
EYE_SCLERA = (252, 250, 248, 255)
IRIS_TOP = (45, 85, 96, 255)           # Deep teal-navy top shade
IRIS_MID = (120, 169, 217, 255)        # Vibrant fantasy blue
IRIS_BOTTOM = (185, 160, 217, 255)     # Mystic lavender lower glow
IRIS_GLOW = (233, 168, 185, 255)       # Rose pink lower rim fleck
PUPIL = (42, 29, 43, 255)              # Deep dark plum pupil

class ArtworkCanvas:
    def __init__(self):
        self.w = CANVAS_W * SCALE
        self.h = CANVAS_H * SCALE
        self.img = Image.new("RGBA", (self.w, self.h), (0, 0, 0, 0))
        self.draw = ImageDraw.Draw(self.img)

    def downsample(self):
        return self.img.resize((CANVAS_W, CANVAS_H), Image.Resampling.LANCZOS)

def draw_capsule(draw, p1, p2, radius, fill, outline=None, width=3):
    x1, y1 = sc(p1)
    x2, y2 = sc(p2)
    r = sc(radius)
    w = sc(width)

    dx = x2 - x1
    dy = y2 - y1
    dist = math.hypot(dx, dy)
    if dist < 1e-4:
        draw.ellipse([x1 - r, y1 - r, x1 + r, y1 + r], fill=fill, outline=outline, width=w)
        return

    nx = -dy / dist * r
    ny = dx / dist * r

    poly = [
        (x1 + nx, y1 + ny),
        (x2 + nx, y2 + ny),
        (x2 - nx, y2 - ny),
        (x1 - nx, y1 - ny)
    ]
    draw.polygon(poly, fill=fill)
    draw.ellipse([x1 - r, y1 - r, x1 + r, y1 + r], fill=fill)
    draw.ellipse([x2 - r, y2 - r, x2 + r, y2 + r], fill=fill)

    if outline:
        draw.line([(x1 + nx, y1 + ny), (x2 + nx, y2 + ny)], fill=outline, width=w)
        draw.line([(x1 - nx, y1 - ny), (x2 - nx, y2 - ny)], fill=outline, width=w)
        draw.arc([x1 - r, y1 - r, x1 + r, y1 + r],
                 start=math.degrees(math.atan2(-ny, -nx)) - 90,
                 end=math.degrees(math.atan2(-ny, -nx)) + 90,
                 fill=outline, width=w)
        draw.arc([x2 - r, y2 - r, x2 + r, y2 + r],
                 start=math.degrees(math.atan2(ny, nx)) - 90,
                 end=math.degrees(math.atan2(ny, nx)) + 90,
                 fill=outline, width=w)

# ══════════════════════════════════════════════════════════════════════════════
# LAYER GENERATORS (SD PROPORTIONS: ~2.1 HEADS TALL)
# ══════════════════════════════════════════════════════════════════════════════

def create_layer_hair_back():
    """Voluminous cozy rear hair puff framing behind shoulders and neck."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    cx, cy = sc(300), sc(370)
    rx, ry = sc(135), sc(105)

    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=HAIR_SHADOW, outline=OUTLINE, width=outline_w)

    rx2, ry2 = sc(130), sc(98)
    draw.ellipse([cx - rx2, cy - ry2 + sc(6), cx + rx2, cy + ry2 + sc(6)], fill=HAIR_BASE)

    for angle in [-40, -20, 0, 20, 40]:
        rad = math.radians(angle)
        sx = cx + int(math.sin(rad) * rx * 0.8)
        sy = cy + int(math.cos(rad) * ry * 0.9)
        draw.ellipse([sx - sc(22), sy - sc(20), sx + sc(22), sy + sc(20)], fill=HAIR_BASE, outline=OUTLINE, width=outline_w)

    return c.downsample()

def create_layer_cape_back():
    """Mystic Lavender shoulder mantle / cape with gold trim behind the character."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    pts = [
        sc((250, 435)),
        sc((215, 520)),
        sc((240, 545)),
        sc((300, 555)),
        sc((360, 545)),
        sc((385, 520)),
        sc((350, 435)),
    ]
    draw.polygon(pts, fill=MYSTIC_LAVENDER, outline=OUTLINE, width=outline_w)

    shadow_pts = [
        sc((240, 450)),
        sc((225, 520)),
        sc((240, 545)),
        sc((300, 555)),
        sc((285, 460)),
    ]
    draw.polygon(shadow_pts, fill=LAVENDER_SHADOW)

    trim_pts = [
        sc((215, 520)),
        sc((240, 545)),
        sc((300, 555)),
        sc((360, 545)),
        sc((385, 520)),
        sc((375, 532)),
        sc((360, 552)),
        sc((300, 563)),
        sc((240, 552)),
        sc((225, 532)),
    ]
    draw.polygon(trim_pts, fill=WARM_GOLD, outline=OUTLINE, width=sc(2))

    return c.downsample()

def create_layer_neck():
    """Cute chibi neck."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    pts = [sc((288, 420)), sc((286, 442)), sc((314, 442)), sc((312, 420))]
    draw.polygon(pts, fill=SKIN_SHADOW, outline=OUTLINE, width=outline_w)
    return c.downsample()

def create_layer_head():
    """Super Deformed chubby anime head base (ears, cheeks, rounded chin)."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    head_poly = [
        sc((200, 275)),
        sc((240, 235)),
        sc((300, 225)),
        sc((360, 235)),
        sc((400, 275)),
        sc((418, 345)),
        sc((410, 395)),
        sc((365, 432)),
        sc((300, 438)),  # soft cute rounded chin
        sc((235, 432)),
        sc((190, 395)),
        sc((182, 345)),
    ]
    draw.polygon(head_poly, fill=SKIN_BASE, outline=OUTLINE, width=outline_w)

    jaw_shadow = [
        sc((245, 415)),
        sc((300, 434)),
        sc((355, 415)),
        sc((345, 435)),
        sc((300, 438)),
        sc((255, 435)),
    ]
    draw.polygon(jaw_shadow, fill=SKIN_SHADOW)

    # Left ear
    draw.ellipse([sc(172), sc(345), sc(194), sc(375)], fill=SKIN_BASE, outline=OUTLINE, width=outline_w)
    draw.arc([sc(178), sc(352), sc(190), sc(368)], start=30, end=200, fill=SKIN_SHADOW, width=sc(2))

    # Right ear
    draw.ellipse([sc(406), sc(345), sc(428), sc(375)], fill=SKIN_BASE, outline=OUTLINE, width=outline_w)
    draw.arc([sc(410), sc(352), sc(422), sc(368)], start=-20, end=150, fill=SKIN_SHADOW, width=sc(2))

    return c.downsample()

def create_layer_blush():
    """Soft rosy cheek blush with tiny white sparkle accents."""
    c = ArtworkCanvas()
    draw = c.draw

    lx, ly = 232, 385
    draw.ellipse([sc(lx - 24), sc(ly - 13), sc(lx + 24), sc(ly + 13)], fill=BLUSH)
    draw.ellipse([sc(lx - 14), sc(ly - 7), sc(lx + 14), sc(ly + 7)], fill=BLUSH_CORE)
    draw.polygon([sc((lx - 4, ly)), sc((lx, ly - 5)), sc((lx + 4, ly)), sc((lx, ly + 5))], fill=WHITE)
    draw.ellipse([sc(lx + 8), sc(ly - 3), sc(lx + 12), sc(ly + 1)], fill=WHITE)

    rx, ry = 368, 385
    draw.ellipse([sc(rx - 24), sc(ry - 13), sc(rx + 24), sc(ry + 13)], fill=BLUSH)
    draw.ellipse([sc(rx - 14), sc(ry - 7), sc(rx + 14), sc(ry + 7)], fill=BLUSH_CORE)
    draw.polygon([sc((rx - 4, ry)), sc((rx, ry - 5)), sc((rx + 4, ry)), sc((rx, ry + 5))], fill=WHITE)
    draw.ellipse([sc(rx - 12), sc(ry - 3), sc(rx - 8), sc(ry + 1)], fill=WHITE)

    return c.downsample()

def create_layer_nose():
    """Cute button nose."""
    c = ArtworkCanvas()
    draw = c.draw
    nx, ny = sc(300), sc(390)
    draw.ellipse([nx - sc(2.5), ny - sc(2), nx + sc(2.5), ny + sc(2)], fill=(201, 141, 123, 255))
    return c.downsample()

def create_layer_mouth(state="neutral"):
    """Small expressive anime chibi mouth."""
    c = ArtworkCanvas()
    draw = c.draw
    mx, my = sc(300), sc(406)
    outline_w = sc(3)

    if state == "neutral":
        draw.arc([mx - sc(11), my - sc(8), mx + sc(11), my + sc(4)], start=30, end=150, fill=OUTLINE, width=outline_w)
        draw.ellipse([mx - sc(4), my + sc(5), mx + sc(4), my + sc(7)], fill=(225, 170, 160, 200))

    elif state == "happy":
        pts = [sc((288, 403)), sc((312, 403)), sc((300, 417))]
        draw.polygon(pts, fill=(185, 60, 85, 255), outline=OUTLINE, width=outline_w)
        draw.ellipse([sc(293), sc(409), sc(307), sc(418)], fill=ROSE_PINK)
        draw.polygon([sc((290, 403)), sc((310, 403)), sc((300, 407))], fill=WHITE)

    elif state == "surprised":
        draw.ellipse([mx - sc(7), my - sc(8), mx + sc(7), my + sc(6)], fill=(185, 60, 85, 255), outline=OUTLINE, width=outline_w)
        draw.ellipse([mx - sc(4), my - sc(1), mx + sc(4), my + sc(5)], fill=ROSE_PINK)

    return c.downsample()

def create_layer_eye(is_left=True, state="open"):
    """Large expressive anime chibi eye."""
    c = ArtworkCanvas()
    draw = c.draw

    cx = sc(254 if is_left else 346)
    cy = sc(360)
    w, h = sc(26), sc(32)

    if state == "open":
        sclera_poly = [
            (cx - w, cy + sc(2)),
            (cx - int(w * 0.7), cy - h + sc(8)),
            (cx, cy - h + sc(3)),
            (cx + int(w * 0.7), cy - h + sc(8)),
            (cx + w, cy + sc(2)),
            (cx + int(w * 0.7), cy + h - sc(4)),
            (cx, cy + h - sc(2)),
            (cx - int(w * 0.7), cy + h - sc(4)),
        ]
        draw.polygon(sclera_poly, fill=EYE_SCLERA, outline=OUTLINE, width=sc(2))

        draw.polygon([
            (cx - w + sc(2), cy - sc(4)),
            (cx, cy - h + sc(3)),
            (cx + w - sc(2), cy - sc(4)),
            (cx, cy - sc(8)),
        ], fill=(225, 222, 228, 255))

        ir_w, ir_h = sc(19), sc(27)
        ir_y = cy + sc(1)
        draw.ellipse([cx - ir_w, ir_y - ir_h, cx + ir_w, ir_y + ir_h], fill=IRIS_TOP)
        draw.ellipse([cx - ir_w + sc(2), ir_y - int(ir_h * 0.4), cx + ir_w - sc(2), ir_y + ir_h - sc(2)], fill=IRIS_MID)
        draw.ellipse([cx - int(ir_w * 0.8), ir_y + sc(4), cx + int(ir_w * 0.8), ir_y + ir_h - sc(3)], fill=IRIS_BOTTOM)
        draw.arc([cx - int(ir_w * 0.75), ir_y + sc(6), cx + int(ir_w * 0.75), ir_y + ir_h - sc(4)], start=30, end=150, fill=IRIS_GLOW, width=sc(3))

        pupil_r = sc(7)
        draw.ellipse([cx - pupil_r, ir_y - sc(5) - pupil_r, cx + pupil_r, ir_y - sc(5) + pupil_r], fill=PUPIL)

        hx = cx - sc(6 if is_left else 5)
        hy = ir_y - sc(11)
        draw.ellipse([hx - sc(5), hy - sc(5), hx + sc(5), hy + sc(5)], fill=WHITE)

        hx2 = cx + sc(7 if is_left else 6)
        hy2 = ir_y + sc(6)
        draw.ellipse([hx2 - sc(3), hy2 - sc(3), hx2 + sc(3), hy2 + sc(3)], fill=WHITE)
        draw.ellipse([cx - sc(2), ir_y + sc(10), cx + sc(1), ir_y + sc(13)], fill=WHITE)

        eyelash_pts = [
            (cx - w - sc(2), cy - sc(2)),
            (cx - int(w * 0.6), cy - h + sc(3)),
            (cx + int(w * 0.4), cy - h + sc(1)),
            (cx + w + sc(3), cy - sc(1)),
            (cx + w - sc(1), cy - sc(8)),
            (cx + int(w * 0.2), cy - h - sc(3)),
            (cx - int(w * 0.5), cy - h),
        ]
        if not is_left:
            eyelash_pts = [(cx - (pt[0] - cx), pt[1]) for pt in eyelash_pts]

        draw.polygon(eyelash_pts, fill=OUTLINE)
        draw.arc([cx - sc(10), cy + h - sc(6), cx + sc(10), cy + h], start=20, end=160, fill=(115, 85, 105, 255), width=sc(2))

    elif state == "blink":
        draw.arc([cx - w + sc(2), cy - sc(6), cx + w - sc(2), cy + sc(14)], start=200, end=340, fill=OUTLINE, width=sc(4))
        wing_x = cx + (w if is_left else -w)
        draw.line([(wing_x - sc(4 if is_left else -4), cy + sc(3)), (wing_x + sc(2 if is_left else -2), cy - sc(2))], fill=OUTLINE, width=sc(3.5))

    return c.downsample()

def create_layer_eyebrow(is_left=True):
    """Expressive anime chibi eyebrow."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    cx = sc(254 if is_left else 346)
    cy = sc(316)
    pts = [
        (cx - sc(16), cy + sc(4 if is_left else -2)),
        (cx - sc(4), cy - sc(4)),
        (cx + sc(14), cy + sc(-2 if is_left else 4)),
    ]
    draw.line(pts, fill=OUTLINE, width=outline_w, joint="curve")
    return c.downsample()

def create_layer_hair_front():
    """Cute voluminous front bangs, side framing, and bouncy ahoge."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    # Crown Ahoge
    ahoge_pts = [
        sc((302, 230)),
        sc((295, 195)),
        sc((315, 160)),
        sc((335, 172)),
        sc((325, 190)),
        sc((308, 205)),
        sc((306, 230)),
    ]
    draw.polygon(ahoge_pts, fill=HAIR_BASE, outline=OUTLINE, width=outline_w)
    draw.line([sc((305, 210)), sc((318, 175))], fill=HAIR_HIGHLIGHT, width=sc(2))

    # Bangs
    bangs_poly = [
        sc((188, 280)),
        sc((205, 235)),
        sc((250, 215)),
        sc((300, 210)),
        sc((350, 215)),
        sc((395, 235)),
        sc((412, 280)),
        sc((395, 332)),
        sc((375, 312)),
        sc((360, 345)),
        sc((340, 320)),
        sc((315, 350)),
        sc((295, 330)),
        sc((275, 348)),
        sc((255, 318)),
        sc((230, 340)),
        sc((210, 315)),
    ]
    draw.polygon(bangs_poly, fill=HAIR_BASE, outline=OUTLINE, width=outline_w)

    bang_shadows = [
        (sc((268, 335)), sc((275, 348)), sc((282, 335))),
        (sc((308, 338)), sc((315, 350)), sc((322, 338))),
        (sc((352, 332)), sc((360, 345)), sc((368, 332))),
    ]
    for b_pts in bang_shadows:
        draw.polygon(b_pts, fill=HAIR_SHADOW)

    draw.arc([sc(215), sc(255), sc(385), sc(285)], start=190, end=350, fill=HAIR_RING, width=sc(5))
    draw.arc([sc(235), sc(258), sc(365), sc(282)], start=195, end=345, fill=GOLD_SHINE, width=sc(2))

    return c.downsample()

def create_layer_hair_side(is_left=True):
    """Soft puffy side-locks framing cheeks."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    base_x = 208 if is_left else 392
    sign = 1 if is_left else -1

    pts = [
        sc((base_x - sign * 15, 280)),
        sc((base_x + sign * 12, 280)),
        sc((base_x + sign * 14, 375)),
        sc((base_x + sign * 4, 408)),
        sc((base_x - sign * 8, 385)),
        sc((base_x - sign * 18, 340)),
    ]
    draw.polygon(pts, fill=HAIR_BASE, outline=OUTLINE, width=outline_w)
    draw.line([sc((base_x - sign * 2, 300)), sc((base_x + sign * 2, 370))], fill=HAIR_HIGHLIGHT, width=sc(2.5))
    return c.downsample()

def create_layer_hair_short():
    """Alternate modular hairstyle: cute adventurer pixie bob."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    bangs_poly = [
        sc((195, 275)),
        sc((240, 220)),
        sc((300, 212)),
        sc((360, 220)),
        sc((405, 275)),
        sc((390, 325)),
        sc((365, 310)),
        sc((345, 335)),
        sc((320, 315)),
        sc((300, 335)),
        sc((280, 315)),
        sc((255, 335)),
        sc((235, 310)),
        sc((210, 325)),
    ]
    draw.polygon(bangs_poly, fill=HAIR2_BASE, outline=OUTLINE, width=outline_w)

    draw.ellipse([sc(200), sc(280), sc(218), sc(298)], fill=ROSE_PINK, outline=OUTLINE, width=sc(2))
    draw.ellipse([sc(382), sc(280), sc(400), sc(298)], fill=ROSE_PINK, outline=OUTLINE, width=sc(2))

    return c.downsample()

def create_layer_torso():
    """
    Compact SD Torso (Chest & upper tunic):
    - Soft Cream #F8EBD5 tunic with Royal Teal neckline and Fantasy Blue accents.
    """
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    tunic_poly = [
        sc((282, 436)),
        sc((318, 436)),
        sc((344, 452)),
        sc((346, 490)),
        sc((300, 492)),
        sc((254, 490)),
        sc((256, 452)),
    ]
    draw.polygon(tunic_poly, fill=CREAM_TUNIC, outline=OUTLINE, width=outline_w)

    collar_poly = [sc((282, 436)), sc((300, 452)), sc((318, 436)), sc((300, 444))]
    draw.polygon(collar_poly, fill=ROYAL_TEAL, outline=OUTLINE, width=sc(2))

    return c.downsample()

def create_layer_pelvis():
    """
    Pelvis / Hip segment with Dark Plum belt, Gold Star Buckle, and Fantasy Blue tunic skirt.
    """
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    skirt_poly = [
        sc((256, 486)),
        sc((344, 486)),
        sc((348, 510)),
        sc((332, 524)),
        sc((300, 526)),
        sc((268, 524)),
        sc((252, 510)),
    ]
    draw.polygon(skirt_poly, fill=CREAM_TUNIC, outline=OUTLINE, width=outline_w)

    trim_poly = [
        sc((254, 506)),
        sc((346, 506)),
        sc((348, 510)),
        sc((332, 524)),
        sc((300, 526)),
        sc((268, 524)),
        sc((252, 510)),
    ]
    draw.polygon(trim_poly, fill=FANTASY_BLUE, outline=OUTLINE, width=sc(2))

    # Belt
    belt_poly = [sc((257, 486)), sc((343, 486)), sc((344, 499)), sc((256, 499))]
    draw.polygon(belt_poly, fill=LEATHER_BASE, outline=OUTLINE, width=sc(2))

    # Gold 4-point star buckle
    bx, by = sc(300), sc(492)
    br = sc(8)
    buckle_pts = [
        (bx, by - br),
        (bx + sc(3), by - sc(3)),
        (bx + br, by),
        (bx + sc(3), by + sc(3)),
        (bx, by + br),
        (bx - sc(3), by + sc(3)),
        (bx - br, by),
        (bx - sc(3), by - sc(3)),
    ]
    draw.polygon(buckle_pts, fill=WARM_GOLD, outline=OUTLINE, width=sc(2))
    draw.ellipse([bx - sc(2), by - sc(2), bx + sc(2), by + sc(2)], fill=GOLD_SHINE)

    return c.downsample()

def create_layer_outfit_adventurer():
    """Alternate Voyager vest & tunic."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    tunic_poly = [
        sc((282, 436)), sc((318, 436)), sc((344, 452)), sc((348, 510)),
        sc((332, 524)), sc((300, 526)), sc((268, 524)), sc((252, 510)), sc((256, 452))
    ]
    draw.polygon(tunic_poly, fill=MYSTIC_LAVENDER, outline=OUTLINE, width=outline_w)

    vest_l = [sc((282, 436)), sc((296, 436)), sc((294, 490)), sc((256, 488)), sc((256, 452))]
    draw.polygon(vest_l, fill=ROYAL_TEAL, outline=OUTLINE, width=outline_w)

    vest_r = [sc((304, 436)), sc((318, 436)), sc((344, 452)), sc((344, 488)), sc((306, 490))]
    draw.polygon(vest_r, fill=ROYAL_TEAL, outline=OUTLINE, width=outline_w)

    draw.ellipse([sc(291), sc(446), sc(297), sc(452)], fill=WARM_GOLD)
    draw.ellipse([sc(291), sc(462), sc(297), sc(468)], fill=WARM_GOLD)
    draw.ellipse([sc(291), sc(478), sc(297), sc(484)], fill=WARM_GOLD)

    return c.downsample()

def create_layer_thigh(is_left=True):
    """Cute chubby chibi thigh."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    lx = 278 if is_left else 322
    p1 = (lx, 514)
    p2 = (lx, 556)
    draw_capsule(draw, p1, p2, radius=12, fill=CREAM_TUNIC, outline=OUTLINE, width=outline_w / SCALE)
    return c.downsample()

def create_layer_shin(is_left=True):
    """Cute chubby chibi shin."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    lx = 278 if is_left else 322
    p1 = (lx, 552)
    p2 = (lx, 586)
    draw_capsule(draw, p1, p2, radius=11, fill=CREAM_TUNIC, outline=OUTLINE, width=outline_w / SCALE)
    return c.downsample()

def create_layer_foot(is_left=True, state="default"):
    """Cute rounded chibi boot (foot)."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    bx = 278 if is_left else 322
    sign = -1 if is_left else 1

    if state == "default":
        boot_pts = [
            sc((bx - 14, 578)),
            sc((bx + 14, 578)),
            sc((bx + 16, 610)),
            sc((bx + sign * 20, 622)),
            sc((bx + sign * 12, 626)),
            sc((bx - sign * 14, 626)),
            sc((bx - 16, 605)),
        ]
        draw.polygon(boot_pts, fill=ROYAL_TEAL, outline=OUTLINE, width=outline_w)
        cuff_pts = [sc((bx - 15, 576)), sc((bx + 15, 576)), sc((bx + 15, 587)), sc((bx - 15, 587))]
        draw.polygon(cuff_pts, fill=WARM_GOLD, outline=OUTLINE, width=sc(2))
        draw.line([sc((bx - sign * 14, 625)), sc((bx + sign * 16, 623))], fill=OUTLINE, width=sc(3))

    elif state == "boots":
        boot_pts = [
            sc((bx - 15, 568)),
            sc((bx + 15, 568)),
            sc((bx + 17, 610)),
            sc((bx + sign * 22, 622)),
            sc((bx + sign * 14, 626)),
            sc((bx - sign * 15, 626)),
            sc((bx - 17, 605)),
        ]
        draw.polygon(boot_pts, fill=LEATHER_BASE, outline=OUTLINE, width=outline_w)
        draw.line([sc((bx - 12, 578)), sc((bx + 12, 578))], fill=WARM_GOLD, width=sc(2.5))
        draw.line([sc((bx - 13, 595)), sc((bx + 13, 595))], fill=WARM_GOLD, width=sc(2.5))

    return c.downsample()

def create_layer_upperarm(is_left=True):
    """Compact upperarm segment with cream sleeve."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    p1 = (256, 446) if is_left else (344, 446)
    p2 = (246, 474) if is_left else (354, 474)
    draw_capsule(draw, p1, p2, radius=11, fill=CREAM_TUNIC, outline=OUTLINE, width=outline_w / SCALE)
    return c.downsample()

def create_layer_forearm(is_left=True):
    """Forearm segment with Fantasy Blue cuff."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    p1 = (246, 472) if is_left else (354, 472)
    p2 = (238, 498) if is_left else (362, 498)
    draw_capsule(draw, p1, p2, radius=10, fill=CREAM_TUNIC, outline=OUTLINE, width=outline_w / SCALE)
    cx, cy = sc(p2)
    draw.ellipse([cx - sc(10), cy - sc(5), cx + sc(10), cy + sc(5)], fill=FANTASY_BLUE, outline=OUTLINE, width=sc(2))
    return c.downsample()

def create_layer_hand(is_left=True):
    """Slightly oversized cute chibi mitten hand with distinct thumb."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    hx = 236 if is_left else 364
    hy = 504
    sign = -1 if is_left else 1

    draw.ellipse([sc(hx - 12), sc(hy - 11), sc(hx + 12), sc(hy + 11)], fill=SKIN_BASE, outline=OUTLINE, width=outline_w)
    tx = hx + sign * 8
    ty = hy - 4
    draw.ellipse([sc(tx - 6), sc(ty - 6), sc(tx + 6), sc(ty + 6)], fill=SKIN_BASE, outline=OUTLINE, width=outline_w)
    return c.downsample()

def create_layer_hat_explorer():
    """Cute oversized floppy adventurer beret with gold star brooch & feather."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    beret_poly = [
        sc((190, 240)),
        sc((235, 175)),
        sc((315, 165)),
        sc((390, 185)),
        sc((430, 230)),
        sc((405, 260)),
        sc((335, 252)),
        sc((260, 255)),
        sc((205, 262)),
    ]
    draw.polygon(beret_poly, fill=FANTASY_BLUE, outline=OUTLINE, width=outline_w)
    draw.arc([sc(220), sc(180), sc(400), sc(240)], start=200, end=340, fill=FANTASY_BLUE_SHADOW, width=sc(4))

    bx, by = sc(225), sc(242)
    feather_pts = [sc((220, 240)), sc((185, 180)), sc((205, 195)), sc((225, 240))]
    draw.polygon(feather_pts, fill=MYSTIC_LAVENDER, outline=OUTLINE, width=sc(2))

    br = sc(10)
    star_pts = [
        (bx, by - br), (bx + sc(3), by - sc(3)), (bx + br, by), (bx + sc(3), by + sc(3)),
        (bx, by + br), (bx - sc(3), by + sc(3)), (bx - br, by), (bx - sc(3), by - sc(3))
    ]
    draw.polygon(star_pts, fill=WARM_GOLD, outline=OUTLINE, width=sc(2))
    draw.ellipse([bx - sc(3), by - sc(3), bx + sc(3), by + sc(3)], fill=GOLD_SHINE)

    return c.downsample()

def create_layer_pendant():
    """Glowing Fantasy Blue / Mystic Lavender teardrop crystal pendant."""
    c = ArtworkCanvas()
    draw = c.draw

    draw.arc([sc(286), sc(434), sc(314), sc(458)], start=20, end=160, fill=WARM_GOLD, width=sc(2))
    crystal_pts = [sc((300, 456)), sc((306, 464)), sc((300, 474)), sc((294, 464))]
    draw.polygon(crystal_pts, fill=MYSTIC_LAVENDER, outline=OUTLINE, width=sc(2))
    draw.polygon([sc((300, 458)), sc((304, 464)), sc((300, 471)), sc((296, 464))], fill=FANTASY_BLUE)
    draw.ellipse([sc(299), sc(461), sc(301), sc(463)], fill=WHITE)
    return c.downsample()

def create_layer_satchel():
    """Cute travel satchel / explorer pouch across the torso."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    draw.line([sc((270, 440)), sc((335, 502))], fill=LEATHER_SHADOW, width=sc(4))
    draw.line([sc((270, 440)), sc((335, 502))], fill=LEATHER_BASE, width=sc(2.5))

    pouch_pts = [sc((318, 492)), sc((346, 492)), sc((348, 514)), sc((316, 514))]
    draw.polygon(pouch_pts, fill=LEATHER_BASE, outline=OUTLINE, width=outline_w)
    draw.polygon([sc((317, 492)), sc((347, 492)), sc((332, 504))], fill=LEATHER_SHADOW, outline=OUTLINE, width=sc(2))
    draw.ellipse([sc(330), sc(501), sc(334), sc(505)], fill=WARM_GOLD)
    return c.downsample()

# ══════════════════════════════════════════════════════════════════════════════
# MAIN ORCHESTRATION & EXPORT
# ══════════════════════════════════════════════════════════════════════════════

def main():
    output_dir = "/Users/dvtinh99/Documents/learn/china/linguaworld/scripts/luma_ad2_layers"
    os.makedirs(output_dir, exist_ok=True)

    print("Generating Super Deformed (SD) Fantasy Anime Chibi layers...")

    layers = {
        # Core Skeletal Layers
        "hair_back": create_layer_hair_back(),
        "cape_back": create_layer_cape_back(),
        "pelvis": create_layer_pelvis(),
        "thigh_r": create_layer_thigh(is_left=False),
        "shin_r": create_layer_shin(is_left=False),
        "foot_r": create_layer_foot(is_left=False, state="default"),
        "thigh_l": create_layer_thigh(is_left=True),
        "shin_l": create_layer_shin(is_left=True),
        "foot_l": create_layer_foot(is_left=True, state="default"),
        "torso": create_layer_torso(),
        "neck": create_layer_neck(),
        "upperarm_r": create_layer_upperarm(is_left=False),
        "forearm_r": create_layer_forearm(is_left=False),
        "hand_r": create_layer_hand(is_left=False),
        "upperarm_l": create_layer_upperarm(is_left=True),
        "forearm_l": create_layer_forearm(is_left=True),
        "hand_l": create_layer_hand(is_left=True),
        "head": create_layer_head(),
        "blush": create_layer_blush(),
        "eye_r": create_layer_eye(is_left=False, state="open"),
        "eye_l": create_layer_eye(is_left=True, state="open"),
        "brow_r": create_layer_eyebrow(is_left=False),
        "brow_l": create_layer_eyebrow(is_left=True),
        "nose": create_layer_nose(),
        "mouth": create_layer_mouth(state="neutral"),
        "hair_side_r": create_layer_hair_side(is_left=False),
        "hair_side_l": create_layer_hair_side(is_left=True),
        "hair_front": create_layer_hair_front(),
        # Modular Equipment & Expressions
        "hat_explorer": create_layer_hat_explorer(),
        "accessory_front_pendant": create_layer_pendant(),
        "accessory_front_satchel": create_layer_satchel(),
        "hair_short": create_layer_hair_short(),
        "outfit_adventurer": create_layer_outfit_adventurer(),
        "shoes_boots_l": create_layer_foot(is_left=True, state="boots"),
        "shoes_boots_r": create_layer_foot(is_left=False, state="boots"),
        "eye_blink_l": create_layer_eye(is_left=True, state="blink"),
        "eye_blink_r": create_layer_eye(is_left=False, state="blink"),
        "mouth_happy": create_layer_mouth(state="happy"),
        "mouth_surprised": create_layer_mouth(state="surprised"),
    }

    manifest = []
    manifest_dict = {}

    for name, img in layers.items():
        bbox = img.getbbox()
        if bbox is None:
            bbox = (0, 0, 10, 10)
        cropped = img.crop(bbox)
        png_path = os.path.join(output_dir, f"{name}.png")
        cropped.save(png_path, "PNG")

        entry = {
            "name": name,
            "left": bbox[0],
            "top": bbox[1],
            "width": bbox[2] - bbox[0],
            "height": bbox[3] - bbox[1],
            "center_x": (bbox[0] + bbox[2]) / 2.0,
            "center_y": (bbox[1] + bbox[3]) / 2.0,
            "file": png_path
        }
        manifest.append(entry)
        manifest_dict[name] = entry
        print(f"  [SAVED] {name:25s} bbox: {bbox} (size: {bbox[2]-bbox[0]}x{bbox[3]-bbox[1]})")

    manifest_path = "/Users/dvtinh99/Documents/learn/china/linguaworld/scripts/luma_ad2_manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    comp = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    draw_order = [
        "hair_back", "cape_back",
        "pelvis",
        "thigh_r", "shin_r", "foot_r",
        "thigh_l", "shin_l", "foot_l",
        "torso", "neck",
        "upperarm_r", "forearm_r", "hand_r",
        "upperarm_l", "forearm_l", "hand_l",
        "accessory_front_pendant",
        "head", "blush", "nose", "mouth",
        "eye_r", "eye_l", "brow_r", "brow_l",
        "hair_side_r", "hair_side_l", "hair_front",
        "hat_explorer"
    ]
    for layer_name in draw_order:
        comp.alpha_composite(layers[layer_name])

    preview_path = "/Users/dvtinh99/Documents/learn/china/linguaworld/scripts/luma_ad2_preview.png"
    comp.save(preview_path, "PNG")
    print(f"\nManifest saved to: {manifest_path}")
    print(f"Full character preview saved to: {preview_path}")

if __name__ == "__main__":
    main()
