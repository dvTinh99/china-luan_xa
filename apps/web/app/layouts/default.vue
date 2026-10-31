<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header / Navigation -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2">
            <span class="text-2xl">🌏</span>
            <span class="text-xl font-bold text-primary-700">LinguaWorld</span>
          </NuxtLink>

          <!-- Navigation Links -->
          <div class="flex items-center gap-1">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
              active-class="!text-primary-700 !bg-primary-50"
            >
              <span class="mr-1.5">{{ link.icon }}</span>
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} LinguaWorld. Learn Mandarin through adventure.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const navLinks = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/learn', label: 'Learn', icon: '📚' },
  { to: '/world', label: 'World', icon: '🎮' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];
</script>
