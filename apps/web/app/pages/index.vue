<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Hero Section -->
    <section class="text-center py-16 sm:py-24">
      <h1 class="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight">
        Learn Mandarin
        <span class="text-primary-600">Through Adventure</span>
      </h1>
      <p class="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
        Explore a vibrant game world, interact with characters, and master
        Mandarin Chinese through immersive gameplay and real-time learning.
      </p>
      <div class="mt-10 flex items-center justify-center gap-4">
        <NuxtLink
          to="/world"
          class="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25"
        >
          🎮 Enter the World
        </NuxtLink>
        <NuxtLink
          to="/learn"
          class="px-8 py-3 bg-white text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors border border-gray-300"
        >
          📚 Start Learning
        </NuxtLink>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div class="text-4xl mb-4">{{ feature.icon }}</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ feature.title }}</h3>
        <p class="text-gray-600">{{ feature.description }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
});

const features = [
  {
    icon: '🌏',
    title: 'Explore a Living World',
    description:
      'Navigate through villages, cities, and landscapes. Every NPC speaks Mandarin and teaches you something new.',
  },
  {
    icon: '⚔️',
    title: 'Learn Through Combat',
    description:
      'Battle with vocabulary and grammar challenges. Defeat enemies by demonstrating your Mandarin skills.',
  },
  {
    icon: '📖',
    title: 'Structured Curriculum',
    description:
      'Follow HSK-aligned lessons woven into the game narrative. Track your progress from beginner to fluent.',
  },
];
</script>
