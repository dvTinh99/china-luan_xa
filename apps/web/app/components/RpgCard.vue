<template>
  <div
    class="rounded-3xl transition-all duration-200 relative"
    :class="[
      variantClasses,
      hoverable ? 'hover:scale-[1.01] hover:shadow-rpg-card-lift cursor-pointer' : '',
    ]"
  >
    <!-- Header ribbon / title if passed -->
    <div v-if="title || $slots.header" class="px-6 pt-5 pb-3 border-b border-wood-750 flex items-center justify-between">
      <div v-if="title" class="flex items-center gap-2.5">
        <slot name="icon" />
        <h3 class="text-base font-bold font-rpg text-amber-200 tracking-wide">{{ title }}</h3>
      </div>
      <slot name="header" />
    </div>

    <!-- Card Body -->
    <div :class="paddingClass">
      <slot />
    </div>

    <!-- Optional Footer -->
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-wood-750 bg-wood-950/40 rounded-b-3xl">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'wood' | 'parchment' | 'board' | 'deep';
    title?: string;
    hoverable?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
  }>(),
  {
    variant: 'wood',
    hoverable: false,
    padding: 'md',
  },
);

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'parchment':
      return 'bg-parchment-100 text-parchment-ink border-2 border-parchment-300 shadow-parchment-shadow';
    case 'board':
      return 'bg-wood-900 border-2 border-wood-700 shadow-rpg-card';
    case 'deep':
      return 'bg-wood-950/90 border border-wood-800 shadow-inner';
    case 'wood':
    default:
      return 'bg-wood-850 border border-wood-700 shadow-rpg-card';
  }
});

const paddingClass = computed(() => {
  switch (props.padding) {
    case 'none':
      return 'p-0';
    case 'sm':
      return 'p-4';
    case 'lg':
      return 'p-7 sm:p-8';
    case 'md':
    default:
      return 'p-6';
  }
});
</script>

