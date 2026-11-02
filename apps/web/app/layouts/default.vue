<template>
  <div class="min-h-screen flex flex-col bg-wood-950 text-slate-100 font-sans selection:bg-gold-500/30 selection:text-gold-200">
    <!-- Cozy Tavern Header -->
    <header class="border-b border-wood-800 bg-wood-950/90 backdrop-blur-xl sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Logo: Dragon Seal -->
        <NuxtLink
          to="/"
          class="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-2xl py-1 px-1.5"
          :aria-label="tDual('common.backHome', 'LinguaWorld 首页')"
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
            <span class="text-[10px] text-wood-600 font-bold uppercase tracking-wider hidden sm:block">
              {{ tDual('hero.tagline', '沉浸式 RPG 汉语') }}
            </span>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation: Grouped into Core Learn, World & RPG Hub -->
        <nav class="hidden md:flex items-center gap-1.5" :aria-label="t('common.menu')">
          <NuxtLink
            to="/learn"
            class="px-3 py-2 rounded-2xl text-xs font-bold text-amber-100/70 hover:text-white hover:bg-wood-850 transition-all flex items-center gap-1.5 border border-transparent"
            active-class="bg-wood-850 text-gold-300 border-wood-700 shadow-sm"
          >
            <BookOpen :size="15" class="text-emerald-400" aria-hidden="true" />
            <span class="font-rpg tracking-wide">{{ tDual('nav.learn', '学习') }}</span>
          </NuxtLink>

          <NuxtLink
            to="/review"
            class="px-3 py-2 rounded-2xl text-xs font-bold text-amber-100/70 hover:text-white hover:bg-wood-850 transition-all flex items-center gap-1.5 border border-transparent relative"
            active-class="bg-wood-850 text-gold-300 border-wood-700 shadow-sm"
          >
            <RotateCcw :size="15" class="text-gold-400" aria-hidden="true" />
            <span class="font-rpg tracking-wide">{{ tDual('nav.review', '复习') }}</span>
            <span
              v-if="dueCount > 0"
              class="ml-1 px-1.5 py-0.5 text-[10px] font-black bg-dragon-600 text-white rounded-full animate-pulse shadow-sm"
              :aria-label="`${dueCount} ${t('srs.dueSuffix')}`"
            >
              {{ dueCount }}
            </span>
          </NuxtLink>

          <NuxtLink
            to="/world"
            class="px-3 py-2 rounded-2xl text-xs font-bold text-amber-100/70 hover:text-white hover:bg-wood-850 transition-all flex items-center gap-1.5 border border-transparent"
            active-class="bg-wood-850 text-gold-300 border-wood-700 shadow-sm"
          >
            <Gamepad2 :size="15" class="text-sky-400" aria-hidden="true" />
            <span class="font-rpg tracking-wide">{{ tDual('nav.world', '大千世界') }}</span>
          </NuxtLink>

          <NuxtLink
            to="/quests"
            class="px-3 py-2 rounded-2xl text-xs font-bold text-amber-100/70 hover:text-white hover:bg-wood-850 transition-all flex items-center gap-1.5 border border-transparent"
            active-class="bg-wood-850 text-gold-300 border-wood-700 shadow-sm"
          >
            <Scroll :size="15" class="text-gold-400" aria-hidden="true" />
            <span class="font-rpg tracking-wide">{{ tDual('nav.quests', '宗门任务') }}</span>
          </NuxtLink>

          <!-- RPG Menu Dropdown (Character, Shop, Inventory) -->
          <div class="relative group" ref="rpgDropdownRef">
            <button
              type="button"
              @click="isRpgMenuOpen = !isRpgMenuOpen"
              class="px-3 py-2 rounded-2xl text-xs font-bold text-amber-100/70 hover:text-white hover:bg-wood-850 transition-all flex items-center gap-1.5 border border-transparent cursor-pointer"
              :class="isRpgRouteActive ? 'bg-wood-850 text-gold-300 border-wood-700 shadow-sm' : ''"
              aria-haspopup="true"
              :aria-expanded="isRpgMenuOpen"
            >
              <Shield :size="15" class="text-purple-400" aria-hidden="true" />
              <span class="font-rpg tracking-wide">{{ tDual('nav.inventory', '角色与行囊') }}</span>
              <ChevronDown :size="13" class="text-amber-200/60 transition-transform group-hover:rotate-180" />
            </button>

            <!-- Dropdown Menu -->
            <div
              class="absolute top-full left-0 mt-2 w-52 bg-wood-900 border border-wood-750 rounded-2xl p-2 shadow-card-elevated backdrop-blur-xl z-50 hidden group-hover:block transition-all"
            >
              <NuxtLink
                to="/character"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-wood-800 transition-colors"
                active-class="bg-wood-800 text-gold-300"
              >
                <Shield :size="14" class="text-purple-400" />
                <span>{{ tDual('nav.characterStats', '侠客属性') }}</span>
              </NuxtLink>

              <NuxtLink
                to="/inventory"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-wood-800 transition-colors"
                active-class="bg-wood-800 text-gold-300"
              >
                <Briefcase :size="14" class="text-orange-400" />
                <span>{{ tDual('inventoryDetail.title', '随身行囊') }}</span>
              </NuxtLink>

              <NuxtLink
                to="/shop"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-wood-800 transition-colors"
                active-class="bg-wood-800 text-gold-300"
              >
                <Store :size="14" class="text-amber-400" />
                <span>{{ tDual('nav.shop', '珍宝商行') }}</span>
              </NuxtLink>
            </div>
          </div>
        </nav>

        <!-- Right Side: Language Selector, Coin Pouch & Hero Pill -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Language Selector Component -->
          <LanguageSelector />

          <!-- Gold Coin Pouch -->
          <NuxtLink
            to="/character"
            class="flex items-center gap-1.5 sm:gap-2 bg-wood-850 hover:bg-wood-800 border-2 border-wood-700 hover:border-gold-500/60 px-2.5 sm:px-3.5 py-1.5 rounded-2xl transition-all shadow-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            :title="`${t('common.gold')}: ${walletGold}`"
          >
            <Coins :size="15" class="text-gold-400 group-hover:rotate-12 transition-transform" aria-hidden="true" />
            <span class="text-xs sm:text-sm font-black font-heading text-gold-300 tracking-wide">{{ walletGold }}</span>
            <span class="text-[10px] text-amber-200/60 font-semibold hidden sm:inline">{{ tDual('nav.gold', '金币') }}</span>
          </NuxtLink>

          <!-- Hero Portrait Pill -->
          <NuxtLink
            v-if="user"
            to="/character"
            class="flex items-center gap-2.5 bg-wood-850 border border-wood-700 hover:border-wood-600 px-2.5 py-1.5 rounded-2xl transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            :title="t('nav.characterStats')"
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
            {{ tDual('common.login', '登录') }}
          </RpgButton>

          <!-- Mobile Hamburger Toggle -->
          <button
            type="button"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden flex items-center justify-center w-11 h-11 rounded-2xl bg-wood-850 border border-wood-700 text-amber-200 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            :aria-label="isMobileMenuOpen ? t('common.close') : t('common.menu')"
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
          to="/learn"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-200 hover:bg-wood-850"
          active-class="bg-wood-850 text-gold-300"
        >
          <BookOpen :size="18" class="text-emerald-400" aria-hidden="true" />
          <span class="font-rpg">{{ tDual('nav.learn', '学习') }}</span>
        </NuxtLink>
        <NuxtLink
          to="/review"
          @click="isMobileMenuOpen = false"
          class="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-slate-200 hover:bg-wood-850"
          active-class="bg-wood-850 text-gold-300"
        >
          <div class="flex items-center gap-3">
            <RotateCcw :size="18" class="text-gold-400" aria-hidden="true" />
            <span class="font-rpg">{{ tDual('nav.review', '复习') }}</span>
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
          <span class="font-rpg">{{ tDual('nav.world', '大千世界') }}</span>
        </NuxtLink>
        <NuxtLink
          to="/quests"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-200 hover:bg-wood-850"
          active-class="bg-wood-850 text-gold-300"
        >
          <Scroll :size="18" class="text-gold-400" aria-hidden="true" />
          <span class="font-rpg">{{ tDual('nav.quests', '宗门任务') }}</span>
        </NuxtLink>

        <!-- RPG Hub Accordion in Mobile -->
        <div class="pt-2 border-t border-wood-850">
          <div class="text-[10px] text-wood-500 uppercase tracking-wider font-extrabold px-4 pb-2">
            {{ tDual('nav.inventory', '角色与行囊') }}
          </div>
          <div class="grid grid-cols-3 gap-2">
            <NuxtLink
              to="/character"
              @click="isMobileMenuOpen = false"
              class="flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center bg-wood-900 border border-wood-800 text-slate-200 hover:text-white"
              active-class="border-gold-500/50 text-gold-300"
            >
              <Shield :size="16" class="text-purple-400" />
              <span class="text-[11px] font-bold">{{ tDual('characterDetail.tabRpg', '属性') }}</span>
            </NuxtLink>
            <NuxtLink
              to="/inventory"
              @click="isMobileMenuOpen = false"
              class="flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center bg-wood-900 border border-wood-800 text-slate-200 hover:text-white"
              active-class="border-gold-500/50 text-gold-300"
            >
              <Briefcase :size="16" class="text-orange-400" />
              <span class="text-[11px] font-bold">{{ tDual('characterDetail.tabCloset', '行囊') }}</span>
            </NuxtLink>
            <NuxtLink
              to="/shop"
              @click="isMobileMenuOpen = false"
              class="flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center bg-wood-900 border border-wood-800 text-slate-200 hover:text-white"
              active-class="border-gold-500/50 text-gold-300"
            >
              <Store :size="16" class="text-amber-400" />
              <span class="text-[11px] font-bold">{{ tDual('nav.shop', '商行') }}</span>
            </NuxtLink>
          </div>
        </div>

        <div v-if="user" class="pt-3 border-t border-wood-800">
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-dragon-400 hover:bg-dragon-950/40"
          >
            <LogOut :size="18" aria-hidden="true" />
            <span>{{ tDual('common.logout', '退出登录') }} ({{ user.username }})</span>
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
            <span>{{ tDual('common.pronounce', '发音') }}</span>
          </span>
          <span class="flex items-center gap-1.5">
            <kbd class="px-1.5 py-0.5 bg-wood-900 border border-wood-750 rounded text-[10px] text-amber-300 font-mono">Space</kbd>
            <span>{{ tDual('lessonDetail.flipCard', '翻牌') }}</span>
          </span>
          <span class="flex items-center gap-1.5">
            <kbd class="px-1.5 py-0.5 bg-wood-900 border border-wood-750 rounded text-[10px] text-amber-300 font-mono">1-4</kbd>
            <span>{{ tDual('reviewDetail.keyRating', '评分') }}</span>
          </span>
        </div>

        <div class="flex items-center gap-4 text-[11px] text-wood-600">
          <span>FSRS Spaced Repetition • Web Speech Synthesis Mandarin</span>
          <span>•</span>
          <NuxtLink to="/admin/audio" class="hover:text-gold-300 transition-colors flex items-center gap-1 text-wood-500 hover:text-gold-300">
            <Headphones :size="12" />
            <span>Audio Studio</span>
          </NuxtLink>
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
  Store,
  Briefcase,
  Scroll,
  LogIn,
  LogOut,
  Menu,
  X,
  Headphones,
  ChevronDown,
} from 'lucide-vue-next';
import LanguageSelector from '~/components/LanguageSelector.vue';
import { useOriginLanguage } from '~/composables/useOriginLanguage';

const { t, tDual, dual, sub, ui } = useOriginLanguage();

const route = useRoute();
const isMobileMenuOpen = ref(false);
const isRpgMenuOpen = ref(false);

const isRpgRouteActive = computed(() => {
  return ['/character', '/inventory', '/shop'].includes(route.path);
});

const { data: authData, refresh: refreshAuth } = await useFetch<any>('/api/auth/me');
const user = computed(() => authData.value?.data?.user);
const characterName = computed(() => user.value?.character?.name || '');
const characterLevel = computed(() => user.value?.character?.level || 1);
const walletGold = computed(() => user.value?.wallet?.balanceGold ?? user.value?.wallet?.goldBalance ?? 0);

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
