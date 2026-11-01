<template>
  <div class="relative w-full h-[360px] sm:h-[460px] rounded-3xl bg-gradient-to-b from-wood-850/80 via-wood-900/90 to-wood-950 border-2 border-wood-750 p-4 overflow-hidden flex flex-col justify-between shadow-rpg-panel group">
    <!-- Cozy Room Fantasy Backdrop Detail -->
    <div class="absolute -right-16 -top-16 w-56 h-56 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -left-16 bottom-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

    <!-- Stage Top Bar: Badge & Emote Pills -->
    <div class="relative z-10 flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-400/30 flex items-center gap-1.5 shadow-sm">
          <Sparkles :size="12" class="text-gold-400" />
          <span>2D Chibi Studio</span>
        </span>
        <span class="text-[10px] text-amber-200/50 font-bold hidden sm:inline">PixiJS 8 Rig</span>
      </div>

      <!-- Emote Reaction Controls (CHARACTER_CONCEPT.md 6 Canonical Expressions) -->
      <div class="flex items-center gap-1 bg-wood-950/80 border border-wood-800 p-1 rounded-2xl overflow-x-auto max-w-full">
        <button
          type="button"
          @click="handleEmote('idle')"
          title="Tự nhiên (Neutral)"
          class="px-2 py-1 rounded-xl text-xs transition-all cursor-pointer hover:bg-wood-800"
          :class="activeEmote === 'idle' ? 'bg-gold-500 text-wood-950 font-bold shadow-sm' : 'text-amber-200/70'"
        >
          ✨
        </button>
        <button
          type="button"
          @click="handleEmote('happy')"
          title="Vui vẻ (Happy)"
          class="px-2 py-1 rounded-xl text-xs transition-all cursor-pointer hover:bg-wood-800"
          :class="activeEmote === 'happy' ? 'bg-gold-500 text-wood-950 font-bold shadow-sm' : 'text-amber-200/70'"
        >
          😊
        </button>
        <button
          type="button"
          @click="handleEmote('curious')"
          title="Tò mò - Nghiêng đầu (Curious)"
          class="px-2 py-1 rounded-xl text-xs transition-all cursor-pointer hover:bg-wood-800"
          :class="activeEmote === 'curious' ? 'bg-gold-500 text-wood-950 font-bold shadow-sm' : 'text-amber-200/70'"
        >
          🧐
        </button>
        <button
          type="button"
          @click="handleEmote('surprised')"
          title="Ngạc nhiên (Surprised)"
          class="px-2 py-1 rounded-xl text-xs transition-all cursor-pointer hover:bg-wood-800"
          :class="activeEmote === 'surprised' ? 'bg-gold-500 text-wood-950 font-bold shadow-sm' : 'text-amber-200/70'"
        >
          😮
        </button>
        <button
          type="button"
          @click="handleEmote('sleepy')"
          title="Buồn ngủ (Sleepy)"
          class="px-2 py-1 rounded-xl text-xs transition-all cursor-pointer hover:bg-wood-800"
          :class="activeEmote === 'sleepy' ? 'bg-gold-500 text-wood-950 font-bold shadow-sm' : 'text-amber-200/70'"
        >
          😴
        </button>
        <button
          type="button"
          @click="handleEmote('proud')"
          title="Tự hào - Ánh sao (Proud)"
          class="px-2 py-1 rounded-xl text-xs transition-all cursor-pointer hover:bg-wood-800"
          :class="activeEmote === 'proud' ? 'bg-gold-500 text-wood-950 font-bold shadow-sm' : 'text-amber-200/70'"
        >
          ⭐
        </button>
        <button
          type="button"
          @click="handleEmote('breathe')"
          title="Tĩnh tâm thở nhẹ (Breathe)"
          class="px-2 py-1 rounded-xl text-xs transition-all cursor-pointer hover:bg-wood-800"
          :class="activeEmote === 'breathe' ? 'bg-gold-500 text-wood-950 font-bold shadow-sm' : 'text-amber-200/70'"
        >
          🧘
        </button>
      </div>
    </div>

    <!-- Canvas Container -->
    <div ref="canvasContainerRef" class="relative flex-1 w-full flex items-center justify-center overflow-hidden">
      <!-- Loading Indicator -->
      <div v-if="isInitializing" class="absolute inset-0 flex flex-col items-center justify-center text-amber-200/60 space-y-2">
        <Loader2 :size="28" class="animate-spin text-gold-400" />
        <span class="text-xs font-bold">Đang khởi tạo Chibi Rig...</span>
      </div>

      <!-- WebGL Fallback State -->
      <div v-if="hasError" class="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-wood-950/90 rounded-2xl border border-red-500/30 text-amber-200/80">
        <AlertTriangle :size="32" class="text-red-400 mb-2" />
        <div class="text-sm font-bold text-white mb-1">Không thể khởi tạo WebGL</div>
        <p class="text-xs text-amber-200/60 max-w-xs">
          Trình duyệt của bạn có thể đang tắt tính năng tăng tốc phần cứng WebGL.
        </p>
      </div>
    </div>

    <!-- Stage Bottom Info & Hint -->
    <div class="relative z-10 flex items-center justify-between text-[11px] text-amber-200/50 pt-2 border-t border-wood-800/60">
      <span>Luma Chibi • Cel-Shading 2D • 60 FPS</span>
      <span class="font-mono text-gold-400 font-bold">Thao tác trực tiếp</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles, Loader2, AlertTriangle } from 'lucide-vue-next';
import type { CharacterAppearanceState, CharacterEmote } from '../../types/character';
import { PixiChibiCharacterEngine } from '../../services/character/pixi-character-engine.client';

const props = defineProps<{
  appearance: CharacterAppearanceState;
  activeEmote: CharacterEmote;
}>();

const emit = defineEmits<{
  (e: 'update:activeEmote', emote: CharacterEmote): void;
}>();

const canvasContainerRef = ref<HTMLDivElement | null>(null);
const isInitializing = ref(true);
const hasError = ref(false);

let engine: PixiChibiCharacterEngine | null = null;

function handleEmote(emote: CharacterEmote) {
  emit('update:activeEmote', emote);
  if (engine) {
    engine.setEmote(emote);
  }
}

onMounted(async () => {
  if (!canvasContainerRef.value) return;

  try {
    engine = new PixiChibiCharacterEngine(props.appearance);
    await engine.init(canvasContainerRef.value);
    isInitializing.value = false;
  } catch (err) {
    console.error('[CharacterStage] Failed to initialize PixiJS engine:', err);
    hasError.value = true;
    isInitializing.value = false;
  }
});

onUnmounted(() => {
  if (engine) {
    engine.destroy();
    engine = null;
  }
});

// Watch appearance changes to re-skin on the fly without canvas tear-down!
watch(
  () => props.appearance,
  (newApp) => {
    if (engine && newApp) {
      engine.updateAppearance(newApp);
    }
  },
  { deep: true }
);

watch(
  () => props.activeEmote,
  (newEmote) => {
    if (engine && newEmote) {
      engine.setEmote(newEmote);
    }
  }
);
</script>

