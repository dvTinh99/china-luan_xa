<template>
  <div class="rounded-3xl bg-wood-900/90 border-2 border-wood-750 p-5 sm:p-6 shadow-rpg-panel space-y-5 flex flex-col justify-between">
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-wood-800 pb-3 mb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
            <Sparkles :size="18" />
          </div>
          <div>
            <h2 class="text-base font-bold font-heading text-white">{{ tDual('characterDetail.closetTitle', '侠客服饰衣橱') }}</h2>
            <p class="text-[11px] text-amber-200/60">{{ tDual('characterDetail.closetDesc', '点击物品可在 Q 版角色上即时试穿') }}</p>
          </div>
        </div>

        <NuxtLink
          to="/shop"
          class="px-3 py-1.5 rounded-xl bg-wood-850 hover:bg-wood-800 border border-wood-700 hover:border-gold-500/50 text-[11px] font-bold text-amber-200 hover:text-gold-300 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Store :size="13" />
          <span>{{ tDual('nav.shop', '珍宝商行') }}</span>
        </NuxtLink>
      </div>

      <!-- Category Tabs (Hair, Hat, Outfit, Shoes, Accessories) -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-wood-800/80 mb-4 scrollbar-none">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          @click="$emit('update:activeCategory', cat.id)"
          class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          :class="[
            activeCategory === cat.id
              ? 'bg-gold-500 text-wood-950 shadow-rpg-glow-gold'
              : 'bg-wood-950/70 hover:bg-wood-850 text-amber-200/70 hover:text-white border border-wood-800'
          ]"
        >
          <component :is="cat.icon" :size="13" />
          <span>{{ cat.label }}</span>
        </button>
      </div>

      <!-- Item Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
        <div
          v-for="item in items"
          :key="item.id"
          @click="$emit('preview', item)"
          class="p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-2.5 relative select-none cursor-pointer"
          :class="[
            isPreviewing(item)
              ? 'bg-wood-850 border-gold-400 shadow-rpg-glow-gold scale-[1.01]'
              : item.isEquipped
              ? 'bg-wood-900 border-gold-500/50'
              : !item.isOwned
              ? 'opacity-85 bg-wood-950/50 border-wood-800/80 hover:border-gold-500/40'
              : 'bg-wood-950/60 hover:bg-wood-850 border-wood-800 hover:border-wood-700'
          ]"
        >
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border overflow-hidden p-1 relative"
              :class="getRarityBg(item.rarity)"
            >
              <img
                v-if="!hasIconError(item.code)"
                :src="getItemIconSrc(item)"
                :alt="item.name"
                class="w-full h-full object-contain filter drop-shadow-sm select-none"
                loading="lazy"
                @error="onIconError(item.code)"
              />
              <component
                v-else
                :is="getLucideIcon(item.icon)"
                :size="20"
                :class="getRarityColor(item.rarity)"
              />
            </div>

            <!-- Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1">
                <h4 class="text-xs font-bold font-heading text-white truncate">{{ item.name }}</h4>
                <div class="flex items-center gap-1 shrink-0">
                  <span v-if="hasApprovedArt(item.code)" class="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    2D Art
                  </span>
                  <span class="text-[9px] font-black uppercase px-1.5 py-0.2 rounded" :class="getRarityBadge(item.rarity)">
                    {{ item.rarity }}
                  </span>
                </div>
              </div>

              <p class="text-[10px] text-amber-200/60 mt-0.5 line-clamp-2 leading-relaxed">
                {{ item.description }}
              </p>

              <!-- Stat Pill -->
              <div v-if="item.stats?.bonusExpPercent || item.stats?.hpBonus" class="flex items-center gap-2 mt-1.5">
                <span v-if="item.stats.bonusExpPercent" class="text-[10px] font-bold text-gold-300 font-heading">
                  +{{ item.stats.bonusExpPercent }}% EXP
                </span>
                <span v-if="item.stats.hpBonus" class="text-[10px] font-bold text-emerald-400 font-heading">
                  +{{ item.stats.hpBonus }} HP
                </span>
              </div>
            </div>
          </div>

          <!-- Card Bottom State Badges -->
          <div class="flex items-center justify-between pt-2 border-t border-wood-800/60 text-[10px]">
            <span v-if="isPreviewing(item)" class="text-gold-300 font-black flex items-center gap-1">
              <Sparkles :size="11" />
              <span>{{ tDual('characterDetail.previewing', '试穿中') }}{{ !item.isOwned ? ` (${t('characterDetail.unowned')})` : '' }}</span>
            </span>
            <span v-else-if="item.isEquipped" class="text-emerald-400 font-bold flex items-center gap-1">
              <Check :size="11" />
              <span>{{ tDual('characterDetail.equipped', '使用中') }}</span>
            </span>
            <span v-else-if="!item.isOwned" class="text-amber-200/40 italic flex items-center gap-1">
              <Lock :size="10" />
              <span>{{ tDual('characterDetail.unowned', '未拥有') }}</span>
            </span>
            <span v-else class="text-amber-200/40">{{ tDual('characterDetail.available', '已有') }}</span>

            <span class="text-gold-400 font-bold hover:underline">
              {{ isPreviewing(item) ? tDual('characterDetail.deselect', '取消') : tDual('characterDetail.tryOn', '试穿') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Bottom Save & Cancel Controls -->
    <div class="pt-4 border-t border-wood-800 flex items-center justify-between gap-3">
      <div>
        <div v-if="isDirty" class="text-[11px] font-bold text-gold-300 flex items-center gap-1 animate-pulse">
          <Sparkles :size="13" />
          <span>{{ tDual('characterDetail.unsavedChanges', '有未保存的更改') }}</span>
        </div>
        <div v-else class="text-[11px] text-amber-200/40">
          {{ tDual('characterDetail.officialOutfit', '当前显示正式装扮') }}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="isDirty"
          type="button"
          @click="$emit('cancel')"
          :disabled="isSaving"
          class="px-4 py-2 rounded-xl bg-wood-850 hover:bg-wood-800 text-amber-200/80 hover:text-white text-xs font-bold border border-wood-750 transition-all cursor-pointer"
        >
          {{ tDual('characterDetail.cancelTry', '放弃') }}
        </button>

        <button
          type="button"
          @click="$emit('save')"
          :disabled="!isDirty || isSaving"
          class="px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          :class="[
            isDirty
              ? 'bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-wood-950 shadow-rpg-glow-gold'
              : 'bg-wood-800 text-amber-200/40 border border-wood-750'
          ]"
        >
          <Loader2 v-if="isSaving" :size="13" class="animate-spin" />
          <Save v-else :size="13" />
          <span>{{ isSaving ? tDual('characterDetail.saving', '保存中...') : tDual('characterDetail.saveOutfit', '保存装扮') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Sparkles,
  GraduationCap,
  Shirt,
  Footprints,
  PenTool,
  Sword,
  Gem,
  Store,
  Check,
  Lock,
  Save,
  Loader2,
  HardHat,
  Crown,
  Shield,
  ShieldAlert,
} from 'lucide-vue-next';
import { useOriginLanguage } from '~/composables/useOriginLanguage';

const { t, tDual } = useOriginLanguage();
import type {
  CharacterAppearanceState,
  CharacterCustomizationCategory,
  EquipmentCatalogItem,
} from '../../types/character';

const props = defineProps<{
  items: EquipmentCatalogItem[];
  activeCategory: CharacterCustomizationCategory;
  draftAppearance: CharacterAppearanceState;
  isDirty: boolean;
  isSaving: boolean;
}>();

defineEmits<{
  (e: 'update:activeCategory', cat: CharacterCustomizationCategory): void;
  (e: 'preview', item: EquipmentCatalogItem): void;
  (e: 'save'): void;
  (e: 'cancel'): void;
}>();

const categories = computed(() => [
  { id: 'hat' as const, label: tDual('characterDetail.catHead', '冠帽'), icon: GraduationCap },
  { id: 'outfit' as const, label: tDual('characterDetail.catArmor', '长袍'), icon: Shirt },
  { id: 'hair' as const, label: tDual('characterDetail.catAll', '发型'), icon: Sparkles },
  { id: 'shoes' as const, label: tDual('characterDetail.catAccessory', '鞋靴'), icon: Footprints },
  { id: 'accessory' as const, label: tDual('characterDetail.catWeapon', '法宝'), icon: PenTool },
]);

const failedIconCodes = ref<Set<string>>(new Set());

const APPROVED_ART_SET = new Set([
  'item_phoenix_crown',
  'item_straw_hat',
  'item_scholar_hat',
  'item_dragon_armor',
  'item_silk_robe',
  'item_leather_vest',
  'hair_wanderer',
  'hair_topknot',
  'hair_long_fantasy',
  'acc_round_glasses',
  'acc_small_scarf',
  'acc_decorative_necklace',
  'item_jade_pendant',
  'item_wooden_sword',
  'item_bamboo_brush',
  'hair_luma_adventurer',
  'outfit_luma_tunic',
  'shoes_luma_boots',
  'accessory_luma_satchel',
]);

function hasApprovedArt(code: string): boolean {
  return APPROVED_ART_SET.has(code);
}

function onIconError(code: string) {
  failedIconCodes.value.add(code);
}

function hasIconError(code: string): boolean {
  return failedIconCodes.value.has(code);
}

function getItemIconSrc(item: EquipmentCatalogItem): string {
  if (item.icon && (item.icon.startsWith('/') || item.icon.endsWith('.png'))) {
    return item.icon;
  }
  return `/assets/character/icons/icon_${item.code}.png`;
}

function isPreviewing(item: EquipmentCatalogItem): boolean {
  if (item.category === 'hat') return props.draftAppearance.hatId === item.code;
  if (item.category === 'outfit') return props.draftAppearance.outfitId === item.code;
  if (item.category === 'hair') return props.draftAppearance.hairId === item.code;
  if (item.category === 'shoes') return props.draftAppearance.shoesId === item.code;
  if (item.category === 'accessory') return props.draftAppearance.accessoryId === item.code;
  return false;
}

function getRarityBg(rarity: string) {
  switch (rarity) {
    case 'LEGENDARY': return 'bg-amber-500/20 border-amber-400/40';
    case 'EPIC': return 'bg-purple-500/20 border-purple-400/40';
    case 'RARE': return 'bg-sky-500/20 border-sky-400/40';
    default: return 'bg-wood-800 border-wood-700';
  }
}

function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'LEGENDARY': return 'text-gold-300';
    case 'EPIC': return 'text-purple-300';
    case 'RARE': return 'text-sky-300';
    default: return 'text-amber-200';
  }
}

function getRarityBadge(rarity: string) {
  switch (rarity) {
    case 'LEGENDARY': return 'bg-amber-500/30 text-gold-300';
    case 'EPIC': return 'bg-purple-500/30 text-purple-300';
    case 'RARE': return 'bg-sky-500/30 text-sky-300';
    default: return 'bg-wood-800 text-amber-200/60';
  }
}

function getLucideIcon(name: string) {
  const map: Record<string, any> = {
    GraduationCap,
    HardHat,
    Crown,
    Shirt,
    Shield,
    ShieldAlert,
    Footprints,
    PenTool,
    Sword,
    Gem,
    Sparkles,
  };
  return map[name] || Sparkles;
}
</script>

