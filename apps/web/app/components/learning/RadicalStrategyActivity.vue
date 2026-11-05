<template>
  <div class="w-full max-w-2xl mx-auto py-4 flex flex-col items-center">
    <!-- Header Strategy Briefing -->
    <div class="text-center mb-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-gold-300 text-xs font-bold mb-2">
        <Sparkles :size="13" class="text-gold-400" />
        <span>{{ tDual('radicals.tag', '部首战术拆解') }}</span>
      </div>
      <h3 class="text-xl sm:text-2xl font-bold font-heading text-white">{{ tDual('radicals.title', '破译汉字架构') }}</h3>
      <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">
        {{ t('radicals.desc') }}
      </p>
    </div>

    <!-- Main Strategy Card -->
    <div class="w-full bg-surface-900/95 border border-surface-750 rounded-3xl p-6 sm:p-8 shadow-card-elevated relative overflow-hidden mb-6">
      <!-- Glow ambient -->
      <div class="absolute -top-12 -right-12 w-40 h-40 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <!-- Word Spotlight -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-surface-800">
        <div class="flex items-center gap-5">
          <!-- Big Hanzi with frame -->
          <div class="relative group">
            <div class="w-24 h-24 rounded-2xl bg-surface-950 border-2 border-gold-500/40 flex items-center justify-center font-hanzi text-6xl text-white shadow-glow-gold">
              {{ currentItem.simplified }}
            </div>
            <div class="absolute -bottom-2 -right-2">
              <SpeakerButton :text="currentItem.simplified" :audio-url="currentItem.audioUrl" size="sm" />
            </div>
          </div>

          <div>
            <div v-if="pinyinDisplay" class="text-2xl font-extrabold font-heading text-gold-400">
              {{ currentItem.pinyin }}
            </div>
            <div class="text-lg font-bold text-white mt-0.5">
              {{ currentItem.meaning }}
            </div>
            <div class="text-xs text-slate-400 uppercase tracking-widest mt-1">
              {{ currentItem.partOfSpeech }}
            </div>
          </div>
        </div>

        <!-- Radical Badge -->
        <div class="bg-surface-950/80 border border-surface-750 rounded-2xl p-3 sm:text-right flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
          <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{{ tDual('radicals.mainRadical', '主导部首') }}</span>
          <div class="flex items-center gap-2">
            <span class="font-hanzi font-bold text-2xl text-gold-400">{{ activeRadical }}</span>
            <span class="text-xs font-bold text-slate-200">({{ radicalTitle }})</span>
          </div>
        </div>
      </div>

      <!-- Tactical Breakdown Diagram (Components Grid) -->
      <div class="py-6">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Layers :size="14" class="text-gold-400" />
          <span>{{ tDual('radicals.components', '汉字组成构件') }}</span>
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="(comp, idx) in breakdownComponents"
            :key="idx"
            class="p-4 rounded-2xl bg-surface-950/70 border border-surface-800 flex items-center gap-4 transition-all hover:border-gold-500/30"
          >
            <div class="w-12 h-12 rounded-xl bg-surface-900 border border-surface-700 flex items-center justify-center font-hanzi font-bold text-2xl text-amber-300 shrink-0">
              {{ comp.char }}
            </div>
            <div class="text-left">
              <div class="text-sm font-bold text-slate-200">{{ comp.nameVi }}</div>
              <div class="text-xs text-slate-400 mt-0.5">{{ comp.role }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tactical Memory Lore (Story & Mnemonic) -->
      <div class="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/25 text-left mb-6">
        <div class="flex items-center gap-2 text-xs font-black uppercase text-gold-300 mb-1">
          <BookOpen :size="14" />
          <span>{{ tDual('radicals.exclusiveMnemonic', '独家助记心法') }}</span>
        </div>
        <p class="text-xs sm:text-sm text-gold-100 font-medium leading-relaxed">
          {{ tacticalStory }}
        </p>
      </div>

      <!-- Mini-Challenge: Radical Assembly -->
      <div class="pt-4 border-t border-surface-800 text-center">
        <div class="text-xs font-bold text-slate-300 mb-3">
          🎯 {{ t('radicals.challengePrompt', { char: currentItem.simplified }) }}
        </div>

        <div class="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-4">
          <button
            v-for="option in radicalQuizOptions"
            :key="option"
            type="button"
            @click="chooseRadical(option)"
            :disabled="answered"
            class="h-16 rounded-2xl border text-xl font-bold font-hanzi flex flex-col items-center justify-center transition-all cursor-pointer"
            :class="getOptionClass(option)"
          >
            <span class="text-2xl">{{ option }}</span>
          </button>
        </div>

        <!-- Success Toast / Next -->
        <div v-if="answered" class="animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-950 p-4 rounded-2xl border border-surface-750">
          <div class="flex items-center gap-2 text-xs font-bold" :class="isCorrect ? 'text-emerald-400' : 'text-amber-400'">
            <CheckCircle2 v-if="isCorrect" :size="18" />
            <AlertCircle v-else :size="18" />
            <span>{{ isCorrect ? t('radicals.correctFeedback') : t('radicals.incorrectFeedback', { radical: activeRadical }) }}</span>
          </div>

          <button
            type="button"
            @click="nextItem"
            class="min-h-[40px] px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow-brand transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>{{ currentIndex < totalItems - 1 ? tDual('radicals.nextWord', '下一个词') : tDual('radicals.finishRadicals', '完成拆解') }}</span>
            <ArrowRight :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- Stepper Footer -->
    <div class="flex items-center gap-3 text-xs text-slate-400">
      <span>{{ t('radicals.itemOf', { current: currentIndex + 1, total: totalItems }) }}</span>
      <span>•</span>
      <span>{{ t('radicals.tapToUnlock') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const { pinyinDisplay } = usePinyinDisplay();
import { Sparkles, Layers, BookOpen, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-vue-next';

const props = defineProps<{
  vocabulary: any[];
  sessionId: string | null;
}>();

const emit = defineEmits<{
  (e: 'completed'): void;
}>();

const currentIndex = ref(0);
const currentItem = computed(() => props.vocabulary[currentIndex.value] || {});
const totalItems = computed(() => props.vocabulary.length);

const activeRadical = computed(() => {
  return currentItem.value.radicalStrategy?.primaryRadical || '亻';
});

const radicalTitle = computed(() => {
  const radInfo = currentItem.value.radicalStrategy?.radicalInfo;
  return (currentOrigin.value === 'vi' ? radInfo?.meaningVi : radInfo?.meaningEn) || radInfo?.meaningVi || radInfo?.meaningEn || t('radicals.defaultRadicalMeaning');
});

const breakdownComponents = computed(() => {
  if (currentItem.value.radicalStrategy?.components?.length) {
    return currentItem.value.radicalStrategy.components;
  }
  return [
    { char: activeRadical.value, nameVi: radicalTitle.value, role: t('radicals.semanticRadicalRole') },
    { char: currentItem.value.simplified || '字', nameVi: t('radicals.charBody'), role: t('radicals.bodyRole') },
  ];
});

const tacticalStory = computed(() => {
  if (currentItem.value.radicalStrategy?.tacticalStory) {
    return currentItem.value.radicalStrategy.tacticalStory;
  }
  return t('radicals.tacticalStoryFallback', { char: currentItem.value.simplified, pinyin: currentItem.value.pinyin, radical: activeRadical.value });
});

// Quiz Options
const answered = ref(false);
const chosenOption = ref<string | null>(null);
const isCorrect = ref(false);

const fallbackRadicals = ['亻', '女', '口', '心', '日', '氵', '讠', '木', '手', '辶'];

const radicalQuizOptions = computed(() => {
  const correct = activeRadical.value;
  const wrongPool = fallbackRadicals.filter((r) => r !== correct);
  const shuffled = wrongPool.sort(() => Math.random() - 0.5).slice(0, 2);
  return [correct, ...shuffled].sort(() => Math.random() - 0.5);
});

async function chooseRadical(option: string) {
  if (answered.value) return;
  chosenOption.value = option;
  answered.value = true;
  isCorrect.value = option === activeRadical.value;

  if (props.sessionId && currentItem.value.id) {
    await $fetch(`/api/learning/sessions/${props.sessionId}/answers`, {
      method: 'POST',
      body: {
        vocabularyId: currentItem.value.id,
        activityType: 'radical',
        userAnswer: option,
      },
    }).catch(() => {});
  }
}

function getOptionClass(option: string) {
  if (!answered.value) {
    return 'border-surface-750 bg-surface-950/80 hover:bg-surface-850 hover:border-gold-500/40 text-slate-200';
  }
  if (option === activeRadical.value) {
    return 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-glow-jade';
  }
  if (chosenOption.value === option && !isCorrect.value) {
    return 'border-rose-500 bg-rose-500/20 text-rose-300';
  }
  return 'border-surface-800 bg-surface-950/40 text-slate-600 opacity-50';
}

function nextItem() {
  if (currentIndex.value < totalItems.value - 1) {
    currentIndex.value++;
    answered.value = false;
    chosenOption.value = null;
    isCorrect.value = false;
  } else {
    emit('completed');
  }
}
</script>

