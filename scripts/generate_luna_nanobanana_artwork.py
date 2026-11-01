#!/usr/bin/env python3
"""
Generate high-resolution, production-ready layered 2D Anime Chibi Fantasy artwork
specifically reproducing Luna from luna-nanobanana:
- Silvery-lavender wavy voluminous hair with violet undertones.
- Large expressive sapphire-blue anime eyes with multi-tone iris and star highlights.
- Lavender shoulder cowl/mantle with 4-pointed gold star brooch and hanging stole panels.
- Flowing split lavender cape with dark violet lining.
- Cream A-line dress with diagonal violet crossbody strap.
- Lavender adventurer hip pouch with teal-blue flap and gold clasp.
- Puffy cream bishop sleeves with teal-blue cuffs.
- Lavender ankle boots with V-cuff and 4-point gold star emblem.
- Full set of modular parts, joint overlap caps, and expression layers.
"""

import math
import os
import json
from PIL import Image, ImageDraw, ImageFilter

CANVAS_W = 600
CANVAS_H = 800
SCALE = 2  # 2x supersampling for high-quality smooth antialiasing

def sc(val):
    if isinstance(val, (int, float)):
        return int(round(val * SCALE))
    if isinstance(val, (list, tuple)):
        return tuple(sc(x) for x in val)
    return val

# ── Palette strictly sampled from luna-nanobanana ────────────────────────────
OUTLINE = (74, 44, 78, 255)            # #4A2C4E Deep Plum/Violet outline
OUTLINE_INNER = (115, 80, 120, 255)    # Soft inner crease
SKIN_BASE = (255, 238, 234, 255)       # #FFEEEA Soft fair anime peach skin
SKIN_SHADOW = (251, 215, 214, 255)     # #FBD7D6 Warm rosy shadow
BLUSH = (248, 185, 195, 210)           # Rosy cheek blush
BLUSH_CORE = (245, 160, 175, 230)
WHITE = (255, 255, 255, 255)

# Hair: Silvery Lavender with violet shadow & soft luminous sheen
HAIR_BASE = (189, 172, 205, 255)       # #BDACCD Silvery lavender
HAIR_SHADOW = (135, 125, 170, 255)     # #877DAA Soft violet shadow
HAIR_DEEP = (108, 89, 132, 255)        # #6C5984 Deep shadow
HAIR_HIGHLIGHT = (223, 210, 227, 255)  # #DFD2E3 Soft lavender highlight
HAIR_SHEEN = (247, 234, 248, 255)      # Top angel-ring sheen

# Eyes: Sapphire / Fantasy Blue starry anime eyes
EYE_SCLERA = (253, 251, 250, 255)
EYE_TOP = (35, 53, 84, 255)            # Deep navy top iris
EYE_MID = (64, 133, 205, 255)          # Vibrant sapphire blue
EYE_GLOW = (123, 181, 234, 255)        # Starry sky blue lower glow
EYE_STAR = (220, 240, 255, 255)        # Crescent sparkle
PUPIL = (28, 38, 62, 255)              # Deep dark navy pupil

# Costume: Cream Dress + Lavender Mantle & Cape + Teal Accents
CREAM_DRESS = (251, 248, 242, 255)     # #FBF8F2 Cream linen
CREAM_SHADOW = (226, 216, 199, 255)    # #E2D8C7
CAPE_LAVENDER = (154, 133, 175, 255)   # #9A85AF Lavender mantle & cape
CAPE_SHADOW = (108, 89, 132, 255)      # #6C5984
CAPE_TRIM = (223, 210, 227, 255)       # #DFD2E3 Light lavender trim
CAPE_LINING = (85, 65, 105, 255)       # Deep violet inner cape lining
TEAL_ACCENT = (75, 165, 184, 255)      # #4BA5B8 Teal wrist cuffs & pouch flap
TEAL_SHADOW = (45, 115, 130, 255)
GOLD_BASE = (232, 183, 107, 255)       # #E8B76B Fantasy Gold
GOLD_SHADOW = (168, 124, 56, 255)      # #A87C38
GOLD_SHINE = (255, 243, 184, 255)      # #FFF3B8
STRAP_VIOLET = (118, 92, 138, 255)     # Crossbody bag strap

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
# LAYER GENERATORS FOR LUNA (LUNA-NANOBANANA BLUEPRINT)
# ══════════════════════════════════════════════════════════════════════════════

def create_layer_hair_back():
    """Voluminous, cascading wavy lavender hair behind the character."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    # Broad cascading hair mass behind shoulders
    # Center 300, extends from Y: 240 down to Y: 530, X: 160 to 440
    cx, cy = sc(300), sc(390)

    # Outer deep shadow layer
    pts_outer = [
        sc((200, 270)), sc((240, 230)), sc((300, 220)), sc((360, 230)), sc((400, 270)),
        sc((435, 340)), sc((445, 420)), sc((430, 485)), sc((395, 525)),
        sc((355, 500)), sc((330, 528)), sc((300, 495)), sc((270, 528)),
        sc((245, 500)), sc((205, 525)), sc((170, 485)), sc((155, 420)), sc((165, 340))
    ]
    draw.polygon(pts_outer, fill=HAIR_DEEP, outline=OUTLINE, width=outline_w)

    # Main hair body
    pts_main = [
        sc((205, 275)), sc((245, 238)), sc((300, 230)), sc((355, 238)), sc((395, 275)),
        sc((425, 340)), sc((435, 415)), sc((420, 475)), sc((390, 515)),
        sc((355, 492)), sc((330, 518)), sc((300, 488)), sc((270, 518)),
        sc((245, 492)), sc((210, 515)), sc((180, 475)), sc((165, 415)), sc((175, 340))
    ]
    draw.polygon(pts_main, fill=HAIR_BASE)

    # Soft wave strands and highlights
    for x_off in [-80, -40, 0, 40, 80]:
        sx = 300 + x_off
        draw.arc([sc(sx - 35), sc(320), sc(sx + 35), sc(470)], start=30, end=150, fill=HAIR_SHADOW, width=sc(4))
        draw.arc([sc(sx - 28), sc(330), sc(sx + 28), sc(460)], start=40, end=140, fill=HAIR_HIGHLIGHT, width=sc(2.5))

    return c.downsample()

def create_layer_cape_back():
    """Flowing split lavender cape with deep violet interior lining."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    # Left & Right split cape panels extending past thighs (Y: 440 to 570)
    cape_poly = [
        sc((245, 442)),
        sc((220, 510)),
        sc((200, 560)),
        sc((225, 572)),
        sc((255, 535)),
        sc((282, 470)),
        sc((300, 475)),  # Center split
        sc((318, 470)),
        sc((345, 535)),
        sc((375, 572)),
        sc((400, 560)),
        sc((380, 510)),
        sc((355, 442)),
    ]
    draw.polygon(cape_poly, fill=CAPE_LAVENDER, outline=OUTLINE, width=outline_w)

    # Dark violet inner lining visible in the center split
    lining_pts = [
        sc((275, 472)), sc((300, 475)), sc((325, 472)),
        sc((335, 515)), sc((300, 528)), sc((265, 515))
    ]
    draw.polygon(lining_pts, fill=CAPE_LINING)

    # Soft gradient shadow on cape folds
    draw.polygon([sc((210, 540)), sc((225, 572)), sc((245, 545)), sc((230, 520))], fill=CAPE_SHADOW)
    draw.polygon([sc((390, 540)), sc((375, 572)), sc((355, 545)), sc((370, 520))], fill=CAPE_SHADOW)

    return c.downsample()

def create_layer_neck():
    """Cute chibi neck."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    pts = [sc((288, 418)), sc((286, 442)), sc((314, 442)), sc((312, 418))]
    draw.polygon(pts, fill=SKIN_SHADOW, outline=OUTLINE, width=outline_w)
    return c.downsample()

def create_layer_head():
    """Clean bare chubby chibi head base (ears, cheeks, rounded chin)."""
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
        sc((300, 438)),
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

    # Left & right ears
    draw.ellipse([sc(172), sc(345), sc(194), sc(375)], fill=SKIN_BASE, outline=OUTLINE, width=outline_w)
    draw.arc([sc(178), sc(352), sc(190), sc(368)], start=30, end=200, fill=SKIN_SHADOW, width=sc(2))

    draw.ellipse([sc(406), sc(345), sc(428), sc(375)], fill=SKIN_BASE, outline=OUTLINE, width=outline_w)
    draw.arc([sc(410), sc(352), sc(422), sc(368)], start=-20, end=150, fill=SKIN_SHADOW, width=sc(2))

    return c.downsample()

def create_layer_blush():
    """Soft rosy cheek blush with white star highlights."""
    c = ArtworkCanvas()
    draw = c.draw

    # Left cheek
    lx, ly = 232, 385
    draw.ellipse([sc(lx - 24), sc(ly - 13), sc(lx + 24), sc(ly + 13)], fill=BLUSH)
    draw.ellipse([sc(lx - 14), sc(ly - 7), sc(lx + 14), sc(ly + 7)], fill=BLUSH_CORE)
    draw.polygon([sc((lx - 4, ly)), sc((lx, ly - 5)), sc((lx + 4, ly)), sc((lx, ly + 5))], fill=WHITE)
    draw.ellipse([sc(lx + 8), sc(ly - 3), sc(lx + 12), sc(ly + 1)], fill=WHITE)

    # Right cheek
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
    """Small expressive anime mouth matching the Luna emotion sheet."""
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
        draw.ellipse([sc(293), sc(409), sc(307), sc(418)], fill=(245, 140, 160, 255))
        draw.polygon([sc((290, 403)), sc((310, 403)), sc((300, 407))], fill=WHITE)

    elif state == "surprised":
        draw.ellipse([mx - sc(7), my - sc(8), mx + sc(7), my + sc(6)], fill=(185, 60, 85, 255), outline=OUTLINE, width=outline_w)
        draw.ellipse([mx - sc(4), my - sc(1), mx + sc(4), my + sc(5)], fill=(245, 140, 160, 255))

    elif state == "proud":
        # Confident curved smirk to the side
        draw.arc([mx - sc(6), my - sc(7), mx + sc(14), my + sc(3)], start=20, end=160, fill=OUTLINE, width=outline_w)

    return c.downsample()

def create_layer_eye(is_left=True, state="open"):
    """
    Sapphire / Starry Blue anime eyes faithfully reproducing Luna:
    - Deep navy upper iris & pupil.
    - Radiant sapphire blue midtone.
    - Luminous starry sky crescent glow.
    - Crisp white circular & oval highlights + twinkle sparkles.
    """
    c = ArtworkCanvas()
    draw = c.draw

    cx = sc(254 if is_left else 346)
    cy = sc(360)
    w, h = sc(26), sc(32)

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

    if state == "open":
        # Sclera
        draw.polygon(sclera_poly, fill=EYE_SCLERA, outline=OUTLINE, width=sc(2))

        # Upper eyelid shadow on sclera
        draw.polygon([
            (cx - w + sc(2), cy - sc(4)),
            (cx, cy - h + sc(3)),
            (cx + w - sc(2), cy - sc(4)),
            (cx, cy - sc(8)),
        ], fill=(225, 222, 235, 255))

        # Large Iris
        ir_w, ir_h = sc(19), sc(27)
        ir_y = cy + sc(1)
        draw.ellipse([cx - ir_w, ir_y - ir_h, cx + ir_w, ir_y + ir_h], fill=EYE_TOP)
        draw.ellipse([cx - ir_w + sc(2), ir_y - int(ir_h * 0.4), cx + ir_w - sc(2), ir_y + ir_h - sc(2)], fill=EYE_MID)
        draw.ellipse([cx - int(ir_w * 0.8), ir_y + sc(4), cx + int(ir_w * 0.8), ir_y + ir_h - sc(3)], fill=EYE_GLOW)
        draw.arc([cx - int(ir_w * 0.75), ir_y + sc(6), cx + int(ir_w * 0.75), ir_y + ir_h - sc(4)], start=30, end=150, fill=EYE_STAR, width=sc(3))

        # Pupil
        pupil_r = sc(7)
        draw.ellipse([cx - pupil_r, ir_y - sc(5) - pupil_r, cx + pupil_r, ir_y - sc(5) + pupil_r], fill=PUPIL)

        # Highlights
        hx = cx - sc(6 if is_left else 5)
        hy = ir_y - sc(11)
        draw.ellipse([hx - sc(5), hy - sc(5), hx + sc(5), hy + sc(5)], fill=WHITE)
        hx2 = cx + sc(7 if is_left else 6)
        hy2 = ir_y + sc(6)
        draw.ellipse([hx2 - sc(3), hy2 - sc(3), hx2 + sc(3), hy2 + sc(3)], fill=WHITE)
        draw.ellipse([cx - sc(2), ir_y + sc(10), cx + sc(1), ir_y + sc(13)], fill=WHITE)

        # Eyelashes
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
        draw.arc([cx - sc(10), cy + h - sc(6), cx + sc(10), cy + h], start=20, end=160, fill=(115, 85, 120, 255), width=sc(2))

    elif state == "blink":
        # Closed smiling happy eyes
        draw.arc([cx - w + sc(2), cy - sc(6), cx + w - sc(2), cy + sc(14)], start=200, end=340, fill=OUTLINE, width=sc(4))
        wing_x = cx + (w if is_left else -w)
        draw.line([(wing_x - sc(4 if is_left else -4), cy + sc(3)), (wing_x + sc(2 if is_left else -2), cy - sc(2))], fill=OUTLINE, width=sc(3.5))

    elif state == "star":
        # Excited star eyes from emotion sheet!
        draw.polygon(sclera_poly, fill=EYE_SCLERA, outline=OUTLINE, width=sc(2))
        ir_w, ir_h = sc(19), sc(27)
        ir_y = cy + sc(1)
        draw.ellipse([cx - ir_w, ir_y - ir_h, cx + ir_w, ir_y + ir_h], fill=EYE_MID)
        # Big golden star in center of eye
        sr = sc(12)
        star_pts = [
            (cx, ir_y - sr), (cx + sc(3), ir_y - sc(3)), (cx + sr, ir_y), (cx + sc(3), ir_y + sc(3)),
            (cx, ir_y + sr), (cx - sc(3), ir_y + sc(3)), (cx - sr, ir_y), (cx - sc(3), ir_y - sc(3))
        ]
        draw.polygon(star_pts, fill=GOLD_SHINE, outline=OUTLINE, width=sc(1.5))
        draw.ellipse([cx - sc(6), ir_y - sc(9), cx - sc(2), ir_y - sc(5)], fill=WHITE)

    return c.downsample()

def create_layer_eyebrow(is_left=True):
    """Expressive anime chibi eyebrow in plum/violet."""
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
    """
    Voluminous center-parted wavy bangs with charming swept locks
    strictly matching Luna in luna-nanobanana.
    """
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    # Center-parted bangs sweeping gracefully across forehead
    bangs_poly = [
        sc((188, 275)),
        sc((205, 230)),
        sc((250, 210)),
        sc((300, 205)),
        sc((350, 210)),
        sc((395, 230)),
        sc((412, 275)),
        # Curled tips
        sc((395, 335)),
        sc((375, 310)),
        sc((360, 345)),
        sc((340, 320)),
        sc((315, 355)),  # Right parted lock
        sc((300, 325)),  # Center part dip
        sc((285, 355)),  # Left parted lock
        sc((260, 320)),
        sc((240, 345)),
        sc((225, 310)),
        sc((205, 335)),
    ]
    draw.polygon(bangs_poly, fill=HAIR_BASE, outline=OUTLINE, width=outline_w)

    # Shading under bang curls
    bang_shadows = [
        (sc((278, 342)), sc((285, 355)), sc((292, 342))),
        (sc((308, 342)), sc((315, 355)), sc((322, 342))),
        (sc((352, 332)), sc((360, 345)), sc((368, 332))),
    ]
    for b_pts in bang_shadows:
        draw.polygon(b_pts, fill=HAIR_SHADOW)

    # Angel ring luminous hair sheen
    draw.arc([sc(215), sc(245), sc(385), sc(280)], start=190, end=350, fill=HAIR_HIGHLIGHT, width=sc(5))
    draw.arc([sc(235), sc(248), sc(365), sc(276)], start=195, end=345, fill=HAIR_SHEEN, width=sc(2))

    return c.downsample()

def create_layer_hair_side(is_left=True):
    """Lush, wavy outward curling side locks framing the cheeks."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    base_x = 208 if is_left else 392
    sign = 1 if is_left else -1

    pts = [
        sc((base_x - sign * 15, 275)),
        sc((base_x + sign * 12, 275)),
        sc((base_x + sign * 18, 375)),
        sc((base_x + sign * 8, 418)),   # Outward curling tip
        sc((base_x - sign * 6, 395)),
        sc((base_x - sign * 18, 340)),
    ]
    draw.polygon(pts, fill=HAIR_BASE, outline=OUTLINE, width=outline_w)
    draw.line([sc((base_x - sign * 2, 295)), sc((base_x + sign * 4, 385))], fill=HAIR_HIGHLIGHT, width=sc(2.5))
    return c.downsample()

def create_layer_hair_short():
    """Alternate modular hairstyle: cute wavy adventurer bob."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    bangs_poly = [
        sc((195, 275)), sc((240, 220)), sc((300, 212)), sc((360, 220)), sc((405, 275)),
        sc((390, 325)), sc((365, 310)), sc((345, 335)), sc((320, 315)), sc((300, 335)),
        sc((280, 315)), sc((255, 335)), sc((235, 310)), sc((210, 325)),
    ]
    draw.polygon(bangs_poly, fill=(215, 195, 230, 255), outline=OUTLINE, width=outline_w)
    draw.ellipse([sc(200), sc(280), sc(218), sc(298)], fill=TEAL_ACCENT, outline=OUTLINE, width=sc(2))
    draw.ellipse([sc(382), sc(280), sc(400), sc(298)], fill=TEAL_ACCENT, outline=OUTLINE, width=sc(2))
    return c.downsample()

def create_layer_torso():
    """
    Cream A-line under-dress with diagonal violet crossbody bag strap.
    """
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    tunic_poly = [
        sc((282, 436)),
        sc((318, 436)),
        sc((344, 452)),
        sc((346, 492)),
        sc((300, 494)),
        sc((254, 492)),
        sc((256, 452)),
    ]
    draw.polygon(tunic_poly, fill=CREAM_DRESS, outline=OUTLINE, width=outline_w)

    # Diagonal crossbody satchel strap (from right shoulder down to left hip)
    draw.line([sc((280, 438)), sc((338, 495))], fill=STRAP_VIOLET, width=sc(4.5))
    draw.line([sc((280, 438)), sc((338, 495))], fill=(154, 125, 175, 255), width=sc(2.5))

    return c.downsample()

def create_layer_mantle_front():
    """
    Lavender shoulder cowl / mantle with golden 4-point star brooch,
    teardrop crystal, and two hanging stole panels.
    """
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    # 1. Shoulder cowl / mantle wrap around neck and shoulders
    cowl_pts = [
        sc((265, 432)),
        sc((300, 442)),
        sc((335, 432)),
        sc((365, 455)),
        sc((355, 478)),
        sc((330, 485)),
        sc((300, 475)),
        sc((270, 485)),
        sc((245, 478)),
        sc((235, 455)),
    ]
    draw.polygon(cowl_pts, fill=CAPE_LAVENDER, outline=OUTLINE, width=outline_w)
    draw.polygon([sc((270, 438)), sc((300, 445)), sc((330, 438)), sc((300, 442))], fill=CAPE_TRIM)

    # 2. Two hanging stole panels (front flaps)
    stole_l = [sc((268, 480)), sc((286, 480)), sc((278, 535)), sc((258, 532))]
    draw.polygon(stole_l, fill=CAPE_LAVENDER, outline=OUTLINE, width=sc(2))
    draw.line([sc((260, 530)), sc((276, 533))], fill=GOLD_BASE, width=sc(2))

    stole_r = [sc((314, 480)), sc((332, 480)), sc((342, 532)), sc((322, 535))]
    draw.polygon(stole_r, fill=CAPE_LAVENDER, outline=OUTLINE, width=sc(2))
    draw.line([sc((324, 533)), sc((340, 530))], fill=GOLD_BASE, width=sc(2))

    # 3. Golden 4-point fantasy star brooch at center chest
    bx, by = sc(300), sc(460)
    br = sc(11)
    star_pts = [
        (bx, by - br), (bx + sc(3.5), by - sc(3.5)), (bx + br, by), (bx + sc(3.5), by + sc(3.5)),
        (bx, by + br), (bx - sc(3.5), by + sc(3.5)), (bx - br, by), (bx - sc(3.5), by - sc(3.5))
    ]
    draw.polygon(star_pts, fill=GOLD_BASE, outline=OUTLINE, width=sc(2))
    draw.ellipse([bx - sc(3), by - sc(3), bx + sc(3), by + sc(3)], fill=GOLD_SHINE)

    # Teardrop crystal pendant hanging below star
    draw.polygon([sc((300, 469)), sc((304, 476)), sc((300, 482)), sc((296, 476))], fill=EYE_MID, outline=OUTLINE, width=sc(1.5))
    draw.ellipse([sc(299), sc(474), sc(301), sc(476)], fill=WHITE)

    return c.downsample()

def create_layer_pelvis():
    """Pelvis segment with cream dress skirt hem."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    skirt_poly = [
        sc((254, 488)),
        sc((346, 488)),
        sc((352, 520)),
        sc((335, 536)),
        sc((300, 538)),
        sc((265, 536)),
        sc((248, 520)),
    ]
    draw.polygon(skirt_poly, fill=CREAM_DRESS, outline=OUTLINE, width=outline_w)

    # Soft hem shadow & scalloped fold
    draw.polygon([
        sc((250, 522)), sc((265, 536)), sc((300, 538)), sc((335, 536)), sc((350, 522)),
        sc((342, 528)), sc((300, 532)), sc((258, 528))
    ], fill=CREAM_SHADOW)

    return c.downsample()

def create_layer_thigh(is_left=True):
    """Cute chubby chibi thigh (bare skin)."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    lx = 278 if is_left else 322
    p1 = (lx, 514)
    p2 = (lx, 556)
    draw_capsule(draw, p1, p2, radius=12, fill=SKIN_BASE, outline=OUTLINE, width=outline_w / SCALE)
    return c.downsample()

def create_layer_shin(is_left=True):
    """Cute chubby chibi shin (bare skin)."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    lx = 278 if is_left else 322
    p1 = (lx, 552)
    p2 = (lx, 586)
    draw_capsule(draw, p1, p2, radius=11, fill=SKIN_BASE, outline=OUTLINE, width=outline_w / SCALE)
    return c.downsample()

def create_layer_foot(is_left=True, state="default"):
    """
    Cute lavender chibi ankle boots with V-notch collar
    and 4-point gold star emblem.
    """
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    bx = 278 if is_left else 322
    sign = -1 if is_left else 1

    if state == "default":
        boot_pts = [
            sc((bx - 14, 578)),
            sc((bx, 584)),       # V-notch collar
            sc((bx + 14, 578)),
            sc((bx + 16, 610)),
            sc((bx + sign * 20, 622)),
            sc((bx + sign * 12, 626)),
            sc((bx - sign * 14, 626)),
            sc((bx - 16, 605)),
        ]
        draw.polygon(boot_pts, fill=CAPE_LAVENDER, outline=OUTLINE, width=outline_w)

        # Gold star emblem on front of boot
        fx, fy = sc(bx), sc(598)
        fs = sc(5)
        star_pts = [
            (fx, fy - fs), (fx + sc(1.5), fy - sc(1.5)), (fx + fs, fy), (fx + sc(1.5), fy + sc(1.5)),
            (fx, fy + fs), (fx - sc(1.5), fy + sc(1.5)), (fx - fs, fy), (fx - sc(1.5), fy - sc(1.5))
        ]
        draw.polygon(star_pts, fill=GOLD_BASE, outline=OUTLINE, width=sc(1.5))
        # Boot sole
        draw.line([sc((bx - sign * 14, 625)), sc((bx + sign * 16, 623))], fill=OUTLINE, width=sc(3))

    elif state == "boots":
        # Alternate travel boots
        boot_pts = [
            sc((bx - 15, 568)), sc((bx + 15, 568)), sc((bx + 17, 610)),
            sc((bx + sign * 22, 622)), sc((bx + sign * 14, 626)),
            sc((bx - sign * 15, 626)), sc((bx - 17, 605)),
        ]
        draw.polygon(boot_pts, fill=(110, 80, 125, 255), outline=OUTLINE, width=outline_w)
        draw.line([sc((bx - 12, 578)), sc((bx + 12, 578))], fill=GOLD_BASE, width=sc(2.5))
        draw.line([sc((bx - 13, 595)), sc((bx + 13, 595))], fill=GOLD_BASE, width=sc(2.5))

    return c.downsample()

def create_layer_upperarm(is_left=True):
    """Puffy cream bishop sleeve upperarm segment."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    p1 = (256, 446) if is_left else (344, 446)
    p2 = (246, 474) if is_left else (354, 474)
    draw_capsule(draw, p1, p2, radius=13, fill=CREAM_DRESS, outline=OUTLINE, width=outline_w / SCALE)
    return c.downsample()

def create_layer_forearm(is_left=True):
    """Puffy cream sleeve forearm with teal-blue wrist cuff."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    p1 = (246, 472) if is_left else (354, 472)
    p2 = (238, 498) if is_left else (362, 498)
    draw_capsule(draw, p1, p2, radius=12, fill=CREAM_DRESS, outline=OUTLINE, width=outline_w / SCALE)
    # Teal-blue wrist cuff
    cx, cy = sc(p2)
    draw.ellipse([cx - sc(11), cy - sc(5), cx + sc(11), cy + sc(5)], fill=TEAL_ACCENT, outline=OUTLINE, width=sc(2))
    return c.downsample()

def create_layer_hand(is_left=True, gesture="mitten"):
    """Cute chubby chibi hands."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    hx = 236 if is_left else 364
    hy = 504
    sign = -1 if is_left else 1

    if gesture == "mitten":
        draw.ellipse([sc(hx - 12), sc(hy - 11), sc(hx + 12), sc(hy + 11)], fill=SKIN_BASE, outline=OUTLINE, width=outline_w)
        tx = hx + sign * 8
        ty = hy - 4
        draw.ellipse([sc(tx - 6), sc(ty - 6), sc(tx + 6), sc(ty + 6)], fill=SKIN_BASE, outline=OUTLINE, width=outline_w)

    elif gesture == "open":
        # Waving open palm hand
        draw.ellipse([sc(hx - 11), sc(hy - 10), sc(hx + 11), sc(hy + 10)], fill=SKIN_BASE, outline=OUTLINE, width=outline_w)
        for f_ang in [-30, -10, 10, 30]:
            rad = math.radians(f_ang)
            fx = hx + int(math.sin(rad) * 14 * sign)
            fy = hy - int(math.cos(rad) * 14)
            draw.ellipse([sc(fx - 4), sc(fy - 5), sc(fx + 4), sc(fy + 5)], fill=SKIN_BASE, outline=OUTLINE, width=sc(2))

    return c.downsample()

def create_layer_satchel():
    """Cute lavender adventurer hip pouch with teal-blue flap & gold clasp."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3)

    # Pouch on the left hip (around X: 334, Y: 504)
    px, py = sc(334), sc(504)
    pouch_pts = [sc((320, 496)), sc((348, 496)), sc((350, 520)), sc((318, 520))]
    draw.polygon(pouch_pts, fill=CAPE_LAVENDER, outline=OUTLINE, width=outline_w)

    # Teal-blue flap
    flap_pts = [sc((319, 496)), sc((349, 496)), sc((334, 510))]
    draw.polygon(flap_pts, fill=TEAL_ACCENT, outline=OUTLINE, width=sc(2))

    # Gold center clasp
    draw.ellipse([sc(331), sc(506), sc(337), sc(512)], fill=GOLD_BASE, outline=OUTLINE, width=sc(1.5))
    draw.ellipse([sc(333), sc(508), sc(335), sc(510)], fill=GOLD_SHINE)

    return c.downsample()

def create_layer_outfit_adventurer():
    """Alternate Voyager vest without cape."""
    c = ArtworkCanvas()
    draw = c.draw
    outline_w = sc(3.5)

    tunic_poly = [
        sc((282, 436)), sc((318, 436)), sc((344, 452)), sc((348, 510)),
        sc((332, 524)), sc((300, 526)), sc((268, 524)), sc((252, 510)), sc((256, 452))
    ]
    draw.polygon(tunic_poly, fill=(225, 210, 235, 255), outline=OUTLINE, width=outline_w)

    vest_l = [sc((282, 436)), sc((296, 436)), sc((294, 490)), sc((256, 488)), sc((256, 452))]
    draw.polygon(vest_l, fill=TEAL_ACCENT, outline=OUTLINE, width=outline_w)

    vest_r = [sc((304, 436)), sc((318, 436)), sc((344, 452)), sc((344, 488)), sc((306, 490))]
    draw.polygon(vest_r, fill=TEAL_ACCENT, outline=OUTLINE, width=outline_w)

    draw.ellipse([sc(291), sc(446), sc(297), sc(452)], fill=GOLD_BASE)
    draw.ellipse([sc(291), sc(462), sc(297), sc(468)], fill=GOLD_BASE)
    draw.ellipse([sc(291), sc(478), sc(297), sc(484)], fill=GOLD_BASE)

    return c.downsample()

# ══════════════════════════════════════════════════════════════════════════════
# MAIN ORCHESTRATION & EXPORT
# ══════════════════════════════════════════════════════════════════════════════

def main():
    output_dir = "/Users/dvtinh99/Documents/learn/china/linguaworld/scripts/luna_layers"
    os.makedirs(output_dir, exist_ok=True)

    print("Generating Luna character layers from luna-nanobanana...")

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
        "hand_r": create_layer_hand(is_left=False, gesture="mitten"),
        "upperarm_l": create_layer_upperarm(is_left=True),
        "forearm_l": create_layer_forearm(is_left=True),
        "hand_l": create_layer_hand(is_left=True, gesture="mitten"),
        "mantle_front": create_layer_mantle_front(),
        "accessory_front_satchel": create_layer_satchel(),
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
        # Expression & Hand Attachments
        "eye_blink_l": create_layer_eye(is_left=True, state="blink"),
        "eye_blink_r": create_layer_eye(is_left=False, state="blink"),
        "eye_star_l": create_layer_eye(is_left=True, state="star"),
        "eye_star_r": create_layer_eye(is_left=False, state="star"),
        "mouth_happy": create_layer_mouth(state="happy"),
        "mouth_surprised": create_layer_mouth(state="surprised"),
        "mouth_proud": create_layer_mouth(state="proud"),
        "hand_open_l": create_layer_hand(is_left=True, gesture="open"),
        "hand_open_r": create_layer_hand(is_left=False, gesture="open"),
        # Modular Equipment
        "hair_short": create_layer_hair_short(),
        "outfit_adventurer": create_layer_outfit_adventurer(),
        "shoes_boots_l": create_layer_foot(is_left=True, state="boots"),
        "shoes_boots_r": create_layer_foot(is_left=False, state="boots"),
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

    manifest_path = "/Users/dvtinh99/Documents/learn/china/linguaworld/scripts/luna_manifest.json"
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
        "mantle_front", "accessory_front_satchel",
        "head", "blush", "nose", "mouth",
        "eye_r", "eye_l", "brow_r", "brow_l",
        "hair_side_r", "hair_side_l", "hair_front"
    ]
    for layer_name in draw_order:
        comp.alpha_composite(layers[layer_name])

    preview_path = "/Users/dvtinh99/Documents/learn/china/linguaworld/scripts/luna_preview.png"
    comp.save(preview_path, "PNG")
    print(f"\nManifest saved to: {manifest_path}")
    print(f"Full character preview saved to: {preview_path}")

if __name__ == "__main__":
    main()
