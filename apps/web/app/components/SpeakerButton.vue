<template>
  <div class="inline-flex items-center gap-1.5">
    <button
      type="button"
      @click.stop="handleToggle"
      :aria-label="isPlayingThis ? `${t('common.stopAudio')}: ${text}` : `${t('common.playAudio')}: ${text}`"
      :aria-pressed="isPlayingThis"
      class="inline-flex items-center justify-center rounded-2xl transition-all duration-150 cursor-pointer select-none relative group focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none border-b-2 active:border-b-0 active:translate-y-0.5"
      :class="[
        sizeClasses,
        isPlayingThis
          ? 'bg-gold-500/20 text-gold-300 border-gold-400 shadow-rpg-glow-gold'
          : 'bg-wood-850 hover:bg-wood-800 text-amber-200/90 hover:text-gold-300 border-wood-700 hover:border-gold-500/50'
      ]"
    >
      <!-- Loading State -->
      <Loader2
        v-if="isLoadingThis"
        :size="iconSize"
        class="animate-spin text-gold-400"
        aria-hidden="true"
      />

      <!-- Wave Bars while playing -->
      <span v-else-if="isPlayingThis" class="flex items-center gap-0.5 px-0.5" aria-hidden="true">
        <span class="w-1 h-3 bg-gold-400 rounded-full animate-pulse" />
        <span class="w-1 h-5 bg-gold-300 rounded-full animate-pulse" style="animation-delay: 150ms" />
        <span class="w-1 h-3.5 bg-gold-400 rounded-full animate-pulse" style="animation-delay: 300ms" />
      </span>

      <!-- Vector Volume2 Icon when idle -->
      <Volume2
        v-else
        :size="iconSize"
        class="transition-transform duration-150 group-hover:scale-110"
        aria-hidden="true"
      />

      <span v-if="showLabel" class="ml-2 text-xs font-bold tracking-wide">
        {{ isPlayingThis ? tDual('common.playingAudio', '发音中') : tDual('common.pronounce', '发音') }}
      </span>
    </button>

    <!-- Optional Speed Toggle Pill -->
    <button
      v-if="showSpeedToggle"
      type="button"
      @click.stop="cycleSpeed"
      :title="tDual('common.speed', '语速')"
      class="h-7 px-2 rounded-lg bg-wood-900 border border-wood-750 text-[10px] font-bold text-amber-200/80 hover:text-gold-300 hover:border-gold-500/50 transition-colors cursor-pointer select-none"
    >
      {{ activeSpeed }}x
    </button>
  </div>
</template>

<script setup lang="ts">
import { Volume2, Loader2 } from 'lucide-vue-next';
import type { PlaybackSpeed } from '../composables/useAudioManager';
import { useOriginLanguage } from '~/composables/useOriginLanguage';

const { t, tDual } = useOriginLanguage();

const props = withDefaults(
  defineProps<{
    text: string;
    audioUrl?: string | null;
    audioAssetId?: string | null;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    showSpeedToggle?: boolean;
  }>(),
  {
    size: 'md',
    showLabel: false,
    showSpeedToggle: false,
  },
);

const { play, stop, status, activeText, activeSpeed, setSpeed } = useAudioManager();

const isPlayingThis = computed(() => {
  return (status.value === 'playing') && activeText.value?.trim() === props.text?.trim();
});

const isLoadingThis = computed(() => {
  return (status.value === 'loading') && activeText.value?.trim() === props.text?.trim();
});

const sizeClasses = computed(() => {
  if (props.size === 'sm') {
    return props.showLabel
      ? 'min-h-[40px] px-3 py-1.5 text-xs'
      : 'w-10 h-10 text-xs';
  }
  if (props.size === 'lg') {
    return props.showLabel
      ? 'min-h-[50px] px-5 py-3 text-sm'
      : 'w-14 h-14 text-base';
  }
  return props.showLabel
    ? 'min-h-[44px] px-4 py-2.5 text-xs'
    : 'w-11 h-11 text-sm';
});

const iconSize = computed(() => {
  if (props.size === 'sm') return 16;
  if (props.size === 'lg') return 24;
  return 19;
});

function handleToggle() {
  if (isPlayingThis.value) {
    stop();
  } else {
    play({
      text: props.text,
      audioUrl: props.audioUrl,
      audioAssetId: props.audioAssetId,
    });
  }
}

const speeds: PlaybackSpeed[] = [0.75, 1.0, 1.25, 1.5];
function cycleSpeed() {
  const currentIndex = speeds.indexOf(activeSpeed.value);
  const nextIndex = (currentIndex + 1) % speeds.length;
  setSpeed(speeds[nextIndex]);
}
</script>
