<template>
  <div class="relative" ref="selectorRef">
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-wood-900/90 hover:bg-wood-850 border border-wood-750 hover:border-gold-500/40 text-xs font-bold text-amber-100 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
      :aria-label="`${t('common.selectOriginLang')} (${currentOption.nativeLabel})`"
      :aria-expanded="isOpen"
    >
      <span class="text-sm leading-none">{{ currentOption.flag }}</span>
      <span class="font-rpg text-[11px] tracking-wide hidden sm:inline-block">
        {{ currentOption.nativeLabel }}
      </span>
      <ChevronDown
        :size="13"
        class="text-amber-300/70 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Language Dropdown Menu -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform -translate-y-2 opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 rounded-2xl bg-wood-900/95 border-2 border-gold-500/30 p-1.5 shadow-card-elevated backdrop-blur-xl z-50 space-y-1"
      >
        <div class="px-2.5 py-1 text-[10px] font-bold text-amber-200/50 uppercase tracking-wider border-b border-wood-800">
          {{ tDual('common.originLanguage', '母语') }}
        </div>

        <button
          v-for="lang in availableLanguages"
          :key="lang.code"
          type="button"
          @click="selectLanguage(lang.code)"
          class="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="originLanguage === lang.code
            ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
            : 'text-amber-100/70 hover:text-white hover:bg-wood-800'"
        >
          <div class="flex items-center gap-2">
            <span class="text-base">{{ lang.flag }}</span>
            <div class="flex flex-col text-left">
              <span>{{ lang.nativeLabel }}</span>
              <span class="text-[10px] opacity-60">
                {{ lang.code === 'vi' ? tDual('common.langVi', '越南语') : tDual('common.langEn', '英语') }}
              </span>
            </div>
          </div>
          <Check v-if="originLanguage === lang.code" :size="14" class="text-gold-400" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronDown, Check } from 'lucide-vue-next';
import { useOriginLanguage, type OriginLanguageCode } from '~/composables/useOriginLanguage';

const { t, tDual, originLanguage, setOriginLanguage, availableLanguages, currentOption } = useOriginLanguage();

const isOpen = ref(false);
const selectorRef = ref<HTMLElement | null>(null);

const selectLanguage = (code: OriginLanguageCode) => {
  setOriginLanguage(code);
  isOpen.value = false;
};

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  if (process.client) {
    document.addEventListener('click', handleClickOutside);
  }
});

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('click', handleClickOutside);
  }
});
</script>
