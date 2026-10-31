<template>
  <div class="w-full">
    <div v-if="label || showValue" class="flex justify-between items-center text-xs font-bold mb-1.5">
      <span class="text-slate-300 flex items-center gap-1.5">
        <slot name="icon" />
        <span>{{ label }}</span>
      </span>
      <span :class="valueColorClass" class="font-heading">
        {{ value }} / {{ max }} {{ unit }}
      </span>
    </div>

    <!-- Carved wooden bar track -->
    <div
      class="w-full rounded-full overflow-hidden bg-wood-950 p-0.5 border border-wood-750 shadow-inner"
      :class="heightClass"
    >
      <div
        class="h-full rounded-full transition-all duration-500 relative"
        :class="barColorClass"
        :style="{ width: `${percentage}%` }"
      >
        <!-- Subtle glossy sheen -->
        <div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number;
    max: number;
    label?: string;
    unit?: string;
    color?: 'red' | 'gold' | 'jade' | 'purple' | 'blue';
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
  }>(),
  {
    value: 0,
    max: 100,
    label: '',
    unit: '',
    color: 'gold',
    size: 'md',
    showValue: true,
  },
);

const percentage = computed(() => {
  if (props.max <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((props.value / props.max) * 100)));
});

const barColorClass = computed(() => {
  switch (props.color) {
    case 'red':
      return 'bg-gradient-to-r from-dragon-600 to-rose-400';
    case 'jade':
      return 'bg-gradient-to-r from-jade-600 to-emerald-400';
    case 'purple':
      return 'bg-gradient-to-r from-purple-600 to-indigo-400';
    case 'blue':
      return 'bg-gradient-to-r from-mana-600 to-sky-400';
    case 'gold':
    default:
      return 'bg-gradient-to-r from-amber-600 via-gold-500 to-amber-300';
  }
});

const valueColorClass = computed(() => {
  switch (props.color) {
    case 'red':
      return 'text-dragon-400';
    case 'jade':
      return 'text-jade-400';
    case 'purple':
      return 'text-purple-400';
    case 'blue':
      return 'text-sky-400';
    case 'gold':
    default:
      return 'text-gold-300';
  }
});

const heightClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-2.5';
    case 'lg':
      return 'h-5';
    case 'md':
    default:
      return 'h-3.5';
  }
});
</script>

