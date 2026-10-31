// ============================================================================
// Official Spine v8 Adapter for PixiJS (CHIBI_CHARACTER.md §3, §5, §14)
// ============================================================================

import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { Assets } from 'pixi.js';

export interface SpineAssetContract {
  skeletonPath: string; // e.g. "/assets/spine/character/chibi_hero.json"
  atlasPath: string;    // e.g. "/assets/spine/character/chibi_hero.atlas"
  texturePath: string;  // e.g. "/assets/spine/character/chibi_hero.png"
}

export class SpineCharacterAdapter {
  private spineInstance: Spine | null = null;
  private isAvailable = false;

  constructor() {}

  /**
   * Attempts to verify and load production Spine assets
   */
  async loadProductionSpine(contract: SpineAssetContract): Promise<boolean> {
    try {
      // Check if skeleton file is accessible over HTTP
      const checkRes = await fetch(contract.skeletonPath, { method: 'HEAD' });
      if (!checkRes.ok) {
        this.isAvailable = false;
        console.info('[SpineAdapter] Production Spine assets not found. Utilizing Phase 1 Vector Chibi Rig.');
        return false;
      }

      // Load via PixiJS 8 Assets pipeline
      Assets.add({ alias: 'chibi-skeleton', src: contract.skeletonPath });
      Assets.add({ alias: 'chibi-atlas', src: contract.atlasPath });
      await Assets.load(['chibi-skeleton', 'chibi-atlas']);

      this.spineInstance = Spine.from({
        skeleton: 'chibi-skeleton',
        atlas: 'chibi-atlas',
      });

      this.isAvailable = true;
      return true;
    } catch (err) {
      this.isAvailable = false;
      console.warn('[SpineAdapter] Could not load Spine asset, fallback active:', err);
      return false;
    }
  }

  getSpineDisplay(): Spine | null {
    return this.spineInstance;
  }

  hasProductionModel(): boolean {
    return this.isAvailable;
  }

  setAnimation(animName: string, loop = true): void {
    if (!this.spineInstance) return;
    try {
      this.spineInstance.state.setAnimation(0, animName, loop);
    } catch (e) {
      console.warn(`[SpineAdapter] Animation "${animName}" missing on skeleton:`, e);
    }
  }

  setSkin(skinName: string): void {
    if (!this.spineInstance) return;
    try {
      this.spineInstance.skeleton.setSkinByName(skinName);
      this.spineInstance.skeleton.setSlotsToSetupPose();
    } catch (e) {
      console.warn(`[SpineAdapter] Skin "${skinName}" missing:`, e);
    }
  }
}

