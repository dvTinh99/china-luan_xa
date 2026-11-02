<template>
  <div class="w-full max-w-2xl mx-auto py-4 flex flex-col items-center">
    <!-- Header -->
    <div class="text-center mb-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
        <PenTool :size="13" class="text-emerald-400" />
        <span>{{ tDual('writing.tag', '汉字书写与笔顺') }}</span>
      </div>
      <h3 class="text-xl sm:text-2xl font-bold font-heading text-white">{{ tDual('writing.title', '神功笔法练习') }}</h3>
      <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">
        {{ t('writing.desc') }}
      </p>
    </div>

    <!-- Practice Mode Switcher (Draw vs Stroke Order Challenge) -->
    <div class="flex items-center bg-surface-950 p-1.5 rounded-2xl border border-surface-750 mb-6 shadow-inner">
      <button
        type="button"
        @click="switchPracticeMode('draw')"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        :class="practiceMode === 'draw' ? 'bg-emerald-600 text-white shadow-glow-jade' : 'text-slate-400 hover:text-white'"
      >
        <PenTool :size="14" />
        <span>1. {{ tDual('writing.modeCanvas', '自由临摹') }}</span>
      </button>

      <button
        type="button"
        @click="switchPracticeMode('order')"
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        :class="practiceMode === 'order' ? 'bg-amber-600 text-white shadow-glow-gold' : 'text-slate-400 hover:text-white'"
      >
        <Sparkles :size="14" />
        <span>2. {{ tDual('writing.modeOrder', '笔顺挑战') }}</span>
      </button>
    </div>

    <!-- Main Character Writing Studio -->
    <div class="w-full bg-surface-900/95 border border-surface-750 rounded-3xl p-6 sm:p-8 shadow-card-elevated relative flex flex-col items-center">
      <!-- Word Details Header -->
      <div class="w-full flex items-center justify-between border-b border-surface-800 pb-4 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl font-extrabold font-heading text-gold-400">{{ currentWord.pinyin }}</span>
            <SpeakerButton :text="currentWord.simplified" :audio-url="currentWord.audioUrl" size="sm" />
          </div>
          <div class="text-sm font-bold text-slate-200 mt-0.5">{{ currentWord.meaning }}</div>
        </div>

        <div class="text-right">
          <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">{{ tDual('writing.vocab', '生词') }}</div>
          <div class="text-sm font-extrabold text-gold-300">{{ currentIndex + 1 }} / {{ totalWords }}</div>
        </div>
      </div>

      <!-- MODE 1: FREEHAND DRAWING VIA HANZI-WRITER -->
      <div v-show="practiceMode === 'draw'" class="w-full flex flex-col items-center">
        <!-- Writing Stage Canvas -->
        <div class="relative flex flex-col items-center my-2">
          <div
            ref="writerTarget"
            class="w-[280px] h-[280px] rounded-3xl bg-wood-950 border-4 border-wood-750 shadow-inner flex items-center justify-center relative overflow-hidden transition-all duration-300"
            :class="isCompleted ? 'border-emerald-500/60 shadow-glow-jade' : 'hover:border-gold-500/40'"
          >
            <!-- HanziWriter injects SVG here -->
          </div>

          <!-- Mode badge -->
          <div class="mt-3 flex items-center gap-2">
            <span
              class="px-3 py-1 rounded-full text-xs font-bold border transition-colors"
              :class="writerMode === 'quiz' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-surface-850 border-surface-750 text-slate-400'"
            >
              {{ writerMode === 'quiz' ? ('✍️ ' + tDual('writing.modeQuiz', '临摹模式')) : ('👀 ' + tDual('writing.modeDemo', '演示模式')) }}
            </span>
            <span v-if="mistakes > 0" class="text-xs text-amber-400 font-medium">
              ({{ t('writing.mistakes', { count: mistakes }) }})
            </span>
          </div>
        </div>

        <!-- Control Toolbar for Drawing -->
        <div class="flex flex-wrap items-center justify-center gap-2.5 mt-6 w-full pt-4 border-t border-surface-800">
          <button
            type="button"
            @click="animateStrokes"
            class="min-h-[42px] px-4 py-2 rounded-xl bg-surface-850 hover:bg-surface-800 border border-surface-750 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Play :size="14" class="text-gold-400" />
            <span>{{ tDual('writing.btnDemo', '演示') }}</span>
          </button>

          <button
            type="button"
            @click="resetWriter"
            class="min-h-[42px] px-4 py-2 rounded-xl bg-surface-850 hover:bg-surface-800 border border-surface-750 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw :size="14" class="text-slate-400" />
            <span>{{ tDual('writing.btnRedo', '重写') }}</span>
          </button>

          <button
            type="button"
            @click="startQuiz"
            class="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PenTool :size="14" class="text-emerald-400" />
            <span>{{ tDual('writing.btnWriteNow', '开始临摹') }}</span>
          </button>
        </div>
      </div>

      <!-- MODE 2: STROKE ORDER CHALLENGE -->
      <div v-if="practiceMode === 'order'" class="w-full flex flex-col items-center">
        <!-- Hanzi Display Stage with Interactive Stroke Highlighting -->
        <div class="relative w-full max-w-md bg-wood-950 border-2 border-wood-750 rounded-3xl p-6 flex flex-col items-center justify-center shadow-inner mb-6">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            {{ tDual('writing.completedStrokesLabel', '已完成笔画') }}: <span class="text-gold-400 font-extrabold">{{ currentStrokeIndex }}</span> / {{ strokeCount }}
          </div>

          <!-- SVG Character Stage (Renders completed strokes and outline) -->
          <div class="w-56 h-56 relative flex items-center justify-center bg-wood-900/60 rounded-2xl border border-wood-700/60 overflow-hidden shadow-inner">
            <!-- Grid Lines (米字格) -->
            <svg class="absolute inset-0 w-full h-full stroke-white/10 pointer-events-none" viewBox="0 0 224 224">
              <line x1="0" y1="112" x2="224" y2="112" stroke-dasharray="6 6" stroke-width="2" />
              <line x1="112" y1="0" x2="112" y2="224" stroke-dasharray="6 6" stroke-width="2" />
              <line x1="0" y1="0" x2="224" y2="224" stroke-dasharray="6 6" stroke-width="1.5" />
              <line x1="0" y1="224" x2="224" y2="0" stroke-dasharray="6 6" stroke-width="1.5" />
            </svg>

            <!-- SVG Stroke Paths with Proper Coordinate Transformation -->
            <svg
              v-if="rawStrokeData"
              class="w-full h-full pointer-events-none"
              viewBox="0 0 224 224"
            >
              <g :transform="stageTransform">
                <!-- 1. Background outline of all strokes -->
                <path
                  v-for="(pathStr, sIdx) in rawStrokeData.strokes"
                  :key="'bg_'+sIdx"
                  :d="pathStr"
                  fill="rgba(255, 255, 255, 0.12)"
                />

                <!-- 2. Completed strokes in vibrant Jade Green -->
                <path
                  v-for="(pathStr, sIdx) in rawStrokeData.strokes"
                  :key="'done_'+sIdx"
                  :d="sIdx < currentStrokeIndex ? pathStr : ''"
                  fill="#10B981"
                />

                <!-- 3. Target pulse for the stroke just hit -->
                <path
                  v-if="lastHitIndex !== null"
                  :d="rawStrokeData.strokes[lastHitIndex]"
                  fill="#F59E0B"
                />
              </g>
            </svg>

            <!-- Loading indicator -->
            <div v-else class="text-xs text-slate-500 animate-pulse">
              {{ tDual('writing.loadingStrokes', '正在加载笔画数据...') }}
            </div>
          </div>

          <!-- Instruction Pill -->
          <div class="mt-4 px-4 py-1.5 rounded-full bg-surface-900 border border-surface-750 text-xs font-bold text-slate-300 text-center">
            <span v-if="currentStrokeIndex < strokeCount">
              👉 {{ t('writing.chooseStroke', { index: currentStrokeIndex + 1 }) }}
            </span>
            <span v-else class="text-emerald-400 font-extrabold flex items-center justify-center gap-1.5">
              <CheckCircle2 :size="14" />
              <span>{{ t('writing.allStrokesCorrect', { count: strokeCount }) }}</span>
            </span>
          </div>
        </div>

        <!-- Stroke Options Grid (Shuffled stroke previews to click) -->
        <div v-if="currentStrokeIndex < strokeCount && rawStrokeData" class="w-full">
          <div class="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            {{ tDual('writing.chooseStrokeStep', '选择当前正确的笔画') }}
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            <button
              v-for="(option, optIdx) in currentStrokeOptions"
              :key="option.actualIndex + '_' + optIdx"
              type="button"
              @click="handleSelectStroke(option.actualIndex)"
              class="h-28 p-2.5 rounded-2xl border bg-surface-950/90 hover:bg-surface-850 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group active:scale-95 shadow-sm"
              :class="orderFeedbackClass(option.actualIndex)"
            >
              <!-- SVG preview of single isolated stroke, zoomed & centered -->
              <div class="w-16 h-16 relative flex items-center justify-center bg-wood-950/80 rounded-xl border border-surface-800/80 overflow-hidden">
                <svg
                  class="w-full h-full pointer-events-none"
                  viewBox="0 0 64 64"
                >
                  <g :transform="getOptionTransform(option.actualIndex)">
                    <path
                      :d="rawStrokeData.strokes[option.actualIndex]"
                      fill="#FCD34D"
                      class="group-hover:fill-gold-300 transition-colors"
                    />
                  </g>
                </svg>
              </div>
              <span class="text-[10px] text-slate-400 font-bold group-hover:text-slate-200">
                {{ t('writing.option', { index: optIdx + 1 }) }}
              </span>
            </button>
          </div>
        </div>

        <!-- Reset Button for Order Mode -->
        <div class="flex items-center gap-3 mt-6">
          <button
            type="button"
            @click="resetStrokeOrderChallenge"
            class="px-4 py-2 rounded-xl bg-surface-850 hover:bg-surface-800 border border-surface-750 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw :size="14" />
            <span>{{ tDual('writing.restartFromFirst', '从第一画重新开始') }}</span>
          </button>
        </div>
      </div>

      <!-- Completion Banner (Shared across modes) -->
      <div
        v-if="isCompleted"
        class="mt-6 w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in text-center sm:text-left"
      >
        <div class="flex items-center gap-2.5 text-emerald-300 text-xs font-bold">
          <CheckCircle2 :size="20" class="text-emerald-400 shrink-0" />
          <span>{{ t('writing.wordFinished', { char: currentWord.simplified }) }}</span>
        </div>

        <button
          type="button"
          @click="nextWord"
          class="min-h-[42px] px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow-brand transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>{{ currentIndex < totalWords - 1 ? tDual('writing.nextWord', '下一个词') : tDual('writing.finishWriting', '完成书写') }}</span>
          <ArrowRight :size="14" />
        </button>
      </div>
    </div>

    <!-- Tips -->
    <div class="mt-4 text-[11px] text-slate-400 flex items-center gap-3 text-center">
      <span>💡 {{ t('writing.strokeMantra') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { PenTool, Play, RotateCcw, CheckCircle2, ArrowRight, Sparkles } from 'lucide-vue-next';
import { useOriginLanguage } from '~/composables/useOriginLanguage';

const { t, tDual } = useOriginLanguage();

const props = defineProps<{
  vocabulary: any[];
  sessionId: string | null;
}>();

const emit = defineEmits<{
  (e: 'completed'): void;
}>();

const writerTarget = ref<HTMLElement | null>(null);
const currentIndex = ref(0);
const isCompleted = ref(false);
const mistakes = ref(0);
const writerMode = ref<'view' | 'quiz'>('quiz');
const practiceMode = ref<'draw' | 'order'>('draw');

let writerInstance: any = null;

const currentWord = computed(() => props.vocabulary[currentIndex.value] || {});
const totalWords = computed(() => props.vocabulary.length);

// ---------------------------------------------------------------------------
// STROKE ORDER CHALLENGE STATE & TRANSFORMS
// ---------------------------------------------------------------------------
interface HanziRawData {
  strokes: string[];
  medians: number[][][];
  radicals?: number[];
}

const rawStrokeData = ref<HanziRawData | null>(null);
const currentStrokeIndex = ref(0);
const lastHitIndex = ref<number | null>(null);
const wrongPickIndex = ref<number | null>(null);

const strokeCount = computed(() => rawStrokeData.value?.strokes?.length || 0);

/**
 * Standard HanziWriter transform for the main 224x224 display stage
 * CHARACTER_BOUNDS = [{ x: 0, y: -124 }, { x: 1024, y: 900 }]
 */
const stageTransform = computed(() => {
  const width = 224;
  const height = 224;
  const padding = 16;
  const preScaledWidth = 1024;
  const preScaledHeight = 1024;
  const fromY = -124;

  const effectiveWidth = width - 2 * padding;
  const effectiveHeight = height - 2 * padding;
  const scale = Math.min(effectiveWidth / preScaledWidth, effectiveHeight / preScaledHeight);
  const xOffset = padding + (effectiveWidth - scale * preScaledWidth) / 2;
  const yCenteringBuffer = padding + (effectiveHeight - scale * preScaledHeight) / 2;
  const yOffset = -1 * fromY * scale + yCenteringBuffer;

  return `translate(${xOffset}, ${height - yOffset}) scale(${scale}, ${-1 * scale})`;
});

/**
 * Parses SVG path numbers to calculate individual stroke bounding box
 */
function getStrokeBoundingBox(d: string) {
  const nums = d.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < nums.length; i += 2) {
    xs.push(nums[i]);
    if (i + 1 < nums.length) ys.push(nums[i + 1]);
  }
  const minX = xs.length ? Math.min(...xs) : 0;
  const maxX = xs.length ? Math.max(...xs) : 1024;
  const minY = ys.length ? Math.min(...ys) : 0;
  const maxY = ys.length ? Math.max(...ys) : 900;
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: Math.max(maxX - minX, 20),
    height: Math.max(maxY - minY, 20),
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

/**
 * Fits and centers an isolated stroke cleanly into each 64x64 option thumbnail
 */
function getOptionTransform(strokeIndex: number) {
  if (!rawStrokeData.value?.strokes[strokeIndex]) return '';
  const d = rawStrokeData.value.strokes[strokeIndex];
  const bb = getStrokeBoundingBox(d);

  const targetBox = 64;
  const pad = 10;
  const avail = targetBox - 2 * pad;
  const maxDim = Math.max(bb.width, bb.height);
  const s = avail / maxDim;

  // Center in targetBox:
  // Stroke in raw coordinates has (X, Y).
  // Under scale(s, -s):
  // X' = s * X + tx -> want s * bb.centerX + tx = targetBox / 2 => tx = targetBox/2 - s * bb.centerX
  // Y' = -s * Y + ty -> want -s * bb.centerY + ty = targetBox / 2 => ty = targetBox/2 + s * bb.centerY
  const tx = targetBox / 2 - s * bb.centerX;
  const ty = targetBox / 2 + s * bb.centerY;

  return `translate(${tx}, ${ty}) scale(${s}, ${-1 * s})`;
}

// Load Raw Hanzi Stroke Data from CDN
async function fetchRawStrokeData(char: string) {
  rawStrokeData.value = null;
  currentStrokeIndex.value = 0;
  lastHitIndex.value = null;
  wrongPickIndex.value = null;

  try {
    const res = await fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`);
    if (res.ok) {
      const data: HanziRawData = await res.json();
      rawStrokeData.value = data;
    }
  } catch (err) {
    console.error('Failed to load raw HanziWriter stroke data:', err);
  }
}

// Generate candidate strokes for current step (1 correct + distractors)
const currentStrokeOptions = computed(() => {
  if (!rawStrokeData.value) return [];
  const total = rawStrokeData.value.strokes.length;
  const target = currentStrokeIndex.value;
  if (target >= total) return [];

  const otherIndices: number[] = [];
  for (let i = 0; i < total; i++) {
    if (i !== target) otherIndices.push(i);
  }

  const shuffledOthers = otherIndices.sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [target, ...shuffledOthers].sort(() => Math.random() - 0.5);

  return options.map((idx) => ({
    actualIndex: idx,
  }));
});

function handleSelectStroke(selectedIdx: number) {
  if (isCompleted.value) return;

  if (selectedIdx === currentStrokeIndex.value) {
    lastHitIndex.value = selectedIdx;
    wrongPickIndex.value = null;
    currentStrokeIndex.value++;

    if (currentStrokeIndex.value >= strokeCount.value) {
      isCompleted.value = true;
      recordCompletion();
    }
  } else {
    wrongPickIndex.value = selectedIdx;
    mistakes.value++;
    setTimeout(() => {
      wrongPickIndex.value = null;
    }, 700);
  }
}

function orderFeedbackClass(idx: number) {
  if (wrongPickIndex.value === idx) {
    return 'border-rose-500 bg-rose-500/20 text-rose-300';
  }
  if (lastHitIndex.value === idx) {
    return 'border-emerald-500 bg-emerald-500/20 text-emerald-300';
  }
  return 'border-surface-750 hover:border-gold-500/50';
}

function resetStrokeOrderChallenge() {
  currentStrokeIndex.value = 0;
  lastHitIndex.value = null;
  wrongPickIndex.value = null;
  isCompleted.value = false;
}

// ---------------------------------------------------------------------------
// MODE SWITCHER & DRAWING CANVAS
// ---------------------------------------------------------------------------
function switchPracticeMode(mode: 'draw' | 'order') {
  practiceMode.value = mode;
  isCompleted.value = false;
  mistakes.value = 0;

  const char = currentWord.value.simplified?.charAt(0) || '你';
  if (mode === 'draw') {
    nextTick(() => {
      initHanziWriter();
    });
  } else {
    fetchRawStrokeData(char);
  }
}

async function recordCompletion() {
  if (props.sessionId && currentWord.value.id) {
    await $fetch(`/api/learning/sessions/${props.sessionId}/answers`, {
      method: 'POST',
      body: {
        vocabularyId: currentWord.value.id,
        activityType: 'writing',
        userAnswer: 'completed',
      },
    }).catch(() => {});
  }
}

async function initHanziWriter() {
  if (import.meta.server || practiceMode.value !== 'draw') return;
  await nextTick();

  if (!writerTarget.value || !currentWord.value?.simplified) return;

  writerTarget.value.innerHTML = '';
  isCompleted.value = false;
  mistakes.value = 0;

  try {
    const HanziWriterModule = await import('hanzi-writer');
    const HanziWriter = HanziWriterModule.default || HanziWriterModule;

    const charToDraw = currentWord.value.simplified.charAt(0);

    writerInstance = HanziWriter.create(writerTarget.value, charToDraw, {
      width: 260,
      height: 260,
      padding: 20,
      showOutline: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 150,
      strokeColor: '#F59E0B',
      outlineColor: 'rgba(255, 255, 255, 0.15)',
      drawingColor: '#10B981',
      radicalColor: '#EF4444',
      showHintAfterMisses: 2,
    });

    startQuiz();
  } catch (err) {
    console.error('Failed to initialize HanziWriter:', err);
  }
}

function animateStrokes() {
  if (!writerInstance) return;
  writerMode.value = 'view';
  writerInstance.animateCharacter({
    onComplete: () => {
      setTimeout(() => {
        startQuiz();
      }, 1000);
    },
  });
}

function resetWriter() {
  if (!writerInstance) return;
  writerInstance.cancelQuiz();
  writerTarget.value!.innerHTML = '';
  initHanziWriter();
}

function startQuiz() {
  if (!writerInstance) return;
  writerMode.value = 'quiz';
  writerInstance.quiz({
    onMistake: () => {
      mistakes.value++;
    },
    onComplete: async () => {
      isCompleted.value = true;
      recordCompletion();
    },
  });
}

function nextWord() {
  if (currentIndex.value < totalWords.value - 1) {
    currentIndex.value++;
    isCompleted.value = false;
    mistakes.value = 0;

    const char = currentWord.value.simplified?.charAt(0) || '你';
    if (practiceMode.value === 'draw') {
      initHanziWriter();
    } else {
      fetchRawStrokeData(char);
    }
  } else {
    emit('completed');
  }
}

watch(currentIndex, () => {
  const char = currentWord.value.simplified?.charAt(0) || '你';
  if (practiceMode.value === 'draw') {
    initHanziWriter();
  } else {
    fetchRawStrokeData(char);
  }
});

watch(
  () => props.vocabulary,
  () => {
    if (props.vocabulary.length > 0) {
      const char = currentWord.value.simplified?.charAt(0) || '你';
      if (practiceMode.value === 'draw') {
        initHanziWriter();
      } else {
        fetchRawStrokeData(char);
      }
    }
  }
);

onMounted(() => {
  const char = currentWord.value.simplified?.charAt(0) || '你';
  if (practiceMode.value === 'draw') {
    initHanziWriter();
  } else {
    fetchRawStrokeData(char);
  }
});
</script>
