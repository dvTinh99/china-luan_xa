// ============================================================================
// Official Spine v8 Adapter for PixiJS (CHIBI_CHARACTER.md §3, §5, §14)
// ============================================================================

import {
  Spine,
  Skin,
  TextureAtlas,
  AtlasAttachmentLoader,
  SkeletonJson,
} from '@esotericsoftware/spine-pixi-v8';
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
      const checkRes = await fetch(contract.skeletonPath);
      if (!checkRes.ok) {
        this.isAvailable = false;
        console.info('[SpineAdapter] Production Spine assets not found. Utilizing Phase 1 Vector Chibi Rig.');
        return false;
      }

      // Register with PixiJS 8 Assets resolver if not registered yet
      if (!Assets.resolver.hasKey('chibi-skeleton')) {
        Assets.add({ alias: 'chibi-skeleton', src: contract.skeletonPath });
      }
      if (!Assets.resolver.hasKey('chibi-atlas')) {
        Assets.add({ alias: 'chibi-atlas', src: contract.atlasPath });
      }
      await Assets.load(['chibi-skeleton', 'chibi-atlas']);

      let spine: Spine;
      try {
        spine = Spine.from({
          skeleton: 'chibi-skeleton',
          atlas: 'chibi-atlas',
        });
      } catch (fromErr) {
        console.warn('[SpineAdapter] Spine.from failed, using direct loader:', fromErr);
        const atlasAsset = Assets.get('chibi-atlas') as TextureAtlas;
        const skeletonAsset = Assets.get('chibi-skeleton');
        const attachmentLoader = new AtlasAttachmentLoader(atlasAsset, true);
        const parser = new SkeletonJson(attachmentLoader);
        const skeletonData = parser.readSkeletonData(skeletonAsset);
        spine = new Spine({ skeletonData });
      }

      this.spineInstance = spine;
      this.isAvailable = true;
      console.info('[SpineAdapter] Production Spine 4.3 character loaded successfully!');
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
      const skeleton = this.spineInstance.skeleton;
      const skeletonData = skeleton.data;
      const combinedSkin = new Skin('active-skin');

      const defaultSkin = skeletonData.findSkin('default');
      if (defaultSkin) combinedSkin.addSkin(defaultSkin);

      const targetSkin = skeletonData.findSkin(skinName);
      if (targetSkin && targetSkin !== defaultSkin) {
        combinedSkin.addSkin(targetSkin);
      }

      skeleton.setSkin(combinedSkin);
      skeleton.setupPoseSlots();
    } catch (e) {
      console.warn(`[SpineAdapter] Skin "${skinName}" missing:`, e);
    }
  }
}
