<template>
  <div class="min-h-screen flex flex-col bg-wood-950 text-slate-100 font-sans selection:bg-gold-500/30 selection:text-gold-200">
    <!-- Cozy Tavern Header -->
    <header class="border-b border-wood-800 bg-wood-950/90 backdrop-blur-xl sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Logo: Dragon Seal -->
        <NuxtLink
          to="/"
          class="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-2xl py-1 px-1.5"
          aria-label="LinguaWorld Trang chủ"
        >
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-dragon-600 via-dragon-500 to-amber-600 flex items-center justify-center font-hanzi font-black text-2xl text-white shadow-rpg-glow-dragon border-2 border-gold-400/40 group-hover:scale-105 transition-transform">
            龙
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="text-xl font-bold font-rpg tracking-wider bg-gradient-to-r from-amber-100 via-gold-200 to-amber-400 bg-clip-text text-transparent">
                LinguaWorld
              </span>
              <RpgBadge variant="gold" size="sm" class="hidden sm:inline-flex">
                HSK 3.0
              </RpgBadge>
            </div>
            <span class="text-[10px] text-wood-600 font-bold uppercase tracking-wider hidden sm:block">Cozy RPG Mandarin</span>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1.5" aria-label="Menu chính">
          <NuxtLink
            to="/"
            class="px-3.5 py-2 rounded-2xl text-sm font-bold text-amber-100/70 hover:text-white hover:bg-wood-850 transition-all flex items-center gap-2 border border-transparent"
            active-class="bg-wood-850 text-gold-300 border-wood-700 shadow-sm"
          >
            <Sparkles :size="16" class="text-gold-400" aria-hidden="true" />
            <span class="font-rpg tracking-wide">Trang chủ</span>
          </NuxtLink>

          <NuxtLink
            to="/learn"
            class="px-3.5 py-2 rounded-2xl text-sm font-bold text-amber-100/70 hover:text-white hover:bg-wood-850 transition-all flex items-center gap-2 border border-transparent"
            active-class="bg-wood-850 text-gold-300 border-wood-700 shadow-sm"
          >
            <BookOpen :size="16" class="text-emerald-400" aria-hidden="true" />
            <span class="font-rpg tracking-wide">Học bài</span>
          </NuxtLink>

          <NuxtLink
            to="/review"
            class="px-3.5 py-2 rounded-2xl text-sm font-bold text-amber-100/70 hover:text-white hover:bg-wood-850 transition-all flex items-center gap-2 border border-transparent relative"
            active-class="bg-wood-850 text-gold-300 border-wood-700 shadow-sm"
          >
            <RotateCcw :size="16" class="text-gold-400" aria-hidden="true" />
            <span class="font-rpg tracking-wide">Ôn tập SRS</span>
            <span
              v-if="dueCount > 0"
              class="ml-1 px-1.5 py-0.5 text-[11px] font-black bg-dragon-600 text-white rounded-full animate-pulse shadow-sm"
              :aria-label="`${dueCount} thẻ cần ôn`"
            >
              {{ dueCount }}
            </span>
          </NuxtLink>

          <NuxtLink
            to="/world"
            class="px-3.5 py-2 rounded-2xl text-sm font-bold text-amber-100/70 hover:text-white hover:bg-wood-850 transition-all flex items-center gap-2 border border-transparent"
            active-class="bg-wood-850 text-gold-300 border-wood-700 shadow-sm"
          >
            <Gamepad2 :size="16" class="text-sky-400" aria-hidden="true" />
            <span class="font-rpg tracking-wide">Thế giới 2D</span>
          </NuxtLink>

          <NuxtLink
            to="/character"
            class="px-3.5 py-2 rounded-2xl text-sm font-bold text-amber-100/70 hover:text-white hover:bg-wood-850 transition-all flex items-center gap-2 border border-transparent"
            active-class="bg-wood-850 text-gold-300 border-wood-700 shadow-sm"
          >
            <Shield :size="16" class="text-purple-400" aria-hidden="true" />
            <span class="font-rpg tracking-wide">Nhân vật</span>
          </NuxtLink>
        </nav>

        <!-- Right Side: Coin Pouch & Hero Pill -->
        <div class="flex items-center gap-3">
          <!-- Gold Coin Pouch -->
          <NuxtLink
            to="/character"
            class="flex items-center gap-2 bg-wood-850 hover:bg-wood-800 border-2 border-wood-700 hover:border-gold-500/60 px-3.5 py-1.5 rounded-2xl transition-all shadow-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            title="Túi Gold của bạn"
          >
            <Coins :size="16" class="text-gold-400 group-hover:rotate-12 transition-transform" aria-hidden="true" />
            <span class="text-sm font-black font-heading text-gold-300 tracking-wide">{{ walletGold }}</span>
            <span class="text-[11px] text-amber-200/60 font-semibold hidden sm:inline">Gold</span>
          </NuxtLink>

          <!-- Hero Portrait Pill -->
          <NuxtLink
            v-if="user"
            to="/character"
            class="flex items-center gap-2.5 bg-wood-850 border border-wood-700 hover:border-wood-600 px-2.5 py-1.5 rounded-2xl transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            title="Hồ sơ nhân vật"
          >
            <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-dragon-600 to-amber-600 flex items-center justify-center text-xs font-bold font-hanzi text-white border border-gold-400/50 shadow-sm">
              {{ characterName ? characterName.slice(0, 1) : '侠' }}
            </div>
            <div class="hidden sm:block text-left pr-1">
              <div class="text-xs font-bold text-amber-100 leading-none group-hover:text-gold-300 transition-colors">{{ characterName || 'Hero' }}</div>
              <div class="text-[10px] text-gold-400 font-bold leading-tight mt-0.5">Lv.{{ characterLevel }}</div>
            </div>
          </NuxtLink>

          <!-- Login if guest -->
          <RpgButton
            v-else
            to="/login"
            variant="dragon"
            size="sm"
          >
            <template #prefix>
              <LogIn :size="14" aria-hidden="true" />
            </template>
            Đăng nhập
          </RpgButton>

          <!-- Mobile Hamburger Toggle -->
          <button
            type="button"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden flex items-center justify-center w-11 h-11 rounded-2xl bg-wood-850 border border-wood-700 text-amber-200 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            :aria-label="isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'"
            :aria-expanded="isMobileMenuOpen"
          >
            <X v-if="isMobileMenuOpen" :size="20" aria-hidden="true" />
            <Menu v-else :size="20" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden border-t border-wood-800 bg-wood-950/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-fade-in"
      >
        <NuxtLink
          to="/"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-200 hover:bg-wood-850"
          active-class="bg-wood-850 text-gold-300"
        >
          <Sparkles :size="18" class="text-gold-400" aria-hidden="true" />
          <span class="font-rpg">Trang chủ Tavern</span>
        </NuxtLink>
        <NuxtLink
          to="/learn"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-200 hover:bg-wood-850"
          active-class="bg-wood-850 text-gold-300"
        >
          <BookOpen :size="18" class="text-emerald-400" aria-hidden="true" />
          <span class="font-rpg">Giáo trình HSK 3.0</span>
        </NuxtLink>
        <NuxtLink
          to="/review"
          @click="isMobileMenuOpen = false"
          class="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-slate-200 hover:bg-wood-850"
          active-class="bg-wood-850 text-gold-300"
        >
          <div class="flex items-center gap-3">
            <RotateCcw :size="18" class="text-gold-400" aria-hidden="true" />
            <span class="font-rpg">Ôn tập Thần Tháp (SRS)</span>
          </div>
          <span v-if="dueCount > 0" class="px-2 py-0.5 text-xs font-black bg-dragon-600 text-white rounded-full">
            {{ dueCount }}
          </span>
        </NuxtLink>
        <NuxtLink
          to="/world"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-200 hover:bg-wood-850"
          active-class="bg-wood-850 text-gold-300"
        >
          <Gamepad2 :size="18" class="text-sky-400" aria-hidden="true" />
          <span class="font-rpg">Thế giới RPG 2D</span>
        </NuxtLink>
        <NuxtLink
          to="/character"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-200 hover:bg-wood-850"
          active-class="bg-wood-850 text-gold-300"
        >
          <Shield :size="18" class="text-purple-400" aria-hidden="true" />
          <span class="font-rpg">Nhân vật & Túi đồ</span>
        </NuxtLink>

        <div v-if="user" class="pt-3 border-t border-wood-800">
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-dragon-400 hover:bg-dragon-950/40"
          >
            <LogOut :size="18" aria-hidden="true" />
            <span>Đăng xuất ({{ user.username }})</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Cozy Hearth Footer -->
    <footer class="border-t border-wood-800/80 py-8 bg-wood-950 text-xs text-wood-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-wood-900 border border-wood-750 flex items-center justify-center font-hanzi font-bold text-xs text-gold-400">
            龙
          </div>
          <div>
            <span class="font-bold text-amber-200/90 font-rpg text-sm">LinguaWorld</span>
            <span class="text-wood-600 mx-2">•</span>
            <span>Cozy Fantasy RPG & HSK 3.0 Chinese Learning</span>
          </div>
        </div>

        <div class="flex items-center gap-4 text-xs text-amber-200/60">
          <span class="flex items-center gap-1.5">
            <kbd class="px-1.5 py-0.5 bg-wood-900 border border-wood-750 rounded text-[10px] text-amber-300 font-mono">P</kbd>
            <span>Phát âm</span>
          </span>
          <span class="flex items-center gap-1.5">
            <kbd class="px-1.5 py-0.5 bg-wood-900 border border-wood-750 rounded text-[10px] text-amber-300 font-mono">Space</kbd>
            <span>Lật thẻ</span>
          </span>
          <span class="flex items-center gap-1.5">
            <kbd class="px-1.5 py-0.5 bg-wood-900 border border-wood-750 rounded text-[10px] text-amber-300 font-mono">1-4</kbd>
            <span>Đánh giá FSRS</span>
          </span>
        </div>

        <div class="text-[11px] text-wood-600">
          FSRS Spaced Repetition • Web Speech Synthesis Mandarin
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  Sparkles,
  BookOpen,
  RotateCcw,
  Gamepad2,
  Shield,
  Coins,
  LogIn,
  LogOut,
  Menu,
  X,
} from 'lucide-vue-next';

const isMobileMenuOpen = ref(false);

const { data: authData, refresh: refreshAuth } = await useFetch<any>('/api/auth/me');
const user = computed(() => authData.value?.data?.user);
const characterName = computed(() => user.value?.character?.name || '');
const characterLevel = computed(() => user.value?.character?.level || 1);
const walletGold = computed(() => user.value?.wallet?.goldBalance ?? 0);

const dueCount = ref(0);
async function fetchDueCount() {
  try {
    const srs = await $fetch<any>('/api/srs/statistics');
    dueCount.value = srs?.data?.dueCount || 0;
  } catch (e) {}
}

onMounted(() => {
  fetchDueCount();
});

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  isMobileMenuOpen.value = false;
  navigateTo('/login');
}
</script>
