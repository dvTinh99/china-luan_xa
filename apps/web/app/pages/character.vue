<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-850 border border-surface-750 text-xs font-bold text-slate-300 mb-2">
        <Shield :size="13" class="text-purple-400" aria-hidden="true" />
        <span>Hệ thống Nhân vật RPG & Ngôn ngữ Độc lập</span>
      </div>
      <h1 class="text-3xl font-extrabold font-heading text-white tracking-tight">Hồ Sơ Nhân Vật & Tiến Trình Học Tập</h1>
      <p class="text-slate-400 text-xs sm:text-sm mt-1">
        Cấp độ RPG và trình độ năng lực tiếng Trung được lưu trữ và phát triển độc lập theo nguyên tắc thiết kế sư phạm.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="py-24 text-center text-slate-400">
      <div class="w-12 h-12 rounded-2xl bg-surface-850 border border-surface-750 flex items-center justify-center animate-spin mb-3 text-purple-400 mx-auto">
        <Shield :size="24" aria-hidden="true" />
      </div>
      <p class="text-sm font-medium">Đang tải thông tin nhân vật...</p>
    </div>

    <div v-else-if="characterData" class="space-y-8">
      <!-- Top 2-Column Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 1. RPG Character Panel -->
        <div class="bg-surface-900 border border-surface-750 rounded-3xl p-6 sm:p-7 shadow-card-elevated relative overflow-hidden flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-4 mb-6">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-amber-600 flex items-center justify-center font-hanzi text-3xl font-black text-white shadow-glow-brand ring-1 ring-white/20">
                {{ character.name ? character.name.slice(0, 1) : '侠' }}
              </div>
              <div>
                <div class="flex items-center gap-2.5">
                  <h2 class="text-xl font-black font-heading text-white">{{ character.name }}</h2>
                  <span class="px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40 text-xs font-bold font-heading">
                    Lv.{{ character.level }}
                  </span>
                </div>
                <div class="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Avatar Thế giới 2D (Tân Thủ Thôn)</span>
                </div>
              </div>
            </div>

            <!-- HP Bar -->
            <div class="mb-4">
              <div class="flex justify-between text-xs font-bold mb-1.5">
                <span class="text-slate-300 flex items-center gap-1">
                  <Heart :size="13" class="text-emerald-400" aria-hidden="true" />
                  <span>Sinh lực (HP)</span>
                </span>
                <span class="text-emerald-400 font-heading">{{ character.hp }} / {{ character.maxHp }}</span>
              </div>
              <div class="w-full h-3 bg-surface-950 rounded-full overflow-hidden border border-surface-750">
                <div
                  class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  :style="{ width: `${(character.hp / character.maxHp) * 100}%` }"
                />
              </div>
            </div>

            <!-- EXP Bar -->
            <div class="mb-4">
              <div class="flex justify-between text-xs font-bold mb-1.5">
                <span class="text-slate-300 flex items-center gap-1">
                  <Zap :size="13" class="text-purple-400" aria-hidden="true" />
                  <span>Kinh nghiệm (EXP)</span>
                </span>
                <span class="text-purple-400 font-heading">{{ character.exp }} / {{ nextLevelExp }} EXP</span>
              </div>
              <div class="w-full h-3 bg-surface-950 rounded-full overflow-hidden border border-surface-750">
                <div
                  class="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-300"
                  :style="{ width: `${expPercentage}%` }"
                />
              </div>
            </div>

            <!-- Active Gear Bonuses Display -->
            <div v-if="gearStats.equippedCount > 0" class="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl mb-4 text-xs">
              <span class="text-purple-300 font-bold flex items-center gap-1.5">
                <Sparkles :size="14" class="text-purple-400" />
                <span>Trang bị kích hoạt ({{ gearStats.equippedCount }})</span>
              </span>
              <span class="text-gold-300 font-bold font-heading">
                +{{ gearStats.totalBonusExpPercent }}% EXP / +{{ gearStats.totalHpBonus }} HP
              </span>
            </div>
          </div>

          <!-- Wallet Balance & Inventory Link -->
          <div class="flex items-center justify-between p-4 bg-surface-950/80 rounded-2xl border border-surface-750 mt-4">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-500">Tài sản hiện có</span>
              <div class="flex items-center gap-2 font-black font-heading text-gold-300 text-lg">
                <Coins :size="18" class="text-gold-400" aria-hidden="true" />
                <span>{{ walletBalance }}</span>
                <span class="text-xs font-semibold text-gold-500">Gold</span>
              </div>
            </div>

            <NuxtLink
              to="/inventory"
              class="px-3.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-750 border border-surface-700 hover:border-gold-500/40 text-xs font-bold text-amber-200 hover:text-gold-300 transition-all flex items-center gap-1.5"
            >
              <Briefcase :size="14" />
              <span>Hành trang</span>
            </NuxtLink>
          </div>
        </div>

        <!-- 2. Separate Language Proficiency Panel (Mandatory Rule) -->
        <div class="bg-surface-900 border border-surface-750 rounded-3xl p-6 sm:p-7 shadow-card-elevated flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold font-heading text-white flex items-center gap-2">
                <BookOpen :size="18" class="text-brand-400" aria-hidden="true" />
                <span>Năng Lực Tiếng Trung</span>
              </h2>
              <span class="px-3 py-1 rounded-full bg-brand-950 text-brand-300 border border-brand-800 text-xs font-black">
                {{ proficiency.estimatedHskLevel }}
              </span>
            </div>
            <p class="text-xs text-slate-400 mb-6 leading-relaxed">
              Chỉ số ngôn ngữ được tính toán độc lập từ kết quả trả lời thực tế, không bị ảnh hưởng bởi vật phẩm hay thời gian online.
            </p>

            <!-- Proficiency Stats Grid -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="p-4 bg-surface-950/80 rounded-2xl border border-surface-750">
                <div class="text-xs text-slate-400 font-medium">Từ vựng đã học</div>
                <div class="text-3xl font-black font-heading text-gold-300 mt-1">
                  {{ proficiency.vocabularyEnrolled }}
                  <span class="text-xs font-normal text-slate-500">từ</span>
                </div>
              </div>
              <div class="p-4 bg-surface-950/80 rounded-2xl border border-surface-750">
                <div class="text-xs text-slate-400 font-medium">Đã tinh thông (Mastered)</div>
                <div class="text-3xl font-black font-heading text-emerald-400 mt-1">
                  {{ proficiency.masteredCount }}
                  <span class="text-xs font-normal text-slate-500">từ</span>
                </div>
              </div>
              <div class="p-4 bg-surface-950/80 rounded-2xl border border-surface-750">
                <div class="text-xs text-slate-400 font-medium">Đang củng cố (Review)</div>
                <div class="text-3xl font-black font-heading text-sky-400 mt-1">
                  {{ proficiency.reviewingCount }}
                  <span class="text-xs font-normal text-slate-500">từ</span>
                </div>
              </div>
              <div class="p-4 bg-surface-950/80 rounded-2xl border border-surface-750">
                <div class="text-xs text-slate-400 font-medium">Tỷ lệ lưu giữ (Retention)</div>
                <div class="text-3xl font-black font-heading text-purple-400 mt-1">
                  {{ Math.round((proficiency.retentionRate || 0.9) * 100) }}%
                </div>
              </div>
            </div>
          </div>

          <NuxtLink
            to="/review"
            class="min-h-[44px] w-full py-3 rounded-2xl bg-surface-800 hover:bg-surface-750 text-gold-300 border border-surface-700 hover:border-gold-500/40 text-xs font-bold text-center transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <RotateCcw :size="14" aria-hidden="true" />
            <span>Ôn tập các thẻ đến hạn (FSRS)</span>
          </NuxtLink>
        </div>
      </div>

      <!-- 3. Transaction History Ledger -->
      <div class="bg-surface-900 border border-surface-750 rounded-3xl p-6 sm:p-7 shadow-card-elevated">
        <div class="flex items-center justify-between border-b border-surface-750 pb-4 mb-4">
          <div class="flex items-center gap-2 font-bold font-heading text-white text-base">
            <Coins :size="18" class="text-gold-400" aria-hidden="true" />
            <span>Lịch Sử Giao Dịch Gold (Sổ Cái Idempotent)</span>
          </div>
          <span class="text-xs text-slate-400">{{ transactions.length }} giao dịch gần nhất</span>
        </div>

        <div v-if="transactions.length === 0" class="py-8 text-center text-xs text-slate-500">
          Chưa có giao dịch nào được ghi nhận.
        </div>

        <div v-else class="divide-y divide-surface-800">
          <div
            v-for="tx in transactions"
            :key="tx.id"
            class="py-3.5 flex items-center justify-between text-xs"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                :class="tx.amount >= 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-brand-500/15 text-brand-400 border border-brand-500/30'"
              >
                <ArrowDownLeft v-if="tx.amount >= 0" :size="15" aria-hidden="true" />
                <ArrowUpRight v-else :size="15" aria-hidden="true" />
              </div>
              <div>
                <div class="font-bold text-slate-200">{{ tx.description || tx.reason }}</div>
                <div class="text-[10px] text-slate-500 mt-0.5">{{ formatDate(tx.createdAt) }}</div>
              </div>
            </div>

            <div
              class="font-extrabold font-heading text-sm"
              :class="tx.amount >= 0 ? 'text-emerald-400' : 'text-brand-400'"
            >
              {{ tx.amount >= 0 ? `+${tx.amount}` : tx.amount }} 🪙
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Shield,
  Heart,
  Zap,
  Coins,
  BookOpen,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Briefcase,
} from 'lucide-vue-next';

definePageMeta({
  layout: 'default',
});

const { data, pending } = await useFetch<any>('/api/character/profile');
const characterData = computed(() => data.value?.data);

const character = computed(() => characterData.value?.character || {});
const walletBalance = computed(() => characterData.value?.wallet?.goldBalance ?? 0);
const proficiency = computed(() => characterData.value?.proficiency || {});
const transactions = computed(() => characterData.value?.transactions || []);
const gearStats = computed(() => characterData.value?.gearStats || { totalBonusExpPercent: 0, totalHpBonus: 0, equippedCount: 0 });

const nextLevelExp = computed(() => (character.value?.level || 1) * 100);
const expPercentage = computed(() => {
  const current = character.value?.exp || 0;
  const target = nextLevelExp.value;
  return Math.min(100, Math.round((current / target) * 100));
});

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
</script>
