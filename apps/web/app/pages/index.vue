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
                {{ characterName || 'Lữ Khách Phương Xa' }}
              </h1>
              <RpgBadge variant="gold" size="sm">
                HSK 3.0 Band 1
              </RpgBadge>
            </div>
            <p class="text-xs text-amber-200/70 font-medium">
              Võ sinh tại Tân Thủ Thôn • Hành trình chinh phục Hán tự
            </p>

            <!-- Mini Vitals (HP & EXP) -->
            <div class="grid grid-cols-2 gap-3 pt-1 max-w-sm">
              <RpgProgressBar
                :value="characterHp"
                :max="characterMaxHp"
                label="Sinh lực (HP)"
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
                label="Kinh nghiệm"
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
            Tiếp tục học tập
          </RpgButton>

          <RpgButton
            to="/world"
            variant="wood"
            size="lg"
          >
            <template #prefix>
              <Gamepad2 :size="18" class="text-sky-400" aria-hidden="true" />
            </template>
            Vào Làng 2D
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
          title="Tiến Trình Học Tiếp Theo"
        >
          <template #icon>
            <Flame :size="18" class="text-dragon-400" aria-hidden="true" />
          </template>
          <template #header>
            <RpgBadge variant="dragon" size="sm">Đề xuất ưu tiên</RpgBadge>
          </template>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="text-xs text-gold-400 font-bold uppercase tracking-wider">Bài học sắp tới</div>
              <h4 class="text-lg font-bold font-heading text-white">
                {{ nextRecommendedLesson?.title || 'Lời chào cơ bản & Đại từ nhân xưng' }}
              </h4>
              <p class="text-xs text-amber-200/70 line-clamp-2 leading-relaxed">
                {{ nextRecommendedLesson?.description || 'Học các đại từ cơ bản: 你, 我, 他, 她, 们, 好, 见... kèm Flashcard, Nối từ và Trắc nghiệm.' }}
              </p>
              <div class="flex items-center gap-4 text-xs font-bold pt-2">
                <span class="text-amber-200/60">📖 12 từ vựng</span>
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
              Vào học ngay
            </RpgButton>
          </div>
        </RpgCard>

        <!-- 2. Active Daily Quests Board (Nhiệm Vụ Hàng Ngày) -->
        <RpgCard
          variant="board"
          title="Bảng Nhiệm Vụ Hàng Ngày (Quest Board)"
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
                  <div class="text-sm font-bold text-slate-100">Luyện nhớ Thần Tháp (FSRS)</div>
                  <div class="text-xs text-slate-400">Ôn tập toàn bộ các thẻ từ đến hạn hôm nay</div>
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
                  Ôn tập
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
                  <div class="text-sm font-bold text-slate-100">Khai mở thư tịch cổ</div>
                  <div class="text-xs text-slate-400">Hoàn thành ít nhất 1 bài học HSK 3.0 với độ chính xác &gt; 80%</div>
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
                  Làm bài
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
                  <div class="text-sm font-bold text-slate-100">Thám hiểm Tân Thủ Thôn 2D</div>
                  <div class="text-xs text-slate-400">Dạo bước trong thế giới 2D và đối thoại cùng NPC Trưởng thôn</div>
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
                  Khám phá
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
          title="Thần Tháp Ôn Tập (FSRS)"
        >
          <template #icon>
            <RotateCcw :size="18" class="text-gold-400" aria-hidden="true" />
          </template>
          <template #header>
            <RpgBadge :variant="dueCount > 0 ? 'dragon' : 'jade'" size="sm">
              {{ dueCount > 0 ? `${dueCount} thẻ đến hạn` : 'Đã hoàn tất' }}
            </RpgBadge>
          </template>

          <div class="text-center py-4">
            <div class="w-20 h-20 rounded-3xl bg-wood-900 border-2 border-wood-700 flex flex-col items-center justify-center mx-auto mb-3 shadow-inner">
              <span class="text-3xl font-black font-heading text-gold-400">{{ dueCount }}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Từ cần ôn</span>
            </div>
            <p class="text-xs text-amber-200/70 max-w-xs mx-auto leading-relaxed mb-5">
              {{ dueCount > 0 
                ? 'Thuật toán FSRS phát hiện các từ sắp phai nhạt trong trí nhớ. Hãy củng cố ngay để đạt điểm ổn định cao nhất!' 
                : 'Trí nhớ của bạn đang trong trạng thái tối ưu. Không có thẻ nào bị trễ hạn hôm nay.' }}
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
              {{ dueCount > 0 ? 'Bắt đầu phiên ôn tập' : 'Ôn luyện tự do' }}
            </RpgButton>
          </div>
        </RpgCard>

        <!-- 4. Learning Mastery Progress Summary -->
        <RpgCard
          variant="wood"
          title="Chỉ Số Tinh Thông Ngôn Ngữ"
        >
          <template #icon>
            <Award :size="18" class="text-emerald-400" aria-hidden="true" />
          </template>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3.5 bg-wood-950/70 rounded-2xl border border-wood-800 text-center">
                <div class="text-[11px] text-slate-400 font-semibold">Từ đã tiếp cận</div>
                <div class="text-2xl font-black font-heading text-gold-300 mt-1">{{ proficiency.vocabularyEnrolled || 12 }}</div>
              </div>
              <div class="p-3.5 bg-wood-950/70 rounded-2xl border border-wood-800 text-center">
                <div class="text-[11px] text-slate-400 font-semibold">Đã tinh thông</div>
                <div class="text-2xl font-black font-heading text-emerald-400 mt-1">{{ proficiency.masteredCount || 5 }}</div>
              </div>
            </div>

            <RpgProgressBar
              :value="proficiency.masteredCount || 5"
              :max="proficiency.vocabularyEnrolled || 12"
              label="Tỷ lệ thuần thục HSK 3.0"
              unit="từ"
              color="gold"
              size="md"
            />
          </div>
        </RpgCard>

        <!-- 5. Recent Achievements -->
        <RpgCard
          variant="wood"
          title="Thành Tựu Mới Mở Khóa"
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
                <div class="text-xs font-bold text-white truncate">Khởi Đầu Hành Trình</div>
                <div class="text-[10px] text-slate-400 truncate">Tạo thành công nhân vật đầu tiên</div>
              </div>
              <span class="text-xs text-gold-400 font-bold shrink-0">✓ Đạt</span>
            </div>

            <div class="flex items-center gap-3 p-3 rounded-2xl bg-wood-900 border border-wood-750">
              <div class="w-10 h-10 rounded-xl bg-dragon-500/15 border border-dragon-500/30 flex items-center justify-center text-dragon-400 shrink-0">
                <Shield :size="18" aria-hidden="true" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-white truncate">Âm Điệu Tiên Phong</div>
                <div class="text-[10px] text-slate-400 truncate">Luyện nghe phát âm chuẩn 10 từ đầu tiên</div>
              </div>
              <span class="text-xs text-gold-400 font-bold shrink-0">✓ Đạt</span>
            </div>
          </div>
        </RpgCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
