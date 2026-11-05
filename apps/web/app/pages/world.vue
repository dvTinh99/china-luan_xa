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
      <h2 class="text-2xl font-black font-heading mb-2">{{ tDual('worldDetail.loading2D', '大千世界初始化中...') }}</h2>
      <p class="text-slate-400 text-sm mb-6">{{ t('worldDetail.connectingWasm') }}</p>
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
      <h2 class="text-2xl font-black font-heading mb-2">{{ tDual('worldDetail.errorLoading', '无法加载大千世界') }}</h2>
      <p class="text-slate-400 text-sm mb-8 max-w-md">
        {{ bridge.error.value || t('worldDetail.errorWasmDesc') }}
      </p>
      <div class="flex flex-wrap gap-3.5 justify-center">
        <button
          type="button"
          class="min-h-[48px] px-6 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-500 shadow-glow-brand transition-all flex items-center gap-2 cursor-pointer"
          @click="handleRetry"
        >
          <RotateCcw :size="16" aria-hidden="true" />
          <span>{{ tDual('worldDetail.retry', '重试') }}</span>
        </button>
        <NuxtLink
          to="/"
          class="min-h-[48px] px-6 py-3 bg-surface-800 text-slate-200 border border-surface-700 rounded-xl font-bold text-sm hover:bg-surface-750 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Home :size="16" aria-hidden="true" />
          <span>{{ tDual('worldDetail.backHome', '返回主页') }}</span>
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
      <!-- Back button & Region Tag -->
      <div class="pointer-events-auto flex items-center gap-2">
        <NuxtLink
          to="/"
          class="min-h-[40px] px-3.5 py-1.5 bg-surface-950/80 border border-surface-750 backdrop-blur-md text-white rounded-xl text-xs font-bold hover:bg-surface-900 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <ArrowLeft :size="14" aria-hidden="true" />
          <span>{{ tDual('worldDetail.exitWorld', '离开世界') }}</span>
        </NuxtLink>

        <div class="px-3.5 py-1.5 bg-wood-950/80 border border-wood-750 backdrop-blur-md text-gold-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <MapPin :size="13" class="text-gold-400" />
          <span>{{ tDual('worldDetail.starterVillage', '新手村 (Lv.1+)') }}</span>
        </div>
      </div>

      <!-- Action Buttons & Status -->
      <div class="pointer-events-auto flex items-center gap-2.5">
        <button
          type="button"
          @click="startCombat"
          :disabled="combatLoading"
          class="min-h-[40px] px-4 py-1.5 bg-gradient-to-r from-dragon-600 to-amber-600 hover:from-dragon-500 hover:to-amber-500 border border-gold-400/50 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-rpg-glow-dragon cursor-pointer hover:scale-105"
        >
          <Sword :size="15" />
          <span>{{ tDual('worldDetail.challengeMonster', '挑战魔物') }}</span>
        </button>

        <div
          class="px-3.5 py-1.5 bg-surface-950/80 border border-surface-750 backdrop-blur-md text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
        >
          <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span>Godot 4.6</span>
        </div>
      </div>
    </div>

    <!-- COMBAT OVERLAY MODAL (Turn-based Chinese Learning Battle) -->
    <div
      v-if="isCombatOpen"
      class="fixed inset-0 bg-surface-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div class="bg-wood-900/95 border-2 border-gold-500/50 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between max-h-[92vh]">
        <!-- Battle Header -->
        <div class="flex items-center justify-between border-b border-wood-800 pb-3 mb-4">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-dragon-600/30 text-dragon-300 border border-dragon-500/40">
              {{ tDual('worldDetail.battlefield', '词汇竞技场') }}
            </span>
            <span class="text-xs text-amber-200/60 font-bold">{{ t('worldDetail.turn', { turn: combatSession?.question?.turn || 1, total: combatSession?.question?.totalTurns || 5 }) }}</span>
          </div>

          <button
            type="button"
            @click="fleeCombat"
            class="px-3 py-1 rounded-xl bg-wood-800 hover:bg-wood-750 text-amber-200/60 hover:text-white text-xs font-bold border border-wood-700 cursor-pointer"
          >
            {{ tDual('worldDetail.flee', '逃跑') }}
          </button>
        </div>

        <!-- Combat Arena: Enemy vs Player Cards -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <!-- Enemy Side -->
          <div class="p-4 rounded-2xl bg-wood-950/80 border border-wood-800 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <div class="w-8 h-8 rounded-xl bg-dragon-600/20 border border-dragon-500/40 flex items-center justify-center text-dragon-400">
                  <Flame :size="18" />
                </div>
                <div>
                  <div class="text-xs font-bold text-white leading-tight">{{ combatSession?.enemy?.name }}</div>
                  <div class="text-[10px] text-dragon-400 font-bold">{{ tDual('worldDetail.monsterType', '字灵心魔') }}</div>
                </div>
              </div>

              <!-- Enemy HP Bar -->
              <div class="mt-3">
                <div class="flex justify-between text-[11px] font-bold font-mono text-dragon-300 mb-1">
                  <span>HP</span>
                  <span>{{ combatSession?.enemy?.hp }} / {{ combatSession?.enemy?.maxHp }}</span>
                </div>
                <div class="h-2 rounded-full bg-wood-900 overflow-hidden border border-wood-800">
                  <div
                    class="h-full bg-gradient-to-r from-dragon-600 to-red-500 transition-all duration-300"
                    :style="{ width: `${Math.max(0, Math.min(100, (combatSession?.enemy?.hp / combatSession?.enemy?.maxHp) * 100))}%` }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Player Side -->
          <div class="p-4 rounded-2xl bg-wood-950/80 border border-wood-800 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <div class="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Shield :size="18" />
                </div>
                <div>
                  <div class="text-xs font-bold text-white leading-tight">{{ combatSession?.player?.name }}</div>
                  <div class="text-[10px] text-emerald-400 font-bold">{{ t('worldDetail.playerLevel', { level: combatSession?.player?.level }) }}</div>
                </div>
              </div>

              <!-- Player HP Bar -->
              <div class="mt-3">
                <div class="flex justify-between text-[11px] font-bold font-mono text-emerald-300 mb-1">
                  <span>HP</span>
                  <span>{{ combatSession?.player?.hp }} / {{ combatSession?.player?.maxHp }}</span>
                </div>
                <div class="h-2 rounded-full bg-wood-900 overflow-hidden border border-wood-800">
                  <div
                    class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    :style="{ width: `${Math.max(0, Math.min(100, (combatSession?.player?.hp / combatSession?.player?.maxHp) * 100))}%` }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Feedback Banner -->
        <div v-if="battleMessage" class="mb-4 p-2.5 rounded-xl text-center text-xs font-bold border transition-all animate-fade-in" :class="battleMessageClass">
          {{ battleMessage }}
        </div>

        <!-- Active Combat Question Area (Mandarin Attack Challenge) -->
        <div v-if="!combatFinished" class="space-y-4">
          <div class="p-5 rounded-2xl bg-wood-950/90 border border-wood-750 text-center relative">
            <div class="text-[11px] font-bold text-amber-200/50 uppercase tracking-widest mb-2">
              {{ tDual('worldDetail.spellBook', '绝学出招 • 选取汉字对应释义') }}
            </div>

            <div class="flex items-center justify-center gap-3 mb-2">
              <span class="text-5xl font-black font-hanzi text-white tracking-wider">
                {{ combatSession?.question?.simplified }}
              </span>
              <SpeakerButton
                :text="combatSession?.question?.simplified"
                :audio-url="combatSession?.question?.audioUrl"
                size="md"
              />
            </div>

            <div v-if="pinyinDisplay" class="text-sm font-bold text-gold-400 font-heading">
              {{ combatSession?.question?.pinyin }}
            </div>
          </div>

          <!-- Answer Options (4 Multiple Choice Buttons) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              v-for="(option, idx) in combatSession?.question?.options"
              :key="idx"
              type="button"
              @click="submitCombatAnswer(option)"
              :disabled="combatTurnPending"
              class="p-3.5 rounded-xl border border-wood-750 bg-wood-950/70 hover:bg-wood-800 hover:border-gold-500/50 text-xs font-bold text-slate-100 text-left transition-all flex items-center justify-between cursor-pointer disabled:opacity-50"
            >
              <span>{{ option }}</span>
              <ChevronRight :size="14" class="text-amber-200/40" />
            </button>
          </div>
        </div>

        <!-- VICTORY / DEFEAT MODAL CONCLUSION -->
        <div v-else class="text-center py-4 space-y-4 animate-fade-in">
          <div
            class="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center border-2 shadow-lg"
            :class="combatOutcome === 'VICTORY' ? 'bg-gold-500/20 border-gold-400 text-gold-300' : 'bg-dragon-600/20 border-dragon-500 text-dragon-300'"
          >
            <Trophy v-if="combatOutcome === 'VICTORY'" :size="32" />
            <AlertTriangle v-else :size="32" />
          </div>

          <div>
            <h3 class="text-2xl font-black font-heading text-white">
              {{ combatOutcome === 'VICTORY' ? tDual('worldDetail.victoryTitle', '大获全胜！') : tDual('worldDetail.defeatTitle', '战斗惜败！') }}
            </h3>
            <p class="text-xs text-amber-200/70 mt-1">
              {{ combatOutcome === 'VICTORY' ? t('worldDetail.victoryDesc') : t('worldDetail.defeatDesc') }}
            </p>
          </div>

          <!-- Rewards Grid if Victory -->
          <div v-if="combatOutcome === 'VICTORY' && victoryRewards" class="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div class="p-3 rounded-2xl bg-wood-950 border border-wood-800 text-center">
              <div class="text-[10px] text-amber-200/50 uppercase font-bold">{{ tDual('characterDetail.exp', '经验值') }}</div>
              <div class="text-lg font-black font-heading text-purple-400 mt-0.5">
                +{{ victoryRewards.expEarned }} EXP
              </div>
              <div v-if="victoryRewards.gearBonusExp > 0" class="text-[10px] text-gold-400 font-bold">
                {{ t('worldDetail.gearBonusExp', { bonus: victoryRewards.gearBonusExp }) }}
              </div>
            </div>

            <div class="p-3 rounded-2xl bg-wood-950 border border-wood-800 text-center">
              <div class="text-[10px] text-amber-200/50 uppercase font-bold">{{ tDual('characterDetail.luck', '金币') }}</div>
              <div class="text-lg font-black font-heading text-gold-300 mt-0.5">
                +{{ victoryRewards.goldEarned }} Gold
              </div>
            </div>
          </div>

          <div v-if="victoryRewards?.leveledUp" class="p-2.5 rounded-xl bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-bold">
            🌟 {{ t('lessonDetail.levelUp') }}
          </div>

          <button
            type="button"
            @click="closeCombat"
            class="px-8 py-3 rounded-2xl bg-gold-500 hover:bg-gold-400 text-wood-950 font-bold text-xs shadow-rpg-glow-gold transition-all cursor-pointer"
          >
            {{ tDual('worldDetail.explore', '继续探索') }}
          </button>
        </div>
      </div>
    </div>

    <!-- NPC STORY & CHAKRA DIALOGUE MODAL -->
    <div
      v-if="isNpcDialogueOpen"
      class="fixed inset-0 bg-surface-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div class="bg-wood-900/95 border-2 border-gold-500/50 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-4">
        <!-- Ambient glow -->
        <div class="absolute -right-12 -top-12 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div class="flex items-center justify-between border-b border-wood-800 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-400/40 flex items-center justify-center text-gold-300">
              <MessageSquare :size="20" />
            </div>
            <div>
              <h3 class="text-base font-bold text-white font-heading">{{ npcDialogueData?.name || tDual('worldDetail.elderChenName', '陈老 (Elder Chen)') }}</h3>
              <p class="text-[11px] text-amber-200/60">{{ t('worldDetail.elderChenRole') }}</p>
            </div>
          </div>
          <button
            type="button"
            @click="isNpcDialogueOpen = false"
            class="text-amber-200/60 hover:text-white p-1 rounded-lg hover:bg-wood-800 transition-colors"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Chakra Status Pill -->
        <div class="flex items-center justify-between p-3 rounded-2xl bg-wood-950 border border-wood-800 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-500 shadow-sm animate-pulse" />
            <span class="font-bold text-white">{{ tDual('worldDetail.chakraRootBreath', '周天气息: 海底轮') }}</span>
          </div>
          <span class="font-mono font-bold text-gold-400">{{ chakraProgressPercent }}% {{ t('worldDetail.chakraUnlocked') }}</span>
        </div>

        <!-- Dialogue Message Body -->
        <div class="p-4 rounded-2xl bg-wood-950/80 border border-wood-800/80 text-sm leading-relaxed text-amber-100/90 font-medium">
          {{ npcDialogueData?.message }}
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            @click="isNpcDialogueOpen = false"
            class="px-4 py-2.5 rounded-xl bg-wood-800 hover:bg-wood-750 text-amber-200/70 text-xs font-bold border border-wood-700 transition-colors"
          >
            {{ tDual('common.close', '关闭') }}
          </button>
          <NuxtLink
            to="/learn"
            class="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-wood-950 text-xs font-black shadow-rpg-glow-gold transition-all flex items-center gap-1.5"
          >
            <Sparkles :size="14" />
            <span>{{ tDual('worldDetail.goToLearn', '前往修仙台') }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { pinyinDisplay } = usePinyinDisplay();
import {
  Gamepad2,
  AlertTriangle,
  RotateCcw,
  Home,
  ArrowLeft,
  MapPin,
  Sword,
  Shield,
  Flame,
  ChevronRight,
  Trophy,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-vue-next';
import { NuxtToGodotEvent, GodotToNuxtEvent } from '@linguaworld/shared-types';

definePageMeta({
  layout: 'game',
});

const router = useRouter();
const gameIframeRef = ref<HTMLIFrameElement | null>(null);

const gameIframeSrc = '/game/index.html';
const bridge = useGameBridge(gameIframeRef);

// Combat State
const isCombatOpen = ref(false);
const combatLoading = ref(false);
const combatTurnPending = ref(false);
const combatSession = ref<any>(null);
const combatFinished = ref(false);
const combatOutcome = ref<'VICTORY' | 'DEFEAT' | null>(null);
const victoryRewards = ref<any>(null);
const battleMessage = ref<string | null>(null);
const battleMessageClass = ref('bg-wood-800 text-amber-200 border-wood-700');

// NPC Story & Chakra Dialogue State
const isNpcDialogueOpen = ref(false);
const npcDialogueData = ref<any>(null);
const chakraProgressPercent = ref(49.3);

async function startCombat() {
  combatLoading.value = true;
  combatFinished.value = false;
  combatOutcome.value = null;
  victoryRewards.value = null;
  battleMessage.value = null;

  try {
    const res = await $fetch<any>('/api/combat/start', {
      method: 'POST',
    });

    if (res?.data) {
      combatSession.value = res.data;
      isCombatOpen.value = true;
    }
  } catch (err: any) {
    alert(err?.data?.message || t('worldDetail.cannotStartBattle'));
  } finally {
    combatLoading.value = false;
  }
}

async function submitCombatAnswer(option: string) {
  if (combatTurnPending.value || !combatSession.value) return;

  combatTurnPending.value = true;
  try {
    const res = await $fetch<any>('/api/combat/action', {
      method: 'POST',
      body: {
        combatSessionId: combatSession.value.combatSessionId,
        action: 'attack',
        answer: option,
      },
    });

    const data = res?.data;
    if (!data) return;

    if (data.isCorrect) {
      battleMessage.value = t('worldDetail.battleHit', { damage: data.playerDamage });
      battleMessageClass.value = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    } else {
      battleMessage.value = t('worldDetail.battleMiss', { meaning: data.correctMeaning, damage: data.enemyDamage });
      battleMessageClass.value = 'bg-dragon-600/20 text-dragon-300 border-dragon-500/40';
    }

    // Update HP
    combatSession.value.enemy.hp = data.enemyHp;
    combatSession.value.player.hp = data.playerHp;

    if (data.outcome === 'VICTORY') {
      combatFinished.value = true;
      combatOutcome.value = 'VICTORY';
      victoryRewards.value = data.rewards;
    } else if (data.outcome === 'DEFEAT') {
      combatFinished.value = true;
      combatOutcome.value = 'DEFEAT';
    } else if (data.nextQuestion) {
      combatSession.value.question = data.nextQuestion;
    }
  } catch (err: any) {
    battleMessage.value = t('worldDetail.battleError', { err: err?.data?.message || err.message });
    battleMessageClass.value = 'bg-dragon-600/20 text-dragon-300 border-dragon-500/40';
  } finally {
    combatTurnPending.value = false;
  }
}

async function fleeCombat() {
  if (!combatSession.value) {
    isCombatOpen.value = false;
    return;
  }

  try {
    await $fetch('/api/combat/action', {
      method: 'POST',
      body: {
        combatSessionId: combatSession.value.combatSessionId,
        action: 'flee',
      },
    });
  } catch (e) {}

  isCombatOpen.value = false;
}

function closeCombat() {
  isCombatOpen.value = false;
  combatSession.value = null;
  combatFinished.value = false;
}

onMounted(() => {
  bridge.on(GodotToNuxtEvent.INTERACT_NPC, async (payload: any) => {
    console.log('[World] Player interacted with NPC:', payload);

    try {
      // 1. Fetch live Chakra progression status from server
      const chakraRes = await $fetch<any>('/api/chakra/status');
      const muladhara = chakraRes?.data?.chakras?.[0];
      chakraProgressPercent.value = muladhara?.progressPercent || 0;

      const isUnlocked = muladhara?.isUnlocked || (muladhara?.progressPercent >= 100);
      npcDialogueData.value = {
        name: tDual('worldDetail.elderChenName', '陈老 (Elder Chen)'),
        message: isUnlocked
          ? t('worldDetail.elderChenUnlocked')
          : t('worldDetail.elderChenLocked', {
              percent: muladhara?.progressPercent || 0,
              retained: muladhara?.retainedVocabCount || 0,
              target: muladhara?.targetVocabCount || 20,
            }),
      };
      isNpcDialogueOpen.value = true;
    } catch (e) {
      console.warn('Failed to load chakra for NPC dialogue:', e);
    }

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

  bridge.on(GodotToNuxtEvent.START_COMBAT, async (payload: any) => {
    console.log('[World] Godot initiated combat:', payload);
    await startCombat();
  });

  bridge.on(GodotToNuxtEvent.OPEN_APP_ROUTE, (payload: any) => {
    if (payload?.route) {
      router.push(payload.route);
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
