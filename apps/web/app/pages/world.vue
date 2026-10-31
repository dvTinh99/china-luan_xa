<template>
  <div class="relative w-full h-full">
    <!-- Loading State -->
    <div
      v-if="bridge.status.value === 'loading'"
      class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-20"
    >
      <div class="text-6xl mb-6 animate-bounce">🌏</div>
      <h2 class="text-2xl font-bold mb-2">Loading LinguaWorld...</h2>
      <p class="text-gray-400 mb-6">Preparing your adventure</p>
      <div class="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div class="h-full bg-primary-500 rounded-full animate-pulse" style="width: 60%" />
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="bridge.status.value === 'error'"
      class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-20"
    >
      <div class="text-6xl mb-6">⚠️</div>
      <h2 class="text-2xl font-bold mb-2">Failed to Load Game</h2>
      <p class="text-gray-400 mb-6 max-w-md text-center">
        {{ bridge.error.value || 'The game could not be loaded. Please try again.' }}
      </p>
      <div class="flex gap-4">
        <button
          class="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          @click="handleRetry"
        >
          🔄 Retry
        </button>
        <NuxtLink
          to="/"
          class="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
        >
          🏠 Go Home
        </NuxtLink>
      </div>
    </div>

    <!-- Game Iframe -->
    <iframe
      ref="gameIframeRef"
      :src="gameIframeSrc"
      class="w-full h-full border-0"
      allow="autoplay; fullscreen"
      :class="{ 'opacity-0': bridge.status.value !== 'ready' }"
      @load="handleIframeLoad"
    />

    <!-- HUD Overlay (visible when game is ready) -->
    <div
      v-if="bridge.status.value === 'ready'"
      class="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pointer-events-none z-10"
    >
      <!-- Back button -->
      <NuxtLink
        to="/"
        class="pointer-events-auto px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-black/70 transition-colors"
      >
        ← Exit World
      </NuxtLink>

      <!-- Status indicator -->
      <div
        class="pointer-events-auto px-3 py-1.5 bg-black/50 backdrop-blur-sm text-green-400 rounded-lg text-sm font-medium flex items-center gap-2"
      >
        <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        Connected
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GodotToNuxtEvent } from '@linguaworld/shared-types';

definePageMeta({
  layout: 'game',
});

const router = useRouter();
const gameIframeRef = ref<HTMLIFrameElement | null>(null);

// Game iframe source — served from public/game/
const gameIframeSrc = '/game/index.html';

// Initialize the game bridge composable
const bridge = useGameBridge(gameIframeRef);

// Handle iframe load event
function handleIframeLoad() {
  console.log('[World] Game iframe loaded');
}

// Retry loading the game
function handleRetry() {
  bridge.retry();
}

// Listen for game events
bridge.on(GodotToNuxtEvent.INTERACT_NPC, (payload) => {
  console.log('[World] NPC interaction:', payload);
  // TODO Phase 1: Open NPC dialogue modal
});

bridge.on(GodotToNuxtEvent.ENTER_REGION, (payload) => {
  console.log('[World] Entered region:', payload);
  // TODO Phase 1: Update region display in HUD
});

bridge.on(GodotToNuxtEvent.START_COMBAT, (payload) => {
  console.log('[World] Combat started:', payload);
  // TODO Phase 1: Navigate to combat route or overlay
});

bridge.on(GodotToNuxtEvent.OPEN_APP_ROUTE, (payload) => {
  console.log('[World] Game requested route:', payload);
  if (payload?.route) {
    router.push(payload.route);
  }
});
</script>
