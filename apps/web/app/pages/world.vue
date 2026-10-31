<template>
  <div class="relative w-full h-full bg-surface-950">
    <!-- Loading State -->
    <div
      v-if="bridge.status.value === 'loading'"
      class="absolute inset-0 flex flex-col items-center justify-center bg-surface-950 text-white z-20"
    >
      <div class="w-16 h-16 rounded-3xl bg-brand-600/15 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-6 animate-bounce shadow-glow-brand">
        <Gamepad2 :size="32" aria-hidden="true" />
      </div>
      <h2 class="text-2xl font-black font-heading mb-2">Đang Khởi Tạo Thế Giới 2D...</h2>
      <p class="text-slate-400 text-sm mb-6">Kết nối Godot 4.6 Web Assembly Canvas</p>
      <div class="w-64 h-2.5 bg-surface-850 rounded-full overflow-hidden border border-surface-750">
        <div class="h-full bg-gradient-to-r from-brand-500 to-gold-400 rounded-full animate-pulse" style="width: 75%" />
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="bridge.status.value === 'error'"
      class="absolute inset-0 flex flex-col items-center justify-center bg-surface-950 text-white z-20 p-6 text-center"
    >
      <div class="w-16 h-16 rounded-3xl bg-brand-950/80 border border-brand-800 flex items-center justify-center text-brand-400 mb-6">
        <AlertTriangle :size="32" aria-hidden="true" />
      </div>
      <h2 class="text-2xl font-black font-heading mb-2">Không Thể Tải Thế Giới 2D</h2>
      <p class="text-slate-400 text-sm mb-8 max-w-md">
        {{ bridge.error.value || 'Gặp sự cố khi khởi tạo WebAssembly. Vui lòng thử lại.' }}
      </p>
      <div class="flex flex-wrap gap-3.5 justify-center">
        <button
          type="button"
          class="min-h-[48px] px-6 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-500 shadow-glow-brand transition-all flex items-center gap-2 cursor-pointer"
          @click="handleRetry"
        >
          <RotateCcw :size="16" aria-hidden="true" />
          <span>Thử lại</span>
        </button>
        <NuxtLink
          to="/"
          class="min-h-[48px] px-6 py-3 bg-surface-800 text-slate-200 border border-surface-700 rounded-xl font-bold text-sm hover:bg-surface-750 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Home :size="16" aria-hidden="true" />
          <span>Về trang chủ</span>
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
        class="pointer-events-auto min-h-[40px] px-3.5 py-1.5 bg-surface-950/80 border border-surface-750 backdrop-blur-md text-white rounded-xl text-xs font-bold hover:bg-surface-900 transition-colors flex items-center gap-1.5 shadow-sm"
      >
        <ArrowLeft :size="14" aria-hidden="true" />
        <span>Thoát thế giới</span>
      </NuxtLink>

      <!-- Status indicator -->
      <div
        class="pointer-events-auto px-3.5 py-1.5 bg-surface-950/80 border border-surface-750 backdrop-blur-md text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
      >
        <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span>Godot Bridge: Đã kết nối</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Gamepad2,
  AlertTriangle,
  RotateCcw,
  Home,
  ArrowLeft,
} from 'lucide-vue-next';
import { NuxtToGodotEvent, GodotToNuxtEvent } from '@linguaworld/shared-types';

definePageMeta({
  layout: 'game',
});

const router = useRouter();
const gameIframeRef = ref<HTMLIFrameElement | null>(null);

const gameIframeSrc = '/game/index.html';
const bridge = useGameBridge(gameIframeRef);

onMounted(() => {
  bridge.on(GodotToNuxtEvent.INTERACT_NPC, async (payload: any) => {
    console.log('[World] Player interacted with NPC:', payload);
    try {
      // Safely resolve published NPC audio through backend API (§9)
      const res = await $fetch<any>(`/api/audio/resolve?contentType=NPC_DIALOGUE&contentId=npc_village_chief_intro`);
      if (res?.data?.asset?.url) {
        bridge.send(NuxtToGodotEvent.PLAY_AUDIO, {
          assetId: res.data.asset.id,
          audioUrl: res.data.asset.url,
          sourceText: res.data.asset.sourceText,
          speakerId: payload.npcId,
        });
      }
    } catch (e) {
      console.warn('[World] Failed to resolve NPC audio via bridge:', e);
    }
  });

  bridge.on(GodotToNuxtEvent.AUDIO_STATUS, (payload: any) => {
    console.log('[World] Audio status from game:', payload);
  });
});

function handleIframeLoad() {
  console.log('[World] Game iframe loaded');
}

function handleRetry() {
  bridge.retry();
}
</script>
