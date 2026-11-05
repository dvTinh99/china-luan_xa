<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in">
    <!-- ===================================================================== -->
    <!-- 1. HERO BENTO QUEST HUB                                               -->
    <!-- ===================================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      <!-- Bento 1: Mascot Luma & Current Quest CTA (8 Columns) -->
      <div
        ref="heroBentoRef"
        class="lg:col-span-8 relative overflow-hidden rounded-3xl bg-wood-900 border-2 border-wood-750 p-6 sm:p-7 shadow-rpg-panel flex flex-col justify-between group bento-card"
      >
        <!-- Background Ambient Glow -->
        <div class="absolute -right-16 -top-16 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div class="absolute -left-16 -bottom-16 w-56 h-56 bg-jade-500/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          <!-- Header Tag & Curriculum Level -->
          <div class="flex items-center justify-between gap-3 mb-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-400/30 text-xs font-bold text-gold-300 shadow-sm">
              <Sparkles :size="13" class="text-gold-400" aria-hidden="true" />
              <span>{{ ui.heroTag }}</span>
            </div>

            <span class="text-xs font-semibold text-amber-200/50 hidden sm:inline-flex items-center gap-1.5">
              <Compass :size="14" class="text-amber-400" />
              <span>{{ ui.heroTagline }}</span>
            </span>
          </div>

          <!-- Luma Mascot + Speech Bubble & Current Quest -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-5 my-2">
            <!-- Luma Avatar with Floating GSAP Effect -->
            <div class="relative shrink-0 flex items-center justify-center">
              <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-wood-950 to-wood-850 border-2 border-gold-400/60 p-1 shadow-rpg-glow-gold relative overflow-hidden group cursor-pointer"
                   @click="cycleLumaDialogue"
                   :title="t('learnIndex.lumaTooltip')">
                <img
                  src="/assets/character/ui/avatar_luma_portrait.png"
                  alt="Luma The Little Wanderer"
                  class="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-110 select-none luma-mascot"
                />
                <span class="absolute bottom-1 right-1 w-3 h-3 bg-emerald-400 border-2 border-wood-950 rounded-full" />
              </div>
            </div>

            <!-- Speech Bubble & Quest Details -->
            <div class="flex-1 min-w-0">
              <!-- Speech Bubble -->
              <div class="relative p-3 rounded-2xl bg-wood-950/90 border border-gold-500/30 text-xs text-amber-200/90 leading-relaxed shadow-sm mb-3">
                <div class="font-bold text-gold-300 flex items-center gap-1.5 mb-0.5">
                  <span>{{ tDual('learnIndex.companionLuma', '伴读小仙 鹿玛') }}:</span>
                  <span class="text-[10px] text-amber-200/50 italic font-normal">"{{ currentDialogue.zh }} ({{ t(currentDialogue.key) }})"</span>
                </div>
                <div class="text-[11px] text-amber-100/70">
                  {{ ui.nextGoalPrefix }}: {{ ui.conquerLesson }} <span class="text-gold-300 font-bold">{{ dualLessonTitle(nextLesson?.title) || tDual('learnIndex.nextGoal', '下一关') }}</span> {{ ui.rewardSuffix }}
                </div>
              </div>

              <!-- Main Title -->
              <h1 class="text-xl sm:text-2xl font-black font-heading text-white tracking-tight flex items-center gap-2">
                <span>{{ ui.heroTitle }}</span>
              </h1>
            </div>
          </div>
        </div>

        <!-- Quest Card Action Banner -->
        <div class="pt-4 border-t border-wood-800/80 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3 text-xs text-amber-200/70">
            <span class="flex items-center gap-1 text-purple-300 font-bold">
              <Sparkles :size="13" />
              <span>+{{ nextLesson?.expReward || 60 }} 经验 (EXP)</span>
            </span>
            <span class="text-wood-700">•</span>
            <span class="flex items-center gap-1 text-gold-300 font-bold">
              <Coins :size="13" />
              <span>+{{ nextLesson?.goldReward || 25 }} {{ tDual('learnIndex.goldSub', '金币') }}</span>
            </span>
            <span class="text-wood-700">•</span>
            <span class="text-slate-300 font-medium">
              📖 {{ nextLesson?.vocabularyCount || 12 }} {{ tDual('learnIndex.vocab', '生词') }}
            </span>
          </div>

          <!-- Large Play CTA Button -->
          <NuxtLink
            :to="nextLesson ? `/learn/lesson/${nextLesson.id}` : '#'"
            class="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-gold-500 via-amber-500 to-gold-400 hover:from-gold-400 hover:to-amber-300 text-wood-950 font-black text-sm shadow-rpg-glow-gold hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0 min-h-[46px]"
          >
            <Play :size="16" class="fill-current text-wood-950" />
            <span>{{ ui.btnContinueLesson }}</span>
            <ArrowRight :size="16" />
          </NuxtLink>
        </div>
      </div>

      <!-- Bento 2: Spaced Repetition SRS Quick Station (4 Columns) -->
      <div
        ref="srsBentoRef"
        class="lg:col-span-4 rounded-3xl bg-wood-900 border-2 border-wood-750 p-6 shadow-rpg-panel flex flex-col justify-between bento-card relative overflow-hidden"
      >
        <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div class="flex items-center justify-between border-b border-wood-800 pb-3 mb-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <RotateCcw :size="16" />
              </div>
              <h2 class="text-sm font-bold font-heading text-white">{{ ui.srsTitle }}</h2>
            </div>
            <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {{ dual('间隔重复', 'SRS', 'Spaced Repetition') }}
            </span>
          </div>

          <!-- Counter Display -->
          <div class="my-4 text-center">
            <div v-if="isSrsLoading" class="mx-auto w-20 h-14 rounded-xl bg-wood-800 animate-pulse" aria-hidden="true" />
            <div v-else class="text-4xl sm:text-5xl font-black font-heading text-gold-300 srs-counter">
              {{ dueCount }}
            </div>
            <p v-if="!isSrsLoading" class="text-xs text-amber-200/60 mt-1 font-medium">
              {{ dueCount > 0 ? (dueCount + ' ' + tDual('learnIndex.cardsDue', '张生词已到复习时刻')) : ui.srsEmpty }}
            </p>
          </div>

          <!-- Memory Retention Bar -->
          <div class="p-3 rounded-2xl bg-wood-950/70 border border-wood-800 space-y-1.5 my-2">
            <div class="flex items-center justify-between text-[11px] font-bold">
              <span class="text-amber-200/70">{{ ui.retentionRate }}:</span>
              <span class="text-emerald-400 font-mono">98.2%</span>
            </div>
            <div class="w-full h-2 bg-wood-900 rounded-full overflow-hidden border border-wood-800">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[98%]" />
            </div>
          </div>
        </div>

        <NuxtLink
          to="/review"
          class="w-full mt-4 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border"
          :class="dueCount > 0
            ? 'bg-purple-600/90 hover:bg-purple-500 text-white border-purple-400/40 shadow-sm'
            : 'bg-wood-850 hover:bg-wood-800 text-amber-200/70 border-wood-750'"
        >
          <RotateCcw :size="14" />
          <span>{{ dueCount > 0 ? ui.btnStartReview : ui.btnViewDeck }}</span>
        </NuxtLink>
      </div>

    </div>

    <NuxtLink to="/learn/pinyin" class="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-sky-950/80 via-wood-900 to-wood-900 border-2 border-sky-800/70 hover:border-sky-500/60 p-5 sm:p-6 transition-colors shadow-rpg-panel">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
          <AudioLines :size="22" aria-hidden="true" />
        </div>
        <div>
          <div class="text-[10px] uppercase tracking-wider text-sky-300 font-black">Pinyin · 拼音</div>
          <h2 class="text-lg font-black text-white mt-0.5">{{ sub('Học nền tảng phát âm tiếng Trung', 'Build your Mandarin pronunciation foundations') }}</h2>
          <p class="text-xs text-amber-100/55 mt-1">{{ sub('Ba chặng: thanh mẫu, vận mẫu, thanh điệu và biến điệu.', 'Three stages: initials, finals, tones and tone changes.') }}</p>
        </div>
      </div>
      <span class="inline-flex items-center gap-2 text-xs font-bold text-sky-200 group-hover:text-white shrink-0">{{ sub('Vào chuyên đề', 'Open course') }} <ArrowRight :size="15" /></span>
    </NuxtLink>

    <!-- ===================================================================== -->
    <!-- 2. QUICK STATS ROW                                                    -->
    <!-- ===================================================================== -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 stats-row">
      <!-- Stat 1: Total Vocabulary Learned -->
      <div class="p-4 rounded-2xl bg-wood-900/80 border border-wood-750 flex items-center gap-3.5 shadow-sm">
        <div class="w-11 h-11 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
          <BookOpen :size="20" />
        </div>
        <div class="min-w-0">
          <div class="text-[11px] font-bold text-amber-200/60 uppercase">{{ ui.statTotalVocab }}</div>
          <div class="text-lg font-black font-heading text-white">
            <span class="text-gold-300">{{ completedVocabCount }}</span> / {{ totalVocabCount }}
            <span class="text-xs text-amber-200/50 font-normal">({{ progressPercent }}%)</span>
          </div>
        </div>
      </div>

      <!-- Stat 2: Current Streak -->
      <div class="p-4 rounded-2xl bg-wood-900/80 border border-wood-750 flex items-center gap-3.5 shadow-sm">
        <div class="w-11 h-11 rounded-xl bg-dragon-500/15 border border-dragon-500/30 flex items-center justify-center text-dragon-400 shrink-0">
          <Flame :size="20" />
        </div>
        <div class="min-w-0">
          <div class="text-[11px] font-bold text-amber-200/60 uppercase">{{ ui.statStreak }}</div>
          <div class="text-lg font-black font-heading text-dragon-400">
            3 {{ ui.streakUnit }} 🔥
          </div>
        </div>
      </div>

      <!-- Stat 3: Accumulated Gold & EXP -->
      <div class="p-4 rounded-2xl bg-wood-900/80 border border-wood-750 flex items-center gap-3.5 shadow-sm">
        <div class="w-11 h-11 rounded-xl bg-jade-500/15 border border-jade-500/30 flex items-center justify-center text-jade-400 shrink-0">
          <Trophy :size="20" />
        </div>
        <div class="min-w-0">
          <div class="text-[11px] font-bold text-amber-200/60 uppercase">{{ ui.statLoot }}</div>
          <div class="text-lg font-black font-heading text-jade-300">
            {{ totalRewards.exp }} <span class="text-xs text-purple-300 font-bold">EXP</span> • {{ totalRewards.gold }} <span class="text-xs text-gold-400 font-bold">{{ ui.navGold }}</span>
          </div>
        </div>
      </div>
    </div>



    <!-- ===================================================================== -->
    <!-- 3. VIEW MODE SWITCHER & UNIT FILTER TABS                              -->
    <!-- ===================================================================== -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-wood-800">
      <!-- Unit Tabs Filter (Visible in Codex view) -->
      <div v-if="viewMode === 'codex'" class="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
        <button
          type="button"
          @click="selectedUnitId = 'all'"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          :class="selectedUnitId === 'all'
            ? 'bg-gold-500 text-wood-950 shadow-sm'
            : 'bg-wood-950/70 hover:bg-wood-850 text-amber-200/70 hover:text-white border border-wood-800'"
        >
          {{ tDual('learnIndex.allLessons', '全部历练') }} ({{ totalLessonsCount }})
        </button>

        <button
          v-for="unit in currentUnits"
          :key="unit.id"
          type="button"
          @click="selectedUnitId = unit.id"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          :class="selectedUnitId === unit.id
            ? 'bg-gold-500 text-wood-950 shadow-sm'
            : 'bg-wood-950/70 hover:bg-wood-850 text-amber-200/70 hover:text-white border border-wood-800'"
        >
          <span>第 {{ unit.orderIndex }} 单元 ({{ t('learnIndex.unit') }} {{ unit.orderIndex }})</span>
          <span class="text-[10px] opacity-70">({{ unit.lessons.length }})</span>
        </button>
      </div>

      <!-- Tagline for Unified Chakra Journey -->
      <div v-else class="flex items-center gap-2 text-xs font-bold text-amber-300 py-1">
        <Sparkles :size="14" class="text-gold-400" />
        <span>{{ ui.journeyTitle }}</span>
      </div>

      <!-- View Mode Toggle: Unified Chakra Journey vs Codex Grid -->
      <div class="flex items-center gap-1 bg-wood-950/90 border border-wood-800 p-1 rounded-2xl shrink-0 self-end sm:self-auto">
        <button
          type="button"
          @click="viewMode = 'journey'"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          :class="viewMode === 'journey' ? 'bg-gradient-to-r from-red-600 via-amber-500 to-gold-400 text-wood-950 font-black shadow-sm' : 'text-amber-200/60 hover:text-white'"
          :title="ui.tabJourney"
        >
          <Zap :size="13" class="fill-current text-wood-950" />
          <span>{{ ui.tabJourney }}</span>
        </button>
        <button
          type="button"
          @click="viewMode = 'codex'"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          :class="viewMode === 'codex' ? 'bg-gold-500 text-wood-950 shadow-sm' : 'text-amber-200/60 hover:text-white'"
          :title="ui.tabCodex"
        >
          <Layers :size="13" />
          <span>{{ ui.tabCodex }}</span>
        </button>
      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- 4. VIEW MODE 1: UNIFIED CHAKRA ASCENSION JOURNEY (MAP + CHAKRA)       -->
    <!-- ===================================================================== -->
    <div v-if="viewMode === 'journey'" class="space-y-6">
      <ChakraJourneyMap />
    </div>

    <!-- ===================================================================== -->
    <!-- 5. VIEW MODE 2: THE IMPERIAL CODEX GRID                               -->
    <!-- ===================================================================== -->
    <div v-else-if="viewMode === 'codex'" class="space-y-10 py-2">
      <div v-for="unit in filteredUnits" :key="unit.id" class="space-y-4">
        <!-- Unit Header -->
        <div class="flex items-center justify-between border-b border-wood-800 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 font-heading font-black text-sm">
              {{ unit.orderIndex }}
            </div>
            <div>
              <h2 class="text-base font-bold font-heading text-white">{{ dualUnitTitle(unit.title) }}</h2>
              <span class="text-[11px] text-amber-200/60">{{ unit.lessons.length }} {{ tDual('learnIndex.scrolls', '卷典籍') }}</span>
            </div>
          </div>

          <span class="text-xs font-bold text-gold-400/80 bg-wood-950 px-3 py-1 rounded-xl border border-wood-800">
            HSK 3.0 Band 1
          </span>
        </div>

        <!-- Lessons Cards Grid (2 Columns) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="lesson in unit.lessons"
            :key="lesson.id"
            class="p-5 rounded-2xl bg-wood-900/90 border-2 border-wood-750 hover:border-gold-400/60 shadow-rpg-card hover:shadow-rpg-card-lift transition-all flex flex-col justify-between gap-4 group codex-card relative overflow-hidden"
          >
            <!-- Card Header -->
            <div>
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="text-base font-bold font-heading text-white group-hover:text-gold-300 transition-colors">
                  {{ dualLessonTitle(lesson.title) }}
                </h3>
                <span
                  v-if="lesson.isCompleted"
                  class="px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 shrink-0"
                >
                  <CheckCircle2 :size="11" class="text-emerald-400" />
                  <span>{{ tDual('learnIndex.mastered', '已悟') }}</span>
                </span>
              </div>
              <p class="text-xs text-amber-200/60 line-clamp-2 leading-relaxed mb-3">
                {{ lesson.description }}
              </p>

              <!-- Hanzi Preview Chips -->
              <div v-if="lesson.hanziPreview?.length" class="flex items-center gap-1.5 flex-wrap my-2">
                <span
                  v-for="(hz, hIdx) in lesson.hanziPreview"
                  :key="hIdx"
                  class="px-2.5 py-1 rounded-xl bg-wood-950 border border-wood-800 font-hanzi text-sm text-gold-300 font-bold hover:border-gold-500/50 transition-colors shadow-sm select-none"
                  :title="tDual('learnIndex.featuredHanzi', '典型汉字')"
                >
                  {{ hz }}
                </span>
              </div>

              <!-- 5-Phase Mini Activity Pillars -->
              <div class="flex items-center gap-1.5 text-[10px] text-amber-200/50 pt-2 border-t border-wood-800/60">
                <span class="px-2 py-0.5 rounded-lg bg-wood-950 border border-wood-800 font-medium">🎴 {{ tDual('learnIndex.tagVocab', '生词') }}</span>
                <span class="px-2 py-0.5 rounded-lg bg-wood-950 border border-wood-800 font-medium">🧩 {{ tDual('learnIndex.tagRadical', '部首') }}</span>
                <span class="px-2 py-0.5 rounded-lg bg-wood-950 border border-wood-800 font-medium">🔗 {{ tDual('learnIndex.tagMatch', '连词') }}</span>
                <span class="px-2 py-0.5 rounded-lg bg-wood-950 border border-wood-800 font-medium">✍️ {{ tDual('learnIndex.tagWrite', '书写') }}</span>
                <span class="px-2 py-0.5 rounded-lg bg-wood-950 border border-wood-800 font-medium">📝 {{ tDual('learnIndex.tagQuiz', '测验') }}</span>
              </div>
            </div>

            <!-- Card Bottom Bar -->
            <div class="flex items-center justify-between pt-3 border-t border-wood-800/80 mt-auto">
              <div class="flex items-center gap-3 text-xs">
                <span class="text-amber-200/60">📖 {{ lesson.vocabularyCount }} {{ tDual('learnIndex.wordsUnit', '词') }}</span>
                <span class="text-purple-400 font-bold">+{{ lesson.expReward }} 经验 (EXP)</span>
                <span class="text-gold-400 font-bold flex items-center gap-1">
                  <Coins :size="12" />
                  <span>+{{ lesson.goldReward }} {{ tDual('learnIndex.goldSub', '金币') }}</span>
                </span>
              </div>

              <NuxtLink
                :to="`/learn/lesson/${lesson.id}`"
                class="min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                :class="lesson.isCompleted
                  ? 'bg-wood-800 hover:bg-wood-750 text-slate-200 border border-wood-700'
                  : 'bg-gold-500 hover:bg-gold-400 text-wood-950 font-black shadow-rpg-glow-gold'"
              >
                <span>{{ lesson.isCompleted ? tDual('learnIndex.btnReview', '温故') : tDual('learnIndex.btnStart', '历练') }}</span>
                <ChevronRight :size="14" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import {
  Sparkles,
  AudioLines,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  Coins,
  ChevronRight,
  Play,
  ArrowRight,
  Flame,
  Trophy,
  Compass,
  Layers,
  Star,
  Zap,
} from 'lucide-vue-next';
import { gsap } from 'gsap';
import ChakraJourneyMap from '~/components/chakra/ChakraJourneyMap.vue';
import { useOriginLanguage } from '~/composables/useOriginLanguage';

definePageMeta({
  layout: 'default',
});

const { t, dual, tDual, sub, ui, dualLessonTitle, dualUnitTitle } = useOriginLanguage();

// View mode state: 'journey' (Unified 7-Chakra Ascension Map) or 'codex' (Grid)
const viewMode = ref<'journey' | 'codex'>('journey');
const selectedUnitId = ref<string>('all');

// Fetch server-authoritative Chakra milestone progress
const { data: chakraRes } = await useFetch<any>('/api/chakra/status');
const chakraStatus = computed(() => chakraRes.value?.data);
const currentMuladhara = computed(() => chakraStatus.value?.chakras?.[0]);

// Luma Dialogue cycle with pure Chinese & Origin Language via i18n
const lumaDialogues = [
  { zh: '今天我们要完成5个HSK汉字哦！', key: 'dialogues.d0' },
  { zh: '日就月将，千里之行始于足下！', key: 'dialogues.d1' },
  { zh: '笔顺端正，生词铭记于心神之中！', key: 'dialogues.d2' },
  { zh: '莫忘温习SRS卡片，以保真气不散！', key: 'dialogues.d3' },
  { zh: '少侠已积累了丰厚的金币与修为经验！', key: 'dialogues.d4' },
];
const dialogueIndex = ref(0);
const currentDialogue = computed(() => lumaDialogues[dialogueIndex.value]);

function cycleLumaDialogue() {
  dialogueIndex.value = (dialogueIndex.value + 1) % lumaDialogues.length;
  // Trigger a cute wobble on click
  gsap.to('.luma-mascot', {
    rotation: dialogueIndex.value % 2 === 0 ? 8 : -8,
    duration: 0.2,
    yoyo: true,
    repeat: 1,
    ease: 'power1.inOut',
  });
}

// Fetch curriculum courses
const { data } = await useFetch<any>('/api/learning/courses');
const courses = computed(() => data.value?.data?.courses || []);
const currentCourse = computed(() => courses.value[0] || null);
const currentUnits = computed(() => currentCourse.value?.units || []);

// Filtered Units based on active tab
const filteredUnits = computed(() => {
  if (selectedUnitId.value === 'all') {
    return currentUnits.value;
  }
  return currentUnits.value.filter((u: any) => u.id === selectedUnitId.value);
});

// All lessons flat list
const allLessons = computed(() => {
  return currentUnits.value.flatMap((u: any) => u.lessons);
});

// Next lesson in sequence (first uncompleted)
const nextLesson = computed(() => {
  return allLessons.value.find((l: any) => !l.isCompleted) || allLessons.value[0];
});

function isNextLesson(lesson: any): boolean {
  return nextLesson.value?.id === lesson.id;
}

// Progress metrics
const totalLessonsCount = computed(() => allLessons.value.length);
const completedLessonsCount = computed(() => allLessons.value.filter((l: any) => l.isCompleted).length);
const totalVocabCount = computed(() => allLessons.value.reduce((acc: number, l: any) => acc + (l.vocabularyCount || 0), 0) || 106);
const completedVocabCount = computed(() => allLessons.value.filter((l: any) => l.isCompleted).reduce((acc: number, l: any) => acc + (l.vocabularyCount || 0), 0) || 12);
const progressPercent = computed(() => Math.round((completedVocabCount.value / (totalVocabCount.value || 1)) * 100));

const totalRewards = computed(() => {
  const gold = allLessons.value.filter((l: any) => l.isCompleted).reduce((acc: number, l: any) => acc + (l.goldReward || 0), 0);
  const exp = allLessons.value.filter((l: any) => l.isCompleted).reduce((acc: number, l: any) => acc + (l.expReward || 0), 0);
  return { gold: gold + 120, exp: exp + 360 }; // Include baseline account balance
});

const dueCount = ref(0);
const isSrsLoading = ref(true);

// GSAP Animations & Lifecycles
const heroBentoRef = ref<HTMLElement | null>(null);
const srsBentoRef = ref<HTMLElement | null>(null);

onMounted(async () => {
  try {
    const srs = await $fetch<any>('/api/srs/statistics');
    dueCount.value = srs?.data?.dueCount ?? 4;
  } catch (e) {
    dueCount.value = 4; // Friendly fallback count for demo
  } finally {
    isSrsLoading.value = false;
  }

  await nextTick();

  // Respect user preference for reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // 1. Bento Entrance Stagger Animation
  gsap.from('.bento-card', {
    y: 20,
    opacity: 0,
    duration: 0.6,
    stagger: 0.12,
    ease: 'power2.out',
  });

  // 2. Stats Row Pop-in
  gsap.from('.stats-row > div', {
    y: 15,
    opacity: 0,
    duration: 0.5,
    stagger: 0.08,
    delay: 0.25,
    ease: 'power2.out',
  });

  // 3. Luma Subtle Idle Floating Loop
  gsap.to('.luma-mascot', {
    y: -6,
    duration: 2.5,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  });

  // 4. SRS Counter Roll-Up Effect
  const counterEl = document.querySelector('.srs-counter');
  if (counterEl) {
    const target = dueCount.value;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.2,
      ease: 'power1.out',
      onUpdate: () => {
        counterEl.textContent = Math.round(obj.val).toString();
      },
    });
  }

  // 5. Journey Path SVG Dash Flow
  gsap.fromTo(
    '.journey-svg-path',
    { strokeDashoffset: 100 },
    {
      strokeDashoffset: 0,
      duration: 10,
      repeat: -1,
      ease: 'none',
    }
  );

  // 6. Journey Nodes Stagger Animation
  gsap.from('.journey-node', {
    scale: 0.85,
    opacity: 0,
    duration: 0.5,
    stagger: 0.07,
    delay: 0.35,
    ease: 'back.out(1.5)',
  });
});

// Reactively animate on viewMode changes
watch(viewMode, async (val) => {
  await nextTick();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  if (val === 'codex') {
    gsap.from('.codex-card', {
      y: 16,
      opacity: 0,
      duration: 0.35,
      stagger: 0.05,
      ease: 'power2.out',
    });
  } else if (val === 'journey') {
    gsap.from('.chakra-journey-container', {
      y: 16,
      opacity: 0,
      duration: 0.45,
      ease: 'power2.out',
    });
  }
});

// Reactively animate on unit filter change
watch(selectedUnitId, async () => {
  await nextTick();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  if (viewMode.value === 'codex') {
    gsap.from('.codex-card', {
      y: 12,
      opacity: 0,
      duration: 0.3,
      stagger: 0.04,
      ease: 'power2.out',
    });
  } else {
    gsap.from('.journey-node', {
      scale: 0.9,
      opacity: 0,
      duration: 0.3,
      stagger: 0.05,
      ease: 'back.out(1.3)',
    });
  }
});
</script>

<style scoped>
/* Custom animations & smooth scrollbar */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
