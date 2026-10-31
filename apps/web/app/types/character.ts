// ============================================================================
// Types for Chibi Rig Character Studio (CHIBI_CHARACTER.md)
// ============================================================================

export type CharacterCustomizationCategory = 'hair' | 'hat' | 'outfit' | 'shoes' | 'accessory';

export type CharacterEmote = 'idle' | 'happy' | 'surprised' | 'breathe';

export interface CharacterAppearanceState {
  hairId: string;
  hairColor: string;
  hatId: string | null;
  outfitId: string;
  outfitColor: string;
  shoesId: string | null;
  accessoryId: string | null;
  expression: CharacterEmote;
}

export interface EquipmentCatalogItem {
  id: string;
  code: string;
  name: string;
  category: CharacterCustomizationCategory;
  slot?: string;
  icon: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  isOwned: boolean;
  isEquipped: boolean;
  stats?: {
    bonusExpPercent?: number;
    hpBonus?: number;
    atkBonus?: number;
    defBonus?: number;
    luckBonus?: number;
  };
  colorVariants?: string[];
}

export interface CharacterStats {
  name: string;
  level: number;
  exp: number;
  nextLevelExp: number;
  hp: number;
  maxHp: number;
  effectiveMaxHp: number;
  atk: number;
  def: number;
  luck: number;
  gearBonusExpPercent: number;
  gearHpBonus: number;
}

export interface LearningStats {
  vocabularyEnrolled: number;
  masteredCount: number;
  reviewingCount: number;
  retentionRate: number;
  estimatedHskLevel: string;
  streakDays: number;
}

export interface AssetManifestItem {
  id: string;
  code: string;
  category: CharacterCustomizationCategory;
  displayName: string;
  slot: string;
  skinOrAttachmentName: string;
  thumbnail: string;
  colorVariants: string[];
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  compatibility: string[];
  unlockRequirements: string;
  version: string;
}

