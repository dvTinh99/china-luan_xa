// ============================================================================
// Composable: useCharacterStudio (CHIBI_CHARACTER.md §8, §9)
// ============================================================================

import type {
  CharacterAppearanceState,
  CharacterCustomizationCategory,
  CharacterEmote,
  CharacterStats,
  EquipmentCatalogItem,
  LearningStats,
} from '../types/character';
import { CHIBI_DEFAULT_APPEARANCE, CHARACTER_ASSET_MANIFEST } from '../services/character/asset-manifest';

export function useCharacterStudio() {
  const savedAppearance = ref<CharacterAppearanceState>({ ...CHIBI_DEFAULT_APPEARANCE });
  const draftAppearance = ref<CharacterAppearanceState>({ ...CHIBI_DEFAULT_APPEARANCE });

  const activeCategory = ref<CharacterCustomizationCategory>('hat');
  const activeEmote = ref<CharacterEmote>('idle');

  const isLoading = ref(true);
  const isSaving = ref(false);
  const toastMessage = ref<string | null>(null);

  const characterStats = ref<CharacterStats>({
    name: 'Hiệp Khách',
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    hp: 100,
    maxHp: 100,
    effectiveMaxHp: 100,
    atk: 25,
    def: 15,
    luck: 10,
    gearBonusExpPercent: 0,
    gearHpBonus: 0,
  });

  const learningStats = ref<LearningStats>({
    vocabularyEnrolled: 0,
    masteredCount: 0,
    reviewingCount: 0,
    retentionRate: 0.95,
    estimatedHskLevel: 'HSK 3.0 Band 1 (In Progress)',
    streakDays: 3,
  });

  const inventoryItems = ref<any[]>([]);

  // Dirty state: checks if preview differs from saved configuration
  const isDirty = computed(() => {
    return (
      draftAppearance.value.hatId !== savedAppearance.value.hatId ||
      draftAppearance.value.outfitId !== savedAppearance.value.outfitId ||
      draftAppearance.value.hairId !== savedAppearance.value.hairId ||
      draftAppearance.value.shoesId !== savedAppearance.value.shoesId ||
      draftAppearance.value.accessoryId !== savedAppearance.value.accessoryId
    );
  });

  // Dynamic equipment catalog matching user inventory & manifest
  const catalog = computed<EquipmentCatalogItem[]>(() => {
    const ownedCodes = new Set(inventoryItems.value.map((inv) => inv.item.code));

    return CHARACTER_ASSET_MANIFEST.map((manifest) => {
      const invRecord = inventoryItems.value.find((inv) => inv.item.code === manifest.code);
      const isOwned = ownedCodes.has(manifest.code) || manifest.unlockRequirements === 'Khởi đầu';
      const isEquipped =
        savedAppearance.value.hatId === manifest.code ||
        savedAppearance.value.outfitId === manifest.code ||
        savedAppearance.value.hairId === manifest.code ||
        savedAppearance.value.shoesId === manifest.code ||
        savedAppearance.value.accessoryId === manifest.code;

      const itemStats = (invRecord?.item?.stats as any) || {};

      return {
        id: manifest.id,
        code: manifest.code,
        name: manifest.displayName,
        category: manifest.category,
        slot: manifest.slot,
        icon: manifest.thumbnail,
        description: invRecord?.item?.description || manifest.unlockRequirements,
        rarity: manifest.rarity,
        isOwned,
        isEquipped,
        stats: {
          bonusExpPercent: itemStats.bonusExpPercent,
          hpBonus: itemStats.hpBonus,
          atkBonus: itemStats.atkBonus || (manifest.category === 'accessory' ? 12 : undefined),
          defBonus: itemStats.defBonus || (manifest.category === 'outfit' ? 15 : undefined),
          luckBonus: 5,
        },
        colorVariants: manifest.colorVariants,
      };
    });
  });

  // Filtered by active category tab
  const categoryItems = computed(() => {
    return catalog.value.filter((item) => item.category === activeCategory.value);
  });

  function showToast(msg: string) {
    toastMessage.value = msg;
    setTimeout(() => {
      if (toastMessage.value === msg) {
        toastMessage.value = null;
      }
    }, 3500);
  }

  /**
   * Preview an equipment item in the draft without saving to server
   */
  function previewItem(item: EquipmentCatalogItem): void {
    if (item.category === 'hat') {
      draftAppearance.value.hatId = draftAppearance.value.hatId === item.code ? null : item.code;
    } else if (item.category === 'outfit') {
      draftAppearance.value.outfitId = item.code;
    } else if (item.category === 'hair') {
      draftAppearance.value.hairId = item.code;
    } else if (item.category === 'shoes') {
      draftAppearance.value.shoesId = draftAppearance.value.shoesId === item.code ? null : item.code;
    } else if (item.category === 'accessory') {
      draftAppearance.value.accessoryId = draftAppearance.value.accessoryId === item.code ? null : item.code;
    }
  }

  /**
   * Discards preview changes and restores the server-authoritative appearance
   */
  function resetDraft(): void {
    draftAppearance.value = { ...savedAppearance.value };
    showToast('Đã khôi phục trang phục ban đầu.');
  }

  /**
   * Plays a temporary emote reaction on the character stage
   */
  function triggerEmote(emote: CharacterEmote): void {
    activeEmote.value = emote;
    draftAppearance.value.expression = emote;
  }

  /**
   * Persists draft appearance to backend
   */
  async function saveAppearance(): Promise<void> {
    isSaving.value = true;
    try {
      const res = await $fetch<any>('/api/character/appearance', {
        method: 'POST',
        body: {
          hatId: draftAppearance.value.hatId,
          outfitId: draftAppearance.value.outfitId,
          hairId: draftAppearance.value.hairId,
          shoesId: draftAppearance.value.shoesId,
          accessoryId: draftAppearance.value.accessoryId,
        },
      });

      if (res?.success) {
        savedAppearance.value = { ...draftAppearance.value };
        showToast(res.data?.message || 'Đã lưu diện mạo nhân vật thành công!');
        await loadStudioData();
      }
    } catch (err: any) {
      showToast(`Không thể lưu: ${err?.data?.message || err.message}`);
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * Loads authoritative data from backend profile & inventory
   */
  async function loadStudioData(): Promise<void> {
    isLoading.value = true;
    try {
      const [profileRes, invRes] = await Promise.all([
        $fetch<any>('/api/character/profile'),
        $fetch<any>('/api/inventory'),
      ]);

      const prof = profileRes?.data;
      if (prof) {
        const char = prof.character || {};
        characterStats.value = {
          name: char.name || 'Hiệp Khách',
          level: char.level || 1,
          exp: char.exp || 0,
          nextLevelExp: (char.level || 1) * 100,
          hp: char.hp || 100,
          maxHp: char.maxHp || 100,
          effectiveMaxHp: prof.character?.effectiveMaxHp || 100,
          atk: 25 + (char.level - 1) * 5,
          def: 15 + (char.level - 1) * 3,
          luck: 10 + Math.floor(char.level / 2),
          gearBonusExpPercent: prof.gearStats?.totalBonusExpPercent || 0,
          gearHpBonus: prof.gearStats?.totalHpBonus || 0,
        };

        if (prof.proficiency) {
          learningStats.value = {
            vocabularyEnrolled: prof.proficiency.vocabularyEnrolled || 0,
            masteredCount: prof.proficiency.masteredCount || 0,
            reviewingCount: prof.proficiency.reviewingCount || 0,
            retentionRate: prof.proficiency.retentionRate ?? 0.95,
            estimatedHskLevel: prof.proficiency.estimatedHskLevel || 'HSK 3.0 Band 1 (In Progress)',
            streakDays: 3,
          };
        }

        // Restore saved appearance if present in database
        if (char.appearance) {
          savedAppearance.value = {
            ...CHIBI_DEFAULT_APPEARANCE,
            ...char.appearance,
          };
          draftAppearance.value = { ...savedAppearance.value };
        }
      }

      inventoryItems.value = invRes?.data?.inventory || [];
    } catch (e) {
      console.error('[CharacterStudio] Load error:', e);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    savedAppearance,
    draftAppearance,
    isDirty,
    activeCategory,
    activeEmote,
    isLoading,
    isSaving,
    toastMessage,
    characterStats,
    learningStats,
    catalog,
    categoryItems,
    previewItem,
    resetDraft,
    triggerEmote,
    saveAppearance,
    loadStudioData,
    showToast,
  };
}

