<template>
  <div class="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full bg-surface-900 border border-surface-750 rounded-3xl p-8 sm:p-9 shadow-card-elevated">
      <div class="text-center mb-8">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-gold-500 flex items-center justify-center font-hanzi font-black text-2xl text-white mx-auto mb-3.5 shadow-glow-brand ring-1 ring-white/20">
          龙
        </div>
        <h1 class="text-2xl font-black font-heading text-white">{{ tDual('authDetail.registerTitle', '注册 LinguaWorld') }}</h1>
        <p class="text-xs text-slate-400 mt-1">{{ t('authDetail.registerDesc') }}</p>
      </div>

      <div
        v-if="errorMessage"
        class="mb-5 p-3.5 bg-brand-950/70 border border-brand-800 rounded-2xl text-brand-300 text-xs font-semibold text-center flex items-center justify-center gap-2"
        role="alert"
      >
        <AlertCircle :size="16" class="text-brand-400 shrink-0" aria-hidden="true" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5" for="reg-char">{{ tDual('authDetail.charName', '侠客名号') }}</label>
          <input
            id="reg-char"
            v-model="form.characterName"
            type="text"
            required
            :placeholder="t('authDetail.charNamePlaceholder')"
            class="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-surface-950 border border-surface-750 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5" for="reg-user">{{ tDual('authDetail.regUsername', '登录账号') }}</label>
          <input
            id="reg-user"
            v-model="form.username"
            type="text"
            required
            placeholder="minh_hero"
            class="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-surface-950 border border-surface-750 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5" for="reg-email">Email</label>
          <input
            id="reg-email"
            v-model="form.email"
            type="email"
            required
            placeholder="learner@example.com"
            class="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-surface-950 border border-surface-750 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5" for="reg-pw">{{ tDual('authDetail.passwordMin', '密码') }}</label>
          <input
            id="reg-pw"
            v-model="form.password"
            type="password"
            required
            minlength="6"
            placeholder="••••••••"
            class="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-surface-950 border border-surface-750 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full min-h-[48px] py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-glow-brand disabled:opacity-50 transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
        >
          <UserPlus v-if="!loading" :size="16" aria-hidden="true" />
          <span>{{ loading ? tDual('authDetail.creating', '正在创建角色...') : tDual('authDetail.btnRegister', '立即启程修仙') }}</span>
        </button>
      </form>

      <div class="mt-6 text-center text-xs text-slate-400">
        {{ t('authDetail.haveAccount') }}
        <NuxtLink to="/login" class="text-gold-400 font-bold hover:underline ml-1">{{ tDual('authDetail.loginNow', '立即登录') }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, UserPlus } from 'lucide-vue-next';
import { useOriginLanguage } from '~/composables/useOriginLanguage';

definePageMeta({
  layout: 'default',
});

const { t, tDual } = useOriginLanguage();

const router = useRouter();

const form = reactive({
  characterName: '',
  username: '',
  email: '',
  password: '',
});

const loading = ref(false);
const errorMessage = ref('');

async function handleRegister() {
  loading.value = true;
  errorMessage.value = '';

  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: form,
    });
    router.push('/learn');
  } catch (err: any) {
    errorMessage.value = err?.data?.message || t('authDetail.registerFail');
  } finally {
    loading.value = false;
  }
}
</script>
