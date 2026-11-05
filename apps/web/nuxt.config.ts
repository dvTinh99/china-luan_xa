// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'url';

const cloudflareWorkersBuild = process.env.CLOUDFLARE_WORKERS_BUILD === '1';

export default defineNuxtConfig({
  alias: {
    // Avoid resolving lucide-vue-next's all-icons barrel (1,500+ modules) in
    // constrained CI environments. The facade exports only icons used by app.
    'lucide-vue-next': fileURLToPath(new URL('./app/utils/lucide-icons.ts', import.meta.url)),
    '@linguaworld/database/sqlite': fileURLToPath(new URL(
      cloudflareWorkersBuild ? './server/utils/sqlite-worker-unavailable.ts' : '../../database/prisma/generated/sqlite',
      import.meta.url,
    )),
    '@linguaworld/database/postgresql': fileURLToPath(new URL(
      cloudflareWorkersBuild ? '../../database/prisma/generated/worker/client.ts' : '../../database/prisma/generated/postgresql',
      import.meta.url,
    )),
  },
  // ---------------------------------------------------------------------------
  // Nuxt 4 compatibility
  // ---------------------------------------------------------------------------
  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2025-01-01',

  // ---------------------------------------------------------------------------
  // Nitro Server Configuration
  // ---------------------------------------------------------------------------
  nitro: {
    preset: 'cloudflare-module',
    experimental: {
      wasm: true,
      asyncContext: true,
    },
    externals: {
      inline: ['@vue/server-renderer', 'vue'],
    },
  },

  routeRules: {
    // Cache dài hạn cho các file build của Godot để người chơi không phải tải lại
    '/godot/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    }
  },

  // ---------------------------------------------------------------------------
  // Modules
  // ---------------------------------------------------------------------------
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
  ],

  // ---------------------------------------------------------------------------
  // i18n Configuration (Origin Language Subtitle Engine)
  // ---------------------------------------------------------------------------
  i18n: {
    locales: [
      { code: 'vi', language: 'vi-VN', name: 'Tiếng Việt', file: 'vi.ts' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.ts' },
    ],
    defaultLocale: 'vi',
    strategy: 'no_prefix',
    lazy: false,
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'linguaworld_origin_language',
      redirectOn: 'root',
    },
  },

  // ---------------------------------------------------------------------------
  // Runtime config
  // ---------------------------------------------------------------------------
  runtimeConfig: {
    /** Server-only: secret used for signing session cookies */
    sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',

    /** Server-only: database URL */
    databaseUrl: process.env.DATABASE_URL || '',

    /** Client-accessible config */
    public: {
      /** Origin of the Godot game iframe — used for postMessage validation */
      gameOrigin: process.env.NUXT_PUBLIC_GAME_ORIGIN || 'http://localhost:3000',
    },
  },

  // ---------------------------------------------------------------------------
  // App
  // ---------------------------------------------------------------------------
  app: {
    head: {
      title: 'LinguaWorld — Học Tiếng Trung RPG HSK 3.0',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Nền tảng học tiếng Trung HSK 3.0 kết hợp thế giới game nhập vai 2D RPG, Spaced Repetition FSRS và phát âm chuẩn Mandarin.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          media: 'print',
          onload: "this.media='all'",
          href: 'https://fonts.googleapis.com/css2?family=Marcellus&family=Noto+Serif+SC:wght@600;700;900&family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Tailwind
  // ---------------------------------------------------------------------------
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  // ---------------------------------------------------------------------------
  // TypeScript
  // ---------------------------------------------------------------------------
  typescript: {
    strict: true,
    typeCheck: false, // Disable in dev for speed; use `nuxt typecheck` instead
  },

  // ---------------------------------------------------------------------------
  // Dev tools
  // ---------------------------------------------------------------------------
  devtools: { enabled: true },
});
