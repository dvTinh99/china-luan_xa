<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-7 animate-fade-in">
    <header class="rounded-3xl bg-gradient-to-br from-wood-900 via-wood-850 to-wood-900 border-2 border-wood-750 p-6 sm:p-8 shadow-rpg-panel">
      <NuxtLink to="/learn" class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200/60 hover:text-gold-300 mb-5">
        <ArrowLeft :size="14" aria-hidden="true" />
        {{ sub('返回学习路线', 'Back to learning path') }}
      </NuxtLink>
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div class="max-w-3xl">
          <div class="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-gold-500/15 border border-gold-400/30 text-[11px] font-bold uppercase tracking-wider text-gold-300 mb-3">
            <AudioLines :size="14" aria-hidden="true" />
            Pinyin · 拼音
          </div>
          <h1 class="text-3xl sm:text-4xl font-black font-heading text-white tracking-tight">
            {{ sub('Nền tảng phát âm tiếng Trung', 'Mandarin pronunciation foundations') }}
          </h1>
          <p class="text-sm text-amber-100/70 mt-3 leading-relaxed max-w-2xl">
            {{ sub('Học cách ghép âm tiết qua thanh mẫu, vận mẫu và thanh điệu. Nghe ví dụ, luyện nhận diện rồi làm bài kiểm tra cho từng chặng.', 'Learn to build Mandarin syllables from initials, finals, and tones. Listen to examples, practise recognition, and take a quiz at the end of each stage.') }}
          </p>
        </div>
        <div class="rounded-2xl bg-wood-950/80 border border-wood-800 px-4 py-3 shrink-0">
          <div class="text-[10px] text-amber-200/50 uppercase font-bold tracking-wider">{{ sub('Điều kiện hoàn thành', 'Completion requirement') }}</div>
          <div class="text-xl font-black text-gold-300 mt-1">8 / 10 <span class="text-sm font-bold">{{ sub('câu đúng', 'correct') }}</span></div>
        </div>
      </div>
    </header>

    <section class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 items-stretch" :aria-label="sub('Cấu tạo âm tiết Pinyin', 'Pinyin syllable structure')">
      <div class="rounded-2xl bg-wood-900/80 border border-wood-750 p-4 text-center">
        <div class="text-[10px] uppercase tracking-wider text-amber-200/50 font-bold">{{ sub('Phụ âm đầu (có thể vắng)', 'Initial (may be absent)') }}</div>
        <div class="text-2xl font-black text-gold-300 mt-1">n</div>
        <div class="text-xs text-amber-100/60">{{ sub('thanh mẫu', 'initial') }}</div>
      </div>
      <div class="hidden md:grid place-items-center text-gold-500 text-xl font-black">+</div>
      <div class="rounded-2xl bg-wood-900/80 border border-wood-750 p-4 text-center">
        <div class="text-[10px] uppercase tracking-wider text-amber-200/50 font-bold">{{ sub('Phần vần', 'Final') }}</div>
        <div class="text-2xl font-black text-emerald-300 mt-1">i</div>
        <div class="text-xs text-amber-100/60">{{ sub('vận mẫu', 'final') }}</div>
      </div>
      <div class="hidden md:grid place-items-center text-gold-500 text-xl font-black">+</div>
      <div class="rounded-2xl bg-wood-900/80 border border-wood-750 p-4 text-center">
        <div class="text-[10px] uppercase tracking-wider text-amber-200/50 font-bold">{{ sub('Cao độ', 'Pitch contour') }}</div>
        <div class="text-2xl font-black text-sky-300 mt-1">ǐ</div>
        <div class="text-xs text-amber-100/60">{{ sub('thanh điệu', 'tone') }}</div>
      </div>
    </section>

    <section v-if="contentPending" class="grid grid-cols-1 md:grid-cols-3 gap-4" role="status" aria-busy="true">
      <div v-for="item in 3" :key="item" class="h-28 rounded-2xl bg-wood-900 border border-wood-750 animate-pulse" />
      <span class="sr-only">{{ sub('Đang tải nội dung Pinyin', 'Loading Pinyin content') }}</span>
    </section>

    <template v-else-if="activeStage">
      <nav class="grid grid-cols-1 md:grid-cols-3 gap-3" :aria-label="sub('Các chặng Pinyin', 'Pinyin stages')">
        <button
          v-for="(stage, index) in stages"
          :key="stage.id"
          type="button"
          @click="selectStage(stage.id)"
          class="rounded-2xl border-2 p-4 text-left transition-colors cursor-pointer"
          :class="activeStageId === stage.id ? 'bg-gold-500/10 border-gold-400/70' : 'bg-wood-900/75 border-wood-750 hover:border-wood-600'"
          :aria-current="activeStageId === stage.id ? 'step' : undefined"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-[10px] uppercase tracking-wider font-black text-amber-200/50">{{ sub(`Chặng ${index + 1}`, `Stage ${index + 1}`) }}</span>
            <span v-if="getProgress(stage.id)?.completed" class="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-bold">
              <CheckCircle2 :size="14" /> {{ getProgress(stage.id)?.bestScore }}%
            </span>
          </div>
          <div class="font-bold text-white mt-1">{{ localize(stage.title) }}</div>
          <div class="text-xs text-amber-100/55 mt-1">{{ localize(stage.subtitle) }}</div>
        </button>
      </nav>

      <div v-if="progressLoading" class="text-xs text-amber-100/50" role="status">{{ sub('Đang tải tiến độ...', 'Loading progress...') }}</div>
      <div v-else-if="loginRequired" class="rounded-2xl bg-sky-500/10 border border-sky-400/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p class="text-sm text-sky-100/80">{{ sub('Đăng nhập để lưu tiến độ hoàn thành các chặng trên tài khoản của bạn.', 'Sign in to save completed stages to your account.') }}</p>
        <NuxtLink to="/login?redirect=/learn/pinyin" class="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-100 text-xs font-bold text-center">{{ sub('Đăng nhập', 'Sign in') }}</NuxtLink>
      </div>

      <main class="space-y-6">
        <section class="rounded-3xl bg-wood-900/80 border-2 border-wood-750 p-5 sm:p-7 shadow-rpg-panel">
          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-wood-800 pb-4 mb-5">
            <div>
              <div class="text-[10px] uppercase font-black tracking-wider text-gold-400">{{ activeStage.id === 'initials' ? sub('Thanh mẫu', 'Initials') : activeStage.id === 'finals' ? sub('Vận mẫu', 'Finals') : sub('Thanh điệu', 'Tones') }}</div>
              <h2 class="text-2xl font-black text-white mt-1">{{ localize(activeStage.title) }}</h2>
            </div>
            <div v-if="getProgress(activeStage.id)?.completed" class="text-xs text-emerald-300 font-bold">{{ sub('Đã hoàn thành · điểm cao nhất', 'Completed · best score') }}: {{ getProgress(activeStage.id)?.bestScore }}%</div>
          </div>

          <div class="space-y-7">
            <article v-for="(section, sectionIndex) in activeStage.sections" :key="`${activeStage.id}-${sectionIndex}`" class="space-y-3">
              <div>
                <h3 class="text-lg font-bold text-gold-200">{{ localize(section.title) }}</h3>
                <p class="text-sm text-amber-100/65 mt-1 leading-relaxed">{{ localize(section.description) }}</p>
              </div>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div v-for="row in section.rows" :key="row.label" class="rounded-2xl bg-wood-950/75 border border-wood-800 p-4">
                  <div class="text-lg font-black font-mono text-white tracking-wide">{{ row.label }}</div>
                  <p class="text-xs text-amber-100/60 leading-relaxed mt-1">{{ localize(row.description) }}</p>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <div v-for="sound in row.examples" :key="`${sound.hanzi}-${sound.pinyin}`" class="inline-flex items-center gap-2 rounded-xl bg-wood-900 border border-wood-800 px-2.5 py-2">
                      <span class="font-hanzi text-lg text-gold-200">{{ sound.hanzi }}</span>
                      <span class="text-xs font-bold text-white">{{ sound.pinyin }}</span>
                      <span class="text-[10px] text-amber-100/45">{{ localize(sound.meaning) }}</span>
                      <SpeakerButton :text="sound.hanzi" size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="rounded-3xl bg-wood-900/80 border-2 border-wood-750 p-5 sm:p-7 shadow-rpg-panel">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-wood-800 pb-4 mb-5">
            <div>
              <div class="text-[10px] uppercase font-black tracking-wider text-purple-300">{{ sub('Kiểm tra kiến thức', 'Knowledge check') }}</div>
              <h2 class="text-xl font-black text-white mt-1">{{ sub('Bài luyện tập cuối chặng', 'Stage quiz') }}</h2>
              <p class="text-xs text-amber-100/55 mt-1">{{ sub('Chọn một đáp án cho cả 10 câu. Cần đúng ít nhất 8 câu để lưu hoàn thành.', 'Answer all 10 questions. Get at least 8 correct to save completion.') }}</p>
            </div>
            <div class="text-sm font-bold text-gold-300 shrink-0">{{ answeredCount }} / 10</div>
          </div>

          <div class="space-y-4">
            <fieldset v-for="(item, itemIndex) in activeStage.questions" :key="item.id" class="rounded-2xl bg-wood-950/65 border border-wood-800 p-4 min-w-0">
              <legend class="sr-only">{{ localize(item.prompt) }}</legend>
              <div class="text-sm font-bold text-white"><span class="text-gold-400 mr-1">{{ itemIndex + 1 }}.</span> {{ localize(item.prompt) }}</div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                <button
                  v-for="option in item.choices"
                  :key="option.id"
                  type="button"
                  @click="selectAnswer(item.id, option.id)"
                  class="rounded-xl border px-3 py-2.5 text-sm font-semibold text-left transition-colors cursor-pointer"
                  :class="answerClass(item.id, option.id)"
                  :aria-pressed="answers[item.id] === option.id"
                >
                  {{ localize(option.label) }}
                </button>
              </div>
              <div v-if="attemptResult" class="mt-3 rounded-xl p-3 text-xs leading-relaxed" :class="feedbackByQuestion[item.id]?.isCorrect ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-100 border border-amber-500/20'">
                <div class="font-bold">{{ feedbackByQuestion[item.id]?.isCorrect ? sub('Đúng', 'Correct') : `${sub('Đáp án', 'Answer')}: ${optionLabel(item, feedbackByQuestion[item.id]?.correctOptionId)}` }}</div>
                <p class="mt-1">{{ localize(feedbackByQuestion[item.id]?.explanation) }}</p>
              </div>
            </fieldset>
          </div>

          <div class="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <button v-if="!attemptResult" type="button" @click="submitAttempt" :disabled="!allAnswered || attemptPending || loginRequired" class="min-h-[46px] px-5 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-wood-950 text-sm font-black shadow-rpg-glow-gold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              {{ attemptPending ? sub('Đang chấm bài...', 'Checking answers...') : sub('Nộp bài', 'Submit quiz') }}
            </button>
            <button v-else type="button" @click="resetAttempt" class="min-h-[46px] px-5 py-3 rounded-xl bg-wood-800 hover:bg-wood-750 border border-wood-700 text-white text-sm font-bold cursor-pointer">
              {{ sub('Làm lại để cải thiện điểm', 'Retake to improve your score') }}
            </button>
            <div v-if="attemptResult" class="text-sm font-bold" :class="attemptResult.passed ? 'text-emerald-300' : 'text-amber-200'" role="status" aria-live="polite">
              {{ attemptResult.score }}% · {{ attemptResult.passed ? sub('Đạt — tiến độ đã lưu', 'Passed — progress saved') : sub('Chưa đạt — cần 80%', 'Not passed — 80% required') }}
            </div>
            <p v-if="attemptError" class="text-xs text-red-300" role="alert">{{ attemptError }}</p>
          </div>
        </section>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ArrowLeft, AudioLines, CheckCircle2 } from 'lucide-vue-next';
import type {
  PinyinAttemptResult,
  PinyinCurriculumResponse,
  PinyinLocalizedText,
  PinyinStageContent,
  PinyinStageId,
  PinyinStageProgress,
} from '@linguaworld/api-contracts';
import { useOriginLanguage } from '~/composables/useOriginLanguage';

definePageMeta({ layout: 'default' });

const { locale, sub } = useOriginLanguage();
const { data: contentResponse, pending: contentPending } = await useFetch<{ data: PinyinCurriculumResponse }>('/api/learning/pinyin');
const stages = computed(() => contentResponse.value?.data?.stages || []);
const activeStageId = ref<PinyinStageId>('initials');
const activeStage = computed(() => stages.value.find((stage) => stage.id === activeStageId.value));
const answers = reactive<Record<string, string>>({});
const progress = ref<PinyinStageProgress[]>([]);
const progressLoading = ref(true);
const loginRequired = ref(false);
const attemptPending = ref(false);
const attemptError = ref('');
const attemptResult = ref<PinyinAttemptResult | null>(null);

const answeredCount = computed(() => Object.keys(answers).length);
const allAnswered = computed(() => Boolean(activeStage.value && activeStage.value.questions.every((item) => answers[item.id])));
const feedbackByQuestion = computed(() => Object.fromEntries((attemptResult.value?.feedback || []).map((feedback) => [feedback.questionId, feedback])));

function localize(value?: PinyinLocalizedText | null): string {
  if (!value) return '';
  return locale.value === 'en' ? value.en : value.vi;
}

function getProgress(stageId: PinyinStageId) {
  return progress.value.find((item) => item.stageId === stageId);
}

function selectStage(stageId: PinyinStageId) {
  activeStageId.value = stageId;
  resetAttempt();
}

function selectAnswer(questionId: string, optionId: string) {
  answers[questionId] = optionId;
}

function answerClass(questionId: string, optionId: string) {
  const selected = answers[questionId] === optionId;
  if (attemptResult.value) {
    const feedback = feedbackByQuestion.value[questionId];
    if (feedback?.correctOptionId === optionId) return 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100';
    if (selected) return 'border-red-400/40 bg-red-500/10 text-red-100';
  }
  return selected
    ? 'border-gold-400/60 bg-gold-500/15 text-gold-100'
    : 'border-wood-750 bg-wood-900 text-amber-100/75 hover:border-wood-600';
}

function optionLabel(item: PinyinStageContent['questions'][number], optionId?: string) {
  const option = item.choices.find((choice) => choice.id === optionId);
  return option ? localize(option.label) : '';
}

function resetAttempt() {
  for (const key of Object.keys(answers)) delete answers[key];
  attemptResult.value = null;
  attemptError.value = '';
}

async function loadProgress() {
  progressLoading.value = true;
  loginRequired.value = false;
  try {
    const response = await $fetch<{ data: { progress: PinyinStageProgress[] } }>('/api/learning/pinyin/progress');
    progress.value = response.data.progress;
  } catch (error: any) {
    loginRequired.value = error?.statusCode === 401 || error?.status === 401;
    if (!loginRequired.value) attemptError.value = sub('Không tải được tiến độ. Hãy thử tải lại trang.', 'Could not load progress. Please refresh and try again.');
  } finally {
    progressLoading.value = false;
  }
}

async function submitAttempt() {
  if (!activeStage.value || !allAnswered.value || attemptPending.value) return;
  attemptPending.value = true;
  attemptError.value = '';
  try {
    const response = await $fetch<{ data: PinyinAttemptResult }>(`/api/learning/pinyin/${activeStage.value.id}/attempt`, {
      method: 'POST',
      body: {
        answers: activeStage.value.questions.map((question) => ({
          questionId: question.id,
          optionId: answers[question.id],
        })),
      },
    });
    attemptResult.value = response.data;
    if (response.data.progress) {
      const index = progress.value.findIndex((item) => item.stageId === response.data.progress?.stageId);
      if (index === -1) progress.value.push(response.data.progress);
      else progress.value[index] = response.data.progress;
    }
  } catch (error: any) {
    if (error?.statusCode === 401 || error?.status === 401) {
      loginRequired.value = true;
      attemptError.value = sub('Đăng nhập để lưu kết quả chặng học.', 'Sign in to save this stage result.');
    } else {
      attemptError.value = error?.data?.error?.message || sub('Không thể nộp bài lúc này. Hãy thử lại.', 'Could not submit the quiz. Please try again.');
    }
  } finally {
    attemptPending.value = false;
  }
}

onMounted(loadProgress);
</script>
