import compression from 'vite-plugin-compression2';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: true,
  
  vite: {
    plugins: [
      compression({
        algorithms: ['brotliCompress'],
        // Optional: specify algorithms (gzip by default)
        // algorithms: ['gzip', 'brotliCompress'], 
        // Optional: only compress files larger than a certain threshold (in bytes)
        // threshold: 1024, 
        // Optional: exclude specific file types
        // exclude: [/\\.map$/, /stats\\.html$/],
      }),
    ],
  },

  nitro: { 
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  },
  
  app: {
    head: {
      title: 'HVAC Fresh Air',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Expert HVAC Services for residential and commercial clients.' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
    },
    pageTransition: { name: 'page', mode: 'default' }
  },
  
  modules: [
    '@nuxtjs/sitemap',
    '@nuxtjs/supabase',
    '@nuxt/ui',
    '@nuxt/image',
    '@pinia/nuxt',
    '@nuxt/devtools',
    '@nuxtjs/robots'
  ],
  
  css: [
    '~/assets/css/main.css',
    '~/assets/css/transitions.css'
  ],
  
  image: {
    format: ['webp', 'jpeg', 'jpg', 'png'],
    provider: 'ipx',
  },
  
  // Router middleware - now configured at the top level
  routeRules: {
    // Add any specific route rules here if needed
  },
  
  plugins: [
    '~/plugins/userRole.js'
  ],
  
  supabase: {
    redirect: false,
  },
  
  // For strict router mode, create a plugin or use hooks
  hooks: {
    'pages:extend'(pages) {
      // Add catch-all route for error page
      pages.push({
        name: 'error',
        path: '/:pathMatch(.*)*',
        file: '~/layouts/error.vue'
      })
    }
  },
  
  robots: {
    disallow: ['/admin', '/admin/**', '/booking', '/booking/**', '/construction']
  }
})