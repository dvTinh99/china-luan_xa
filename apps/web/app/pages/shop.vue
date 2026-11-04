<template>
  <div class="py-6 sm:py-10 space-y-8 animate-fade-in">
    <!-- Shopkeeper Hero Banner -->
    <div class="relative overflow-hidden rounded-3xl bg-wood-900 border-2 border-wood-750 p-6 sm:p-8 shadow-rpg-panel">
      <div class="absolute -right-12 -top-12 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-400/30 flex items-center gap-1.5">
              <Store :size="14" />
              <span>{{ tDual('shopDetail.tag', '新手商铺') }}</span>
            </span>
            <span class="text-xs font-bold text-amber-200/60 hidden sm:inline">{{ tDual('shopDetail.keeper', '店主: 钱掌柜') }}</span>
          </div>

          <h1 class="text-3xl sm:text-4xl font-black font-heading text-white tracking-wide">
            {{ tDual('shopDetail.title', '珍宝商行') }}
          </h1>

          <p class="text-amber-200/80 text-sm max-w-xl leading-relaxed">
            {{ t('shopDetail.desc') }}
          </p>
        </div>

        <!-- Player Current Gold Display -->
        <div class="bg-wood-950/90 border-2 border-gold-500/40 p-4 sm:p-5 rounded-2xl shadow-rpg-glow-gold flex flex-col items-center justify-center shrink-0 min-w-[180px]">
          <span class="text-xs font-bold text-amber-200/60 uppercase tracking-wider mb-1">{{ tDual('shopDetail.yourWallet', '您的钱袋') }}</span>
          <div class="flex items-center gap-2 text-2xl sm:text-3xl font-black font-heading text-gold-300">
            <Coins :size="24" class="text-gold-400" />
            <span>{{ walletGold }}</span>
          </div>
          <span class="text-[10px] text-amber-200/50 mt-1">{{ tDual('shopDetail.goldCoins', '金币') }}</span>
        </div>
      </div>
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
        class="p-4 rounded-2xl bg-gold-500/20 border border-gold-500/40 text-gold-200 text-xs font-bold flex items-center justify-between gap-3 shadow-rpg-glow-gold"
      >
        <div class="flex items-center gap-3">
          <Sparkles :size="18" class="text-gold-400 shrink-0" />
          <span>{{ toastMessage }}</span>
        </div>
        <button
          type="button"
          @click="toastMessage = null"
          class="text-amber-200/50 hover:text-white text-xs font-bold"
        >
          ✕
        </button>
      </div>
    </transition>

    <!-- Category Filters -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-wood-800">
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        @click="selectedCategory = cat.id"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
        :class="[
          selectedCategory === cat.id
            ? 'bg-gold-500 text-wood-950 shadow-rpg-glow-gold'
            : 'bg-wood-900/60 hover:bg-wood-850 text-amber-200/70 hover:text-amber-100 border border-wood-800'
        ]"
      >
        <component :is="cat.icon" :size="14" />
        <span>{{ cat.label }}</span>
        <span class="text-[10px] opacity-70">({{ getCategoryCount(cat.id) }})</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="status" aria-busy="true">
      <div v-for="card in 6" :key="card" class="min-h-[276px] rounded-3xl bg-wood-900/80 border-2 border-wood-750 p-5 flex flex-col justify-between animate-pulse">
        <div class="space-y-5">
          <div class="flex justify-between"><div class="w-12 h-12 rounded-2xl bg-wood-800" /><div class="w-16 h-5 rounded-full bg-wood-800" /></div>
          <div class="space-y-2"><div class="w-2/3 h-5 rounded bg-wood-800" /><div class="w-full h-3 rounded bg-wood-800" /><div class="w-4/5 h-3 rounded bg-wood-800" /></div>
        </div>
        <div class="flex justify-between items-center pt-5"><div class="w-20 h-6 rounded bg-wood-800" /><div class="w-24 h-10 rounded-xl bg-wood-800" /></div>
      </div>
      <span class="sr-only">{{ t('shopDetail.loading') }}</span>
    </div>

    <!-- Items Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="rounded-3xl bg-wood-900/80 border-2 transition-all duration-200 p-5 flex flex-col justify-between group hover:-translate-y-1"
        :class="getRarityBorderClass(item.rarity)"
      >
        <div class="space-y-3">
          <!-- Item Header & Badge -->
          <div class="flex items-start justify-between gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border" :class="getRarityIconBg(item.rarity)">
              <component :is="getLucideIcon(item.icon)" :size="24" :class="getRarityTextColor(item.rarity)" />
            </div>

            <div class="flex flex-col items-end gap-1">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider" :class="getRarityBadgeClass(item.rarity)">
                {{ item.rarity }}
              </span>
              <span v-if="item.slot" class="text-[10px] font-bold text-amber-200/50 uppercase">
                {{ tDual('shopDetail.slotPrefix', '装备部位') }}: {{ formatSlotName(item.slot) }}
              </span>
            </div>
          </div>

          <!-- Item Title & Description -->
          <div>
            <h3 class="text-lg font-bold font-heading text-white group-hover:text-gold-300 transition-colors">
              {{ item.name }}
            </h3>
            <p class="text-xs text-amber-200/70 mt-1 leading-relaxed">
              {{ item.description }}
            </p>
          </div>

          <!-- Stat Bonuses Pill -->
          <div v-if="item.stats" class="flex flex-wrap gap-1.5 pt-1">
            <span
              v-if="item.stats.bonusExpPercent"
              class="px-2 py-0.5 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-300 text-[11px] font-bold"
            >
              +{{ item.stats.bonusExpPercent }}% {{ tDual('characterDetail.exp', '经验值') }}
            </span>
            <span
              v-if="item.stats.hpBonus"
              class="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold"
            >
              +{{ item.stats.hpBonus }} {{ tDual('characterDetail.hp', '气血值') }}
            </span>
            <span
              v-if="item.stats.healHp"
              class="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold"
            >
              {{ t('shopDetail.healHp', { hp: item.stats.healHp }) }}
            </span>
            <span
              v-if="item.stats.grantExp"
              class="px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-bold"
            >
              {{ t('shopDetail.grantExp', { exp: item.stats.grantExp }) }}
            </span>
          </div>
        </div>

        <!-- Price & Purchase Action -->
        <div class="mt-5 pt-3 border-t border-wood-800/80 flex items-center justify-between gap-3">
          <div class="flex items-center gap-1.5">
            <Coins :size="18" class="text-gold-400" />
            <span class="text-xl font-black font-heading text-gold-300">{{ item.priceGold }}</span>
            <span class="text-xs text-amber-200/50 font-bold">Gold</span>
          </div>

          <button
            type="button"
            @click="handleBuy(item)"
            :disabled="isBuying === item.id || walletGold < item.priceGold"
            class="px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            :class="[
              walletGold >= item.priceGold
                ? 'bg-gold-500 hover:bg-gold-400 text-wood-950 shadow-rpg-glow-gold'
                : 'bg-wood-800 text-amber-200/50 border border-wood-700'
            ]"
          >
            <Loader2 v-if="isBuying === item.id" :size="13" class="animate-spin" />
            <ShoppingBag v-else :size="13" />
            <span>{{ isBuying === item.id ? tDual('shopDetail.buying', '购买中...') : walletGold >= item.priceGold ? tDual('shopDetail.buyNow', '立即购买') : tDual('shopDetail.notEnoughGold', '金币不足') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Store,
  Coins,
  ShoppingBag,
  Sparkles,
  Shield,
  Sword,
  Shirt,
  Gem,
  HardHat,
  GraduationCap,
  Crown,
  PenTool,
  Wand2,
  Briefcase,
  Sparkle,
  Coffee,
  ShieldAlert,
  Package,
  Loader2,
} from 'lucide-vue-next';

definePageMeta({
  layout: 'default',
});

const { t, tDual } = useOriginLanguage();

const items = ref<any[]>([]);
const walletGold = ref(0);
const isLoading = ref(true);
const isBuying = ref<string | null>(null);
const toastMessage = ref<string | null>(null);

function showToast(msg: string) {
  toastMessage.value = msg;
  setTimeout(() => {
    if (toastMessage.value === msg) {
      toastMessage.value = null;
    }
  }, 4000);
}

const selectedCategory = ref<'all' | 'HEAD' | 'WEAPON' | 'ARMOR' | 'ACCESSORY' | 'CONSUMABLE'>('all');

const categories = computed(() => [
  { id: 'all', label: tDual('shopDetail.catAll', '全品类'), icon: Package },
  { id: 'HEAD', label: tDual('shopDetail.catHead', '冠冕发簪'), icon: GraduationCap },
  { id: 'WEAPON', label: tDual('shopDetail.catWeapon', '神兵判官笔'), icon: Sword },
  { id: 'ARMOR', label: tDual('shopDetail.catArmor', '玄锦道袍'), icon: Shirt },
  { id: 'ACCESSORY', label: tDual('shopDetail.catAccessory', '灵玉佩饰'), icon: Gem },
  { id: 'CONSUMABLE', label: tDual('shopDetail.catConsumable', '丹药香茗'), icon: Coffee },
]);

function getCategoryCount(catId: string) {
  if (catId === 'all') return items.value.length;
  if (catId === 'CONSUMABLE') return items.value.filter((i) => i.itemType === 'CONSUMABLE').length;
  return items.value.filter((i) => i.slot === catId).length;
}

const filteredItems = computed(() => {
  if (selectedCategory.value === 'all') return items.value;
  if (selectedCategory.value === 'CONSUMABLE') {
    return items.value.filter((i) => i.itemType === 'CONSUMABLE');
  }
  return items.value.filter((i) => i.slot === selectedCategory.value);
});

async function loadShopData() {
  isLoading.value = true;
  try {
    const [shopRes, authRes] = await Promise.all([
      $fetch<any>('/api/shop/items'),
      $fetch<any>('/api/auth/me').catch(() => null),
    ]);

    items.value = shopRes?.data?.items || [];
    walletGold.value = authRes?.data?.user?.wallet?.balanceGold ?? 500;
  } catch (e) {
    console.error('[Shop] Failed to load shop data:', e);
  } finally {
    isLoading.value = false;
  }
}

async function handleBuy(item: any) {
  if (walletGold.value < item.priceGold) {
    showToast(t('shopDetail.notEnoughGoldAlert'));
    return;
  }

  isBuying.value = item.id;
  try {
    const res = await $fetch<any>('/api/shop/purchase', {
      method: 'POST',
      body: { itemId: item.id, quantity: 1 },
    });

    if (res?.data?.purchase?.wallet) {
      walletGold.value = res.data.purchase.wallet.balanceGold;
    }
    showToast(res?.data?.message || t('shopDetail.buySuccess'));
  } catch (err: any) {
    showToast(t('shopDetail.buyError', { err: err?.data?.message || err.message || 'Purchase error' }));
  } finally {
    isBuying.value = null;
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

function getRarityBorderClass(rarity: string) {
  switch (rarity) {
    case 'LEGENDARY':
      return 'border-amber-400/80 shadow-rpg-glow-gold hover:border-gold-300';
    case 'EPIC':
      return 'border-purple-500/70 hover:border-purple-400';
    case 'RARE':
      return 'border-sky-500/70 hover:border-sky-400';
    default:
      return 'border-wood-750 hover:border-wood-600';
  }
}

function getRarityBadgeClass(rarity: string) {
  switch (rarity) {
    case 'LEGENDARY':
      return 'bg-amber-500/20 text-amber-300 border border-amber-400/30';
    case 'EPIC':
      return 'bg-purple-500/20 text-purple-300 border border-purple-400/30';
    case 'RARE':
      return 'bg-sky-500/20 text-sky-300 border border-sky-400/30';
    default:
      return 'bg-wood-800 text-amber-200/70 border border-wood-700';
  }
}

function getRarityIconBg(rarity: string) {
  switch (rarity) {
    case 'LEGENDARY':
      return 'bg-amber-500/15 border-amber-400/30';
    case 'EPIC':
      return 'bg-purple-500/15 border-purple-400/30';
    case 'RARE':
      return 'bg-sky-500/15 border-sky-400/30';
    default:
      return 'bg-wood-800/80 border-wood-700';
  }
}

function getRarityTextColor(rarity: string) {
  switch (rarity) {
    case 'LEGENDARY':
      return 'text-gold-300';
    case 'EPIC':
      return 'text-purple-300';
    case 'RARE':
      return 'text-sky-300';
    default:
      return 'text-amber-200';
  }
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
    Briefcase,
    Sparkle,
    Coffee,
    Sparkles,
  };
  return map[iconName] || Package;
}

onMounted(() => {
  loadShopData();
});
</script>
