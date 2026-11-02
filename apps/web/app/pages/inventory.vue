<template>
  <div class="py-6 sm:py-10 space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wood-800 pb-4">
      <div>
        <h1 class="text-3xl font-black font-heading text-white flex items-center gap-3">
          <Briefcase :size="28" class="text-gold-400" />
          <span>{{ tDual('inventoryDetail.title', '行囊与装备') }}</span>
        </h1>
        <p class="text-amber-200/70 text-xs sm:text-sm mt-1">
          {{ t('inventoryDetail.desc') }}
        </p>
      </div>

      <NuxtLink
        to="/shop"
        class="px-4 py-2 rounded-2xl bg-wood-850 hover:bg-wood-800 border border-wood-700 hover:border-gold-500/50 text-xs font-bold text-amber-200 hover:text-gold-300 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
      >
        <Store :size="15" />
        <span>{{ tDual('inventoryDetail.visitShop', '前往珍宝阁') }}</span>
      </NuxtLink>
    </div>

    <!-- Toast Notification Banner -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0"
    >
      <div
        v-if="toastMessage"
        class="p-3.5 rounded-2xl bg-gold-500/20 border border-gold-500/40 text-gold-200 text-xs font-bold flex items-center gap-3 shadow-rpg-glow-gold"
      >
        <Sparkles :size="16" class="text-gold-400 shrink-0" />
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- Paperdoll Equipment Showcase & Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left 2 Cols: 4 Equipment Slots Paperdoll -->
      <div class="lg:col-span-2 rounded-3xl bg-wood-900/90 border-2 border-wood-750 p-6 shadow-rpg-panel space-y-5">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold font-heading text-white flex items-center gap-2">
            <Shield :size="18" class="text-gold-400" />
            <span>{{ tDual('inventoryDetail.equippedGear', '已穿戴装备') }}</span>
          </h2>
          <span class="text-xs text-amber-200/60 font-bold">4 {{ t('inventoryDetail.slotCount') }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- HEAD SLOT -->
          <div
            class="p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3"
            :class="equipped.HEAD ? 'bg-wood-850/90 border-gold-500/50 shadow-sm' : 'bg-wood-950/60 border-wood-800/80 border-dashed'"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-wood-800 flex items-center justify-center shrink-0 border border-wood-700 text-gold-400">
                <GraduationCap :size="24" />
              </div>
              <div>
                <div class="text-[10px] uppercase font-bold text-amber-200/50">{{ tDual('inventoryDetail.slotHead', '头部装备') }}</div>
                <div v-if="equipped.HEAD" class="text-sm font-bold text-white">{{ equipped.HEAD.item.name }}</div>
                <div v-else class="text-xs text-amber-200/40 italic">{{ tDual('inventoryDetail.emptySlot', '未装备') }}</div>
              </div>
            </div>
            <button
              v-if="equipped.HEAD"
              type="button"
              @click="handleUnequip(equipped.HEAD.id)"
              class="px-2.5 py-1 rounded-lg bg-wood-800 hover:bg-wood-750 text-amber-200/70 hover:text-red-300 text-xs font-bold transition-colors cursor-pointer"
            >
              {{ tDual('inventoryDetail.unequip', '卸下') }}
            </button>
          </div>

          <!-- WEAPON SLOT -->
          <div
            class="p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3"
            :class="equipped.WEAPON ? 'bg-wood-850/90 border-gold-500/50 shadow-sm' : 'bg-wood-950/60 border-wood-800/80 border-dashed'"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-wood-800 flex items-center justify-center shrink-0 border border-wood-700 text-gold-400">
                <Sword :size="24" />
              </div>
              <div>
                <div class="text-[10px] uppercase font-bold text-amber-200/50">{{ tDual('inventoryDetail.slotWeapon', '武器法宝') }}</div>
                <div v-if="equipped.WEAPON" class="text-sm font-bold text-white">{{ equipped.WEAPON.item.name }}</div>
                <div v-else class="text-xs text-amber-200/40 italic">{{ tDual('inventoryDetail.emptySlot', '未装备') }}</div>
              </div>
            </div>
            <button
              v-if="equipped.WEAPON"
              type="button"
              @click="handleUnequip(equipped.WEAPON.id)"
              class="px-2.5 py-1 rounded-lg bg-wood-800 hover:bg-wood-750 text-amber-200/70 hover:text-red-300 text-xs font-bold transition-colors cursor-pointer"
            >
              {{ tDual('inventoryDetail.unequip', '卸下') }}
            </button>
          </div>

          <!-- ARMOR SLOT -->
          <div
            class="p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3"
            :class="equipped.ARMOR ? 'bg-wood-850/90 border-gold-500/50 shadow-sm' : 'bg-wood-950/60 border-wood-800/80 border-dashed'"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-wood-800 flex items-center justify-center shrink-0 border border-wood-700 text-gold-400">
                <Shirt :size="24" />
              </div>
              <div>
                <div class="text-[10px] uppercase font-bold text-amber-200/50">{{ tDual('inventoryDetail.slotArmor', '防御道袍') }}</div>
                <div v-if="equipped.ARMOR" class="text-sm font-bold text-white">{{ equipped.ARMOR.item.name }}</div>
                <div v-else class="text-xs text-amber-200/40 italic">{{ tDual('inventoryDetail.emptySlot', '未装备') }}</div>
              </div>
            </div>
            <button
              v-if="equipped.ARMOR"
              type="button"
              @click="handleUnequip(equipped.ARMOR.id)"
              class="px-2.5 py-1 rounded-lg bg-wood-800 hover:bg-wood-750 text-amber-200/70 hover:text-red-300 text-xs font-bold transition-colors cursor-pointer"
            >
              {{ tDual('inventoryDetail.unequip', '卸下') }}
            </button>
          </div>

          <!-- ACCESSORY SLOT -->
          <div
            class="p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3"
            :class="equipped.ACCESSORY ? 'bg-wood-850/90 border-gold-500/50 shadow-sm' : 'bg-wood-950/60 border-wood-800/80 border-dashed'"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-wood-800 flex items-center justify-center shrink-0 border border-wood-700 text-gold-400">
                <Gem :size="24" />
              </div>
              <div>
                <div class="text-[10px] uppercase font-bold text-amber-200/50">{{ tDual('inventoryDetail.slotAccessory', '佩饰法器') }}</div>
                <div v-if="equipped.ACCESSORY" class="text-sm font-bold text-white">{{ equipped.ACCESSORY.item.name }}</div>
                <div v-else class="text-xs text-amber-200/40 italic">{{ tDual('inventoryDetail.emptySlot', '未装备') }}</div>
              </div>
            </div>
            <button
              v-if="equipped.ACCESSORY"
              type="button"
              @click="handleUnequip(equipped.ACCESSORY.id)"
              class="px-2.5 py-1 rounded-lg bg-wood-800 hover:bg-wood-750 text-amber-200/70 hover:text-red-300 text-xs font-bold transition-colors cursor-pointer"
            >
              {{ tDual('inventoryDetail.unequip', '卸下') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right 1 Col: Total Stats Bonus Card -->
      <div class="rounded-3xl bg-wood-900/90 border-2 border-wood-750 p-6 shadow-rpg-panel flex flex-col justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold font-heading text-white flex items-center gap-2 mb-3">
            <Sparkles :size="18" class="text-gold-400" />
            <span>{{ tDual('inventoryDetail.activeStatsTitle', '激活属性加成') }}</span>
          </h2>
          <p class="text-xs text-amber-200/70 leading-relaxed mb-4">
            {{ t('inventoryDetail.activeStatsDesc') }}
          </p>

          <div class="space-y-3">
            <div class="p-3 rounded-2xl bg-wood-950 border border-wood-800 flex items-center justify-between">
              <span class="text-xs font-bold text-amber-200/70">{{ tDual('characterDetail.exp', '经验值加成') }}</span>
              <span class="text-base font-black font-heading text-gold-300">+{{ statsBonus.totalBonusExpPercent }}%</span>
            </div>
            <div class="p-3 rounded-2xl bg-wood-950 border border-wood-800 flex items-center justify-between">
              <span class="text-xs font-bold text-amber-200/70">{{ tDual('characterDetail.hp', '气血值上限') }}</span>
              <span class="text-base font-black font-heading text-emerald-400">+{{ statsBonus.totalHpBonus }} HP</span>
            </div>
          </div>
        </div>

        <div class="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-[11px] text-gold-300/90 leading-relaxed">
          💡 {{ t('inventoryDetail.gearTip') }}
        </div>
      </div>

    </div>

    <!-- Inventory Bag Grid -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold font-heading text-white flex items-center gap-2">
          <Package :size="20" class="text-gold-400" />
          <span>{{ tDual('inventoryDetail.bagTitle', '我的背包', { count: inventory.length }) }}</span>
        </h2>
      </div>

      <div v-if="isLoading" class="text-center py-16 text-amber-200/50">
        <Loader2 :size="28" class="animate-spin mx-auto mb-2 text-gold-400" />
        <span>{{ t('inventoryDetail.loading') }}</span>
      </div>

      <div v-else-if="inventory.length === 0" class="text-center py-16 rounded-3xl bg-wood-900/40 border border-wood-800/60 p-6 space-y-4">
        <div class="w-16 h-16 rounded-3xl bg-wood-850 flex items-center justify-center mx-auto text-amber-200/40">
          <PackageOpen :size="32" />
        </div>
        <div class="text-base font-bold text-white">{{ tDual('inventoryDetail.emptyBagTitle', '背包空空如也') }}</div>
        <p class="text-xs text-amber-200/60 max-w-sm mx-auto">
          {{ t('inventoryDetail.emptyBagDesc') }}
        </p>
        <NuxtLink
          to="/shop"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-wood-950 font-bold text-xs shadow-rpg-glow-gold transition-all cursor-pointer"
        >
          <Store :size="14" />
          <span>{{ tDual('inventoryDetail.visitShopNow', '立即前往商店') }}</span>
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="inv in inventory"
          :key="inv.id"
          class="p-4 rounded-3xl bg-wood-900/80 border-2 transition-all duration-200 flex flex-col justify-between gap-3"
          :class="inv.isEquipped ? 'border-gold-500 shadow-rpg-glow-gold' : 'border-wood-750 hover:border-wood-600'"
        >
          <div>
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-2xl bg-wood-800 flex items-center justify-center shrink-0 border border-wood-700 text-amber-200">
                  <component :is="getLucideIcon(inv.item.icon)" :size="20" />
                </div>
                <div>
                  <h3 class="text-sm font-bold font-heading text-white">{{ inv.item.name }}</h3>
                  <div class="text-[10px] text-amber-200/50 uppercase mt-0.5 font-bold">
                    {{ inv.item.slot ? formatSlotName(inv.item.slot) : tDual('inventoryDetail.consumable', '消耗品') }}
                  </div>
                </div>
              </div>
              <span v-if="inv.quantity > 1" class="px-2 py-0.5 rounded-lg bg-wood-800 text-gold-300 text-xs font-mono font-bold">
                x{{ inv.quantity }}
              </span>
            </div>

            <p class="text-xs text-amber-200/70 mt-2.5 leading-relaxed">
              {{ inv.item.description }}
            </p>
          </div>

          <div class="pt-3 border-t border-wood-800/80 flex items-center justify-between">
            <span
              v-if="inv.isEquipped"
              class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gold-500/20 text-gold-300 border border-gold-500/30"
            >
              {{ tDual('inventoryDetail.isEquipped', '已装备') }}
            </span>
            <span v-else class="text-[11px] text-amber-200/40">{{ tDual('inventoryDetail.inBag', '在背包中') }}</span>

            <div class="flex items-center gap-2">
              <button
                v-if="inv.item.itemType === 'EQUIPMENT'"
                type="button"
                @click="inv.isEquipped ? handleUnequip(inv.id) : handleEquip(inv.id)"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                :class="[
                  inv.isEquipped
                    ? 'bg-wood-800 hover:bg-wood-750 text-red-300 border border-wood-700'
                    : 'bg-gold-500 hover:bg-gold-400 text-wood-950 shadow-sm'
                ]"
              >
                <Check v-if="!inv.isEquipped" :size="12" />
                <span>{{ inv.isEquipped ? tDual('inventoryDetail.unequip', '卸下') : tDual('inventoryDetail.equip', '装备') }}</span>
              </button>

              <button
                v-else-if="inv.item.itemType === 'CONSUMABLE'"
                type="button"
                @click="handleUse(inv.id)"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              >
                <Coffee :size="12" />
                <span>{{ tDual('inventoryDetail.useItem', '使用') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Briefcase,
  Store,
  Shield,
  GraduationCap,
  Sword,
  Shirt,
  Gem,
  Sparkles,
  Package,
  PackageOpen,
  Check,
  HardHat,
  Crown,
  PenTool,
  Wand2,
  Briefcase as BriefcaseIcon,
  Sparkle,
  Coffee,
  ShieldAlert,
  Loader2,
} from 'lucide-vue-next';

definePageMeta({
  layout: 'default',
});

const { t, tDual } = useOriginLanguage();

const inventory = ref<any[]>([]);
const equipped = ref<Record<string, any>>({
  HEAD: null,
  WEAPON: null,
  ARMOR: null,
  ACCESSORY: null,
});
const statsBonus = ref({
  totalBonusExpPercent: 0,
  totalHpBonus: 0,
});
const isLoading = ref(true);
const toastMessage = ref<string | null>(null);

function showToast(msg: string) {
  toastMessage.value = msg;
  setTimeout(() => {
    if (toastMessage.value === msg) {
      toastMessage.value = null;
    }
  }, 3500);
}

async function loadInventory() {
  isLoading.value = true;
  try {
    const res = await $fetch<any>('/api/inventory');
    inventory.value = res?.data?.inventory || [];
    equipped.value = res?.data?.equipped || {};
    statsBonus.value = res?.data?.statsBonus || { totalBonusExpPercent: 0, totalHpBonus: 0 };
  } catch (e) {
    console.error('[Inventory] Failed to load:', e);
  } finally {
    isLoading.value = false;
  }
}

async function handleEquip(inventoryItemId: string) {
  try {
    const res = await $fetch<any>('/api/inventory/equip', {
      method: 'POST',
      body: { inventoryItemId },
    });
    showToast(res?.data?.message || t('inventoryDetail.equipSuccess'));
    await loadInventory();
  } catch (err: any) {
    showToast(t('inventoryDetail.equipError', { err: err?.data?.message || err.message }));
  }
}

async function handleUnequip(inventoryItemId: string) {
  try {
    const res = await $fetch<any>('/api/inventory/unequip', {
      method: 'POST',
      body: { inventoryItemId },
    });
    showToast(res?.data?.message || t('inventoryDetail.unequipSuccess'));
    await loadInventory();
  } catch (err: any) {
    showToast(t('inventoryDetail.unequipError', { err: err?.data?.message || err.message }));
  }
}

async function handleUse(inventoryItemId: string) {
  try {
    const res = await $fetch<any>('/api/inventory/use', {
      method: 'POST',
      body: { inventoryItemId },
    });
    let effectDesc = '';
    if (res?.data?.effect?.healAmount) {
      effectDesc += ' ' + t('inventoryDetail.healHpEffect', { amount: res.data.effect.healAmount });
    }
    if (res?.data?.effect?.expAmount) {
      effectDesc += ' ' + t('inventoryDetail.expEffect', { amount: res.data.effect.expAmount });
    }
    if (res?.data?.effect?.leveledUp) {
      effectDesc += ' ' + t('inventoryDetail.levelUpEffect');
    }
    showToast((res?.data?.message || t('inventoryDetail.useSuccess')) + effectDesc);
    await loadInventory();
  } catch (err: any) {
    showToast(t('inventoryDetail.useError', { err: err?.data?.message || err.message }));
  }
}

function formatSlotName(slot: string) {
  const map: Record<string, string> = {
    HEAD: tDual('inventoryDetail.slotHead', '头部装备'),
    WEAPON: tDual('inventoryDetail.slotWeapon', '武器法宝'),
    ARMOR: tDual('inventoryDetail.slotArmor', '防御道袍'),
    ACCESSORY: tDual('inventoryDetail.slotAccessory', '佩饰法器'),
  };
  return map[slot] || slot;
}

function getLucideIcon(iconName: string) {
  const map: Record<string, any> = {
    GraduationCap,
    HardHat,
    Crown,
    PenTool,
    Sword,
    Wand2,
    Shirt,
    Shield,
    ShieldAlert,
    Gem,
    Briefcase: BriefcaseIcon,
    Sparkle,
    Coffee,
    Sparkles,
  };
  return map[iconName] || Package;
}

onMounted(() => {
  loadInventory();
});
</script>
