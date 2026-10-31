<template>
  <div class="rounded-3xl bg-wood-900/90 border-2 border-wood-750 p-5 sm:p-6 shadow-rpg-panel space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-wood-800 pb-3">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
          <Shield :size="18" />
        </div>
        <div>
          <h2 class="text-base font-bold font-heading text-white">{{ stats.name }}</h2>
          <span class="text-xs font-bold text-gold-400">Hiệp Khách Cấp {{ stats.level }}</span>
        </div>
      </div>

      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-wood-800 text-amber-200/70 border border-wood-700">
        Chỉ số RPG
      </span>
    </div>

    <!-- Health Bar -->
    <div>
      <div class="flex justify-between text-xs font-bold mb-1">
        <span class="text-amber-200/80 flex items-center gap-1.5">
          <Heart :size="13" class="text-emerald-400" />
          <span>Sinh lực (HP)</span>
        </span>
        <span class="text-emerald-400 font-mono">{{ stats.hp }} / {{ stats.effectiveMaxHp }}</span>
      </div>
      <div class="h-2.5 rounded-full bg-wood-950 overflow-hidden border border-wood-800">
        <div
          class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
          :style="{ width: `${Math.min(100, Math.round((stats.hp / stats.effectiveMaxHp) * 100))}%` }"
        />
      </div>
    </div>

    <!-- EXP Bar -->
    <div>
      <div class="flex justify-between text-xs font-bold mb-1">
        <span class="text-amber-200/80 flex items-center gap-1.5">
          <Zap :size="13" class="text-purple-400" />
          <span>Kinh nghiệm (EXP)</span>
        </span>
        <span class="text-purple-400 font-mono">{{ stats.exp }} / {{ stats.nextLevelExp }}</span>
      </div>
      <div class="h-2.5 rounded-full bg-wood-950 overflow-hidden border border-wood-800">
        <div
          class="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-300"
          :style="{ width: `${Math.min(100, Math.round((stats.exp / stats.nextLevelExp) * 100))}%` }"
        />
      </div>
    </div>

    <!-- Attributes Grid (ATK, DEF, LUCK) -->
    <div class="grid grid-cols-3 gap-2.5 pt-1">
      <div class="p-3 rounded-2xl bg-wood-950 border border-wood-800 text-center">
        <div class="text-[10px] text-amber-200/50 uppercase font-bold flex items-center justify-center gap-1">
          <Sword :size="11" class="text-red-400" />
          <span>Tấn công</span>
        </div>
        <div class="text-base font-black font-heading text-red-300 mt-0.5">
          {{ stats.atk }}
        </div>
      </div>

      <div class="p-3 rounded-2xl bg-wood-950 border border-wood-800 text-center">
        <div class="text-[10px] text-amber-200/50 uppercase font-bold flex items-center justify-center gap-1">
          <ShieldAlert :size="11" class="text-sky-400" />
          <span>Phòng thủ</span>
        </div>
        <div class="text-base font-black font-heading text-sky-300 mt-0.5">
          {{ stats.def }}
        </div>
      </div>

      <div class="p-3 rounded-2xl bg-wood-950 border border-wood-800 text-center">
        <div class="text-[10px] text-amber-200/50 uppercase font-bold flex items-center justify-center gap-1">
          <Sparkle :size="11" class="text-gold-400" />
          <span>May mắn</span>
        </div>
        <div class="text-base font-black font-heading text-gold-300 mt-0.5">
          {{ stats.luck }}
        </div>
      </div>
    </div>

    <!-- Active Gear Stat Bonuses -->
    <div
      v-if="stats.gearBonusExpPercent > 0 || stats.gearHpBonus > 0"
      class="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-xs flex items-center justify-between"
    >
      <span class="text-purple-300 font-bold flex items-center gap-1.5">
        <Sparkles :size="14" class="text-purple-400" />
        <span>Cộng hưởng từ trang bị</span>
      </span>
      <span class="text-gold-300 font-bold font-heading">
        +{{ stats.gearBonusExpPercent }}% EXP / +{{ stats.gearHpBonus }} HP
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Shield,
  Heart,
  Zap,
  Sword,
  ShieldAlert,
  Sparkle,
  Sparkles,
} from 'lucide-vue-next';
import type { CharacterStats } from '../../types/character';

defineProps<{
  stats: CharacterStats;
}>();
</script>

