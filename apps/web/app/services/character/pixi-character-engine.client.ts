// ============================================================================
// PixiJS 8 Chibi Rig Character Engine (CHIBI_CHARACTER.md §3, §4, §6, §12)
// ============================================================================

import { Application, Container, Graphics } from 'pixi.js';
import type { CharacterAppearanceState, CharacterEmote } from '../../types/character';

export class PixiChibiCharacterEngine {
  private app: Application | null = null;
  private containerElement: HTMLElement | null = null;
  private isDestroyed = false;

  // Rig Hierarchy
  private stageRoot: Container | null = null;
  private shadowGraphics: Graphics | null = null;
  private bodyContainer: Container | null = null;
  private headContainer: Container | null = null;

  // Rig Slots
  private shoesGraphics: Graphics | null = null;
  private outfitGraphics: Graphics | null = null;
  private leftArmGraphics: Graphics | null = null;
  private rightArmGraphics: Graphics | null = null;
  private headGraphics: Graphics | null = null;
  private eyesGraphics: Graphics | null = null;
  private mouthGraphics: Graphics | null = null;
  private hairGraphics: Graphics | null = null;
  private hatGraphics: Graphics | null = null;
  private accessoryGraphics: Graphics | null = null;

  // Animation State
  private currentAppearance: CharacterAppearanceState;
  private currentEmote: CharacterEmote = 'idle';
  private blinkTimer = 0;
  private isBlinking = false;
  private animationTime = 0;

  constructor(initialAppearance: CharacterAppearanceState) {
    this.currentAppearance = { ...initialAppearance };
    this.currentEmote = initialAppearance.expression || 'idle';
  }

  /**
   * Initializes PixiJS 8 Application and mounts canvas into the container
   */
  async init(container: HTMLElement): Promise<void> {
    if (this.isDestroyed) return;
    this.containerElement = container;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    this.app = new Application();
    await this.app.init({
      width,
      height,
      backgroundAlpha: 0, // Transparent canvas over cozy room background
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    if (this.isDestroyed) {
      this.app.destroy(true);
      return;
    }

    container.appendChild(this.app.canvas);
    this.setupScene(width, height);

    // Setup PixiJS Ticker for 60fps natural breathing and idle animation
    this.app.ticker.add(this.updateAnimation, this);

    // Window resize observer
    window.addEventListener('resize', this.onResize);
  }

  private setupScene(width: number, height: number): void {
    if (!this.app) return;

    this.stageRoot = new Container();
    this.stageRoot.x = width / 2;
    this.stageRoot.y = height * 0.72; // Anchor character near lower third
    this.app.stage.addChild(this.stageRoot);

    // 1. Soft Oval Shadow on the floor
    this.shadowGraphics = new Graphics();
    this.stageRoot.addChild(this.shadowGraphics);

    // 2. Body Container (root of skeletal animation)
    this.bodyContainer = new Container();
    this.stageRoot.addChild(this.bodyContainer);

    // 3. Rig Layers inside Body Container
    this.shoesGraphics = new Graphics();
    this.outfitGraphics = new Graphics();
    this.leftArmGraphics = new Graphics();
    this.rightArmGraphics = new Graphics();
    this.accessoryGraphics = new Graphics();

    this.headContainer = new Container();
    this.headGraphics = new Graphics();
    this.hairGraphics = new Graphics();
    this.eyesGraphics = new Graphics();
    this.mouthGraphics = new Graphics();
    this.hatGraphics = new Graphics();

    // Assembly hierarchy
    this.bodyContainer.addChild(this.shoesGraphics);
    this.bodyContainer.addChild(this.leftArmGraphics);
    this.bodyContainer.addChild(this.outfitGraphics);
    this.bodyContainer.addChild(this.accessoryGraphics);
    this.bodyContainer.addChild(this.rightArmGraphics);

    this.bodyContainer.addChild(this.headContainer);
    this.headContainer.addChild(this.headGraphics);
    this.headContainer.addChild(this.hairGraphics);
    this.headContainer.addChild(this.eyesGraphics);
    this.headContainer.addChild(this.mouthGraphics);
    this.headContainer.addChild(this.hatGraphics);

    this.redrawRig();
  }

  /**
   * Re-renders all vector rig slots based on active appearance configuration
   */
  private redrawRig(): void {
    this.drawShadow();
    this.drawShoes();
    this.drawOutfit();
    this.drawArms();
    this.drawHead();
    this.drawEyes(false);
    this.drawMouth();
    this.drawHair();
    this.drawHat();
    this.drawAccessory();
  }

  // ── Procedural Chibi Vector Rig Drawers ────────────────────────────────────

  private drawShadow(): void {
    if (!this.shadowGraphics) return;
    this.shadowGraphics.clear();
    // Warm natural floor shadow
    this.shadowGraphics.ellipse(0, 10, 68, 16);
    this.shadowGraphics.fill({ color: 0x2d2218, alpha: 0.22 });
  }

  private drawShoes(): void {
    if (!this.shoesGraphics) return;
    this.shoesGraphics.clear();

    const isEmbroidered = this.currentAppearance.shoesId === 'shoes_embroidered';
    const shoeColor = isEmbroidered ? 0x059669 : 0x2d3748;

    // Left Shoe
    this.shoesGraphics.roundRect(-34, -8, 26, 16, 7);
    this.shoesGraphics.fill({ color: shoeColor });
    this.shoesGraphics.stroke({ width: 2, color: 0x1a202c });

    // Right Shoe
    this.shoesGraphics.roundRect(8, -8, 26, 16, 7);
    this.shoesGraphics.fill({ color: shoeColor });
    this.shoesGraphics.stroke({ width: 2, color: 0x1a202c });

    if (isEmbroidered) {
      // Golden embroidery highlights
      this.shoesGraphics.circle(-21, -2, 3);
      this.shoesGraphics.circle(21, -2, 3);
      this.shoesGraphics.fill({ color: 0xf59e0b });
    }
  }

  private drawOutfit(): void {
    if (!this.outfitGraphics) return;
    this.outfitGraphics.clear();

    const outfitId = this.currentAppearance.outfitId;
    let mainColor = 0x3b82f6; // Scholar Silk Blue
    let trimColor = 0xf59e0b; // Gold trim
    let isDragonRobe = false;

    if (outfitId === 'item_leather_vest') {
      mainColor = 0x854d0e; // Leather brown
      trimColor = 0xd97706;
    } else if (outfitId === 'item_dragon_armor') {
      mainColor = 0xeab308; // Imperial Gold
      trimColor = 0xdc2626; // Dragon red
      isDragonRobe = true;
    }

    // Lower Robe Skirt (A-line chibi gown)
    this.outfitGraphics.poly([-38, -6, 38, -6, 46, 2, -46, 2]);
    this.outfitGraphics.fill({ color: mainColor });
    this.outfitGraphics.stroke({ width: 2.5, color: 0x1e293b });

    // Robe Torso
    this.outfitGraphics.roundRect(-36, -72, 72, 68, 14);
    this.outfitGraphics.fill({ color: mainColor });
    this.outfitGraphics.stroke({ width: 2.5, color: 0x1e293b });

    // Traditional Hanfu Cross Collar (Yiling - 右衽)
    this.outfitGraphics.poly([-26, -70, 0, -42, 6, -42, -18, -70]);
    this.outfitGraphics.fill({ color: 0xfef08a, alpha: 0.85 });

    this.outfitGraphics.poly([26, -70, 0, -42, -6, -42, 18, -70]);
    this.outfitGraphics.fill({ color: 0xffffff, alpha: 0.95 });
    this.outfitGraphics.stroke({ width: 1.5, color: trimColor });

    // Sash / Belt
    this.outfitGraphics.roundRect(-37, -24, 74, 13, 4);
    this.outfitGraphics.fill({ color: trimColor });
    this.outfitGraphics.stroke({ width: 2, color: 0x1e293b });

    // Belt Jade Buckle
    this.outfitGraphics.roundRect(-8, -26, 16, 17, 4);
    this.outfitGraphics.fill({ color: 0x10b981 });
    this.outfitGraphics.stroke({ width: 1.5, color: 0xfef08a });

    if (isDragonRobe) {
      // Golden dragon scales insignia
      this.outfitGraphics.circle(0, -48, 8);
      this.outfitGraphics.fill({ color: 0xdc2626 });
      this.outfitGraphics.stroke({ width: 2, color: 0xfffbeb });
    }
  }

  private drawArms(): void {
    if (!this.leftArmGraphics || !this.rightArmGraphics) return;
    this.leftArmGraphics.clear();
    this.rightArmGraphics.clear();

    const skinColor = 0xffe4cc;
    const sleeveColor = this.currentAppearance.outfitId === 'item_leather_vest' ? 0x854d0e : 0x3b82f6;

    // Left Arm (holding accessory)
    this.leftArmGraphics.roundRect(-52, -64, 18, 38, 8);
    this.leftArmGraphics.fill({ color: sleeveColor });
    this.leftArmGraphics.stroke({ width: 2, color: 0x1e293b });
    // Left Hand
    this.leftArmGraphics.circle(-43, -24, 8);
    this.leftArmGraphics.fill({ color: skinColor });
    this.leftArmGraphics.stroke({ width: 2, color: 0x1e293b });

    // Right Arm (idle friendly gesture)
    this.rightArmGraphics.roundRect(34, -64, 18, 38, 8);
    this.rightArmGraphics.fill({ color: sleeveColor });
    this.rightArmGraphics.stroke({ width: 2, color: 0x1e293b });
    // Right Hand
    this.rightArmGraphics.circle(43, -24, 8);
    this.rightArmGraphics.fill({ color: skinColor });
    this.rightArmGraphics.stroke({ width: 2, color: 0x1e293b });
  }

  private drawHead(): void {
    if (!this.headGraphics) return;
    this.headGraphics.clear();

    const skinColor = 0xffe4cc;
    const blushColor = 0xf472b6;

    // Neck
    this.headGraphics.roundRect(-10, -82, 20, 16, 6);
    this.headGraphics.fill({ color: 0xfbd5b5 });

    // Cute Large Chibi Head
    this.headGraphics.roundRect(-52, -164, 104, 94, 38);
    this.headGraphics.fill({ color: skinColor });
    this.headGraphics.stroke({ width: 2.5, color: 0x1e293b });

    // Soft Rosy Cheeks (Blush)
    this.headGraphics.ellipse(-32, -108, 9, 6);
    this.headGraphics.fill({ color: blushColor, alpha: 0.45 });

    this.headGraphics.ellipse(32, -108, 9, 6);
    this.headGraphics.fill({ color: blushColor, alpha: 0.45 });
  }

  private drawEyes(closed = false): void {
    if (!this.eyesGraphics) return;
    this.eyesGraphics.clear();

    const isHappy = this.currentEmote === 'happy';
    const isSurprised = this.currentEmote === 'surprised';

    if (closed || isHappy) {
      // Curved happy / closed eye arches (^  ^)
      this.eyesGraphics.arc(-24, -118, 9, Math.PI, 0, false);
      this.eyesGraphics.stroke({ width: 3.5, color: 0x1e293b, cap: 'round' });

      this.eyesGraphics.arc(24, -118, 9, Math.PI, 0, false);
      this.eyesGraphics.stroke({ width: 3.5, color: 0x1e293b, cap: 'round' });
    } else if (isSurprised) {
      // Wide open curious eyes (O  O)
      this.eyesGraphics.circle(-24, -118, 12);
      this.eyesGraphics.circle(24, -118, 12);
      this.eyesGraphics.fill({ color: 0x1e293b });

      // Specular highlights
      this.eyesGraphics.circle(-26, -121, 5);
      this.eyesGraphics.circle(22, -121, 5);
      this.eyesGraphics.fill({ color: 0xffffff });
    } else {
      // Classic Cute Chibi Anime Eyes with Highlights
      // Left Eye
      this.eyesGraphics.roundRect(-30, -128, 15, 22, 7);
      this.eyesGraphics.fill({ color: 0x1e293b });
      this.eyesGraphics.circle(-25, -123, 4.5); // Primary specular
      this.eyesGraphics.circle(-21, -114, 2.5); // Secondary reflection
      this.eyesGraphics.fill({ color: 0xffffff });

      // Right Eye
      this.eyesGraphics.roundRect(15, -128, 15, 22, 7);
      this.eyesGraphics.fill({ color: 0x1e293b });
      this.eyesGraphics.circle(20, -123, 4.5);
      this.eyesGraphics.circle(24, -114, 2.5);
      this.eyesGraphics.fill({ color: 0xffffff });
    }

    // Cute soft Eyebrows
    this.eyesGraphics.roundRect(-32, -137, 18, 3.5, 2);
    this.eyesGraphics.roundRect(14, -137, 18, 3.5, 2);
    this.eyesGraphics.fill({ color: 0x2b2118 });
  }

  private drawMouth(): void {
    if (!this.mouthGraphics) return;
    this.mouthGraphics.clear();

    const isSurprised = this.currentEmote === 'surprised';

    if (isSurprised) {
      // Open 'o' mouth
      this.mouthGraphics.circle(0, -96, 5);
      this.mouthGraphics.fill({ color: 0xd97706 });
      this.mouthGraphics.stroke({ width: 2, color: 0x1e293b });
    } else {
      // Cute gentle curve smile
      this.mouthGraphics.arc(0, -100, 7, 0.1, Math.PI - 0.1, false);
      this.mouthGraphics.stroke({ width: 2.5, color: 0x78350f, cap: 'round' });
    }
  }

  private drawHair(): void {
    if (!this.hairGraphics) return;
    this.hairGraphics.clear();

    const hairColor = 0x2b2118; // Traditional ink black/brown
    const isWanderer = this.currentAppearance.hairId === 'hair_wanderer';

    if (isWanderer) {
      // Flowing wanderer bangs
      this.hairGraphics.poly([-52, -150, -42, -118, -26, -145, 0, -135, 26, -145, 42, -118, 52, -150]);
      this.hairGraphics.fill({ color: hairColor });
      this.hairGraphics.stroke({ width: 2, color: 0x1e293b });
    } else {
      // Scholar Topknot Bun & Front Side Bangs
      // Hair bun on top
      this.hairGraphics.circle(0, -170, 18);
      this.hairGraphics.fill({ color: hairColor });
      this.hairGraphics.stroke({ width: 2, color: 0x1e293b });

      // Hairpin / Ribbons
      this.hairGraphics.roundRect(-22, -172, 44, 5, 2.5);
      this.hairGraphics.fill({ color: 0xd97706 });

      // Front Bangs
      this.hairGraphics.poly([-50, -150, -32, -132, -16, -145, 0, -136, 16, -145, 32, -132, 50, -150]);
      this.hairGraphics.fill({ color: hairColor });
    }
  }

  private drawHat(): void {
    if (!this.hatGraphics) return;
    this.hatGraphics.clear();

    const hatId = this.currentAppearance.hatId;
    if (!hatId) return;

    if (hatId === 'item_scholar_hat') {
      // Scholar Hat (Mũ Tú Tài Nho Sinh)
      this.hatGraphics.roundRect(-42, -196, 84, 34, 8);
      this.hatGraphics.fill({ color: 0x1e293b });
      this.hatGraphics.stroke({ width: 2.5, color: 0x0f172a });

      // Golden Emblem
      this.hatGraphics.roundRect(-10, -188, 20, 18, 4);
      this.hatGraphics.fill({ color: 0xf59e0b });
      this.hatGraphics.stroke({ width: 1.5, color: 0xffffff });

      // Scholar ribbons hanging from sides
      this.hatGraphics.roundRect(-46, -175, 8, 38, 4);
      this.hatGraphics.roundRect(38, -175, 8, 38, 4);
      this.hatGraphics.fill({ color: 0x0f172a });
    } else if (hatId === 'item_straw_hat') {
      // Wanderer Straw Hat (Nón Lá Tiêu Dao)
      this.hatGraphics.poly([-74, -154, 0, -198, 74, -154]);
      this.hatGraphics.fill({ color: 0xd97706 });
      this.hatGraphics.stroke({ width: 3, color: 0x92400e });

      // Weave accent
      this.hatGraphics.circle(0, -180, 8);
      this.hatGraphics.fill({ color: 0xb45309 });
    } else if (hatId === 'item_phoenix_crown') {
      // Phoenix Crown (Mão Phượng Hoàng)
      this.hatGraphics.poly([-48, -162, -32, -194, 0, -178, 32, -194, 48, -162]);
      this.hatGraphics.fill({ color: 0xf59e0b });
      this.hatGraphics.stroke({ width: 2.5, color: 0xb45309 });

      // Ruby jewel
      this.hatGraphics.circle(0, -172, 7);
      this.hatGraphics.fill({ color: 0xdc2626 });
      this.hatGraphics.stroke({ width: 1.5, color: 0xfef08a });
    }
  }

  private drawAccessory(): void {
    if (!this.accessoryGraphics) return;
    this.accessoryGraphics.clear();

    const accId = this.currentAppearance.accessoryId;
    if (!accId) return;

    if (accId === 'item_bamboo_brush') {
      // Bamboo Calligraphy Brush (Bút Lông Trúc Lâm)
      this.accessoryGraphics.roundRect(-66, -58, 8, 52, 4);
      this.accessoryGraphics.fill({ color: 0x15803d }); // Jade bamboo green
      this.accessoryGraphics.stroke({ width: 1.5, color: 0x14532d });

      // Brush bristles tip
      this.accessoryGraphics.poly([-67, -6, -61, -6, -64, 8]);
      this.accessoryGraphics.fill({ color: 0x1e293b }); // Ink soaked
    } else if (accId === 'item_wooden_sword') {
      // Training Wooden Sword (Mộc Kiếm)
      this.accessoryGraphics.roundRect(-68, -65, 8, 58, 3);
      this.accessoryGraphics.fill({ color: 0xa16207 });
      this.accessoryGraphics.stroke({ width: 1.5, color: 0x78350f });

      // Guard
      this.accessoryGraphics.roundRect(-76, -24, 24, 6, 2);
      this.accessoryGraphics.fill({ color: 0x78350f });
    } else if (accId === 'item_jade_pendant') {
      // Peace Jade Pendant (Ngọc Bội Bình An)
      this.accessoryGraphics.circle(0, -38, 9);
      this.accessoryGraphics.fill({ color: 0x10b981 });
      this.accessoryGraphics.stroke({ width: 2, color: 0x059669 });

      // Red tassel cord
      this.accessoryGraphics.roundRect(-2, -29, 4, 18, 2);
      this.accessoryGraphics.fill({ color: 0xdc2626 });
    }
  }

  // ── 60 FPS Animation Loop (Subtle Natural Breathing & Emotes) ─────────────

  private updateAnimation(): void {
    if (!this.bodyContainer || !this.headContainer || !this.shadowGraphics) return;

    this.animationTime += 0.04;
    const t = this.animationTime;

    // 1. Natural Breathing & Idle Body Sway
    let breathY = Math.sin(t * 1.8) * 3.5;
    let breathScaleY = 1.0 + Math.sin(t * 1.8) * 0.018;
    let headBobY = Math.sin(t * 1.8 - 0.4) * 2.5;

    // Emote Modifiers
    if (this.currentEmote === 'happy') {
      breathY = Math.sin(t * 4.5) * 5.5; // Excited happy bounce
      headBobY = Math.sin(t * 4.5) * 3.5;
    } else if (this.currentEmote === 'breathe') {
      breathY = Math.sin(t * 0.9) * 4.5; // Slow deep meditation
      breathScaleY = 1.0 + Math.sin(t * 0.9) * 0.03;
    } else if (this.currentEmote === 'surprised') {
      breathY = -4.0 + Math.sin(t * 2.0) * 1.0;
    }

    this.bodyContainer.y = breathY;
    this.bodyContainer.scale.y = breathScaleY;
    this.headContainer.y = headBobY;

    // Shadow scales inverse to breathing height
    const shadowScale = 1.0 - (breathY / 60);
    this.shadowGraphics.scale.set(shadowScale, shadowScale);

    // 2. Procedural Blinking Timer (every 3.5 seconds)
    this.blinkTimer += 0.016;
    if (this.blinkTimer > 3.4 && !this.isBlinking) {
      this.isBlinking = true;
      this.drawEyes(true);
      setTimeout(() => {
        if (!this.isDestroyed) {
          this.drawEyes(false);
          this.isBlinking = false;
          this.blinkTimer = 0;
        }
      }, 140);
    }
  }

  // ── Public Studio API ─────────────────────────────────────────────────────

  /**
   * Applies updated appearance attachments without destroying the canvas
   */
  updateAppearance(newAppearance: CharacterAppearanceState): void {
    this.currentAppearance = { ...newAppearance };
    this.currentEmote = newAppearance.expression || this.currentEmote;
    this.redrawRig();
  }

  /**
   * Plays a temporary emote reaction (happy, surprised, breathe, idle)
   */
  setEmote(emote: CharacterEmote): void {
    this.currentEmote = emote;
    this.drawEyes(false);
    this.drawMouth();
  }

  private onResize = (): void => {
    if (!this.app || !this.containerElement || this.isDestroyed) return;
    const width = this.containerElement.clientWidth || 400;
    const height = this.containerElement.clientHeight || 500;

    this.app.renderer.resize(width, height);
    if (this.stageRoot) {
      this.stageRoot.x = width / 2;
      this.stageRoot.y = height * 0.72;
    }
  };

  /**
   * Cleanly disposes WebGL context and releases GPU resources
   */
  destroy(): void {
    this.isDestroyed = true;
    window.removeEventListener('resize', this.onResize);

    if (this.app) {
      this.app.ticker.remove(this.updateAnimation, this);
      this.app.destroy(true, { children: true });
      this.app = null;
    }
  }
}

