<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-10rem)] flex flex-col justify-between">
    <!-- Top Stepper Bar -->
    <div class="flex items-center justify-between mb-6 border-b border-surface-800 pb-4 gap-4">
      <NuxtLink
        to="/learn"
        class="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2 px-2.5 rounded-xl hover:bg-surface-850"
      >
        <ArrowLeft :size="14" aria-hidden="true" />
        <span>{{ tDual('lessonDetail.exitLesson', '退出课程') }}</span>
      </NuxtLink>

      <!-- Step / Activity Tabs -->
      <div class="flex items-center gap-1 bg-surface-900/90 border border-surface-750 p-1 rounded-2xl text-xs font-bold overflow-x-auto max-w-full">
        <button
          type="button"
          @click="currentActivity = 'flashcard'"
          class="px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="currentActivity === 'flashcard' ? 'bg-brand-600 text-white shadow-glow-brand' : 'text-slate-400 hover:text-white'"
        >
          <Layers :size="14" aria-hidden="true" />
          <span class="hidden sm:inline">1.</span> {{ tDual('lessonDetail.stepFlashcards', '生词卡片') }}
        </button>
        <button
          type="button"
          @click="currentActivity = 'radical'"
          class="px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="currentActivity === 'radical' ? 'bg-amber-600 text-white shadow-glow-gold' : 'text-slate-400 hover:text-white'"
        >
          <Sparkles :size="14" aria-hidden="true" />
          <span class="hidden sm:inline">2.</span> {{ tDual('lessonDetail.stepRadicals', '部首拆解') }}
        </button>
        <button
          type="button"
          @click="currentActivity = 'matching'"
          class="px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="currentActivity === 'matching' ? 'bg-brand-600 text-white shadow-glow-brand' : 'text-slate-400 hover:text-white'"
        >
          <Sparkles :size="14" aria-hidden="true" />
          <span class="hidden sm:inline">3.</span> {{ tDual('lessonDetail.stepMatching', '连连看') }}
        </button>
        <button
          type="button"
          @click="currentActivity = 'writing'"
          class="px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="currentActivity === 'writing' ? 'bg-emerald-600 text-white shadow-glow-jade' : 'text-slate-400 hover:text-white'"
        >
          <PenTool :size="14" aria-hidden="true" />
          <span class="hidden sm:inline">4.</span> {{ tDual('lessonDetail.stepWriting', '汉字书写') }}
        </button>
        <button
          type="button"
          @click="currentActivity = 'quiz'"
          class="px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          :class="currentActivity === 'quiz' ? 'bg-brand-600 text-white shadow-glow-brand' : 'text-slate-400 hover:text-white'"
        >
          <HelpCircle :size="14" aria-hidden="true" />
          <span class="hidden sm:inline">5.</span> {{ tDual('lessonDetail.stepQuiz', '仙道小试') }}
        </button>
      </div>

      <div class="text-xs font-bold text-slate-400 hidden sm:block">
        {{ t('lessonDetail.vocabListCount', { count: vocabulary.length }) }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex-1 flex flex-col items-center justify-center py-6" role="status" aria-busy="true">
      <div class="w-full max-w-md space-y-4 animate-pulse">
        <div class="flex items-center justify-between"><div class="w-24 h-3 rounded bg-surface-800" /><div class="w-36 h-2 rounded-full bg-surface-800" /></div>
        <div class="min-h-[300px] rounded-3xl bg-surface-900 border border-surface-750 p-8 flex flex-col items-center justify-center">
          <div class="w-32 h-24 rounded-2xl bg-surface-800 mb-6" />
          <div class="w-2/3 h-4 rounded bg-surface-800 mb-3" />
          <div class="w-1/2 h-3 rounded bg-surface-800" />
        </div>
        <div class="flex justify-center gap-3"><div class="w-24 h-10 rounded-xl bg-surface-800" /><div class="w-24 h-10 rounded-xl bg-surface-800" /></div>
      </div>
      <span class="sr-only">{{ t('lessonDetail.preparing') }}</span>
    </div>

    <!-- Main Activity Area -->
    <div v-else-if="lesson" class="flex-1 flex flex-col justify-between">
      <!-- 1. FLASHCARDS ACTIVITY -->
      <div v-if="currentActivity === 'flashcard'" class="flex-1 flex flex-col items-center justify-center py-4">
        <!-- Progress Bar & Card Counter -->
        <div class="w-full max-w-md mb-4 flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>{{ t('lessonDetail.cardOf', { current: currentCardIndex + 1, total: vocabulary.length }) }}</span>
          <div class="w-36 h-2 bg-surface-850 rounded-full overflow-hidden border border-surface-750">
            <div
              class="h-full bg-gradient-to-r from-brand-500 to-gold-400 transition-all duration-300"
              :style="{ width: `${((currentCardIndex + 1) / vocabulary.length) * 100}%` }"
            />
          </div>
        </div>

        <!-- 3D Flip Card -->
        <div
          @click="isFlipped = !isFlipped"
          class="w-full max-w-md min-h-[300px] rounded-3xl bg-surface-900 border border-surface-750 hover:border-gold-500/40 shadow-card-elevated p-8 flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-300 hover:scale-[1.01] text-center relative group"
        >
          <div class="absolute top-4 right-4 text-xs font-semibold text-slate-500 flex items-center gap-1.5 group-hover:text-gold-400 transition-colors">
            <RotateCcw :size="13" aria-hidden="true" />
            <span>{{ tDual('lessonDetail.tapToFlip', '点击翻转') }}</span>
          </div>

          <!-- Front Face -->
          <div v-if="!isFlipped" class="flex flex-col items-center justify-center animate-fade-in">
            <div class="flex items-center gap-4 mb-4">
              <div class="text-7xl font-bold font-hanzi text-white tracking-wider">
                {{ currentCard.simplified }}
              </div>
              <SpeakerButton :text="currentCard.simplified" :audio-url="currentCard.audioUrl" size="md" />
            </div>
            <div class="text-xs text-slate-400 uppercase tracking-widest font-bold bg-surface-800 px-3 py-1 rounded-full border border-surface-750">
              {{ currentCard.partOfSpeech }}
            </div>
          </div>

          <!-- Back Face -->
          <div v-else class="flex flex-col items-center justify-center animate-fade-in w-full">
            <div class="flex items-center gap-3 mb-2">
              <div v-if="pinyinDisplay" class="text-2xl font-extrabold font-heading text-gold-400 tracking-wide">
                {{ currentCard.pinyin }}
              </div>
              <SpeakerButton :text="currentCard.simplified" :audio-url="currentCard.audioUrl" size="sm" />
            </div>
            <div class="text-xl font-bold text-white mb-5">
              {{ currentCard.meaning }}
            </div>

            <!-- Example Sentence -->
            <div v-if="currentCard.example" class="p-3.5 bg-surface-950/80 rounded-2xl text-left border border-surface-750 text-xs w-full">
              <div class="flex items-start justify-between gap-2">
                <div class="text-slate-200 font-bold font-hanzi text-sm">{{ currentCard.example.sentenceZh }}</div>
                <SpeakerButton :text="currentCard.example.sentenceZh" size="sm" class="shrink-0" />
              </div>
              <div v-if="pinyinDisplay" class="text-gold-400 text-xs mt-0.5">{{ currentCard.example.sentencePinyin }}</div>
              <div class="text-slate-400 text-xs mt-0.5">{{ currentCard.example.translationVi }}</div>
            </div>
          </div>
        </div>

        <!-- Card Navigation Controls -->
        <div class="flex items-center gap-3 mt-8">
          <button
            type="button"
            @click="prevCard"
            :disabled="currentCardIndex === 0"
            class="min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-850 hover:bg-surface-800 text-slate-300 disabled:opacity-40 text-xs font-bold border border-surface-750 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft :size="16" aria-hidden="true" />
            <span>{{ tDual('common.prev', '上一张') }}</span>
          </button>
          <button
            type="button"
            @click="recordCardRecall(false)"
            class="min-h-[44px] px-5 py-2.5 rounded-xl bg-surface-850 hover:bg-brand-950/60 text-brand-300 border border-surface-700 hover:border-brand-700 text-xs font-bold transition-all cursor-pointer"
          >
            {{ tDual('reviewDetail.rateAgain', '没记住') }}
          </button>
          <button
            type="button"
            @click="recordCardRecall(true)"
            class="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow-jade transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check :size="16" aria-hidden="true" />
            <span>{{ tDual('reviewDetail.rateGood', '已记住') }}</span>
          </button>
          <button
            type="button"
            @click="nextCard"
            :disabled="currentCardIndex === vocabulary.length - 1"
            class="min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-850 hover:bg-surface-800 text-slate-300 disabled:opacity-40 text-xs font-bold border border-surface-750 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{{ tDual('common.next', '下一张') }}</span>
            <ChevronRight :size="16" aria-hidden="true" />
          </button>
        </div>

        <!-- Hotkey hints -->
        <div class="flex items-center gap-3 text-[11px] text-slate-500 mt-4">
          <span><kbd class="px-1 py-0.5 bg-surface-850 rounded border border-surface-700 font-mono">Space</kbd> {{ tDual('lessonDetail.flipCard', '翻转') }}</span>
          <span>•</span>
          <span><kbd class="px-1 py-0.5 bg-surface-850 rounded border border-surface-700 font-mono">P</kbd> {{ tDual('lessonDetail.audioPlay', '发音') }}</span>
          <span>•</span>
          <span><kbd class="px-1 py-0.5 bg-surface-850 rounded border border-surface-700 font-mono">← / →</kbd> {{ tDual('lessonDetail.switchCard', '切换') }}</span>
        </div>
      </div>

      <!-- 2. WORD MATCHING ACTIVITY -->
      <div v-else-if="currentActivity === 'matching'" class="flex-1 flex flex-col justify-center py-6">
        <div class="text-center mb-6">
          <h3 class="text-xl font-bold font-heading text-white">{{ tDual('lessonDetail.matchTitle', '汉字与释义连连看') }}</h3>
          <p class="text-xs text-slate-400 mt-1">{{ t('lessonDetail.matchDesc') }}</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto w-full">
          <button
            v-for="tile in matchingTiles"
            :key="tile.id"
            type="button"
            @click="selectTile(tile)"
            :disabled="tile.matched"
            class="h-24 p-3 rounded-2xl border text-sm font-bold flex flex-col items-center justify-center transition-all select-none cursor-pointer"
            :class="[
              tile.matched ? 'opacity-25 border-transparent bg-surface-950 cursor-not-allowed scale-95' :
              selectedTile?.id === tile.id ? 'border-gold-400 bg-gold-500/20 text-gold-300 scale-105 shadow-glow-gold' :
              'border-surface-750 bg-surface-900/90 hover:bg-surface-850 text-slate-200 hover:border-surface-600'
            ]"
          >
            <span :class="tile.type === 'hanzi' ? 'text-3xl font-bold font-hanzi text-white' : 'text-xs text-slate-200 text-center font-medium'">
              {{ tile.label }}
            </span>
            <span v-if="tile.type === 'hanzi'" class="text-[10px] text-slate-400 font-normal mt-1 flex items-center gap-1">
              <Volume2 :size="10" aria-hidden="true" /> Nghe
            </span>
          </button>
        </div>

        <div v-if="matchingComplete" class="text-center mt-8 p-6 bg-surface-900 border border-emerald-500/40 rounded-3xl max-w-md mx-auto shadow-card-elevated">
          <div class="flex items-center justify-center gap-2 text-emerald-400 font-bold mb-3">
            <CheckCircle2 :size="20" aria-hidden="true" />
            <span>{{ t('lessonDetail.matchComplete') }}</span>
          </div>
          <button
            type="button"
            @click="currentActivity = 'writing'"
            class="min-h-[48px] px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-glow-jade transition-all flex items-center gap-2 mx-auto cursor-pointer"
          >
            <span>{{ tDual('lessonDetail.continueWriting', '下一关: 汉字临摹') }}</span>
            <ArrowRight :size="16" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- 4. RADICAL STRATEGY ACTIVITY -->
      <div v-else-if="currentActivity === 'radical'" class="flex-1 flex flex-col justify-center">
        <RadicalStrategyActivity
          :vocabulary="vocabulary"
          :session-id="sessionId"
          @completed="currentActivity = 'matching'"
        />
      </div>

      <!-- 5. HANZI WRITING ACTIVITY -->
      <div v-else-if="currentActivity === 'writing'" class="flex-1 flex flex-col justify-center">
        <HanziWritingActivity
          :vocabulary="vocabulary"
          :session-id="sessionId"
          @completed="currentActivity = 'quiz'"
        />
      </div>

      <!-- 3. QUIZ ACTIVITY -->
      <div v-else-if="currentActivity === 'quiz'" class="flex-1 flex flex-col items-center justify-center py-6">
        <div class="text-xs font-semibold text-slate-400 mb-3">
          {{ t('lessonDetail.quizQuestionOf', { current: currentQuizIndex + 1, total: quizQuestions.length }) }}
        </div>

        <div class="w-full max-w-md bg-surface-900/95 border border-surface-750 rounded-3xl p-7 shadow-card-elevated">
          <div class="text-center mb-6">
            <span class="text-[11px] uppercase text-gold-400 font-extrabold tracking-wider">{{ tDual('lessonDetail.quizTarget', '目标词汇') }}</span>
            <div class="flex items-center justify-center gap-3 mt-3 mb-2">
              <div class="text-6xl font-bold font-hanzi text-white">
                {{ currentQuiz.question }}
              </div>
              <SpeakerButton :text="currentQuiz.question" :audio-url="currentQuiz.audioUrl" size="md" />
            </div>
            <div class="text-xs text-slate-400">{{ tDual('lessonDetail.quizPrompt', '选择最准确的含义') }}:</div>
          </div>

          <!-- Options -->
          <div class="space-y-3">
            <button
              v-for="(option, idx) in currentQuiz.options"
              :key="idx"
              type="button"
              @click="submitQuizOption(option)"
              :disabled="quizSubmitted"
              class="w-full min-h-[48px] p-4 rounded-xl border text-sm font-semibold text-left transition-all flex items-center justify-between cursor-pointer"
              :class="getOptionClass(option)"
            >
              <span>{{ option }}</span>
              <span v-if="quizSubmitted && option === currentQuiz.correctMeaning" class="text-emerald-400">
                <Check :size="18" aria-hidden="true" />
              </span>
              <span v-else-if="quizSubmitted && selectedOption === option && !isQuizOptionCorrect" class="text-brand-400">
                <X :size="18" aria-hidden="true" />
              </span>
            </button>
          </div>

          <!-- Next Button -->
          <div v-if="quizSubmitted" class="mt-6 pt-4 border-t border-surface-750 flex justify-end">
            <button
              type="button"
              @click="nextQuizQuestion"
              class="min-h-[48px] px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-glow-brand transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{{ currentQuizIndex < quizQuestions.length - 1 ? tDual('lessonDetail.quizNext', '下一题') : tDual('lessonDetail.quizFinish', '完成课程') }}</span>
              <ArrowRight :size="16" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. COMPLETION CELEBRATION MODAL -->
    <div
      v-if="showResultModal"
      class="fixed inset-0 bg-surface-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div class="bg-surface-900 border border-surface-750 rounded-3xl max-w-md w-full p-8 text-center shadow-card-elevated relative overflow-hidden">
        <div class="w-16 h-16 rounded-2xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 mx-auto mb-4">
          <Trophy :size="32" aria-hidden="true" />
        </div>
        <h2 class="text-2xl font-black font-heading text-white mb-1">{{ tDual('lessonDetail.congratsTitle', '恭喜通关！') }}</h2>
        <p class="text-xs text-slate-400 mb-6">{{ lesson?.title }}</p>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <div class="p-3.5 bg-surface-950/80 rounded-2xl border border-surface-750">
            <div class="text-xs text-slate-400 font-medium">{{ tDual('lessonDetail.accuracy', '正确率') }}</div>
            <div class="text-2xl font-black text-emerald-400 font-heading">{{ Math.round((completionData?.accuracy || 1) * 100) }}%</div>
          </div>
          <div class="p-3.5 bg-surface-950/80 rounded-2xl border border-surface-750">
            <div class="text-xs text-slate-400 font-medium">{{ tDual('characterDetail.exp', '获得经验') }}</div>
            <div class="text-2xl font-black text-purple-400 font-heading">+{{ completionData?.expEarned || 0 }}</div>
          </div>
          <div class="p-3.5 bg-surface-950/80 rounded-2xl border border-surface-750">
            <div class="text-xs text-slate-400 font-medium">{{ tDual('characterDetail.luck', '获得金币') }}</div>
            <div class="text-2xl font-black text-gold-400 font-heading">+{{ completionData?.goldEarned || 0 }}</div>
          </div>
          <div class="p-3.5 bg-surface-950/80 rounded-2xl border border-surface-750">
            <div class="text-xs text-slate-400 font-medium">{{ tDual('characterDetail.swordsman', '角色境界') }}</div>
            <div class="text-2xl font-black text-sky-400 font-heading">Lv.{{ completionData?.character?.level || 1 }}</div>
          </div>
        </div>

        <!-- Gear Bonus Pill -->
        <div
          v-if="completionData?.gearBonusExp > 0"
          class="p-2.5 bg-purple-500/15 border border-purple-500/30 rounded-xl text-purple-300 text-xs font-bold mb-4 flex items-center justify-center gap-2"
        >
          <Sparkles :size="14" class="text-purple-400" />
          <span>{{ t('lessonDetail.gearBonus', { bonus: completionData.gearBonusExp, percent: completionData.bonusExpPercent }) }}</span>
        </div>

        <!-- Daily Quests Completed Banner -->
        <div
          v-if="completionData?.questsCompleted && completionData.questsCompleted.length > 0"
          class="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold mb-4 space-y-1 text-left"
        >
          <div class="flex items-center gap-1.5 font-black uppercase text-[11px] text-emerald-200">
            <Trophy :size="13" />
            <span>{{ tDual('lessonDetail.questComplete', '宗门任务达成！') }}</span>
          </div>
          <div v-for="q in completionData.questsCompleted" :key="q.questId" class="text-emerald-100 flex items-center justify-between">
            <span>• {{ q.title }}</span>
            <span class="text-gold-300 font-mono">+{{ q.rewardGold }}G / +{{ q.rewardExp }}XP</span>
          </div>
        </div>

        <div v-if="completionData?.leveledUp" class="p-3 bg-gold-500/20 border border-gold-500/40 rounded-xl text-gold-300 text-xs font-bold mb-6 flex items-center justify-center gap-2">
          <Sparkles :size="16" aria-hidden="true" />
          <span>{{ tDual('lessonDetail.levelUp', '境界提升！') }}</span>
        </div>

        <div class="flex gap-3">
          <NuxtLink
            to="/learn"
            class="flex-1 min-h-[48px] py-3 rounded-xl bg-surface-800 hover:bg-surface-750 text-slate-200 font-bold text-sm border border-surface-700 flex items-center justify-center"
          >
            {{ tDual('lessonDetail.backToList', '返回典籍列表') }}
          </NuxtLink>
          <NuxtLink
            to="/world"
            class="flex-1 min-h-[48px] py-3 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-bold text-sm shadow-glow-brand flex items-center justify-center gap-1.5"
          >
            <span>{{ tDual('lessonDetail.enterWorld', '进入大千世界') }}</span>
            <ArrowRight :size="16" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Layers,
  Sparkles,
  HelpCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  X,
  Volume2,
  Trophy,
  PenTool,
} from 'lucide-vue-next';
import RadicalStrategyActivity from '~/components/learning/RadicalStrategyActivity.vue';
import HanziWritingActivity from '~/components/learning/HanziWritingActivity.vue';
import { useOriginLanguage } from '~/composables/useOriginLanguage';

const { t, tDual } = useOriginLanguage();
const { pinyinDisplay } = usePinyinDisplay();

definePageMeta({
  layout: 'default',
});

const route = useRoute();
const lessonId = route.params.id as string;
const { speak } = usePronunciation();

// Fetch lesson data
const { data, pending } = await useFetch<any>(`/api/learning/lessons/${lessonId}`);
const lesson = computed(() => data.value?.data?.lesson);
const vocabulary = computed(() => lesson.value?.vocabulary || []);

// Active session state
const sessionId = ref<string | null>(null);
const currentActivity = ref<'flashcard' | 'matching' | 'quiz' | 'radical' | 'writing'>('flashcard');

// Flashcard state
const currentCardIndex = ref(0);
const isFlipped = ref(false);
const currentCard = computed(() => vocabulary.value[currentCardIndex.value] || {});

function nextCard() {
  if (currentCardIndex.value < vocabulary.value.length - 1) {
    currentCardIndex.value++;
    isFlipped.value = false;
  }
}

function prevCard() {
  if (currentCardIndex.value > 0) {
    currentCardIndex.value--;
    isFlipped.value = false;
  }
}

async function recordCardRecall(remembered: boolean) {
  if (sessionId.value && currentCard.value?.id) {
    await $fetch(`/api/learning/sessions/${sessionId.value}/answers`, {
      method: 'POST',
      body: {
        vocabularyId: currentCard.value.id,
        activityType: 'flashcard',
        userAnswer: remembered ? 'remembered' : 'again',
      },
    }).catch(() => {});
  }
  nextCard();
}

// Matching Activity State
interface MatchingTile {
  id: string;
  vocabId: string;
  type: 'hanzi' | 'meaning';
  label: string;
  matched: boolean;
}

const matchingTiles = ref<MatchingTile[]>([]);
const selectedTile = ref<MatchingTile | null>(null);
const matchingComplete = computed(() => matchingTiles.value.length > 0 && matchingTiles.value.every((t) => t.matched));

function setupMatching() {
  const sample = vocabulary.value.slice(0, 6);
  const tiles: MatchingTile[] = [];

  sample.forEach((v: any) => {
    tiles.push({
      id: `h_${v.id}`,
      vocabId: v.id,
      type: 'hanzi',
      label: v.simplified,
      matched: false,
    });
    tiles.push({
      id: `m_${v.id}`,
      vocabId: v.id,
      type: 'meaning',
      label: `${v.meaning} (${v.pinyin})`,
      matched: false,
    });
  });

  matchingTiles.value = tiles.sort(() => Math.random() - 0.5);
}

async function selectTile(tile: MatchingTile) {
  if (tile.matched) return;

  if (tile.type === 'hanzi') {
    speak(tile.label);
  }

  if (!selectedTile.value) {
    selectedTile.value = tile;
    return;
  }

  if (selectedTile.value.id === tile.id) {
    selectedTile.value = null;
    return;
  }

  const first = selectedTile.value;
  const isMatch = first.vocabId === tile.vocabId && first.type !== tile.type;

  if (isMatch) {
    first.matched = true;
    tile.matched = true;
    selectedTile.value = null;

    if (sessionId.value) {
      await $fetch(`/api/learning/sessions/${sessionId.value}/answers`, {
        method: 'POST',
        body: {
          vocabularyId: tile.vocabId,
          activityType: 'matching',
          userAnswer: tile.label,
        },
      }).catch(() => {});
    }
  } else {
    selectedTile.value = null;
  }
}

// Quiz Activity State
interface QuizItem {
  vocabId: string;
  question: string;
  audioUrl?: string;
  correctMeaning: string;
  options: string[];
}

const quizQuestions = ref<QuizItem[]>([]);
const currentQuizIndex = ref(0);
const currentQuiz = computed(() => quizQuestions.value[currentQuizIndex.value] || { question: '', options: [], correctMeaning: '' });
const quizSubmitted = ref(false);
const selectedOption = ref<string | null>(null);
const isQuizOptionCorrect = ref(false);

function setupQuiz() {
  const items: QuizItem[] = [];
  const allMeanings = vocabulary.value.map((v: any) => v.meaning);

  vocabulary.value.forEach((v: any) => {
    const wrong = allMeanings.filter((m: string) => m !== v.meaning).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [v.meaning, ...wrong].sort(() => Math.random() - 0.5);

    items.push({
      vocabId: v.id,
      question: v.simplified,
      audioUrl: v.audioUrl,
      correctMeaning: v.meaning,
      options,
    });
  });

  quizQuestions.value = items;
  currentQuizIndex.value = 0;
  quizSubmitted.value = false;
  selectedOption.value = null;
}

async function submitQuizOption(option: string) {
  if (quizSubmitted.value) return;

  selectedOption.value = option;
  quizSubmitted.value = true;
  isQuizOptionCorrect.value = option === currentQuiz.value.correctMeaning;

  if (sessionId.value) {
    await $fetch(`/api/learning/sessions/${sessionId.value}/answers`, {
      method: 'POST',
      body: {
        vocabularyId: currentQuiz.value.vocabId,
        activityType: 'quiz',
        userAnswer: option,
      },
    }).catch(() => {});
  }
}

function getOptionClass(option: string) {
  if (!quizSubmitted.value) {
    return 'border-surface-750 bg-surface-950/70 hover:bg-surface-850 text-slate-200';
  }
  if (option === currentQuiz.value.correctMeaning) {
    return 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold';
  }
  if (selectedOption.value === option && !isQuizOptionCorrect.value) {
    return 'border-brand-500 bg-brand-500/20 text-brand-300 font-bold';
  }
  return 'border-surface-800 bg-surface-950 text-slate-600';
}

async function nextQuizQuestion() {
  if (currentQuizIndex.value < quizQuestions.value.length - 1) {
    currentQuizIndex.value++;
    quizSubmitted.value = false;
    selectedOption.value = null;
  } else {
    await completeLessonSession();
  }
}

// Completion Modal State
const showResultModal = ref(false);
const completionData = ref<any>(null);

async function completeLessonSession() {
  if (!sessionId.value) return;

  try {
    const res = await $fetch<any>(`/api/learning/sessions/${sessionId.value}/complete`, {
      method: 'POST',
    });
    completionData.value = res.data;
    showResultModal.value = true;
  } catch (err) {
    showResultModal.value = true;
  }
}

function handleLessonKeydown(e: KeyboardEvent) {
  if (currentActivity.value === 'flashcard') {
    if (e.key === ' ' && !e.repeat) {
      e.preventDefault();
      isFlipped.value = !isFlipped.value;
    } else if (e.key === 'ArrowRight') {
      nextCard();
    } else if (e.key === 'ArrowLeft') {
      prevCard();
    } else if ((e.key.toLowerCase() === 'p' || e.key.toLowerCase() === 'r') && currentCard.value?.simplified) {
      speak(currentCard.value.simplified, { audioUrl: currentCard.value.audioUrl });
    }
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleLessonKeydown);

  try {
    const sessionRes = await $fetch<any>('/api/learning/sessions', {
      method: 'POST',
      body: { lessonId, sessionType: 'lesson' },
    });
    sessionId.value = sessionRes?.data?.sessionId || null;
  } catch (e) {}

  if (vocabulary.value.length > 0) {
    setupMatching();
    setupQuiz();
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleLessonKeydown);
});

watch(vocabulary, () => {
  if (vocabulary.value.length > 0) {
    setupMatching();
    setupQuiz();
  }
});
</script>
