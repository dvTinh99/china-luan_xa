<template>
  <button
    type="button"
    @click.stop="handleSpeak"
    :aria-label="isCurrentPlaying ? `Dừng phát âm: ${text}` : `Nghe phát âm chuẩn: ${text}`"
    :aria-pressed="isCurrentPlaying"
    class="inline-flex items-center justify-center rounded-2xl transition-all duration-150 cursor-pointer select-none relative group focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none border-b-2 active:border-b-0 active:translate-y-0.5"
    :class="[
      sizeClasses,
      isCurrentPlaying
        ? 'bg-gold-500/20 text-gold-300 border-gold-400 shadow-rpg-glow-gold'
        : 'bg-wood-850 hover:bg-wood-800 text-amber-200/90 hover:text-gold-300 border-wood-700 hover:border-gold-500/50'
    ]"
  >
    <!-- Wave Bars while playing -->
    <span v-if="isCurrentPlaying" class="flex items-center gap-0.5 px-0.5" aria-hidden="true">
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
      {{ isCurrentPlaying ? 'Đang phát...' : 'Phát âm' }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { Volume2 } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    text: string;
    audioUrl?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    rate?: number;
  }>(),
  {
    size: 'md',
    showLabel: false,
    rate: 0.85,
  },
);

const { speak, stop, isPlaying, currentText } = usePronunciation();

const isCurrentPlaying = computed(() => isPlaying.value && currentText.value === props.text);

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

function handleSpeak() {
  if (isCurrentPlaying.value) {
    stop();
  } else {
    speak(props.text, {
      audioUrl: props.audioUrl,
      rate: props.rate,
    });
  }
}
</script>
