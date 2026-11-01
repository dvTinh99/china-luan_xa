<template>
  <div class="relative w-full h-[360px] sm:h-[460px] rounded-3xl bg-gradient-to-b from-wood-850/80 via-wood-900/90 to-wood-950 border-2 border-wood-750 p-4 overflow-hidden flex flex-col justify-between shadow-rpg-panel group">
    <!-- Cozy Room Fantasy Backdrop Detail -->
    <div
      class="absolute inset-0 bg-cover bg-center opacity-35 pointer-events-none mix-blend-overlay"
      style="background-image: url('/assets/character/ui/stage_backdrop_cozy.png')"
    />
    <div class="absolute -right-16 -top-16 w-56 h-56 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -left-16 bottom-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

    <!-- Stage Top Bar: View Mode Switcher & Emote Pills -->
    <div class="relative z-10 flex flex-wrap items-center justify-between gap-2">
      <!-- Mode Toggle: 2D HD Anime Art vs WebGL Live Rig -->
      <div class="flex items-center gap-1 bg-wood-950/80 border border-wood-800 p-1 rounded-2xl shrink-0">
        <button
          type="button"
          @click="stageMode = 'art'"
          title="Minh họa 2D Anime chuẩn nghệ thuật (Official HD Art)"
          class="px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          :class="stageMode === 'art' ? 'bg-gold-500 text-wood-950 shadow-sm' : 'text-amber-200/60 hover:text-white'"
        >
          <Palette :size="12" />
          <span>Minh Họa 2D</span>
        </button>
        <button
          type="button"
          @click="stageMode = 'rig'"
          title="Live Rig Chibi hoạt họa WebGL (PixiJS 8)"
          class="px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          :class="stageMode === 'rig' ? 'bg-gold-500 text-wood-950 shadow-sm' : 'text-amber-200/60 hover:text-white'"
        >
          <Layers :size="12" />
          <span>Chibi Rig Live</span>
        </button>
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

    <!-- Center Stage: HD Artwork Display Mode -->
    <div
      v-if="stageMode === 'art'"
      class="relative flex-1 w-full flex items-center justify-center overflow-hidden py-1"
    >
      <!-- Magical Aura / Soft Glow -->
      <div class="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-gold-500/20 via-teal-500/15 to-purple-500/20 blur-3xl pointer-events-none" />

      <!-- High-Def Transparent Anime Artwork with Gentle Hover Floating -->
      <div class="relative z-10 flex flex-col items-center justify-center h-full max-h-[300px] sm:max-h-[370px]">
        <img
          :src="currentArt.src"
          :alt="currentArt.name"
          class="h-full w-auto max-w-[95%] object-contain filter drop-shadow-2xl transition-all duration-500 transform hover:scale-105 select-none animate-float"
        />
      </div>
    </div>

    <!-- Center Stage: PixiJS Live WebGL Canvas Container -->
    <div
      v-show="stageMode === 'rig'"
      ref="canvasContainerRef"
      class="relative flex-1 w-full flex items-center justify-center overflow-hidden"
    >
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
      <span class="flex items-center gap-1.5 font-medium text-amber-200/90">
        <Sparkles :size="12" class="text-gold-400 shrink-0" />
        <span class="truncate max-w-[240px] sm:max-w-md font-heading font-semibold">{{ currentArt.name }}</span>
      </span>
      <span class="font-mono text-gold-400 font-bold hidden sm:inline">
        {{ stageMode === 'art' ? 'Official Nano MCP 2D Art' : 'WebGL 60 FPS' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Sparkles, Loader2, AlertTriangle, Palette, Layers } from 'lucide-vue-next';
import type { CharacterAppearanceState, CharacterEmote } from '../../types/character';
import { PixiChibiCharacterEngine } from '../../services/character/pixi-character-engine.client';

const props = defineProps<{
  appearance: CharacterAppearanceState;
  activeEmote: CharacterEmote;
}>();

const emit = defineEmits<{
  (e: 'update:activeEmote', emote: CharacterEmote): void;
}>();

const stageMode = ref<'art' | 'rig'>('art');
const canvasContainerRef = ref<HTMLDivElement | null>(null);
const isInitializing = ref(true);
const hasError = ref(false);

let engine: PixiChibiCharacterEngine | null = null;

// Registry of approved official artworks
const ART_MAPPING: Record<string, { src: string; name: string }> = {
  // Canonical Expressions
  'emote_happy': { src: '/assets/character/expressions/expression_happy.png', name: 'Luma • Biểu cảm Vui Vẻ (Happy 😊)' },
  'emote_curious': { src: '/assets/character/expressions/expression_curious.png', name: 'Luma • Biểu cảm Tò Mò (Curious 🧐)' },
  'emote_surprised': { src: '/assets/character/expressions/expression_surprised.png', name: 'Luma • Biểu cảm Ngạc Nhiên (Surprised 😮)' },
  'emote_sleepy': { src: '/assets/character/expressions/expression_sleepy.png', name: 'Luma • Biểu cảm Buồn Ngủ (Sleepy 😴)' },
  'emote_proud': { src: '/assets/character/expressions/expression_proud.png', name: 'Luma • Biểu cảm Tự Hào (Proud ⭐)' },
  'emote_idle': { src: '/assets/character/expressions/expression_idle.png', name: 'Luma • Trạng thái Tự Nhiên (Idle ✨)' },
  'emote_breathe': { src: '/assets/character/expressions/expression_idle.png', name: 'Luma • Tĩnh Tâm Thở Nhẹ (Breathe 🧘)' },

  // Hats & Headgear
  'item_phoenix_crown': { src: '/assets/character/art/luma_equip_phoenix_crown_transparent.png', name: 'Trang Bị: Mão Phượng Hoàng (Phoenix Crown 👑)' },
  'item_straw_hat': { src: '/assets/character/art/luma_equip_straw_hat_transparent.png', name: 'Trang Bị: Nón Lá Tiêu Dao (Straw Hat 🌾)' },
  'item_scholar_hat': { src: '/assets/character/art/luma_equip_scholar_hat_transparent.png', name: 'Trang Bị: Mũ Nho Sinh (Scholar’s Cap 🎓)' },

  // Outfits & Robes
  'item_dragon_armor': { src: '/assets/character/art/luma_equip_dragon_armor_transparent.png', name: 'Trang Bị: Chiến Bào Kim Long (Golden Dragon Armor 🐉)' },
  'item_silk_robe': { src: '/assets/character/art/luma_equip_silk_robe_transparent.png', name: 'Trang Bị: Trường Bào Lam Điền (Scholar Silk Robe 👘)' },
  'item_leather_vest': { src: '/assets/character/art/luma_equip_leather_vest_transparent.png', name: 'Trang Bị: Áo Da Lữ Khách (Wanderer Leather Vest 🦺)' },

  // Hairstyle Variations
  'hair_wanderer': { src: '/assets/character/art/luma_hair_wanderer_transparent.png', name: 'Kiểu Tóc: Kiếm Khách Lãng Tử (Wanderer Hair 🗡️)' },
  'hair_topknot': { src: '/assets/character/art/luma_hair_topknot_transparent.png', name: 'Kiểu Tóc: Búi Tóc Nho Sinh (Scholar Topknot 📜)' },
  'hair_long_fantasy': { src: '/assets/character/art/luma_hair_long_fantasy_transparent.png', name: 'Kiểu Tóc: Tóc Tiên Tung Bay (Long Fairy Hair 🧚)' },

  // Accessories & Weapons
  'acc_round_glasses': { src: '/assets/character/art/luma_equip_round_glasses_transparent.png', name: 'Phụ Kiện: Kính Tròn Học Giả (Round Glasses 👓)' },
  'acc_small_scarf': { src: '/assets/character/art/luma_equip_small_scarf_transparent.png', name: 'Phụ Kiện: Khăn Len Ấm Áp (Cozy Scarf 🧣)' },
  'acc_decorative_necklace': { src: '/assets/character/art/luma_equip_amber_necklace_transparent.png', name: 'Phụ Kiện: Dây Chuyền Ngọc Hổ Phách (Amber Necklace 📿)' },
  'item_jade_pendant': { src: '/assets/character/art/luma_equip_jade_pendant_transparent.png', name: 'Phụ Kiện: Ngọc Bội Bình An (Peace Jade Pendant 🟢)' },
  'item_wooden_sword': { src: '/assets/character/art/luma_equip_wooden_sword_transparent.png', name: 'Vũ Khí: Mộc Kiếm Tân Thủ (Wooden Sword 🗡️)' },
  'item_bamboo_brush': { src: '/assets/character/art/luma_equip_bamboo_brush_transparent.png', name: 'Phụ Kiện: Bút Lông Trúc Lâm (Bamboo Brush 🖌️)' },
};

// Intelligently compute the most specific active visual artwork
const currentArt = computed(() => {
  // 1. Hat equipment priority
  if (props.appearance?.hatId && ART_MAPPING[props.appearance.hatId]) {
    return ART_MAPPING[props.appearance.hatId];
  }
  // 2. Weapon / accessory equipment priority
  if (props.appearance?.accessoryId && ART_MAPPING[props.appearance.accessoryId]) {
    return ART_MAPPING[props.appearance.accessoryId];
  }
  // 3. Outfit equipment priority
  if (props.appearance?.outfitId && props.appearance.outfitId !== 'outfit_luma_tunic' && ART_MAPPING[props.appearance.outfitId]) {
    return ART_MAPPING[props.appearance.outfitId];
  }
  // 4. Hairstyle priority
  if (props.appearance?.hairId && props.appearance.hairId !== 'hair_luma_adventurer' && ART_MAPPING[props.appearance.hairId]) {
    return ART_MAPPING[props.appearance.hairId];
  }
  // 5. Active Emote reaction
  const emoteKey = `emote_${props.activeEmote || 'idle'}`;
  if (ART_MAPPING[emoteKey]) {
    return ART_MAPPING[emoteKey];
  }
  // Default master portrait
  return {
    src: '/assets/character/ui/avatar_luma_portrait.png',
    name: 'Luma (The Little Wanderer) • Chân Dung Gốc',
  };
});

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

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}
</style>
