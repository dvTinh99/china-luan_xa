// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // ---------------------------------------------------------------------------
  // Nuxt 4 compatibility
  // ---------------------------------------------------------------------------
  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2025-01-01',

  // ---------------------------------------------------------------------------
  // Modules
  // ---------------------------------------------------------------------------
  modules: ['@nuxtjs/tailwindcss'],

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
      title: 'LinguaWorld — Learn Mandarin',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'An immersive Mandarin-learning platform with an embedded game world.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
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
