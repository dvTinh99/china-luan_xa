<template>
  <div class="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full bg-surface-900 border border-surface-750 rounded-3xl p-8 sm:p-9 shadow-card-elevated">
      <div class="text-center mb-8">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-gold-500 flex items-center justify-center font-hanzi font-black text-2xl text-white mx-auto mb-3.5 shadow-glow-brand ring-1 ring-white/20">
          龙
        </div>
        <h1 class="text-2xl font-black font-heading text-white">{{ tDual('authDetail.loginTitle', '登录 LinguaWorld') }}</h1>
        <p class="text-xs text-slate-400 mt-1">{{ t('authDetail.loginDesc') }}</p>
      </div>

      <div
        v-if="errorMessage"
        class="mb-5 p-3.5 bg-brand-950/70 border border-brand-800 rounded-2xl text-brand-300 text-xs font-semibold text-center flex items-center justify-center gap-2"
        role="alert"
      >
        <AlertCircle :size="16" class="text-brand-400 shrink-0" aria-hidden="true" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5" for="login-id">{{ tDual('authDetail.emailOrUsername', '电子邮箱或登录名') }}</label>
          <div class="relative">
            <input
              id="login-id"
              v-model="form.identifier"
              type="text"
              required
              placeholder="demo@linguaworld.dev"
              class="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-surface-950 border border-surface-750 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1.5" for="login-pw">{{ tDual('authDetail.password', '密码') }}</label>
          <div class="relative">
            <input
              id="login-pw"
              v-model="form.password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-surface-950 border border-surface-750 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full min-h-[48px] py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-glow-brand disabled:opacity-50 transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
        >
          <LogIn v-if="!loading" :size="16" aria-hidden="true" />
          <span>{{ loading ? tDual('authDetail.verifying', '验证中...') : tDual('authDetail.btnLogin', '立即登录') }}</span>
        </button>
      </form>

      <div class="mt-6 text-center text-xs text-slate-400">
        {{ t('authDetail.noAccount') }}
        <NuxtLink to="/register" class="text-gold-400 font-bold hover:underline ml-1">{{ tDual('authDetail.registerNow', '立即注册') }}</NuxtLink>
      </div>

      <div class="mt-5 pt-4 border-t border-surface-800 text-center">
        <button
          type="button"
          @click="quickDemoLogin"
          class="text-xs text-slate-400 hover:text-gold-300 underline cursor-pointer transition-colors"
        >
          {{ t('authDetail.demoLogin') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, LogIn } from 'lucide-vue-next';
import { useOriginLanguage } from '~/composables/useOriginLanguage';

definePageMeta({
  layout: 'default',
});

const { t, tDual } = useOriginLanguage();

const router = useRouter();

const form = reactive({
  identifier: '',
  password: '',
});

const loading = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  loading.value = true;
  errorMessage.value = '';

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: form,
    });
    router.push('/learn');
  } catch (err: any) {
    errorMessage.value = err?.data?.message || t('authDetail.loginFail');
  } finally {
    loading.value = false;
  }
}

function quickDemoLogin() {
  form.identifier = 'demo@linguaworld.dev';
  form.password = 'password123';
  handleLogin();
}
</script>
