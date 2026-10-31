<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
    <!-- Header with SRS Alert Banner -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/70 border border-brand-800/80 text-xs font-bold text-brand-300 mb-3 shadow-sm">
          <Sparkles :size="14" class="text-gold-400" aria-hidden="true" />
          <span>HSK 3.0 Chuẩn mới • Cấp độ Band 1</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
          Lộ Trình Học Tiếng Trung HSK 3.0
        </h1>
        <p class="text-slate-400 text-sm mt-1 max-w-2xl">
          Làm chủ các từ vựng căn bản qua 3 giai đoạn: Thẻ từ (Flashcard), Nối chữ (Matching) và Trắc nghiệm (Quiz).
        </p>
      </div>

      <!-- Quick Action: SRS Review Banner -->
      <NuxtLink
        to="/review"
        class="inline-flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-gold-600 via-gold-500 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-surface-950 font-extrabold shadow-glow-gold hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0 min-h-[48px]"
      >
        <RotateCcw :size="20" class="text-surface-950 animate-spin-reverse" aria-hidden="true" />
        <div class="text-left">
          <div class="text-[10px] uppercase tracking-wider text-surface-950/80 font-bold">Spaced Repetition</div>
          <div class="text-sm font-black">{{ dueCount > 0 ? `Ôn tập ngay (${dueCount} từ cần ôn)` : 'Hàng đợi ôn tập trống' }}</div>
        </div>
      </NuxtLink>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-24 text-slate-400">
      <div class="w-12 h-12 rounded-2xl bg-surface-850 border border-surface-750 flex items-center justify-center animate-bounce mb-3 text-gold-400">
        <BookOpen :size="24" aria-hidden="true" />
      </div>
      <p class="text-sm font-medium">Đang tải giáo trình HSK 3.0...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-6 bg-brand-950/40 border border-brand-800 rounded-2xl text-center">
      <p class="text-brand-300 text-sm mb-4">{{ error.message || 'Không thể tải giáo trình.' }}</p>
      <button @click="refresh()" class="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs hover:bg-brand-500 transition-colors">
        Thử lại
      </button>
    </div>

    <!-- Courses & Units List -->
    <div v-else class="space-y-8">
      <div v-for="course in courses" :key="course.id" class="space-y-6">
        <!-- Units Cards -->
        <div
          v-for="unit in course.units"
          :key="unit.id"
          class="bg-surface-850/70 border border-surface-750/80 rounded-3xl p-6 sm:p-7 shadow-card-elevated"
        >
          <!-- Unit Header -->
          <div class="flex items-center justify-between border-b border-surface-750 pb-4 mb-6">
            <div class="flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-2xl bg-brand-600/15 border border-brand-500/30 flex items-center justify-center text-brand-400 font-heading font-extrabold text-base shadow-sm">
                {{ unit.orderIndex }}
              </div>
              <div>
                <h2 class="text-lg sm:text-xl font-bold font-heading text-slate-100">{{ unit.title }}</h2>
                <div class="text-xs text-slate-400 mt-0.5">{{ unit.lessons.length }} Bài học</div>
              </div>
            </div>

            <span class="text-xs font-semibold text-slate-400 bg-surface-900/80 px-3 py-1.5 rounded-xl border border-surface-750 hidden sm:inline-block">
              HSK 3.0 Band 1
            </span>
          </div>

          <!-- Lessons Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="lesson in unit.lessons"
              :key="lesson.id"
              class="bg-surface-900/90 border border-surface-750 hover:border-surface-600 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:scale-[1.01]"
            >
              <div>
                <div class="flex items-start justify-between gap-2 mb-2">
                  <h3 class="text-base font-bold font-heading text-slate-200 group-hover:text-gold-300 transition-colors">
                    {{ lesson.title }}
                  </h3>
                  <span
                    v-if="lesson.isCompleted"
                    class="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-[11px] font-bold shrink-0 flex items-center gap-1"
                  >
                    <CheckCircle2 :size="12" class="text-emerald-400" aria-hidden="true" />
                    <span>Đã học</span>
                  </span>
                </div>
                <p class="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {{ lesson.description }}
                </p>
              </div>

              <div class="flex items-center justify-between pt-3.5 border-t border-surface-800/80 mt-auto">
                <div class="flex items-center gap-3 text-xs">
                  <span class="text-slate-400 font-medium">📖 {{ lesson.vocabularyCount }} từ</span>
                  <span class="text-purple-400 font-bold">+{{ lesson.expReward }} EXP</span>
                  <span class="text-gold-400 font-bold flex items-center gap-1">
                    <Coins :size="12" aria-hidden="true" />
                    <span>+{{ lesson.goldReward }}</span>
                  </span>
                </div>

                <NuxtLink
                  :to="`/learn/lesson/${lesson.id}`"
                  class="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  :class="lesson.isCompleted 
                    ? 'bg-surface-800 hover:bg-surface-750 text-slate-300 border border-surface-700' 
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow-brand'"
                >
                  <span>{{ lesson.isCompleted ? 'Ôn lại' : 'Bắt đầu' }}</span>
                  <ChevronRight :size="14" aria-hidden="true" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Sparkles,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  Coins,
  ChevronRight,
} from 'lucide-vue-next';

definePageMeta({
  layout: 'default',
});

const { data, pending, error, refresh } = await useFetch<any>('/api/learning/courses');
const courses = computed(() => data.value?.data?.courses || []);

const dueCount = ref(0);
onMounted(async () => {
  try {
    const srs = await $fetch<any>('/api/srs/statistics');
    dueCount.value = srs?.data?.dueCount || 0;
  } catch (e) {}
});
</script>
