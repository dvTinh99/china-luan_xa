// ============================================================================
// PixiJS 8 Chibi Rig Character Engine — Luma Adventurer & Modular 2D RPG Gear
// Conforms strictly to CHIBI_CHARACTER.md & CHARACTER_CONCEPT.md
//
// Key Art Direction Rules:
// 1. Soft dark-brown outlines (0x3d281d), NEVER harsh pure-black outlines.
// 2. Soft cel-shading with 2-3 levels (base, shadow, highlight).
// 3. 2.5–3 heads tall chibi proportions with large expressive anime head.
// 4. Multi-layered anime eyes (sclera, lid shadow, layered iris, pupil, highlights).
// 5. 6 canonical expressions: neutral, happy, curious, surprised, sleepy, proud.
// 6. Signature dynamic ahoge with spring sway physics.
// 7. Full modular support for:
//    - Hair: Short Layered, Medium Wavy, Long Fantasy, Adventurer, Topknot, Wanderer.
//    - Hats: Fantasy Beret, Adventurer Hood, Nature-Themed Hat, Scholar Cap, Straw Hat, Phoenix Crown.
//    - Outfits: Explorer Tunic, Forest Ranger, Academy Robe, Silk Robe, Leather Vest, Dragon Robe.
//    - Shoes: Adventure Boots, Fantasy Cloth, Nature Sandals, Embroidered, Cloth Shoes.
//    - Accessories: Round Glasses, Small Scarf, Decorative Necklace, Explorer Satchel, Bamboo Brush, Wooden Sword, Jade Pendant.
// ============================================================================

import { Application, Container, Graphics } from 'pixi.js';
import type { CharacterAppearanceState, CharacterEmote } from '../../types/character';
import { SpineCharacterAdapter } from './spine-adapter.client';

// ── Palette Constants (CHARACTER_CONCEPT.md Art Direction 2.0 Super Deformed) ─
const PALETTE = {
  // Outlines & Creases (Dark Plum Outline, NEVER pure black)
  OUTLINE_MAIN: 0x493747,
  OUTLINE_SOFT: 0x5c425a,
  OUTLINE_LIGHT: 0x7c5d7a,

  // Skin Tones (Warm Anime Cel-Shading)
  SKIN_BASE: 0xf5d9c4,
  SKIN_SHADOW: 0xe8be9e,
  SKIN_NECK_SHADOW: 0xdfb09e,
  BLUSH: 0xfca5a5,
  BLUSH_SPECULAR: 0xffffff,

  // Hair Tones (Mystic Lavender Art Direction 2.0)
  HAIR_BASE: 0xb9a0d9,
  HAIR_SHADOW: 0x9d7ec4,
  HAIR_HIGHLIGHT: 0xd8c5f0,

  // Base & Equipment Colors (Soft Cream, Fantasy Blue, Nature Green)
  TUNIC_CREAM_BASE: 0xf8ebd5,
  TUNIC_CREAM_SHADOW: 0xe8d5ba,
  JACKET_SAGE_BASE: 0x78a9d9,
  JACKET_SAGE_SHADOW: 0x5584b5,
  JACKET_SAGE_HIGHLIGHT: 0x9bc2e8,
  FOREST_GREEN_BASE: 0x9cc8a1,
  FOREST_GREEN_SHADOW: 0x76a77c,
  ACADEMY_NAVY_BASE: 0x1e3a8a,
  ACADEMY_NAVY_SHADOW: 0x172554,

  // Leather & Hardware Accents (Warm Gold)
  LEATHER_BASE: 0x8b5a2b,
  LEATHER_SHADOW: 0x5c3d1e,
  BRASS_GOLD_BASE: 0xe8b76b,
  BRASS_GOLD_SHADOW: 0xc89849,
  BRASS_GOLD_SHINE: 0xfbe2a8,

  // Eye Elements (Fantasy Blue Iris)
  EYE_SCLERA: 0xfbf9f5,
  EYE_LID_SHADOW: 0x493747,
  IRIS_TOP_SHADOW: 0x493747,
  IRIS_MID_SAGE: 0x78a9d9,
  IRIS_LUMINOUS: 0xb9a0d9,
  IRIS_PUPIL: 0x251a24,

  // Floor Shadow
  FLOOR_SHADOW: 0x332230,
};

export class PixiChibiCharacterEngine {
  private app: Application | null = null;
  private containerElement: HTMLElement | null = null;
  private isDestroyed = false;

  // Spine Runtime Adapter
  private spineAdapter = new SpineCharacterAdapter();
  private usingSpine = false;
  private spineContainer: Container | null = null;

  // Rig Hierarchy (Modular Skeletal Layering)
  private stageRoot: Container | null = null;
  private shadowGraphics: Graphics | null = null;

  // Body Container (Translates for breathing and bounces)
  private bodyContainer: Container | null = null;
  private backHairGraphics: Graphics | null = null;
  private legsAndShoesGraphics: Graphics | null = null;
  private outfitBaseGraphics: Graphics | null = null;
  private outfitJacketGraphics: Graphics | null = null;
  private outfitBeltGraphics: Graphics | null = null;
  private leftArmContainer: Container | null = null;
  private leftArmGraphics: Graphics | null = null;
  private rightArmContainer: Container | null = null;
  private rightArmGraphics: Graphics | null = null;
  private accessoryBackGraphics: Graphics | null = null;
  private accessoryFrontGraphics: Graphics | null = null;

  // Head Container (Translates and rotates for curious head-tilts)
  private headContainer: Container | null = null;
  private headBaseGraphics: Graphics | null = null;
  private faceFeaturesGraphics: Graphics | null = null;
  private eyesGraphics: Graphics | null = null;
  private mouthGraphics: Graphics | null = null;
  private frontHairGraphics: Graphics | null = null;
  private ahogeGraphics: Graphics | null = null;
  private hatGraphics: Graphics | null = null;
  private glassesGraphics: Graphics | null = null;
  private sparkleGraphics: Graphics | null = null;

  // Animation & Physics State
  private currentAppearance: CharacterAppearanceState;
  private currentEmote: CharacterEmote = 'idle';
  private animationTime = 0;
  private blinkTimer = 0;
  private isBlinking = false;
  private headTiltTarget = 0;
  private currentHeadTilt = 0;

  constructor(initialAppearance: CharacterAppearanceState) {
    this.currentAppearance = { ...initialAppearance };
    this.currentEmote = initialAppearance.expression || 'idle';
  }

  /**
   * Initializes PixiJS 8 Application with antialiasing and transparent background
   */
  async init(container: HTMLElement): Promise<void> {
    if (this.isDestroyed) return;
    this.containerElement = container;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 460;

    this.app = new Application();
    await this.app.init({
      width,
      height,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    if (this.isDestroyed) {
      this.app.destroy(true);
      return;
    }

    container.appendChild(this.app.canvas);

    // Attempt to load production Spine 4.3 Nanobanana character
    const spineLoaded = await this.spineAdapter.loadProductionSpine({
      skeletonPath: '/assets/spine/character/chibi_hero.json',
      atlasPath: '/assets/spine/character/chibi_hero.atlas',
      texturePath: '/assets/spine/character/luma.png',
    });

    if (spineLoaded && this.spineAdapter.hasProductionModel()) {
      this.usingSpine = true;
      this.setupSpineScene(width, height);
    } else {
      this.usingSpine = false;
      this.setupScene(width, height);
      // Setup 60 FPS ticker for procedural vector fallback
      this.app.ticker.add(this.updateAnimation, this);
    }

    // Dynamic resize handler
    window.addEventListener('resize', this.onResize);
  }

  /**
   * Sets up production Spine 4.3 character scene
   */
  private setupSpineScene(width: number, height: number): void {
    if (!this.app) return;

    const spineDisplay = this.spineAdapter.getSpineDisplay();
    if (!spineDisplay) return;

    this.spineContainer = new Container();
    this.app.stage.addChild(this.spineContainer);

    // Soft Floor Shadow for Spine model
    this.shadowGraphics = new Graphics();
    this.shadowGraphics.ellipse(0, 5, 88, 20);
    this.shadowGraphics.fill({ color: PALETTE.FLOOR_SHADOW, alpha: 0.28 });
    this.spineContainer.addChild(this.shadowGraphics);

    this.spineContainer.addChild(spineDisplay);
    this.updateSpineLayout(width, height);

    this.syncSpineSkin();
    this.syncSpineAnimation();
  }

  /**
   * Updates Spine character positioning and proportional scaling
   */
  private updateSpineLayout(width: number, height: number): void {
    if (!this.spineContainer) return;
    const spineDisplay = this.spineAdapter.getSpineDisplay();
    if (!spineDisplay) return;

    // Center horizontally, anchor feet near 90% of container height
    this.spineContainer.x = width / 2;
    this.spineContainer.y = height * 0.90;

    // Chibi skeleton bounds: width ~379, height ~597
    const targetHeight = Math.min(height * 0.78, 380);
    const targetWidth = width * 0.75;
    const scale = Math.min(targetHeight / 597, targetWidth / 379);

    spineDisplay.scale.set(scale, scale);
  }

  /**
   * Synchronizes current expression with production Spine keyframed animations
   */
  private syncSpineAnimation(): void {
    if (!this.usingSpine) return;

    let animName = 'idle_breathe';
    switch (this.currentEmote) {
      case 'happy':
        animName = 'happy';
        break;
      case 'curious':
        animName = 'curious';
        break;
      case 'surprised':
        animName = 'surprised';
        break;
      case 'sleepy':
        animName = 'sleepy';
        break;
      case 'proud':
        animName = 'proud';
        break;
      case 'breathe':
      case 'idle':
      default:
        animName = 'idle_breathe';
        break;
    }

    this.spineAdapter.setAnimation(animName, true);
  }

  /**
   * Synchronizes outfit variant with production Spine skins
   */
  private syncSpineSkin(): void {
    if (!this.usingSpine) return;

    const outfit = this.currentAppearance.outfitId;
    let skinName = 'skin_explorer';
    if (outfit?.includes('adventurer') || outfit?.includes('ranger')) {
      skinName = 'skin_adventurer';
    } else {
      skinName = 'skin_explorer';
    }

    this.spineAdapter.setSkin(skinName);
  }

  /**
   * Builds the modular 2D rig tree matching CHARACTER_CONCEPT.md §Modular Character Requirements
   */
  private setupScene(width: number, height: number): void {
    if (!this.app) return;

    this.stageRoot = new Container();
    this.stageRoot.x = width / 2;
    this.stageRoot.y = height * 0.74; // Ground baseline for 2.6 heads chibi
    this.app.stage.addChild(this.stageRoot);

    // 1. Soft Floor Shadow
    this.shadowGraphics = new Graphics();
    this.stageRoot.addChild(this.shadowGraphics);

    // 2. Body Container (Skeletal root for torso, limbs, and head)
    this.bodyContainer = new Container();
    this.stageRoot.addChild(this.bodyContainer);

    // 3. Back Hair (Behind neck and torso)
    this.backHairGraphics = new Graphics();
    this.bodyContainer.addChild(this.backHairGraphics);

    // 4. Back Accessory (e.g. Back scabbard/quiver)
    this.accessoryBackGraphics = new Graphics();
    this.bodyContainer.addChild(this.accessoryBackGraphics);

    // 5. Legs & Shoes
    this.legsAndShoesGraphics = new Graphics();
    this.bodyContainer.addChild(this.legsAndShoesGraphics);

    // 6. Torso Outfit Layers (Base Tunic, Jacket, Belt)
    this.outfitBaseGraphics = new Graphics();
    this.outfitJacketGraphics = new Graphics();
    this.outfitBeltGraphics = new Graphics();
    this.bodyContainer.addChild(this.outfitBaseGraphics);
    this.bodyContainer.addChild(this.outfitJacketGraphics);
    this.bodyContainer.addChild(this.outfitBeltGraphics);

    // 7. Left Arm (Behind front accessories, layered naturally)
    this.leftArmContainer = new Container();
    this.leftArmGraphics = new Graphics();
    this.leftArmContainer.addChild(this.leftArmGraphics);
    this.bodyContainer.addChild(this.leftArmContainer);

    // 8. Right Arm
    this.rightArmContainer = new Container();
    this.rightArmGraphics = new Graphics();
    this.rightArmContainer.addChild(this.rightArmGraphics);
    this.bodyContainer.addChild(this.rightArmContainer);

    // 9. Front Crossbody Accessory (Explorer satchel strap, scarf, necklace)
    this.accessoryFrontGraphics = new Graphics();
    this.bodyContainer.addChild(this.accessoryFrontGraphics);

    // 10. Head Container (Rotates independently for curious expressions)
    this.headContainer = new Container();
    this.bodyContainer.addChild(this.headContainer);

    // 11. Head Facial Layers
    this.headBaseGraphics = new Graphics();
    this.faceFeaturesGraphics = new Graphics();
    this.eyesGraphics = new Graphics();
    this.glassesGraphics = new Graphics();
    this.mouthGraphics = new Graphics();
    this.frontHairGraphics = new Graphics();
    this.ahogeGraphics = new Graphics();
    this.hatGraphics = new Graphics();
    this.sparkleGraphics = new Graphics();

    this.headContainer.addChild(this.headBaseGraphics);
    this.headContainer.addChild(this.faceFeaturesGraphics);
    this.headContainer.addChild(this.eyesGraphics);
    this.headContainer.addChild(this.glassesGraphics);
    this.headContainer.addChild(this.mouthGraphics);
    this.headContainer.addChild(this.frontHairGraphics);
    this.headContainer.addChild(this.ahogeGraphics);
    this.headContainer.addChild(this.hatGraphics);
    this.headContainer.addChild(this.sparkleGraphics);

    this.redrawAllSlots();
  }

  /**
   * Complete re-skin of all vector slots
   */
  private redrawAllSlots(): void {
    this.drawFloorShadow();
    this.drawBackHair();
    this.drawLegsAndShoes();
    this.drawTorsoOutfit();
    this.drawArms();
    this.drawAccessory();
    this.drawHeadBase();
    this.drawFaceFeatures();
    this.drawEyes(false);
    this.drawGlasses();
    this.drawMouth();
    this.drawFrontHair();
    this.drawAhoge();
    this.drawHat();
    this.drawSparkles();
  }

  // ── Vector Rig Drawing Implementations ─────────────────────────────────────

  private drawFloorShadow(): void {
    if (!this.shadowGraphics) return;
    this.shadowGraphics.clear();
    // Warm gentle floor shadow with soft cel edge
    this.shadowGraphics.ellipse(0, 10, 72, 16);
    this.shadowGraphics.fill({ color: PALETTE.FLOOR_SHADOW, alpha: 0.24 });
  }

  private drawBackHair(): void {
    if (!this.backHairGraphics) return;
    this.backHairGraphics.clear();

    const hairId = this.currentAppearance.hairId;
    const baseColor = this.getHairColor();
    const shadowColor = PALETTE.HAIR_SHADOW;

    if (hairId === 'hair_topknot') {
      // Scholar Topknot Bun sitting on crown behind head
      this.backHairGraphics.circle(0, -188, 20);
      this.backHairGraphics.fill({ color: shadowColor });
      this.backHairGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      this.backHairGraphics.circle(0, -186, 17);
      this.backHairGraphics.fill({ color: baseColor });

      // Hairpin (Trâm cài)
      this.backHairGraphics.roundRect(-26, -189, 52, 6, 3);
      this.backHairGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });
      this.backHairGraphics.stroke({ width: 1.5, color: PALETTE.OUTLINE_MAIN });
    } else if (hairId === 'hair_wanderer') {
      // Flowing wanderer locks peeking from behind shoulders
      this.backHairGraphics.poly([-48, -130, -56, -70, -38, -60, -32, -90]);
      this.backHairGraphics.poly([48, -130, 56, -70, 38, -60, 32, -90]);
      this.backHairGraphics.fill({ color: shadowColor });
      this.backHairGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });
    } else if (hairId === 'hair_long_fantasy') {
      // Long Fantasy Hairstyle: Twin elegant flowing mantles behind shoulders
      this.backHairGraphics.poly([-52, -145, -62, -50, -42, -45, -34, -100]);
      this.backHairGraphics.poly([52, -145, 62, -50, 42, -45, 34, -100]);
      this.backHairGraphics.roundRect(-46, -150, 92, 90, 24);
      this.backHairGraphics.fill({ color: shadowColor });
      this.backHairGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });
    } else if (hairId === 'hair_medium_wavy') {
      // Medium Wavy Hairstyle: Soft wavy shoulder curls
      this.backHairGraphics.roundRect(-50, -148, 100, 78, 26);
      this.backHairGraphics.fill({ color: shadowColor });
      this.backHairGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      this.backHairGraphics.circle(-46, -78, 12);
      this.backHairGraphics.circle(46, -78, 12);
      this.backHairGraphics.fill({ color: baseColor });
      this.backHairGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });
    } else {
      // Default: Short Layered / Luma Adventurer Layered Back Hair
      this.backHairGraphics.roundRect(-48, -145, 96, 68, 24);
      this.backHairGraphics.fill({ color: shadowColor });
      this.backHairGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      // Left & right shoulder tufts
      this.backHairGraphics.poly([-42, -90, -52, -62, -32, -72]);
      this.backHairGraphics.poly([42, -90, 52, -62, 32, -72]);
      this.backHairGraphics.fill({ color: baseColor });
      this.backHairGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });
    }
  }

  private drawLegsAndShoes(): void {
    if (!this.legsAndShoesGraphics) return;
    this.legsAndShoesGraphics.clear();

    const shoesId = this.currentAppearance.shoesId || 'shoes_adventure_boots';

    // Pants / Tights (Dark charcoal warm linen)
    const pantsColor = 0x3d312a;
    // Left leg
    this.legsAndShoesGraphics.roundRect(-24, -26, 14, 28, 4);
    // Right leg
    this.legsAndShoesGraphics.roundRect(10, -26, 14, 28, 4);
    this.legsAndShoesGraphics.fill({ color: pantsColor });
    this.legsAndShoesGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });

    if (shoesId === 'shoes_embroidered' || shoesId === 'shoes_fantasy_cloth') {
      // Soft Fantasy Cloth Shoes / Embroidered Silk Shoes
      const shoeColor = shoesId === 'shoes_fantasy_cloth' ? PALETTE.JACKET_SAGE_BASE : 0x059669;
      // Left
      this.legsAndShoesGraphics.roundRect(-30, -6, 24, 16, 7);
      this.legsAndShoesGraphics.fill({ color: shoeColor });
      this.legsAndShoesGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });
      // Right
      this.legsAndShoesGraphics.roundRect(6, -6, 24, 16, 7);
      this.legsAndShoesGraphics.fill({ color: shoeColor });
      this.legsAndShoesGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });

      // Gold embroidery trim around ankle opening
      this.legsAndShoesGraphics.roundRect(-28, -6, 20, 4, 2);
      this.legsAndShoesGraphics.roundRect(8, -6, 20, 4, 2);
      this.legsAndShoesGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });
    } else if (shoesId === 'shoes_nature_sandals') {
      // Nature-Themed Sandals (Strapped natural leather sandals)
      const soleColor = 0xb45309;
      // Left sole
      this.legsAndShoesGraphics.roundRect(-29, -3, 23, 9, 3);
      // Right sole
      this.legsAndShoesGraphics.roundRect(6, -3, 23, 9, 3);
      this.legsAndShoesGraphics.fill({ color: soleColor });
      this.legsAndShoesGraphics.stroke({ width: 1.8, color: PALETTE.OUTLINE_MAIN });

      // Criss-cross leather straps
      this.legsAndShoesGraphics.poly([-28, -12, -22, -3, -18, -12]);
      this.legsAndShoesGraphics.poly([7, -12, 13, -3, 17, -12]);
      this.legsAndShoesGraphics.stroke({ width: 2, color: PALETTE.LEATHER_SHADOW });
    } else if (shoesId === 'shoes_cloth') {
      // Cloth shoes (Hài Vải Hành Hiệp)
      const clothColor = 0x475569;
      this.legsAndShoesGraphics.roundRect(-28, -6, 22, 16, 6);
      this.legsAndShoesGraphics.roundRect(6, -6, 22, 16, 6);
      this.legsAndShoesGraphics.fill({ color: clothColor });
      this.legsAndShoesGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });
    } else {
      // Simple Adventure Boots (Luma Adventurer Soft Leather Boots)
      // Left Boot
      this.legsAndShoesGraphics.roundRect(-29, -10, 23, 20, 7);
      this.legsAndShoesGraphics.fill({ color: PALETTE.LEATHER_BASE });
      this.legsAndShoesGraphics.stroke({ width: 2.2, color: PALETTE.OUTLINE_MAIN });

      // Left Folded Linen Cuff
      this.legsAndShoesGraphics.roundRect(-30, -12, 25, 8, 3);
      this.legsAndShoesGraphics.fill({ color: PALETTE.TUNIC_CREAM_BASE });
      this.legsAndShoesGraphics.stroke({ width: 1.8, color: PALETTE.OUTLINE_MAIN });

      // Left Brass Buckle
      this.legsAndShoesGraphics.roundRect(-24, -3, 8, 5, 2);
      this.legsAndShoesGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });

      // Right Boot
      this.legsAndShoesGraphics.roundRect(6, -10, 23, 20, 7);
      this.legsAndShoesGraphics.fill({ color: PALETTE.LEATHER_BASE });
      this.legsAndShoesGraphics.stroke({ width: 2.2, color: PALETTE.OUTLINE_MAIN });

      // Right Folded Linen Cuff
      this.legsAndShoesGraphics.roundRect(5, -12, 25, 8, 3);
      this.legsAndShoesGraphics.fill({ color: PALETTE.TUNIC_CREAM_BASE });
      this.legsAndShoesGraphics.stroke({ width: 1.8, color: PALETTE.OUTLINE_MAIN });

      // Right Brass Buckle
      this.legsAndShoesGraphics.roundRect(16, -3, 8, 5, 2);
      this.legsAndShoesGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });
    }
  }

  private drawTorsoOutfit(): void {
    if (!this.outfitBaseGraphics || !this.outfitJacketGraphics || !this.outfitBeltGraphics) return;
    this.outfitBaseGraphics.clear();
    this.outfitJacketGraphics.clear();
    this.outfitBeltGraphics.clear();

    const outfitId = this.currentAppearance.outfitId;

    if (outfitId === 'outfit_forest_ranger') {
      // ── Forest Ranger Outfit ──────────────────────────────────────────────
      // Forest Green Tunic Base
      this.outfitBaseGraphics.poly([-34, -76, 34, -76, 38, -12, -38, -12]);
      this.outfitBaseGraphics.fill({ color: PALETTE.FOREST_GREEN_BASE });
      this.outfitBaseGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      // Tan Leather Shoulder Yokes
      this.outfitJacketGraphics.poly([-36, -74, -14, -74, -18, -48, -36, -48]);
      this.outfitJacketGraphics.poly([36, -74, 14, -74, 18, -48, 36, -48]);
      this.outfitJacketGraphics.fill({ color: PALETTE.LEATHER_BASE });
      this.outfitJacketGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });

      // Criss-Cross Lacing at Collar
      this.outfitJacketGraphics.poly([-6, -66, 6, -58, -6, -50, 6, -42]);
      this.outfitJacketGraphics.stroke({ width: 1.8, color: PALETTE.BRASS_GOLD_SHINE });

      // Ranger Utility Belt & Dual Pouches
      this.outfitBeltGraphics.roundRect(-36, -26, 72, 13, 3);
      this.outfitBeltGraphics.fill({ color: PALETTE.LEATHER_SHADOW });
      this.outfitBeltGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });

      // Left utility pouch
      this.outfitBeltGraphics.roundRect(-32, -28, 12, 16, 3);
      this.outfitBeltGraphics.fill({ color: PALETTE.LEATHER_BASE });
      this.outfitBeltGraphics.stroke({ width: 1.5, color: PALETTE.OUTLINE_MAIN });

      // Right acorn button
      this.outfitBeltGraphics.circle(24, -20, 3.5);
      this.outfitBeltGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });
    } else if (outfitId === 'outfit_academy_robe') {
      // ── Elegant Academy Outfit ────────────────────────────────────────────
      // Midnight Navy Blue Scholar Robe
      this.outfitBaseGraphics.poly([-36, -76, 36, -76, 42, -6, -42, -6]);
      this.outfitBaseGraphics.fill({ color: PALETTE.ACADEMY_NAVY_BASE });
      this.outfitBaseGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      // Cream Lapels with Gold Filigree Piping
      this.outfitJacketGraphics.poly([-26, -74, 0, -42, -14, -74]);
      this.outfitJacketGraphics.poly([26, -74, 0, -42, 14, -74]);
      this.outfitJacketGraphics.fill({ color: PALETTE.TUNIC_CREAM_BASE });
      this.outfitJacketGraphics.stroke({ width: 2, color: PALETTE.BRASS_GOLD_BASE });

      // Structured High Collar Accent
      this.outfitJacketGraphics.roundRect(-16, -76, 32, 8, 3);
      this.outfitJacketGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });

      // Academy Crest Sash
      this.outfitBeltGraphics.roundRect(-36, -26, 72, 13, 3);
      this.outfitBeltGraphics.fill({ color: PALETTE.ACADEMY_NAVY_SHADOW });
      this.outfitBeltGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });

      // Academy Golden Crest
      this.outfitBeltGraphics.roundRect(-9, -29, 18, 18, 4);
      this.outfitBeltGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });
      this.outfitBeltGraphics.stroke({ width: 1.5, color: PALETTE.BRASS_GOLD_SHINE });
    } else if (outfitId === 'item_silk_robe' || outfitId === 'outfit_novice') {
      // Traditional Scholar Silk Robe (Hanfu Blue / Indigo)
      const silkBlue = 0x3b82f6;
      const silkShadow = 0x1d4ed8;

      // Lower Skirt
      this.outfitBaseGraphics.poly([-38, -12, 38, -12, 44, 2, -44, 2]);
      this.outfitBaseGraphics.fill({ color: silkShadow });
      this.outfitBaseGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      // Robe Torso
      this.outfitBaseGraphics.roundRect(-34, -76, 68, 68, 12);
      this.outfitBaseGraphics.fill({ color: silkBlue });
      this.outfitBaseGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      // Cross collar (Yiling)
      this.outfitJacketGraphics.poly([-26, -74, 0, -46, 6, -46, -18, -74]);
      this.outfitJacketGraphics.fill({ color: 0xfef08a, alpha: 0.9 });
      this.outfitJacketGraphics.poly([26, -74, 0, -46, -6, -46, 18, -74]);
      this.outfitJacketGraphics.fill({ color: 0xffffff, alpha: 0.95 });
      this.outfitJacketGraphics.stroke({ width: 1.5, color: PALETTE.BRASS_GOLD_BASE });

      // Sash Belt
      this.outfitBeltGraphics.roundRect(-36, -28, 72, 14, 4);
      this.outfitBeltGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });
      this.outfitBeltGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });

      // Jade Belt Buckle
      this.outfitBeltGraphics.roundRect(-8, -30, 16, 18, 4);
      this.outfitBeltGraphics.fill({ color: 0x10b981 });
      this.outfitBeltGraphics.stroke({ width: 1.5, color: PALETTE.BRASS_GOLD_SHINE });
    } else if (outfitId === 'item_leather_vest') {
      // Traveler Leather Vest
      this.outfitBaseGraphics.roundRect(-32, -74, 64, 62, 10);
      this.outfitBaseGraphics.fill({ color: PALETTE.TUNIC_CREAM_BASE });
      this.outfitBaseGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      this.outfitJacketGraphics.poly([-34, -72, -12, -72, -8, -24, -36, -24]);
      this.outfitJacketGraphics.poly([34, -72, 12, -72, 8, -24, 36, -24]);
      this.outfitJacketGraphics.fill({ color: PALETTE.LEATHER_BASE });
      this.outfitJacketGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      this.outfitBeltGraphics.roundRect(-35, -28, 70, 13, 3);
      this.outfitBeltGraphics.fill({ color: PALETTE.LEATHER_SHADOW });
      this.outfitBeltGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });
    } else {
      // ── Canonical Cozy Explorer Tunic / Luma Adventurer Outfit ─────────────
      // 1. Layer A: Cream Linen Tunic Base
      this.outfitBaseGraphics.poly([-32, -76, 32, -76, 36, -14, -36, -14]);
      this.outfitBaseGraphics.fill({ color: PALETTE.TUNIC_CREAM_BASE });
      this.outfitBaseGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      // Tunic Cel Shadow fold
      this.outfitBaseGraphics.poly([-36, -24, 36, -24, 36, -14, -36, -14]);
      this.outfitBaseGraphics.fill({ color: PALETTE.TUNIC_CREAM_SHADOW, alpha: 0.7 });

      // 2. Layer B: Sage Green Fantasy Adventurer Jacket / Vest
      this.outfitJacketGraphics.poly([-35, -74, -14, -74, -10, -22, -37, -22]);
      this.outfitJacketGraphics.poly([35, -74, 14, -74, 10, -22, 37, -22]);
      this.outfitJacketGraphics.fill({ color: PALETTE.JACKET_SAGE_BASE });
      this.outfitJacketGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      // Soft jacket collar lapels with highlight trim
      this.outfitJacketGraphics.poly([-14, -74, -8, -52, -18, -66]);
      this.outfitJacketGraphics.poly([14, -74, 8, -52, 18, -66]);
      this.outfitJacketGraphics.fill({ color: PALETTE.JACKET_SAGE_HIGHLIGHT });
      this.outfitJacketGraphics.stroke({ width: 1.5, color: PALETTE.OUTLINE_MAIN });

      // 3. Layer C: Leather Adventurer Belt with Brass Buckle
      this.outfitBeltGraphics.roundRect(-36, -26, 72, 13, 3);
      this.outfitBeltGraphics.fill({ color: PALETTE.LEATHER_BASE });
      this.outfitBeltGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });

      // Brass Rectangular Buckle
      this.outfitBeltGraphics.roundRect(-8, -28, 16, 17, 3);
      this.outfitBeltGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });
      this.outfitBeltGraphics.stroke({ width: 1.8, color: PALETTE.OUTLINE_MAIN });

      this.outfitBeltGraphics.roundRect(-4, -25, 8, 11, 2);
      this.outfitBeltGraphics.fill({ color: PALETTE.LEATHER_SHADOW });

      // Small Adventurer Token / Compass Pin (Curiosity symbol)
      this.outfitBeltGraphics.circle(18, -20, 4);
      this.outfitBeltGraphics.fill({ color: PALETTE.BRASS_GOLD_SHINE });
      this.outfitBeltGraphics.stroke({ width: 1.2, color: PALETTE.OUTLINE_MAIN });
    }
  }

  private drawArms(): void {
    if (!this.leftArmGraphics || !this.rightArmGraphics) return;
    this.leftArmGraphics.clear();
    this.rightArmGraphics.clear();

    const outfitId = this.currentAppearance.outfitId;
    let sleeveColor = PALETTE.JACKET_SAGE_BASE;
    if (outfitId === 'outfit_forest_ranger') sleeveColor = PALETTE.FOREST_GREEN_BASE;
    if (outfitId === 'outfit_academy_robe') sleeveColor = PALETTE.ACADEMY_NAVY_BASE;
    if (outfitId === 'item_silk_robe' || outfitId === 'outfit_novice') sleeveColor = 0x3b82f6;
    if (outfitId === 'item_leather_vest') sleeveColor = PALETTE.TUNIC_CREAM_BASE;

    // Left Arm (Naturally resting slightly away from torso)
    this.leftArmGraphics.roundRect(-52, -68, 18, 42, 8);
    this.leftArmGraphics.fill({ color: sleeveColor });
    this.leftArmGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

    // Left Sleeve Linen Cuff
    this.leftArmGraphics.roundRect(-53, -30, 20, 7, 2);
    this.leftArmGraphics.fill({ color: PALETTE.TUNIC_CREAM_BASE });
    this.leftArmGraphics.stroke({ width: 1.5, color: PALETTE.OUTLINE_MAIN });

    // Left Hand (Cute chibi rounded hand)
    this.leftArmGraphics.circle(-43, -20, 8.5);
    this.leftArmGraphics.fill({ color: PALETTE.SKIN_BASE });
    this.leftArmGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });

    // Right Arm
    this.rightArmGraphics.roundRect(34, -68, 18, 42, 8);
    this.rightArmGraphics.fill({ color: sleeveColor });
    this.rightArmGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

    // Right Sleeve Linen Cuff
    this.rightArmGraphics.roundRect(33, -30, 20, 7, 2);
    this.rightArmGraphics.fill({ color: PALETTE.TUNIC_CREAM_BASE });
    this.rightArmGraphics.stroke({ width: 1.5, color: PALETTE.OUTLINE_MAIN });

    // Right Hand
    this.rightArmGraphics.circle(43, -20, 8.5);
    this.rightArmGraphics.fill({ color: PALETTE.SKIN_BASE });
    this.rightArmGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });
  }

  private drawAccessory(): void {
    if (!this.accessoryFrontGraphics || !this.accessoryBackGraphics) return;
    this.accessoryFrontGraphics.clear();
    this.accessoryBackGraphics.clear();

    const accId = this.currentAppearance.accessoryId || 'accessory_luma_satchel';

    if (accId === 'acc_small_scarf') {
      // ── Small Scarf: Warm cozy knitted wool scarf wrapped around neck ─────
      const scarfColor = 0xb45309; // Terracotta / warm amber
      this.accessoryFrontGraphics.roundRect(-24, -86, 48, 18, 7);
      this.accessoryFrontGraphics.fill({ color: scarfColor });
      this.accessoryFrontGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });

      // Scarf Tail draped over left shoulder
      this.accessoryFrontGraphics.poly([-18, -74, -8, -74, -10, -46, -22, -46]);
      this.accessoryFrontGraphics.fill({ color: 0x92400e });
      this.accessoryFrontGraphics.stroke({ width: 1.8, color: PALETTE.OUTLINE_MAIN });

      // Scarf Fringes
      this.accessoryFrontGraphics.poly([-22, -46, -10, -46, -11, -42, -21, -42]);
      this.accessoryFrontGraphics.fill({ color: PALETTE.BRASS_GOLD_SHINE });
    } else if (accId === 'acc_decorative_necklace') {
      // ── Decorative Necklace: Braided cord with glowing amber talisman ──────
      this.accessoryFrontGraphics.arc(0, -78, 18, 0.2, Math.PI - 0.2, false);
      this.accessoryFrontGraphics.stroke({ width: 2, color: PALETTE.LEATHER_SHADOW });

      // Glowing Amber / Jade Talisman
      this.accessoryFrontGraphics.circle(0, -60, 6.5);
      this.accessoryFrontGraphics.fill({ color: 0xf59e0b });
      this.accessoryFrontGraphics.stroke({ width: 1.5, color: PALETTE.BRASS_GOLD_SHINE });

      // Center Specular
      this.accessoryFrontGraphics.circle(-2, -62, 2);
      this.accessoryFrontGraphics.fill({ color: 0xffffff });
    } else if (accId === 'accessory_luma_satchel') {
      // Luma Explorer Satchel (Diagonal Crossbody Leather Strap)
      this.accessoryFrontGraphics.poly([22, -72, 28, -72, -32, -22, -38, -22]);
      this.accessoryFrontGraphics.fill({ color: PALETTE.LEATHER_BASE });
      this.accessoryFrontGraphics.stroke({ width: 1.8, color: PALETTE.OUTLINE_MAIN });

      // Brass strap adjustment buckle
      this.accessoryFrontGraphics.roundRect(-4, -50, 8, 6, 2);
      this.accessoryFrontGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });
      this.accessoryFrontGraphics.stroke({ width: 1.2, color: PALETTE.OUTLINE_MAIN });

      // Satchel Pouch resting on left hip
      this.accessoryFrontGraphics.roundRect(-54, -28, 22, 24, 5);
      this.accessoryFrontGraphics.fill({ color: PALETTE.LEATHER_BASE });
      this.accessoryFrontGraphics.stroke({ width: 2.2, color: PALETTE.OUTLINE_MAIN });

      // Satchel Flap
      this.accessoryFrontGraphics.poly([-55, -28, -31, -28, -34, -14, -52, -14]);
      this.accessoryFrontGraphics.fill({ color: PALETTE.LEATHER_SHADOW });
      this.accessoryFrontGraphics.stroke({ width: 1.8, color: PALETTE.OUTLINE_MAIN });

      // Brass Clasp
      this.accessoryFrontGraphics.circle(-43, -13, 3);
      this.accessoryFrontGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });
    } else if (accId === 'item_bamboo_brush') {
      // Bamboo Calligraphy Brush held in left hand
      this.accessoryFrontGraphics.roundRect(-66, -58, 7, 54, 3);
      this.accessoryFrontGraphics.fill({ color: 0x15803d });
      this.accessoryFrontGraphics.stroke({ width: 1.5, color: PALETTE.OUTLINE_MAIN });

      this.accessoryFrontGraphics.poly([-67, -6, -59, -6, -63, 10]);
      this.accessoryFrontGraphics.fill({ color: 0x221711 });
      this.accessoryFrontGraphics.stroke({ width: 1.2, color: PALETTE.OUTLINE_MAIN });
    } else if (accId === 'item_wooden_sword') {
      // Practice Wooden Sword strapped to back
      this.accessoryBackGraphics.roundRect(-66, -72, 8, 64, 3);
      this.accessoryBackGraphics.fill({ color: 0xa16207 });
      this.accessoryBackGraphics.stroke({ width: 1.8, color: PALETTE.OUTLINE_MAIN });

      this.accessoryBackGraphics.roundRect(-74, -26, 24, 6, 2);
      this.accessoryBackGraphics.fill({ color: PALETTE.LEATHER_SHADOW });
    } else if (accId === 'item_jade_pendant') {
      // Peace Jade Pendant hanging from sash
      this.accessoryFrontGraphics.circle(0, -36, 10);
      this.accessoryFrontGraphics.fill({ color: 0x10b981 });
      this.accessoryFrontGraphics.stroke({ width: 2, color: 0x047857 });

      this.accessoryFrontGraphics.circle(0, -36, 3.5);
      this.accessoryFrontGraphics.fill({ color: PALETTE.TUNIC_CREAM_BASE });

      this.accessoryFrontGraphics.roundRect(-3, -25, 6, 20, 2);
      this.accessoryFrontGraphics.fill({ color: 0xdc2626 });
    }
  }

  private drawHeadBase(): void {
    if (!this.headBaseGraphics) return;
    this.headBaseGraphics.clear();

    // 1. Neck (Natural connection to torso)
    this.headBaseGraphics.roundRect(-11, -84, 22, 18, 5);
    this.headBaseGraphics.fill({ color: PALETTE.SKIN_SHADOW });

    // 2. Large Expressive Chibi Head (2.5–3 heads proportion)
    this.headBaseGraphics.roundRect(-54, -168, 108, 98, 42);
    this.headBaseGraphics.fill({ color: PALETTE.SKIN_BASE });
    this.headBaseGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

    // 3. Soft Chin / Jaw Cel Shadow
    this.headBaseGraphics.arc(0, -74, 32, 0.2, Math.PI - 0.2, false);
    this.headBaseGraphics.stroke({ width: 1.5, color: PALETTE.SKIN_SHADOW, cap: 'round' });
  }

  private drawFaceFeatures(): void {
    if (!this.faceFeaturesGraphics) return;
    this.faceFeaturesGraphics.clear();

    const isHappy = this.currentEmote === 'happy';
    const isProud = this.currentEmote === 'proud';
    const blushAlpha = isHappy ? 0.65 : isProud ? 0.6 : 0.42;

    // 1. Soft Rosy Cheeks (Gentle blush on cheeks)
    this.faceFeaturesGraphics.ellipse(-33, -112, 11, 7);
    this.faceFeaturesGraphics.ellipse(33, -112, 11, 7);
    this.faceFeaturesGraphics.fill({ color: PALETTE.BLUSH, alpha: blushAlpha });

    // Cute specular blush highlight dots
    this.faceFeaturesGraphics.circle(-35, -114, 2);
    this.faceFeaturesGraphics.circle(31, -114, 2);
    this.faceFeaturesGraphics.fill({ color: PALETTE.BLUSH_SPECULAR, alpha: 0.75 });

    // 2. Small Cute Anime Button Nose (tiny soft dot)
    this.faceFeaturesGraphics.circle(0, -108, 1.4);
    this.faceFeaturesGraphics.fill({ color: PALETTE.OUTLINE_LIGHT, alpha: 0.6 });
  }

  private drawGlasses(): void {
    if (!this.glassesGraphics) return;
    this.glassesGraphics.clear();

    if (this.currentAppearance.accessoryId !== 'acc_round_glasses') return;

    // ── Round Glasses: Cute thin brass circular frames with specular sheen ───
    const brassColor = PALETTE.BRASS_GOLD_BASE;

    // Left Lens
    this.glassesGraphics.circle(-24, -122, 13);
    this.glassesGraphics.fill({ color: 0xffffff, alpha: 0.18 });
    this.glassesGraphics.stroke({ width: 2, color: brassColor });

    // Left Specular Glint
    this.glassesGraphics.arc(-24, -122, 10, -2.4, -1.2, false);
    this.glassesGraphics.stroke({ width: 1.5, color: 0xffffff, alpha: 0.8 });

    // Right Lens
    this.glassesGraphics.circle(24, -122, 13);
    this.glassesGraphics.fill({ color: 0xffffff, alpha: 0.18 });
    this.glassesGraphics.stroke({ width: 2, color: brassColor });

    // Right Specular Glint
    this.glassesGraphics.arc(24, -122, 10, -2.4, -1.2, false);
    this.glassesGraphics.stroke({ width: 1.5, color: 0xffffff, alpha: 0.8 });

    // Center Bridge
    this.glassesGraphics.arc(0, -120, 11, -2.2, -0.9, false);
    this.glassesGraphics.stroke({ width: 2, color: brassColor });

    // Frame Temples
    this.glassesGraphics.poly([-37, -122, -50, -126]);
    this.glassesGraphics.poly([37, -122, 50, -126]);
    this.glassesGraphics.stroke({ width: 1.8, color: brassColor });
  }

  /**
   * Multi-layered anime cel-shaded eyes with detailed iris, pupil, and multiple highlights
   */
  private drawEyes(closed = false): void {
    if (!this.eyesGraphics) return;
    this.eyesGraphics.clear();

    const emote = this.currentEmote;

    // ── Eyebrows (Capable of expressive changes) ───────────────────────────
    if (emote === 'curious') {
      this.eyesGraphics.poly([-36, -142, -18, -146, -16, -144, -34, -140]);
      this.eyesGraphics.poly([16, -137, 34, -139, 36, -137, 18, -135]);
      this.eyesGraphics.fill({ color: PALETTE.HAIR_BASE });
    } else if (emote === 'surprised') {
      this.eyesGraphics.roundRect(-34, -145, 18, 3.5, 2);
      this.eyesGraphics.roundRect(16, -145, 18, 3.5, 2);
      this.eyesGraphics.fill({ color: PALETTE.HAIR_BASE });
    } else if (emote === 'sleepy') {
      this.eyesGraphics.roundRect(-32, -134, 18, 3, 2);
      this.eyesGraphics.roundRect(14, -134, 18, 3, 2);
      this.eyesGraphics.fill({ color: PALETTE.HAIR_BASE });
    } else {
      this.eyesGraphics.roundRect(-33, -138, 18, 3.5, 2);
      this.eyesGraphics.roundRect(15, -138, 18, 3.5, 2);
      this.eyesGraphics.fill({ color: PALETTE.HAIR_BASE });
    }

    // ── Eye Rendering By State ─────────────────────────────────────────────
    if (closed || emote === 'happy' || emote === 'breathe') {
      this.eyesGraphics.arc(-24, -120, 10, Math.PI, 0, false);
      this.eyesGraphics.stroke({ width: 3.5, color: PALETTE.OUTLINE_MAIN, cap: 'round' });

      this.eyesGraphics.arc(24, -120, 10, Math.PI, 0, false);
      this.eyesGraphics.stroke({ width: 3.5, color: PALETTE.OUTLINE_MAIN, cap: 'round' });

      this.eyesGraphics.poly([-34, -120, -38, -124, -36, -120]);
      this.eyesGraphics.poly([34, -120, 38, -124, 36, -120]);
      this.eyesGraphics.fill({ color: PALETTE.OUTLINE_MAIN });
    } else if (emote === 'surprised') {
      this.eyesGraphics.circle(-24, -121, 13);
      this.eyesGraphics.circle(24, -121, 13);
      this.eyesGraphics.fill({ color: PALETTE.EYE_SCLERA });
      this.eyesGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      this.eyesGraphics.circle(-24, -121, 6);
      this.eyesGraphics.circle(24, -121, 6);
      this.eyesGraphics.fill({ color: PALETTE.IRIS_PUPIL });

      this.eyesGraphics.circle(-26, -124, 4);
      this.eyesGraphics.circle(22, -124, 4);
      this.eyesGraphics.fill({ color: 0xffffff });
    } else if (emote === 'sleepy') {
      this.eyesGraphics.roundRect(-31, -124, 16, 12, 6);
      this.eyesGraphics.roundRect(15, -124, 16, 12, 6);
      this.eyesGraphics.fill({ color: PALETTE.EYE_SCLERA });
      this.eyesGraphics.stroke({ width: 1.5, color: PALETTE.OUTLINE_MAIN });

      this.eyesGraphics.arc(-23, -124, 10, 0, Math.PI, false);
      this.eyesGraphics.stroke({ width: 3.5, color: PALETTE.OUTLINE_MAIN, cap: 'round' });

      this.eyesGraphics.arc(23, -124, 10, 0, Math.PI, false);
      this.eyesGraphics.stroke({ width: 3.5, color: PALETTE.OUTLINE_MAIN, cap: 'round' });
    } else if (emote === 'proud') {
      this.eyesGraphics.roundRect(-31, -129, 16, 21, 8);
      this.eyesGraphics.roundRect(15, -129, 16, 21, 8);
      this.eyesGraphics.fill({ color: PALETTE.IRIS_TOP_SHADOW });
      this.eyesGraphics.stroke({ width: 2.2, color: PALETTE.OUTLINE_MAIN });

      this.eyesGraphics.circle(-23, -119, 6.5);
      this.eyesGraphics.circle(23, -119, 6.5);
      this.eyesGraphics.fill({ color: PALETTE.IRIS_LUMINOUS });

      this.drawStarShape(this.eyesGraphics, -23, -121, 5, 2.5, 0xffffff);
      this.drawStarShape(this.eyesGraphics, 23, -121, 5, 2.5, 0xffffff);
    } else {
      // Canonical Multi-Layer Anime Eyes (Neutral / Curious)
      this.eyesGraphics.roundRect(-32, -130, 17, 23, 8);
      this.eyesGraphics.fill({ color: PALETTE.EYE_SCLERA });
      this.eyesGraphics.stroke({ width: 2.2, color: PALETTE.OUTLINE_MAIN });

      this.eyesGraphics.roundRect(-31, -128, 15, 20, 7);
      this.eyesGraphics.fill({ color: PALETTE.IRIS_TOP_SHADOW });

      this.eyesGraphics.arc(-23.5, -118, 6.5, 0.1, Math.PI - 0.1, false);
      this.eyesGraphics.stroke({ width: 2.5, color: PALETTE.IRIS_LUMINOUS, cap: 'round' });

      this.eyesGraphics.circle(-23.5, -119, 4);
      this.eyesGraphics.fill({ color: PALETTE.IRIS_PUPIL });

      this.eyesGraphics.circle(-27, -124, 4.2);
      this.eyesGraphics.fill({ color: 0xffffff });

      this.eyesGraphics.circle(-21, -115, 2.2);
      this.eyesGraphics.fill({ color: 0xffffff });

      this.eyesGraphics.poly([-33, -128, -23, -132, -15, -129, -15, -131, -23, -134, -35, -130]);
      this.eyesGraphics.fill({ color: PALETTE.OUTLINE_MAIN });

      // Right Eye
      this.eyesGraphics.roundRect(15, -130, 17, 23, 8);
      this.eyesGraphics.fill({ color: PALETTE.EYE_SCLERA });
      this.eyesGraphics.stroke({ width: 2.2, color: PALETTE.OUTLINE_MAIN });

      this.eyesGraphics.roundRect(16, -128, 15, 20, 7);
      this.eyesGraphics.fill({ color: PALETTE.IRIS_TOP_SHADOW });

      this.eyesGraphics.arc(23.5, -118, 6.5, 0.1, Math.PI - 0.1, false);
      this.eyesGraphics.stroke({ width: 2.5, color: PALETTE.IRIS_LUMINOUS, cap: 'round' });

      this.eyesGraphics.circle(23.5, -119, 4);
      this.eyesGraphics.fill({ color: PALETTE.IRIS_PUPIL });

      this.eyesGraphics.circle(20, -124, 4.2);
      this.eyesGraphics.fill({ color: 0xffffff });

      this.eyesGraphics.circle(26, -115, 2.2);
      this.eyesGraphics.fill({ color: 0xffffff });

      this.eyesGraphics.poly([15, -129, 23, -132, 33, -128, 35, -130, 23, -134, 15, -131]);
      this.eyesGraphics.fill({ color: PALETTE.OUTLINE_MAIN });
    }
  }

  private drawMouth(): void {
    if (!this.mouthGraphics) return;
    this.mouthGraphics.clear();

    const emote = this.currentEmote;

    if (emote === 'happy') {
      this.mouthGraphics.poly([-8, -98, 8, -98, 6, -91, 0, -88, -6, -91]);
      this.mouthGraphics.fill({ color: 0xf472b6 });
      this.mouthGraphics.stroke({ width: 2.2, color: PALETTE.OUTLINE_MAIN, cap: 'round' });
    } else if (emote === 'curious') {
      this.mouthGraphics.circle(1, -98, 3.8);
      this.mouthGraphics.fill({ color: 0xf472b6 });
      this.mouthGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN });
    } else if (emote === 'surprised') {
      this.mouthGraphics.roundRect(-4, -100, 8, 11, 4);
      this.mouthGraphics.fill({ color: 0xf472b6 });
      this.mouthGraphics.stroke({ width: 2.2, color: PALETTE.OUTLINE_MAIN });
    } else if (emote === 'sleepy') {
      this.mouthGraphics.arc(0, -97, 4, 0.2, Math.PI - 0.2, false);
      this.mouthGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_SOFT, cap: 'round' });
    } else if (emote === 'proud') {
      this.mouthGraphics.poly([-5, -97, 0, -96, 7, -99]);
      this.mouthGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN, cap: 'round' });
    } else {
      this.mouthGraphics.arc(0, -98, 6.5, 0.15, Math.PI - 0.15, false);
      this.mouthGraphics.stroke({ width: 2.4, color: PALETTE.OUTLINE_SOFT, cap: 'round' });
    }
  }

  private drawFrontHair(): void {
    if (!this.frontHairGraphics) return;
    this.frontHairGraphics.clear();

    const hairId = this.currentAppearance.hairId;
    const baseColor = this.getHairColor();

    if (hairId === 'hair_medium_wavy') {
      // ── Medium Wavy Hairstyle: Soft flowing face-framing wavy clumps ──────
      this.frontHairGraphics.poly([-54, -156, -46, -118, -34, -132, -22, -148]);
      this.frontHairGraphics.poly([-24, -150, -6, -132, 10, -146]);
      this.frontHairGraphics.poly([8, -146, 28, -132, 44, -118, 54, -156]);
      this.frontHairGraphics.fill({ color: baseColor });
      this.frontHairGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      // Highlight gloss
      this.frontHairGraphics.arc(0, -152, 38, -2.5, -0.6, false);
      this.frontHairGraphics.stroke({ width: 2.2, color: PALETTE.HAIR_HIGHLIGHT, cap: 'round' });
    } else if (hairId === 'hair_long_fantasy') {
      // ── Long Fantasy Hairstyle: Elegant layered bangs with brass clip ─────
      this.frontHairGraphics.poly([-54, -158, -44, -120, -32, -146, -16, -150]);
      this.frontHairGraphics.poly([-18, -152, 0, -134, 16, -152]);
      this.frontHairGraphics.poly([14, -150, 32, -146, 44, -120, 54, -158]);
      this.frontHairGraphics.fill({ color: baseColor });
      this.frontHairGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      // Brass Hair Clip / Leaf Pin on right lock
      this.frontHairGraphics.roundRect(32, -144, 12, 5, 2);
      this.frontHairGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });
    } else if (hairId === 'hair_wanderer') {
      // Flowing layered wanderer bangs
      this.frontHairGraphics.poly([-54, -156, -42, -122, -26, -146, 0, -132, 26, -146, 42, -122, 54, -156]);
      this.frontHairGraphics.fill({ color: baseColor });
      this.frontHairGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });
    } else if (hairId === 'hair_topknot') {
      // Scholar neat front bangs
      this.frontHairGraphics.poly([-52, -154, -36, -136, -16, -148, 0, -138, 16, -148, 36, -136, 52, -154]);
      this.frontHairGraphics.fill({ color: baseColor });
      this.frontHairGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });
    } else {
      // ── Canonical Short Layered / Luma Adventurer Layered Hair ─────────────
      this.frontHairGraphics.poly([-54, -158, -48, -124, -38, -122, -44, -148]);
      this.frontHairGraphics.poly([-44, -154, -28, -136, -18, -148]);
      this.frontHairGraphics.poly([-18, -150, -2, -134, 12, -146]);
      this.frontHairGraphics.poly([10, -148, 26, -136, 38, -148]);
      this.frontHairGraphics.poly([38, -148, 48, -122, 54, -124, 54, -158]);
      this.frontHairGraphics.fill({ color: baseColor });
      this.frontHairGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      // Subtle hair highlight gloss arc
      this.frontHairGraphics.arc(0, -154, 40, -2.4, -0.7, false);
      this.frontHairGraphics.stroke({ width: 2.2, color: PALETTE.HAIR_HIGHLIGHT, cap: 'round' });
    }
  }

  /**
   * Signature adventurer ahoge tuft with dynamic spring sway
   */
  private drawAhoge(): void {
    if (!this.ahogeGraphics) return;
    this.ahogeGraphics.clear();

    const hairId = this.currentAppearance.hairId;
    if (hairId === 'hair_topknot' || this.currentAppearance.hatId) {
      return;
    }

    const baseColor = this.getHairColor();

    // Luma's Signature Adventurer Ahoge Tuft
    this.ahogeGraphics.poly([-3, -166, -8, -182, 2, -196, 10, -186, 4, -172]);
    this.ahogeGraphics.fill({ color: baseColor });
    this.ahogeGraphics.stroke({ width: 2, color: PALETTE.OUTLINE_MAIN, cap: 'round' });
  }

  private drawHat(): void {
    if (!this.hatGraphics) return;
    this.hatGraphics.clear();

    const hatId = this.currentAppearance.hatId;
    if (!hatId) return;

    if (hatId === 'hat_fantasy_beret') {
      // ── Soft Fantasy Beret: Slanted felt beret with brass leaf pin ────────
      this.hatGraphics.roundRect(-42, -192, 80, 32, 14);
      this.hatGraphics.fill({ color: PALETTE.JACKET_SAGE_BASE });
      this.hatGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      // Brass Leaf Pin on side
      this.hatGraphics.circle(-26, -184, 5);
      this.hatGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });
      this.hatGraphics.stroke({ width: 1.5, color: PALETTE.BRASS_GOLD_SHINE });
    } else if (hatId === 'hat_adventurer_hood') {
      // ── Small Adventurer Hood: Soft travel cowl framing head & crown ──────
      this.hatGraphics.poly([-52, -156, -46, -198, 0, -206, 46, -198, 52, -156, 42, -174, 0, -180, -42, -174]);
      this.hatGraphics.fill({ color: 0x475569 });
      this.hatGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      // Front brass cowl clasp
      this.hatGraphics.circle(0, -174, 4);
      this.hatGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });
    } else if (hatId === 'hat_nature_themed') {
      // ── Decorative Nature-Themed Hat: Woven straw brim + vine & sprout ────
      this.hatGraphics.poly([-74, -156, 0, -196, 74, -156]);
      this.hatGraphics.fill({ color: 0xd97706 });
      this.hatGraphics.stroke({ width: 2.8, color: 0x854d0e });

      // Braided Vine
      this.hatGraphics.arc(0, -168, 26, 0, Math.PI, false);
      this.hatGraphics.stroke({ width: 2.5, color: 0x16a34a });

      // Tiny Green Sprout Accent
      this.hatGraphics.circle(8, -178, 4);
      this.hatGraphics.fill({ color: 0x4ade80 });
    } else if (hatId === 'item_scholar_hat') {
      // Scholar Cap (Mũ Nho Sinh Tú Tài)
      this.hatGraphics.roundRect(-44, -204, 88, 38, 8);
      this.hatGraphics.fill({ color: 0x1e293b });
      this.hatGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      // Golden Emblem
      this.hatGraphics.roundRect(-11, -196, 22, 20, 4);
      this.hatGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });
      this.hatGraphics.stroke({ width: 1.5, color: PALETTE.BRASS_GOLD_SHINE });

      // Scholar Ribbons
      this.hatGraphics.roundRect(-48, -182, 8, 44, 4);
      this.hatGraphics.roundRect(40, -182, 8, 44, 4);
      this.hatGraphics.fill({ color: 0x0f172a });
      this.hatGraphics.stroke({ width: 1.5, color: PALETTE.OUTLINE_MAIN });
    } else if (hatId === 'item_straw_hat') {
      // Wanderer Straw Hat
      this.hatGraphics.poly([-78, -156, 0, -206, 78, -156]);
      this.hatGraphics.fill({ color: 0xd97706 });
      this.hatGraphics.stroke({ width: 2.8, color: 0x854d0e });

      this.hatGraphics.arc(0, -172, 28, 0, Math.PI, false);
      this.hatGraphics.stroke({ width: 2, color: 0x92400e });
    } else if (hatId === 'item_phoenix_crown') {
      // Phoenix Crown
      this.hatGraphics.poly([-48, -168, -32, -204, 0, -186, 32, -204, 48, -168]);
      this.hatGraphics.fill({ color: PALETTE.BRASS_GOLD_BASE });
      this.hatGraphics.stroke({ width: 2.5, color: PALETTE.OUTLINE_MAIN });

      this.hatGraphics.circle(0, -178, 8);
      this.hatGraphics.fill({ color: 0xdc2626 });
      this.hatGraphics.stroke({ width: 1.5, color: PALETTE.BRASS_GOLD_SHINE });
    }
  }

  private drawSparkles(): void {
    if (!this.sparkleGraphics) return;
    this.sparkleGraphics.clear();

    if (this.currentEmote === 'proud') {
      this.drawStarShape(this.sparkleGraphics, -54, -150, 7, 3, PALETTE.BRASS_GOLD_SHINE);
      this.drawStarShape(this.sparkleGraphics, 52, -158, 8, 3.5, PALETTE.BRASS_GOLD_SHINE);
      this.drawStarShape(this.sparkleGraphics, -42, -90, 5, 2.2, PALETTE.BRASS_GOLD_BASE);
    }
  }

  private drawStarShape(
    g: Graphics,
    cx: number,
    cy: number,
    outerR: number,
    innerR: number,
    color: number
  ): void {
    const points: number[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      points.push(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    }
    g.poly(points);
    g.fill({ color });
  }

  private getHairColor(): number {
    const hex = this.currentAppearance.hairColor;
    if (hex && hex.startsWith('#')) {
      const num = parseInt(hex.replace('#', ''), 16);
      if (!isNaN(num)) return num;
    }
    return PALETTE.HAIR_BASE;
  }

  // ── 60 FPS Animation & Micro-Interactions ─────────────────────────────────

  private updateAnimation(): void {
    if (!this.bodyContainer || !this.headContainer || !this.shadowGraphics) return;

    this.animationTime += 0.04;
    const t = this.animationTime;

    // 1. Natural Breathing & Emote Dynamics
    let breathY = Math.sin(t * 1.8) * 3.2;
    let breathScaleY = 1.0 + Math.sin(t * 1.8) * 0.016;
    let headBobY = Math.sin(t * 1.8 - 0.35) * 2.2;
    let ahogeSpring = Math.sin(t * 3.5) * 0.06;

    if (this.currentEmote === 'happy') {
      breathY = Math.sin(t * 5.0) * 5.8;
      headBobY = Math.sin(t * 5.0) * 3.8;
      ahogeSpring = Math.sin(t * 5.0) * 0.14;
      this.headTiltTarget = 0;
    } else if (this.currentEmote === 'curious') {
      this.headTiltTarget = 0.052; // Canonical 3° head tilt
      breathY = Math.sin(t * 1.6) * 2.5;
      ahogeSpring = 0.08 + Math.sin(t * 2.5) * 0.05;
    } else if (this.currentEmote === 'sleepy') {
      breathY = Math.sin(t * 0.9) * 4.5;
      breathScaleY = 1.0 + Math.sin(t * 0.9) * 0.024;
      headBobY = Math.sin(t * 0.9) * 3.0;
      this.headTiltTarget = 0.02;
    } else if (this.currentEmote === 'breathe') {
      breathY = Math.sin(t * 0.8) * 5.0;
      breathScaleY = 1.0 + Math.sin(t * 0.8) * 0.035;
      headBobY = Math.sin(t * 0.8 - 0.4) * 3.2;
      this.headTiltTarget = 0;
    } else if (this.currentEmote === 'proud') {
      breathY = Math.sin(t * 1.4) * 2.2;
      headBobY = -2.0;
      this.bodyContainer.scale.x = 1.04;
      this.headTiltTarget = -0.025;
    } else {
      this.headTiltTarget = 0;
      this.bodyContainer.scale.x = 1.0;
    }

    // Smooth head-tilt interpolation
    this.currentHeadTilt += (this.headTiltTarget - this.currentHeadTilt) * 0.1;
    this.headContainer.rotation = this.currentHeadTilt;

    this.bodyContainer.y = breathY;
    this.bodyContainer.scale.y = breathScaleY;
    this.headContainer.y = headBobY;

    if (this.ahogeGraphics) {
      this.ahogeGraphics.rotation = ahogeSpring;
    }

    const shadowScale = 1.0 - breathY / 55;
    this.shadowGraphics.scale.set(shadowScale, shadowScale);

    // 2. Procedural Anime Blinking
    this.blinkTimer += 0.016;
    if (this.blinkTimer > 3.8 && !this.isBlinking) {
      this.isBlinking = true;
      this.drawEyes(true);
      setTimeout(() => {
        if (!this.isDestroyed) {
          this.drawEyes(false);
          this.isBlinking = false;
          this.blinkTimer = Math.random() * 0.8;
        }
      }, 130);
    }
  }

  // ── Public Studio API ─────────────────────────────────────────────────────

  /**
   * Applies updated appearance without canvas re-initialization
   */
  updateAppearance(newAppearance: CharacterAppearanceState): void {
    this.currentAppearance = { ...newAppearance };
    this.currentEmote = newAppearance.expression || this.currentEmote;
    if (this.usingSpine) {
      this.syncSpineSkin();
      this.syncSpineAnimation();
    } else {
      this.redrawAllSlots();
    }
  }

  /**
   * Triggers an expression reaction (neutral, happy, curious, surprised, sleepy, proud, breathe)
   */
  setEmote(emote: CharacterEmote): void {
    this.currentEmote = emote;
    if (this.usingSpine) {
      this.syncSpineAnimation();
    } else {
      this.drawEyes(false);
      this.drawMouth();
      this.drawFaceFeatures();
      this.drawSparkles();
    }
  }

  private onResize = (): void => {
    if (!this.app || !this.containerElement || this.isDestroyed) return;
    const width = this.containerElement.clientWidth || 400;
    const height = this.containerElement.clientHeight || 460;

    this.app.renderer.resize(width, height);
    if (this.usingSpine) {
      this.updateSpineLayout(width, height);
    } else if (this.stageRoot) {
      this.stageRoot.x = width / 2;
      this.stageRoot.y = height * 0.74;
    }
  };

  /**
   * Cleanly disposes WebGL context and releases GPU resources
   */
  destroy(): void {
    this.isDestroyed = true;
    window.removeEventListener('resize', this.onResize);

    if (this.app) {
      if (!this.usingSpine) {
        this.app.ticker.remove(this.updateAnimation, this);
      }
      this.app.destroy(true, { children: true });
      this.app = null;
    }
  }
}
