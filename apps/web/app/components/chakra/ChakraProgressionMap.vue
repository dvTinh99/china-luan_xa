<template>
  <div class="relative overflow-hidden rounded-3xl bg-wood-900 border-2 border-wood-750 p-6 sm:p-7 shadow-rpg-panel">
    <!-- Ambient Background Glow matching selected chakra -->
    <div
      class="absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
      :style="{ backgroundColor: selectedChakra?.colorHex || '#EF4444' }"
    />
    <div
      class="absolute -left-20 -bottom-20 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700"
      :style="{ backgroundColor: activeChakra?.colorHex || '#EF4444' }"
    />

    <!-- Header: Title & Decoupled Progression Clarification -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-wood-800 pb-4 mb-6">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 via-amber-500 to-purple-600 p-0.5 shadow-sm flex items-center justify-center">
            <div class="w-full h-full bg-wood-950 rounded-[10px] flex items-center justify-center text-amber-300">
              <Zap :size="15" />
            </div>
          </div>
          <h2 class="text-lg sm:text-xl font-black font-heading text-white tracking-tight">
            {{ tDual('chakra.progressionTitle', '七轮里程碑 • 语言学') }}
          </h2>
        </div>
        <p class="text-xs text-amber-200/60 leading-relaxed">
          {{ tDual('chakra.progressionDesc', '以真实 FSRS 记忆力衡量语言水准 — 独立于等级数值。') }}
        </p>
      </div>

      <!-- Active Chakra Aura Indicator -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-wood-950 border border-wood-800 text-xs shrink-0 self-start sm:self-auto">
        <span
          class="w-3 h-3 rounded-full animate-ping"
          :style="{ backgroundColor: activeChakra?.colorHex || '#EF4444' }"
        />
        <span class="text-amber-200/70 font-medium">{{ tDual('chakra.currentAura', '当前运转真气') }}:</span>
        <span class="font-bold text-white">{{ activeChakra?.nameZh || '海底轮' }} ({{ t('chakraNames.t' + (activeChakra?.tier || 1)) }})</span>
      </div>
    </div>

    <!-- Main Grid: 7-Chakra Column (Left/Center) + Diagnostic Detail Panel (Right) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- 7-Chakra Vertical Energy Spine (5 Columns on Desktop) -->
      <div class="lg:col-span-5 flex flex-col space-y-2.5 relative">
        <!-- Connecting Vertical Energy Flow Line -->
        <div class="absolute left-7 top-6 bottom-6 w-1 bg-gradient-to-b from-purple-500 via-emerald-400 to-red-500 opacity-25 rounded-full -z-0" />

        <button
          v-for="chakra in chakraList"
          :key="chakra.tier"
          type="button"
          @click="selectChakra(chakra)"
          class="relative w-full text-left p-3.5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3.5 group cursor-pointer overflow-hidden z-10"
          :class="[
            selectedChakra?.tier === chakra.tier
              ? 'bg-wood-950 shadow-rpg-card-lift'
              : 'bg-wood-950/60 hover:bg-wood-950/90',
            selectedChakra?.tier === chakra.tier
              ? 'border-gold-400'
              : chakra.isUnlocked
                ? 'border-emerald-500/40'
                : chakra.tier === activeTier
                  ? 'border-gold-500/50'
                  : 'border-wood-800/80 opacity-70'
          ]"
        >
          <!-- Left: Chakra Orb Icon with Aura Color Glow -->
          <div
            class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-transform duration-300 group-hover:scale-105 relative"
            :style="{
              borderColor: chakra.colorHex,
              backgroundColor: `${chakra.colorHex}22`,
              boxShadow: chakra.isUnlocked || chakra.tier === activeTier ? `0 0 16px ${chakra.colorHex}44` : 'none'
            }"
          >
            <span v-if="chakra.isUnlocked" class="text-xs font-black" :style="{ color: chakra.colorHex }">
              ✓
            </span>
            <span v-else-if="chakra.tier === activeTier" class="text-xs font-black font-mono animate-pulse" :style="{ color: chakra.colorHex }">
              {{ chakra.tier }}
            </span>
            <Lock v-else :size="13" class="text-slate-500" />

            <!-- Mini Ping Indicator for active tier -->
            <span
              v-if="chakra.tier === activeTier"
              class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
              :style="{ backgroundColor: chakra.colorHex }"
            />
          </div>

          <!-- Middle: Tier Name, Element, HSK Band -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1.5">
              <span class="text-xs font-black font-heading text-white truncate group-hover:text-gold-300 transition-colors">
                {{ chakra.nameZh || '脉轮' }} ({{ t('chakraNames.t' + chakra.tier) }})
              </span>
              <span
                class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md"
                :class="chakra.isUnlocked ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-wood-900 text-amber-200/60'"
              >
                {{ chakra.progressPercent }}%
              </span>
            </div>

            <div class="flex items-center gap-2 text-[11px] text-amber-200/50 mt-0.5">
              <span>{{ chakra.elementZh || chakra.elementVi }}</span>
              <span>•</span>
              <span class="font-medium text-amber-200/70">{{ chakra.hskBand }}</span>
            </div>

            <!-- Mini Progress Line -->
            <div class="w-full h-1.5 bg-wood-900 rounded-full overflow-hidden mt-1.5 border border-wood-800">
              <div
                class="h-full rounded-full transition-all duration-500"
                :style="{
                  width: `${Math.min(100, Math.max(0, chakra.progressPercent))}%`,
                  backgroundColor: chakra.colorHex
                }"
              />
            </div>
          </div>
        </button>
      </div>

      <!-- Right: Detailed Diagnostic Panel (Non-punitive Flow) (7 Columns on Desktop) -->
      <div
        v-if="selectedChakra"
        class="lg:col-span-7 rounded-2xl bg-wood-950/80 border-2 border-wood-750 p-5 sm:p-6 space-y-5 relative overflow-hidden"
      >
        <!-- Header of Selected Chakra -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-wood-800 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span
                class="w-3.5 h-3.5 rounded-full shadow-sm"
                :style="{ backgroundColor: selectedChakra.colorHex }"
              />
              <h3 class="text-base sm:text-lg font-black font-heading text-white">
                {{ selectedChakra.nameZh || '脉轮' }} ({{ t('chakraNames.t' + selectedChakra.tier) }})
              </h3>
            </div>
            <p class="text-xs text-amber-200/70 mt-1">
              {{ selectedChakra.descriptionZh ? tDual('chakra.philosophy', selectedChakra.descriptionZh) : selectedChakra.descriptionZh }}
            </p>
          </div>

          <!-- Status Badge -->
          <div class="shrink-0">
            <span
              v-if="selectedChakra.isUnlocked"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold"
            >
              <CheckCircle2 :size="13" />
              <span>{{ tDual('chakra.unlockedComplete', '已完全觉醒') }}</span>
            </span>
            <span
              v-else-if="selectedChakra.tier === activeTier"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40 text-xs font-bold animate-pulse"
            >
              <Sparkles :size="13" />
              <span>{{ tDual('chakra.training', '修炼中') }}</span>
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-wood-850 text-slate-400 border border-wood-750 text-xs font-medium"
            >
              <Lock :size="12" />
              <span>{{ tDual('chakra.notMet', '未满足条件') }}</span>
            </span>
          </div>
        </div>

        <!-- Metric 1: Retained Vocabulary & FSRS Stability -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="p-3.5 rounded-xl bg-wood-900 border border-wood-800 flex flex-col justify-between">
            <div class="text-[11px] text-amber-200/60 uppercase font-bold flex items-center justify-between">
              <span>{{ tDual('chakra.retainedVocabTitle', '达到保持度的词汇 (FSRS)') }}</span>
              <BookOpen :size="13" class="text-gold-400" />
            </div>
            <div class="text-xl font-black font-heading text-white my-1">
              <span class="text-gold-300">{{ selectedChakra.retainedVocabCount }}</span>
              <span class="text-sm text-amber-200/50 font-normal"> / {{ selectedChakra.targetVocabCount }} {{ tDual('hero.vocab', '词') }}</span>
            </div>
            <div class="text-[11px] text-amber-200/50">
              {{ tDual('chakra.stabilityReq', '记忆稳定性要求') }}: <span class="text-slate-300 font-mono">≥ {{ selectedChakra.requiredStabilityDays }} {{ t('chakra.days') }}</span>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-wood-900 border border-wood-800 flex flex-col justify-between">
            <div class="text-[11px] text-amber-200/60 uppercase font-bold flex items-center justify-between">
              <span>{{ tDual('chakra.stabilityTitle', '记忆稳定性 (Stability)') }}</span>
              <Shield :size="13" class="text-emerald-400" />
            </div>
            <div class="text-xl font-black font-heading text-emerald-400 my-1 font-mono">
              {{ selectedChakra.avgStability }} <span class="text-xs text-amber-200/50 font-sans font-normal">{{ t('chakra.days') }}</span>
            </div>
            <div class="text-[11px] text-amber-200/50">
              算法: <span class="text-slate-300 font-mono">FSRS-v1 Authoritative</span>
            </div>
          </div>
        </div>

        <!-- Metric 2: 4-Core Skills Breakdown -->
        <div class="space-y-2.5 p-4 rounded-xl bg-wood-900/90 border border-wood-800">
          <div class="text-xs font-bold text-white flex items-center justify-between mb-1">
            <span>{{ tDual('chakra.skillsTitle', '实际语言技能能力') }}</span>
            <span class="text-[11px] text-amber-200/60">{{ tDual('chakra.accuracy', '准确率') }}</span>
          </div>

          <!-- Skill 1: Listening -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs">
              <span class="text-amber-200/80 flex items-center gap-1.5">
                <Headphones :size="12" class="text-sky-400" />
                <span>{{ tDual('chakra.listeningSkill', '听力与拼音发音') }}</span>
              </span>
              <span class="font-mono font-bold text-slate-200">{{ Math.round((selectedChakra.listeningAccuracy || 0.85) * 100) }}%</span>
            </div>
            <div class="w-full h-1.5 bg-wood-950 rounded-full overflow-hidden">
              <div
                class="h-full bg-sky-500 rounded-full"
                :style="{ width: `${Math.round((selectedChakra.listeningAccuracy || 0.85) * 100)}%` }"
              />
            </div>
          </div>

          <!-- Skill 2: Reading -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs">
              <span class="text-amber-200/80 flex items-center gap-1.5">
                <BookOpen :size="12" class="text-emerald-400" />
                <span>{{ tDual('chakra.readingSkill', '阅读理解与词汇配对') }}</span>
              </span>
              <span class="font-mono font-bold text-slate-200">{{ Math.round((selectedChakra.readingAccuracy || 0.85) * 100) }}%</span>
            </div>
            <div class="w-full h-1.5 bg-wood-950 rounded-full overflow-hidden">
              <div
                class="h-full bg-emerald-500 rounded-full"
                :style="{ width: `${Math.round((selectedChakra.readingAccuracy || 0.85) * 100)}%` }"
              />
            </div>
          </div>

          <!-- Skill 3: Writing -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs">
              <span class="text-amber-200/80 flex items-center gap-1.5">
                <PenTool :size="12" class="text-amber-400" />
                <span>{{ tDual('chakra.writingSkill', '笔顺规则与书写') }}</span>
              </span>
              <span class="font-mono font-bold text-slate-200">{{ Math.round((selectedChakra.writingAccuracy || 0.85) * 100) }}%</span>
            </div>
            <div class="w-full h-1.5 bg-wood-950 rounded-full overflow-hidden">
              <div
                class="h-full bg-amber-500 rounded-full"
                :style="{ width: `${Math.round((selectedChakra.writingAccuracy || 0.85) * 100)}%` }"
              />
            </div>
          </div>

          <!-- Skill 4: Character & Radicals -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs">
              <span class="text-amber-200/80 flex items-center gap-1.5">
                <Layers :size="12" class="text-purple-400" />
                <span>{{ tDual('chakra.radicalSkill', '汉字识别与偏旁部首') }}</span>
              </span>
              <span class="font-mono font-bold text-slate-200">{{ Math.round((selectedChakra.characterAccuracy || 0.85) * 100) }}%</span>
            </div>
            <div class="w-full h-1.5 bg-wood-950 rounded-full overflow-hidden">
              <div
                class="h-full bg-purple-500 rounded-full"
                :style="{ width: `${Math.round((selectedChakra.characterAccuracy || 0.85) * 100)}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Diagnostic & Flow Unblocking Banner -->
        <div class="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
             :class="selectedChakra.bottleneckSkill ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'">
          <div>
            <div class="flex items-center gap-2 text-xs font-bold"
                 :class="selectedChakra.bottleneckSkill ? 'text-amber-300' : 'text-emerald-300'">
              <AlertCircle v-if="selectedChakra.bottleneckSkill" :size="14" />
              <Sparkles v-else :size="14" />
              <span>{{ tDual('chakra.diagnosticFlow', '疏通气流诊断') }}</span>
            </div>
            <p class="text-xs text-amber-100/80 mt-1 leading-relaxed">
              {{ getBottleneckText(selectedChakra.bottleneckSkill) }}
            </p>
          </div>

          <NuxtLink
            :to="getRemedyLink(selectedChakra.bottleneckSkill)"
            class="px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm transition-all"
            :class="selectedChakra.bottleneckSkill
              ? 'bg-amber-500 hover:bg-amber-400 text-wood-950 shadow-rpg-glow-gold'
              : 'bg-wood-850 hover:bg-wood-800 text-white border border-wood-750'"
          >
            <span>{{ getRemedyActionLabel(selectedChakra.bottleneckSkill) }}</span>
            <ArrowRight :size="13" />
          </NuxtLink>
        </div>

        <!-- Cosmetic Reward Showcase -->
        <div class="flex items-center justify-between p-3.5 rounded-xl bg-wood-900 border border-wood-800 text-xs">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center border"
              :style="{ borderColor: selectedChakra.colorHex, backgroundColor: `${selectedChakra.colorHex}22` }"
            >
              <Sparkles :size="15" :style="{ color: selectedChakra.colorHex }" />
            </div>
            <div>
              <div class="font-bold text-white">{{ selectedChakra.rewardItemName }}</div>
              <div class="text-[11px] text-amber-200/60">{{ tDual('chakra.rewardAuraDesc', '2D世界专属光环外观') }}</div>
            </div>
          </div>

          <span
            class="px-2.5 py-1 rounded-full font-bold text-[10px]"
            :class="selectedChakra.rewardClaimed
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-wood-800 text-amber-200/50'"
          >
            {{ selectedChakra.rewardClaimed ? tDual('chakra.rewardClaimed', '已领取奖励') : tDual('chakra.reach100ToUnlock', '达到100%解锁') }}
          </span>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Zap,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Shield,
  Headphones,
  PenTool,
  Layers,
  ArrowRight,
} from 'lucide-vue-next';
import { useOriginLanguage } from '~/composables/useOriginLanguage';

const { t, tDual } = useOriginLanguage();

interface ChakraItem {
  tier: number;
  code: string;
  nameZh?: string;
  nameVi: string;
  sanskritName: string;
  hskBand: string;
  elementZh?: string;
  elementVi: string;
  colorHex: string;
  bgGradient: string;
  targetVocabCount: number;
  requiredStabilityDays: number;
  rewardItemCode: string;
  rewardItemName: string;
  regionCode: string;
  regionNameVi: string;
  descriptionZh?: string;
  descriptionVi: string;
  progressPercent: number;
  retainedVocabCount: number;
  avgStability: number;
  listeningAccuracy: number;
  readingAccuracy: number;
  writingAccuracy: number;
  characterAccuracy: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  rewardClaimed: boolean;
  bottleneckSkill: string | null;
}

const chakraList = ref<ChakraItem[]>([]);
const activeTier = ref<number>(1);
const selectedChakra = ref<ChakraItem | null>(null);

const activeChakra = computed(() => {
  return chakraList.value.find((c) => c.tier === activeTier.value) || chakraList.value[0];
});

function selectChakra(chakra: ChakraItem) {
  selectedChakra.value = chakra;
}

function getBottleneckText(skill: string | null | undefined): string {
  if (skill === 'retention') {
    return tDual('remedies.retentionText', 'FSRS 记忆稳定性积累偏缓，建议复习到期卡片以稳固根基。');
  }
  if (skill === 'character') {
    return tDual('remedies.characterText', '汉字识别率与部首掌握未达标准，需静心凝练214部首。');
  }
  if (skill === 'listening') {
    return tDual('remedies.listeningText', '拼音辨音反射敏锐度需提升，请多加聆听发音卡片。');
  }
  if (skill === 'writing') {
    return tDual('remedies.writingText', '汉字笔顺书写规范尚待精进，请完成笔顺轨迹修炼。');
  }
  if (skill === 'reading') {
    return tDual('remedies.readingText', '组词成句与篇章理解需加强，建议多练习词语连结。');
  }
  return tDual('remedies.perfectText', '真气周天畅通无阻！未检测到任何修行瓶颈。');
}

function getRemedyActionLabel(skill: string | null | undefined): string {
  if (skill === 'retention') return tDual('remedies.retentionAction', '前往复习台');
  if (skill === 'character') return tDual('remedies.characterAction', '修炼汉字与部首');
  if (skill === 'listening') return tDual('remedies.listeningAction', '强化拼音听力');
  if (skill === 'writing') return tDual('remedies.writingAction', '练习笔顺笔画');
  return tDual('remedies.perfectAction', '继续修行关卡');
}

function getRemedyLink(skill: string | null | undefined): string {
  if (skill === 'retention') return '/review';
  return '/learn';
}

async function fetchChakraStatus() {
  try {
    const res = await $fetch<any>('/api/chakra/status');
    if (res?.data?.chakras) {
      chakraList.value = res.data.chakras;
      activeTier.value = res.data.activeChakraTier || 1;
      // Default selected chakra to active tier or Tier 1
      selectedChakra.value =
        chakraList.value.find((c) => c.tier === activeTier.value) ||
        chakraList.value[0];
    }
  } catch (err) {
    console.warn('Failed to load chakra status, using fallback:', err);
  }
}

onMounted(() => {
  fetchChakraStatus();
});
</script>
