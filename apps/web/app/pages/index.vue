<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
    <!-- Top Welcome & Hero Banner -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-wood-900 via-wood-850 to-wood-900 border-2 border-wood-700/80 p-6 sm:p-8 shadow-rpg-card">
      <!-- Background subtle atmospheric warm light -->
      <div class="absolute -top-12 -right-12 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute -bottom-12 -left-12 w-96 h-96 bg-dragon-600/10 rounded-full blur-3xl pointer-events-none" />

      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <!-- Left: Player Profile & Welcome -->
        <div class="flex items-start sm:items-center gap-5">
          <!-- RPG Character Avatar Frame -->
          <div class="relative group shrink-0">
            <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-dragon-600 via-dragon-500 to-amber-600 flex items-center justify-center font-hanzi font-black text-4xl sm:text-5xl text-white shadow-rpg-glow-dragon border-2 border-gold-400/80">
              {{ characterName ? characterName.slice(0, 1) : '侠' }}
            </div>
            <!-- Level Ribbon Badge -->
            <div class="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-wood-950 border-2 border-gold-500 font-heading font-black text-xs text-gold-300 shadow-md">
              Lv.{{ characterLevel }}
            </div>
          </div>

          <!-- Hero Details & Vitals -->
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2.5">
              <h1 class="text-2xl sm:text-3xl font-black font-rpg text-white tracking-wide">
                {{ characterName || tDual('home.traveler', '异乡游侠') }}
              </h1>
              <RpgBadge variant="gold" size="sm">
                HSK 3.0 Band 1
              </RpgBadge>
            </div>
            <p class="text-xs text-amber-200/70 font-medium">
              {{ tDual('home.apprenticeBio', '新手村武生 • 汉字修仙历练之旅') }}
            </p>

            <!-- Mini Vitals (HP & EXP) -->
            <div class="grid grid-cols-2 gap-3 pt-1 max-w-sm">
              <RpgProgressBar
                :value="characterHp"
                :max="characterMaxHp"
                :label="tDual('characterDetail.hp', '气血值 (HP)')"
                color="jade"
                size="sm"
              >
                <template #icon>
                  <Heart :size="12" class="text-jade-400" aria-hidden="true" />
                </template>
              </RpgProgressBar>

              <RpgProgressBar
                :value="characterExp"
                :max="nextLevelExp"
                :label="tDual('characterDetail.exp', '经验值 (EXP)')"
                color="purple"
                size="sm"
              >
                <template #icon>
                  <Zap :size="12" class="text-purple-400" aria-hidden="true" />
                </template>
              </RpgProgressBar>
            </div>
          </div>
        </div>

        <!-- Right: Fast Action Hub -->
        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <RpgButton
            to="/learn"
            variant="gold"
            size="lg"
          >
            <template #prefix>
              <BookOpen :size="18" aria-hidden="true" />
            </template>
            {{ tDual('home.continueStudy', '继续修炼') }}
          </RpgButton>

          <RpgButton
            to="/world"
            variant="wood"
            size="lg"
          >
            <template #prefix>
              <Gamepad2 :size="18" class="text-sky-400" aria-hidden="true" />
            </template>
            {{ tDual('home.enterVillage', '进入大千世界') }}
          </RpgButton>
        </div>
      </div>
    </div>

    <!-- Main Player Dashboard Grid: 2 Columns (3:2 ratio on desktop) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Left Column: Quests & Next Activity (7 cols) -->
      <div class="lg:col-span-7 space-y-8">
        <!-- 1. Next Recommended Activity Banner -->
        <RpgCard
          variant="wood"
          :title="tDual('home.nextProgressTitle', '后续进阶境界')"
        >
          <template #icon>
            <Flame :size="18" class="text-dragon-400" aria-hidden="true" />
          </template>
          <template #header>
            <RpgBadge variant="dragon" size="sm">{{ tDual('home.recommendedTag', '首选突破') }}</RpgBadge>
          </template>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="text-xs text-gold-400 font-bold uppercase tracking-wider">{{ tDual('home.upcomingLesson', '即临关卡') }}</div>
              <h4 class="text-lg font-bold font-heading text-white">
                {{ nextRecommendedLesson?.title || tDual('home.defaultLessonTitle', '基础问候与代词') }}
              </h4>
              <p class="text-xs text-amber-200/70 line-clamp-2 leading-relaxed">
                {{ nextRecommendedLesson?.description || t('home.defaultLessonDesc') }}
              </p>
              <div class="flex items-center gap-4 text-xs font-bold pt-2">
                <span class="text-amber-200/60">📖 {{ t('home.vocabCount', { count: 12 }) }}</span>
                <span class="text-purple-400">+50 EXP</span>
                <span class="text-gold-400">+20 Gold 🪙</span>
              </div>
            </div>

            <RpgButton
              :to="`/learn/lesson/${nextRecommendedLesson?.id || 'default'}`"
              variant="dragon"
              size="md"
              class="shrink-0"
            >
              <template #suffix>
                <ArrowRight :size="16" aria-hidden="true" />
              </template>
              {{ tDual('home.startNow', '立即启程') }}
            </RpgButton>
          </div>
        </RpgCard>

        <!-- 2. Active Daily Quests Board -->
        <RpgCard
          variant="board"
          :title="tDual('home.questBoardTitle', '宗门每日任务榜')"
        >
          <template #icon>
            <Scroll :size="18" class="text-gold-400" aria-hidden="true" />
          </template>
          <template #header>
            <span class="text-xs text-amber-200/60 font-mono">Reset sau: 05:22:18</span>
          </template>

          <div class="space-y-3">
            <!-- Quest 1 -->
            <div class="p-4 rounded-2xl bg-wood-850 border border-wood-750 flex items-center justify-between gap-4 hover:border-gold-500/40 transition-colors">
              <div class="flex items-center gap-3.5">
                <div class="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
                  <RotateCcw :size="18" aria-hidden="true" />
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-100">{{ tDual('home.quest1Title', '试炼神塔 (FSRS)') }}</div>
                  <div class="text-xs text-slate-400">{{ t('home.quest1Desc') }}</div>
                </div>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <div class="text-right hidden sm:block">
                  <div class="text-xs font-extrabold text-gold-400">+15 Gold</div>
                  <div class="text-[10px] text-purple-400">+30 EXP</div>
                </div>
                <RpgButton
                  to="/review"
                  variant="gold"
                  size="sm"
                >
                  {{ tDual('home.btnReview', '复习') }}
                </RpgButton>
              </div>
            </div>

            <!-- Quest 2 -->
            <div class="p-4 rounded-2xl bg-wood-850 border border-wood-750 flex items-center justify-between gap-4 hover:border-gold-500/40 transition-colors">
              <div class="flex items-center gap-3.5">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <BookOpen :size="18" aria-hidden="true" />
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-100">{{ tDual('home.quest2Title', '开启古老典籍') }}</div>
                  <div class="text-xs text-slate-400">{{ t('home.quest2Desc') }}</div>
                </div>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <div class="text-right hidden sm:block">
                  <div class="text-xs font-extrabold text-gold-400">+25 Gold</div>
                  <div class="text-[10px] text-purple-400">+60 EXP</div>
                </div>
                <RpgButton
                  to="/learn"
                  variant="wood"
                  size="sm"
                >
                  {{ tDual('home.btnStudy', '研读') }}
                </RpgButton>
              </div>
            </div>

            <!-- Quest 3 -->
            <div class="p-4 rounded-2xl bg-wood-850 border border-wood-750 flex items-center justify-between gap-4 hover:border-gold-500/40 transition-colors">
              <div class="flex items-center gap-3.5">
                <div class="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Gamepad2 :size="18" aria-hidden="true" />
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-100">{{ tDual('home.quest3Title', '踏足新手村2D') }}</div>
                  <div class="text-xs text-slate-400">{{ t('home.quest3Desc') }}</div>
                </div>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <div class="text-right hidden sm:block">
                  <div class="text-xs font-extrabold text-gold-400">+10 Gold</div>
                  <div class="text-[10px] text-purple-400">+20 EXP</div>
                </div>
                <RpgButton
                  to="/world"
                  variant="wood"
                  size="sm"
                >
                  {{ tDual('home.btnExplore', '探寻') }}
                </RpgButton>
              </div>
            </div>
          </div>
        </RpgCard>
      </div>

      <!-- Right Column: SRS Cockpit & Achievements (5 cols) -->
      <div class="lg:col-span-5 space-y-8">
        <!-- 3. Spaced Repetition (SRS) Status Box -->
        <RpgCard
          variant="wood"
          :title="tDual('home.srsTowerTitle', '记忆神塔 (FSRS)')"
        >
          <template #icon>
            <RotateCcw :size="18" class="text-gold-400" aria-hidden="true" />
          </template>
          <template #header>
            <RpgBadge :variant="dueCount > 0 ? 'dragon' : 'jade'" size="sm">
              {{ dueCount > 0 ? t('home.dueCardsCount', { count: dueCount }) : tDual('home.allDone', '全部达成') }}
            </RpgBadge>
          </template>

          <div class="text-center py-4">
            <div class="w-20 h-20 rounded-3xl bg-wood-900 border-2 border-wood-700 flex flex-col items-center justify-center mx-auto mb-3 shadow-inner">
              <span class="text-3xl font-black font-heading text-gold-400">{{ dueCount }}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ tDual('home.cardsToReview', '待复习词汇') }}</span>
            </div>
            <p class="text-xs text-amber-200/70 max-w-xs mx-auto leading-relaxed mb-5">
              {{ dueCount > 0 ? t('home.fsrsDueDesc') : t('home.fsrsOptimalDesc') }}
            </p>

            <RpgButton
              to="/review"
              variant="gold"
              size="md"
              class="w-full"
            >
              <template #prefix>
                <RotateCcw :size="16" aria-hidden="true" />
              </template>
              {{ dueCount > 0 ? tDual('home.startReviewSession', '开启复习轮次') : tDual('home.freePractice', '自由练习') }}
            </RpgButton>
          </div>
        </RpgCard>

        <!-- 4. Learning Mastery Progress Summary -->
        <RpgCard
          variant="wood"
          :title="tDual('home.masteryIndexTitle', '语言熟练掌握度')"
        >
          <template #icon>
            <Award :size="18" class="text-emerald-400" aria-hidden="true" />
          </template>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3.5 bg-wood-950/70 rounded-2xl border border-wood-800 text-center">
                <div class="text-[11px] text-slate-400 font-semibold">{{ tDual('home.wordsEncountered', '已涉猎词汇') }}</div>
                <div class="text-2xl font-black font-heading text-gold-300 mt-1">{{ proficiency.vocabularyEnrolled || 12 }}</div>
              </div>
              <div class="p-3.5 bg-wood-950/70 rounded-2xl border border-wood-800 text-center">
                <div class="text-[11px] text-slate-400 font-semibold">{{ tDual('home.allDone', '已融会贯通') }}</div>
                <div class="text-2xl font-black font-heading text-emerald-400 mt-1">{{ proficiency.masteredCount || 5 }}</div>
              </div>
            </div>

            <RpgProgressBar
              :value="proficiency.masteredCount || 5"
              :max="proficiency.vocabularyEnrolled || 12"
              :label="tDual('home.hskMasteryRate', 'HSK 3.0 掌握度')"
              :unit="t('home.unitWords')"
              color="gold"
              size="md"
            />
          </div>
        </RpgCard>

        <!-- 5. Recent Achievements -->
        <RpgCard
          variant="wood"
          :title="tDual('home.achievementsTitle', '最新达成成就')"
        >
          <template #icon>
            <Trophy :size="18" class="text-gold-400" aria-hidden="true" />
          </template>

          <div class="space-y-3">
            <div class="flex items-center gap-3 p-3 rounded-2xl bg-wood-900 border border-wood-750">
              <div class="w-10 h-10 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
                <Sparkles :size="18" aria-hidden="true" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-white truncate">{{ tDual('home.achieve1Title', '启程初试') }}</div>
                <div class="text-[10px] text-slate-400 truncate">{{ t('home.achieve1Desc') }}</div>
              </div>
              <span class="text-xs text-gold-400 font-bold shrink-0">{{ t('home.achieved') }}</span>
            </div>

            <div class="flex items-center gap-3 p-3 rounded-2xl bg-wood-900 border border-wood-750">
              <div class="w-10 h-10 rounded-xl bg-dragon-500/15 border border-dragon-500/30 flex items-center justify-center text-dragon-400 shrink-0">
                <Shield :size="18" aria-hidden="true" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-white truncate">{{ tDual('home.achieve2Title', '声韵先锋') }}</div>
                <div class="text-[10px] text-slate-400 truncate">{{ t('home.achieve2Desc') }}</div>
              </div>
              <span class="text-xs text-gold-400 font-bold shrink-0">{{ t('home.achieved') }}</span>
            </div>
          </div>
        </RpgCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOriginLanguage } from '~/composables/useOriginLanguage';
import {
  Heart,
  Zap,
  BookOpen,
  Gamepad2,
  Flame,
  ArrowRight,
  Scroll,
  RotateCcw,
  Award,
  Trophy,
  Sparkles,
  Shield,
} from 'lucide-vue-next';

definePageMeta({
  layout: 'default',
});

const { t, tDual } = useOriginLanguage();

// Fetch user character and proficiency
const { data: authData } = await useFetch<any>('/api/auth/me');
const user = computed(() => authData.value?.data?.user);
const character = computed(() => user.value?.character || {});
const characterName = computed(() => character.value?.name || '');
const characterLevel = computed(() => character.value?.level || 1);
const characterHp = computed(() => character.value?.hp || 100);
const characterMaxHp = computed(() => character.value?.maxHp || 100);
const characterExp = computed(() => character.value?.exp || 0);
const nextLevelExp = computed(() => characterLevel.value * 100);

// Fetch courses and next recommended lesson
const { data: coursesData } = await useFetch<any>('/api/learning/courses');
const courses = computed(() => coursesData.value?.data?.courses || []);
const nextRecommendedLesson = computed(() => {
  for (const c of courses.value) {
    for (const u of c.units || []) {
      for (const l of u.lessons || []) {
        if (!l.isCompleted) return l;
      }
    }
  }
  return courses.value[0]?.units[0]?.lessons[0] || null;
});

// Fetch SRS statistics
const dueCount = ref(0);
const proficiency = ref<any>({
  vocabularyEnrolled: 12,
  masteredCount: 5,
  reviewingCount: 7,
});

onMounted(async () => {
  try {
    const srs = await $fetch<any>('/api/srs/statistics');
    dueCount.value = srs?.data?.dueCount || 0;

    const prof = await $fetch<any>('/api/character/profile');
    if (prof?.data?.proficiency) {
      proficiency.value = prof.data.proficiency;
    }
  } catch (e) {}
});
</script>
