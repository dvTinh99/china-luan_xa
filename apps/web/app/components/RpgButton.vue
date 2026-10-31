<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="disabled"
    class="inline-flex items-center justify-center font-bold select-none cursor-pointer text-center relative group transition-all duration-150 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
    :class="[
      variantClasses,
      sizeClasses,
      disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
    ]"
  >
    <slot name="prefix" />
    <span><slot /></span>
    <slot name="suffix" />
  </component>
</template>

<script setup lang="ts">
import { resolveComponent } from 'vue';

const NuxtLink = resolveComponent('NuxtLink');

const props = withDefaults(
  defineProps<{
    variant?: 'gold' | 'dragon' | 'jade' | 'wood' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    to?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }>(),
  {
    variant: 'gold',
    size: 'md',
    type: 'button',
    disabled: false,
  },
);

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'dragon':
      return 'bg-dragon-600 hover:bg-dragon-500 text-white border-b-4 border-dragon-800 active:border-b-0 active:translate-y-1 shadow-rpg-glow-dragon';
    case 'jade':
      return 'bg-jade-500 hover:bg-jade-400 text-wood-950 font-extrabold border-b-4 border-jade-700 active:border-b-0 active:translate-y-1 shadow-rpg-glow-jade';
    case 'wood':
      return 'bg-wood-850 hover:bg-wood-800 text-slate-200 border border-wood-700 border-b-4 border-b-wood-950 active:border-b-0 active:translate-y-1';
    case 'ghost':
      return 'bg-transparent hover:bg-wood-850/80 text-slate-300 hover:text-white border border-transparent hover:border-wood-700';
    case 'gold':
    default:
      return 'bg-gradient-to-b from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-wood-950 font-black border-b-4 border-gold-700 active:border-b-0 active:translate-y-1 shadow-rpg-glow-gold';
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'min-h-[40px] px-3.5 py-1.5 text-xs gap-1.5';
    case 'lg':
      return 'min-h-[52px] px-8 py-3.5 text-base gap-2.5 font-heading tracking-wide';
    case 'md':
    default:
      return 'min-h-[44px] px-5 py-2.5 text-sm gap-2';
  }
});
</script>

