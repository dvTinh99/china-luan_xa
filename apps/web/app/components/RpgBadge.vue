<template>
  <span
    class="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-xl transition-all"
    :class="[variantClasses, sizeClasses]"
  >
    <slot name="icon" />
    <span><slot /></span>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'gold' | 'dragon' | 'jade' | 'wood' | 'mana';
    size?: 'sm' | 'md';
  }>(),
  {
    variant: 'gold',
    size: 'sm',
  },
);

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'dragon':
      return 'bg-dragon-950/80 text-dragon-400 border border-dragon-800/80';
    case 'jade':
      return 'bg-jade-950/80 text-jade-300 border border-jade-800/80';
    case 'mana':
      return 'bg-mana-700/30 text-mana-400 border border-mana-600/50';
    case 'wood':
      return 'bg-wood-800 text-slate-300 border border-wood-700';
    case 'gold':
    default:
      return 'bg-gold-950/80 text-gold-300 border border-gold-700/80';
  }
});

const sizeClasses = computed(() => {
  return props.size === 'sm'
    ? 'px-2.5 py-1 text-[10px]'
    : 'px-3 py-1.5 text-xs';
});
</script>

