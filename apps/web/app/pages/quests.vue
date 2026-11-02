<template>
  <div class="py-6 sm:py-10 space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="relative overflow-hidden rounded-3xl bg-wood-900 border-2 border-wood-750 p-6 sm:p-8 shadow-rpg-panel">
      <div class="absolute -right-8 -top-8 w-56 h-56 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-400/30 flex items-center gap-1.5">
              <Clock :size="12" />
              <span>{{ tDual('questsDetail.dailyRefresh', '每日重置') }}</span>
            </span>
            <span class="text-xs text-amber-200/60 font-mono">{{ todayDate }}</span>
          </div>
          <h1 class="text-3xl font-black font-heading text-white flex items-center gap-3">
            <Scroll :size="28" class="text-gold-400" />
            <span>{{ tDual('questsDetail.title', '宗门每日任务') }}</span>
          </h1>
          <p class="text-amber-200/70 text-xs sm:text-sm mt-1 max-w-xl">
            {{ t('questsDetail.desc') }}
          </p>
        </div>

        <div class="flex items-center gap-3 bg-wood-950/80 border border-wood-800 p-4 rounded-2xl shrink-0">
          <div class="text-center px-2">
            <div class="text-xl font-black font-heading text-emerald-400">{{ completedCount }}/{{ quests.length }}</div>
            <div class="text-[10px] text-amber-200/50 uppercase font-bold">{{ tDual('questsDetail.completedLabel', '已达成') }}</div>
          </div>
          <div class="w-px h-8 bg-wood-800" />
          <div class="text-center px-2">
            <div class="text-xl font-black font-heading text-gold-400">{{ claimedCount }}</div>
            <div class="text-[10px] text-amber-200/50 uppercase font-bold">{{ tDual('questsDetail.claimedLabel', '已领取') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Claim Toast Notification -->
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

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-16 text-amber-200/50">
      <Loader2 :size="32" class="animate-spin mx-auto mb-2 text-gold-400" />
      <span>{{ t('questsDetail.loading') }}</span>
    </div>

    <!-- Quests List -->
    <div v-else class="space-y-4">
      <div
        v-for="quest in quests"
        :key="quest.id"
        class="rounded-3xl bg-wood-900/80 border-2 transition-all p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
        :class="[
          quest.isClaimed
            ? 'border-wood-800/80 opacity-60 bg-wood-950/40'
            : quest.isCompleted
            ? 'border-gold-400 shadow-rpg-glow-gold bg-wood-850/90'
            : 'border-wood-750 hover:border-wood-650'
        ]"
      >
        <div class="flex items-start sm:items-center gap-4">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
            :class="[
              quest.isClaimed ? 'bg-wood-800 text-amber-200/40 border-wood-700' :
              quest.isCompleted ? 'bg-gold-500/20 text-gold-300 border-gold-400/40 animate-pulse' :
              'bg-wood-850 text-amber-200 border-wood-700'
            ]"
          >
            <component :is="getQuestIcon(quest.icon)" :size="24" />
          </div>

          <div class="space-y-1.5 flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold font-heading text-white">{{ quest.title }}</h3>
              <span class="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-wood-800 text-amber-200/60">
                {{ quest.category }}
              </span>
            </div>

            <p class="text-xs text-amber-200/70 leading-relaxed">{{ quest.description }}</p>

            <!-- Progress Bar -->
            <div class="flex items-center gap-3 pt-1 max-w-md">
              <div class="flex-1 h-2 rounded-full bg-wood-950 overflow-hidden border border-wood-800">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="quest.isCompleted ? 'bg-gradient-to-r from-emerald-500 to-gold-400' : 'bg-gold-500'"
                  :style="{ width: `${Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100))}%` }"
                />
              </div>
              <span class="text-xs font-mono font-bold text-amber-200/80 shrink-0">
                {{ quest.currentCount }}/{{ quest.targetCount }}
              </span>
            </div>
          </div>
        </div>

        <!-- Rewards & Action Button -->
        <div class="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-wood-800 pt-3 sm:pt-0">
          <div class="flex items-center gap-3 text-xs font-bold">
            <span class="flex items-center gap-1 text-gold-300">
              <Coins :size="14" class="text-gold-400" />
              <span>+{{ quest.rewardGold }}</span>
            </span>
            <span class="flex items-center gap-1 text-purple-300">
              <Sparkles :size="14" class="text-purple-400" />
              <span>+{{ quest.rewardExp }} EXP</span>
            </span>
          </div>

          <button
            type="button"
            @click="handleClaim(quest.id)"
            :disabled="!quest.isCompleted || quest.isClaimed || isClaiming === quest.id"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:cursor-not-allowed"
            :class="[
              quest.isClaimed
                ? 'bg-wood-800 text-amber-200/40 border border-wood-750'
                : quest.isCompleted
                ? 'bg-gold-500 hover:bg-gold-400 text-wood-950 shadow-rpg-glow-gold'
                : 'bg-wood-800 text-amber-200/40 border border-wood-700'
            ]"
          >
            <Loader2 v-if="isClaiming === quest.id" :size="13" class="animate-spin" />
            <Check v-else-if="quest.isClaimed" :size="13" />
            <Gift v-else :size="13" />
            <span>
              {{ quest.isClaimed ? tDual('questsDetail.btnClaimed', '已领取') : quest.isCompleted ? tDual('questsDetail.btnClaim', '领取奖励') : tDual('questsDetail.btnIncomplete', '未完成') }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOriginLanguage } from '~/composables/useOriginLanguage';
import {
  Scroll,
  Clock,
  Coins,
  Sparkles,
  BookOpen,
  RotateCcw,
  Award,
  TrendingUp,
  Gift,
  Check,
  Loader2,
} from 'lucide-vue-next';

definePageMeta({
  layout: 'default',
});

const { t, tDual } = useOriginLanguage();

const quests = ref<any[]>([]);
const todayDate = ref('');
const isLoading = ref(true);
const isClaiming = ref<string | null>(null);
const toastMessage = ref<string | null>(null);

function showToast(msg: string) {
  toastMessage.value = msg;
  setTimeout(() => {
    if (toastMessage.value === msg) {
      toastMessage.value = null;
    }
  }, 4000);
}

const completedCount = computed(() => quests.value.filter((q) => q.isCompleted).length);
const claimedCount = computed(() => quests.value.filter((q) => q.isClaimed).length);

async function loadQuests() {
  isLoading.value = true;
  try {
    const res = await $fetch<any>('/api/quests');
    quests.value = res?.data?.quests || [];
    todayDate.value = res?.data?.today || '';
  } catch (e) {
    console.error('[Quests] Failed to load:', e);
  } finally {
    isLoading.value = false;
  }
}

async function handleClaim(questId: string) {
  isClaiming.value = questId;
  try {
    const res = await $fetch<any>('/api/quests/claim', {
      method: 'POST',
      body: { questId },
    });
    showToast(res?.data?.message || t('questsDetail.claimSuccess'));
    await loadQuests();
  } catch (err: any) {
    showToast(t('questsDetail.claimError', { err: err?.data?.message || err.message }));
  } finally {
    isClaiming.value = null;
  }
}

function getQuestIcon(iconName: string) {
  const map: Record<string, any> = {
    BookOpen,
    RotateCcw,
    Award,
    TrendingUp,
  };
  return map[iconName] || Scroll;
}

onMounted(() => {
  loadQuests();
});
</script>
