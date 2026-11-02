<template>
  <div class="rounded-3xl bg-wood-900/90 border-2 border-wood-750 p-5 sm:p-6 shadow-rpg-panel space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-wood-800 pb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <BookOpen :size="18" />
        </div>
        <div>
          <h2 class="text-base font-bold font-heading text-white">{{ tDual('characterDetail.academicTitle', '中文能力') }}</h2>
          <span class="text-xs font-bold text-emerald-400">{{ stats.estimatedHskLevel }}</span>
        </div>
      </div>

      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-wood-800 text-amber-200/70 border border-wood-700">
        {{ tDual('characterDetail.academicBadge', '学术独立') }}
      </span>
    </div>

    <p class="text-xs text-amber-200/70 leading-relaxed">
      {{ tDual('characterDetail.academicDesc', '语言能力完全由实际 FSRS 复习成果衡量，不受角色等级或装备影响。') }}
    </p>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-3">
      <div class="p-3.5 rounded-2xl bg-wood-950 border border-wood-800">
        <div class="text-[10px] text-amber-200/50 uppercase font-bold">{{ tDual('characterDetail.vocabLearned', '已学词汇') }}</div>
        <div class="text-2xl font-black font-heading text-gold-300 mt-1">
          {{ stats.vocabularyEnrolled }}
          <span class="text-xs font-normal text-amber-200/40">词</span>
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-wood-950 border border-wood-800">
        <div class="text-[10px] text-amber-200/50 uppercase font-bold">{{ tDual('characterDetail.vocabMastered', '已掌握') }}</div>
        <div class="text-2xl font-black font-heading text-emerald-400 mt-1">
          {{ stats.masteredCount }}
          <span class="text-xs font-normal text-amber-200/40">词</span>
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-wood-950 border border-wood-800">
        <div class="text-[10px] text-amber-200/50 uppercase font-bold">{{ tDual('characterDetail.vocabReinforcing', '巩固中') }}</div>
        <div class="text-2xl font-black font-heading text-sky-400 mt-1">
          {{ stats.reviewingCount }}
          <span class="text-xs font-normal text-amber-200/40">词</span>
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-wood-950 border border-wood-800">
        <div class="text-[10px] text-amber-200/50 uppercase font-bold">{{ tDual('characterDetail.retentionRate', '留存率') }}</div>
        <div class="text-2xl font-black font-heading text-purple-400 mt-1">
          {{ Math.round(stats.retentionRate * 100) }}%
        </div>
      </div>
    </div>

    <!-- Quick Link Button to SRS Review -->
    <NuxtLink
      to="/review"
      class="w-full py-2.5 rounded-2xl bg-wood-850 hover:bg-wood-800 border border-wood-700 hover:border-gold-500/40 text-amber-200 hover:text-gold-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
    >
      <RotateCcw :size="14" />
      <span>{{ tDual('characterDetail.btnReviewDue', '复习到期卡片 (FSRS)') }}</span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, RotateCcw } from 'lucide-vue-next';
import type { LearningStats } from '../../types/character';
import { useOriginLanguage } from '~/composables/useOriginLanguage';

const { tDual } = useOriginLanguage();

defineProps<{
  stats: LearningStats;
}>();
</script>

