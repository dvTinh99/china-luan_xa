<template>
  <div class="w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
    <header class="mb-6 sm:mb-8">
      <p class="text-xs uppercase tracking-[0.2em] text-gold-400 font-bold">{{ t('settings.eyebrow') }}</p>
      <h1 class="text-2xl sm:text-4xl font-black text-white mt-2">{{ t('settings.title') }}</h1>
      <p class="text-sm sm:text-base text-slate-400 mt-2">{{ t('settings.description') }}</p>
    </header>

    <section class="overflow-hidden rounded-2xl sm:rounded-3xl border border-wood-800 bg-wood-900/80 shadow-rpg-panel">
      <div class="flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-6">
        <div class="flex min-w-0 items-start gap-3 sm:gap-4">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold-500/25 bg-gold-500/10 font-heading text-lg font-black text-gold-300" aria-hidden="true">拼</div>
          <div class="min-w-0">
            <h2 class="text-base sm:text-lg font-bold text-white">{{ t('settings.pinyinTitle') }}</h2>
            <p class="mt-1 text-sm leading-relaxed text-slate-400">{{ t('settings.pinyinDescription') }}</p>
            <p v-if="saved" class="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300" role="status">
              <Check :size="14" aria-hidden="true" />{{ t('settings.saved') }}
            </p>
            <p v-else-if="errorMessage" class="mt-3 text-xs text-rose-300" role="alert">{{ errorMessage }}</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="pinyinDisplay"
          :aria-label="t('settings.pinyinTitle')"
          :disabled="saving"
          @click="togglePinyin"
          class="flex w-full shrink-0 items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition-colors disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 sm:w-auto sm:min-w-32"
          :class="pinyinDisplay ? 'bg-emerald-600 border-emerald-400' : 'bg-wood-700 border-wood-600'"
        >
          <span class="sm:hidden">{{ t('settings.displayPinyin') }}</span>
          <span>{{ pinyinDisplay ? t('settings.on') : t('settings.off') }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { pinyinDisplay } = usePinyinDisplay();
const { data: authData, refresh: refreshAuth } = await useFetch<any>('/api/auth/me');
const saving = ref(false);
const saved = ref(false);
const errorMessage = ref('');

if (!authData.value?.data?.user) await navigateTo('/login?redirect=/settings');

watch(() => authData.value?.data?.user?.settings?.pinyinDisplay, (value) => {
  if (typeof value === 'boolean') pinyinDisplay.value = value;
}, { immediate: true });

async function togglePinyin() {
  if (saving.value) return;
  const previous = pinyinDisplay.value;
  const next = !previous;
  pinyinDisplay.value = next;
  saving.value = true;
  saved.value = false;
  errorMessage.value = '';
  try {
    await $fetch('/api/settings/pinyin', { method: 'PUT', body: { pinyinDisplay: next } });
    await refreshAuth();
    saved.value = true;
  } catch {
    pinyinDisplay.value = previous;
    errorMessage.value = t('settings.saveError');
  } finally {
    saving.value = false;
  }
}
</script>
