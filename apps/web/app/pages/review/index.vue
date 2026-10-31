<template>
  <div class="max-w-2xl mx-auto px-4 py-8 min-h-[calc(100vh-10rem)] flex flex-col justify-between">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-surface-800 pb-4 mb-6">
      <NuxtLink to="/learn" class="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2 px-2.5 rounded-xl hover:bg-surface-850">
        <ArrowLeft :size="14" aria-hidden="true" />
        <span>Về lộ trình học</span>
      </NuxtLink>
      <div class="text-center">
        <h1 class="text-base font-bold font-heading text-white flex items-center justify-center gap-2">
          <RotateCcw :size="16" class="text-gold-400" aria-hidden="true" />
          <span>Ôn tập ngắt quãng (FSRS)</span>
        </h1>
        <div class="text-xs text-slate-400 mt-0.5">Còn lại: {{ remainingCount }} từ hôm nay</div>
      </div>
      <div class="flex items-center gap-1.5 text-xs font-extrabold text-gold-300 bg-surface-850 border border-surface-750 px-3 py-1.5 rounded-xl">
        <Coins :size="14" class="text-gold-400" aria-hidden="true" />
        <span>+{{ sessionGoldEarned }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
      <div class="w-12 h-12 rounded-2xl bg-surface-850 border border-surface-750 flex items-center justify-center animate-spin mb-3 text-gold-400">
        <RotateCcw :size="24" aria-hidden="true" />
      </div>
      <p class="text-sm font-medium">Đang tính toán các thẻ cần ôn theo FSRS...</p>
    </div>

    <!-- Zero Due State (All completed) -->
    <div
      v-else-if="cards.length === 0"
      class="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-10 bg-surface-900 border border-surface-750 rounded-3xl my-auto shadow-card-elevated"
    >
      <div class="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-glow-jade">
        <CheckCircle2 :size="36" aria-hidden="true" />
      </div>
      <h2 class="text-2xl font-black font-heading text-white mb-2">Đã Hoàn Thành Ôn Tập Hôm Nay!</h2>
      <p class="text-sm text-slate-400 max-w-sm mb-8 leading-relaxed">
        Bạn đã hoàn tất tất cả các từ vựng cần ôn theo thuật toán FSRS. Hãy học thêm bài mới hoặc du ngoạn thế giới 2D!
      </p>
      <div class="flex flex-wrap gap-3.5 justify-center">
        <NuxtLink
          to="/learn"
          class="min-h-[48px] px-6 py-3 rounded-xl bg-surface-800 hover:bg-surface-750 text-slate-200 text-sm font-bold border border-surface-700 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <BookOpen :size="16" aria-hidden="true" />
          <span>Học bài mới</span>
        </NuxtLink>
        <NuxtLink
          to="/world"
          class="min-h-[48px] px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold shadow-glow-brand flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <Gamepad2 :size="16" aria-hidden="true" />
          <span>Vào thế giới 2D</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Active Review Card -->
    <div v-else class="flex-1 flex flex-col justify-center items-center">
      <div class="w-full max-w-md bg-surface-900 border border-surface-750 hover:border-surface-600 rounded-3xl p-8 shadow-card-elevated text-center relative transition-all">
        <!-- Status badge -->
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">
          Trạng thái thẻ: <span class="text-gold-400 font-extrabold">{{ currentCard.state || 'review' }}</span>
        </div>

        <!-- Hanzi Prominent with Speaker -->
        <div class="flex items-center justify-center gap-4 mb-6">
          <div class="text-7xl font-bold font-hanzi text-white tracking-wider">
            {{ currentCard.simplified }}
          </div>
          <SpeakerButton :text="currentCard.simplified" :audio-url="currentCard.audioUrl" size="lg" />
        </div>

        <!-- Hidden / Revealed Content -->
        <div v-if="revealed" class="animate-fade-in pt-5 border-t border-surface-750">
          <div class="text-2xl font-extrabold font-heading text-gold-400 mb-1">
            {{ currentCard.pinyin }}
          </div>
          <div class="text-xl font-bold text-white mb-4">
            {{ currentCard.meaning }}
          </div>

          <!-- Example sentence -->
          <div v-if="currentCard.example" class="p-3.5 bg-surface-950/80 rounded-2xl text-left border border-surface-750 text-xs">
            <div class="flex items-start justify-between gap-2">
              <div class="text-slate-200 font-bold font-hanzi text-sm">{{ currentCard.example.sentenceZh }}</div>
              <SpeakerButton :text="currentCard.example.sentenceZh" size="sm" class="shrink-0" />
            </div>
            <div class="text-gold-400 text-xs mt-0.5">{{ currentCard.example.sentencePinyin }}</div>
            <div class="text-slate-400 text-xs mt-0.5">{{ currentCard.example.translationVi }}</div>
          </div>
        </div>

        <!-- Reveal Trigger Button -->
        <button
          v-else
          type="button"
          @click="revealed = true"
          class="w-full min-h-[48px] py-3.5 rounded-2xl bg-surface-800 hover:bg-surface-750 text-slate-200 text-sm font-bold transition-all shadow-sm border border-surface-700 mt-6 cursor-pointer hover:border-gold-500/40"
        >
          Hiện nghĩa & Pinyin (Phím Space)
        </button>
      </div>

      <!-- 4 Rating Buttons (Shown when revealed) -->
      <div v-if="revealed" class="grid grid-cols-4 gap-2.5 max-w-md w-full mt-6">
        <button
          type="button"
          @click="submitRating(1)"
          class="min-h-[56px] p-3 rounded-2xl bg-brand-950/70 hover:bg-brand-900 border border-brand-800/80 hover:border-brand-600 text-center transition-all cursor-pointer group active:scale-95"
        >
          <div class="text-xs font-black text-brand-300">1. Quên</div>
          <div class="text-[10px] text-brand-400 mt-0.5">Lặp lại</div>
        </button>
        <button
          type="button"
          @click="submitRating(2)"
          class="min-h-[56px] p-3 rounded-2xl bg-amber-950/70 hover:bg-amber-900 border border-amber-800/80 hover:border-amber-600 text-center transition-all cursor-pointer group active:scale-95"
        >
          <div class="text-xs font-black text-amber-300">2. Khó</div>
          <div class="text-[10px] text-amber-400 mt-0.5">Khó nhớ</div>
        </button>
        <button
          type="button"
          @click="submitRating(3)"
          class="min-h-[56px] p-3 rounded-2xl bg-sky-950/70 hover:bg-sky-900 border border-sky-800/80 hover:border-sky-600 text-center transition-all cursor-pointer group active:scale-95"
        >
          <div class="text-xs font-black text-sky-300">3. Nhớ tốt</div>
          <div class="text-[10px] text-sky-400 mt-0.5">Chuẩn</div>
        </button>
        <button
          type="button"
          @click="submitRating(4)"
          class="min-h-[56px] p-3 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/80 hover:border-emerald-600 text-center transition-all cursor-pointer group active:scale-95"
        >
          <div class="text-xs font-black text-emerald-300">4. Rất dễ</div>
          <div class="text-[10px] text-emerald-400 mt-0.5">Dễ dàng</div>
        </button>
      </div>

      <!-- Hotkeys Info -->
      <div class="flex items-center gap-3 text-[11px] text-slate-500 mt-5">
        <span><kbd class="px-1 py-0.5 bg-surface-850 rounded border border-surface-700 font-mono">Space</kbd> Hiện nghĩa</span>
        <span>•</span>
        <span><kbd class="px-1 py-0.5 bg-surface-850 rounded border border-surface-700 font-mono">1-4</kbd> Đánh giá</span>
        <span>•</span>
        <span><kbd class="px-1 py-0.5 bg-surface-850 rounded border border-surface-700 font-mono">P</kbd> Phát âm</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  RotateCcw,
  ArrowLeft,
  Coins,
  CheckCircle2,
  BookOpen,
  Gamepad2,
} from 'lucide-vue-next';

definePageMeta({
  layout: 'default',
});

const { speak } = usePronunciation();
const { data, pending, refresh } = await useFetch<any>('/api/srs/due');
const cards = ref<any[]>([]);
const currentIndex = ref(0);
const revealed = ref(false);
const sessionGoldEarned = ref(0);

watchEffect(() => {
  if (data.value?.data?.items) {
    cards.value = [...data.value.data.items];
  }
});

const currentCard = computed(() => cards.value[currentIndex.value] || {});
const remainingCount = computed(() => Math.max(0, cards.value.length - currentIndex.value));

async function submitRating(rating: 1 | 2 | 3 | 4) {
  if (!currentCard.value?.vocabularyId) return;

  try {
    const res = await $fetch<any>('/api/srs/reviews', {
      method: 'POST',
      body: {
        vocabularyId: currentCard.value.vocabularyId,
        rating,
      },
    });

    if (res?.data?.rewards) {
      sessionGoldEarned.value += res.data.rewards.goldEarned || 2;
    }
  } catch (err) {}

  revealed.value = false;
  if (currentIndex.value < cards.value.length - 1) {
    currentIndex.value++;
  } else {
    cards.value = [];
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === ' ' && !revealed.value) {
    e.preventDefault();
    revealed.value = true;
  } else if (revealed.value && ['1', '2', '3', '4'].includes(e.key)) {
    submitRating(parseInt(e.key) as 1 | 2 | 3 | 4);
  } else if ((e.key.toLowerCase() === 'p' || e.key.toLowerCase() === 'r') && currentCard.value?.simplified) {
    speak(currentCard.value.simplified, { audioUrl: currentCard.value.audioUrl });
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>
