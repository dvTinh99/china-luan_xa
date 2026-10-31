<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in">
    <!-- Studio Header Banner -->
    <div class="relative overflow-hidden rounded-3xl bg-wood-900 border-2 border-wood-750 p-6 sm:p-7 shadow-rpg-panel">
      <div class="absolute -right-12 -top-12 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-400/30 flex items-center gap-1.5">
              <Sparkles :size="12" />
              <span>Cozy Fantasy Character Studio</span>
            </span>
            <span class="text-xs text-amber-200/60 font-bold hidden sm:inline">Thử đồ & Chỉ số độc lập</span>
          </div>
          <h1 class="text-3xl font-black font-heading text-white flex items-center gap-3">
            <Shield :size="28" class="text-gold-400" />
            <span>Chibi Character Studio & Hồ Sơ</span>
          </h1>
          <p class="text-amber-200/70 text-xs sm:text-sm mt-1 max-w-xl">
            Phòng thử đồ nhân vật 2D Chibi hoạt họa. Tùy biến trang bị, theo dõi chỉ số hiệp khách và thành tích học tập HSK 3.0.
          </p>
        </div>

        <!-- Gold Pouch Pill -->
        <div class="flex items-center gap-3 bg-wood-950/80 border border-wood-800 p-3.5 rounded-2xl shrink-0 self-start sm:self-auto">
          <div class="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
            <Coins :size="20" />
          </div>
          <div>
            <div class="text-[10px] text-amber-200/50 uppercase font-bold">Tài sản hiện có</div>
            <div class="text-lg font-black font-heading text-gold-300 leading-tight">
              {{ walletBalance }} <span class="text-xs font-semibold text-gold-500">Gold</span>
            </div>
          </div>
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
        class="p-4 rounded-2xl bg-gradient-to-r from-gold-500/20 to-emerald-500/20 border border-gold-500/40 text-gold-200 text-xs font-bold flex items-center justify-between gap-3 shadow-rpg-glow-gold"
      >
        <div class="flex items-center gap-2.5">
          <Sparkles :size="16" class="text-gold-400 shrink-0" />
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

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="text-center py-20 text-amber-200/50">
      <Loader2 :size="32" class="animate-spin mx-auto mb-2 text-gold-400" />
      <span>Đang chuẩn bị studio nhân vật...</span>
    </div>

    <!-- Main Studio Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Left 5 Columns: 2D Chibi Stage & RPG Stats -->
      <div class="lg:col-span-5 space-y-6">
        <!-- 2D Chibi Rig Stage -->
        <CharacterStage
          :appearance="draftAppearance"
          :active-emote="activeEmote"
          @update:active-emote="triggerEmote"
        />

        <!-- Character RPG Stats Panel -->
        <CharacterStatsPanel :stats="characterStats" />
      </div>

      <!-- Right 7 Columns: Equipment Closet & Learning Stats -->
      <div class="lg:col-span-7 space-y-6">
        <!-- Equipment Closet (Wardrobe) -->
        <EquipmentCloset
          :items="categoryItems"
          v-model:active-category="activeCategory"
          :draft-appearance="draftAppearance"
          :is-dirty="isDirty"
          :is-saving="isSaving"
          @preview="previewItem"
          @save="saveAppearance"
          @cancel="resetDraft"
        />

        <!-- Separate Learning Proficiency Panel -->
        <LearningStatsPanel :stats="learningStats" />
      </div>
    </div>

    <!-- Bottom Section: Idempotent Wallet Ledger History -->
    <div class="rounded-3xl bg-wood-900/90 border-2 border-wood-750 p-6 shadow-rpg-panel">
      <div class="flex items-center justify-between border-b border-wood-800 pb-4 mb-4">
        <div class="flex items-center gap-2 font-bold font-heading text-white text-base">
          <Coins :size="18" class="text-gold-400" />
          <span>Lịch Sử Giao Dịch Gold (Sổ Cái Idempotent)</span>
        </div>
        <span class="text-xs text-amber-200/50">{{ transactions.length }} giao dịch gần nhất</span>
      </div>

      <div v-if="transactions.length === 0" class="py-8 text-center text-xs text-amber-200/40">
        Chưa có giao dịch nào được ghi nhận.
      </div>

      <div v-else class="divide-y divide-wood-800/80">
        <div
          v-for="tx in transactions"
          :key="tx.id"
          class="py-3 flex items-center justify-between text-xs"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
              :class="tx.amount >= 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'"
            >
              <ArrowDownLeft v-if="tx.amount >= 0" :size="15" />
              <ArrowUpRight v-else :size="15" />
            </div>
            <div>
              <div class="font-bold text-white">{{ tx.description }}</div>
              <div class="text-[10px] text-amber-200/50 mt-0.5">{{ formatDate(tx.createdAt) }}</div>
            </div>
          </div>

          <div
            class="font-extrabold font-heading text-sm"
            :class="tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'"
          >
            {{ tx.amount >= 0 ? `+${tx.amount}` : tx.amount }} 🪙
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Sparkles,
  Shield,
  Coins,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-vue-next';
import CharacterStage from '../components/character/CharacterStage.client.vue';
import CharacterStatsPanel from '../components/character/CharacterStatsPanel.vue';
import LearningStatsPanel from '../components/character/LearningStatsPanel.vue';
import EquipmentCloset from '../components/character/EquipmentCloset.vue';
import { useCharacterStudio } from '../composables/useCharacterStudio';

definePageMeta({
  layout: 'default',
});

const {
  draftAppearance,
  isDirty,
  activeCategory,
  activeEmote,
  isLoading,
  isSaving,
  toastMessage,
  characterStats,
  learningStats,
  categoryItems,
  previewItem,
  resetDraft,
  triggerEmote,
  saveAppearance,
  loadStudioData,
} = useCharacterStudio();

const transactions = ref<any[]>([]);
const walletBalance = ref(0);

async function loadTransactions() {
  try {
    const res = await $fetch<any>('/api/character/profile');
    if (res?.data) {
      transactions.value = res.data.transactions || [];
      walletBalance.value = res.data.wallet?.goldBalance ?? 0;
    }
  } catch (e) {}
}

function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

onMounted(async () => {
  await Promise.all([
    loadStudioData(),
    loadTransactions(),
  ]);
});
</script>
