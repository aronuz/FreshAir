// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  target: 'static',
  ssr: true,
  nitro: { 
    prerender: {
      crawLinks: true,
      routes: ['/']
    }
  },
  app: {
    head: {
      title: 'HVAC Fresh Air',
      meta: [
        {charset: 'utf-8'},
        {name: 'viewport', content: 'width=device-width, initial-scale=1'},
        { hid: 'description', name: 'description', content: 'Expert HVAC Servicesfor residential and comercial clients.'}
      ],
      link: [
        {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}
      ]
    }
  },
  modules: [// Install this module
  '@nuxtjs/sitemap', '@nuxtjs/supabase', '@nuxt/ui', '@nuxt/image'],
  css: ['~/assets/css/main.css'],
  image: {
    //domains: ['picsum.photos', 'www.google.com'],
    format: ['webp', 'jpeg', 'jpg', 'png'],
    provider: 'ipx',
  },
  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        path: '*',
        component: resolve(__dirname, 'layouts/error.vue')
      });
    },
    middleware: ['errorMiddleware']
  },
  plugins: [
    '~/plugins/userRole.js'
  ],
  supabase: {
    redirect: false,
    // redirectOptions: {
    //   login: '/login', // Redirect unauthenticated users
    //   callback: '/confirm', // Supabase callback page after OAuth
    //   // exclude: ['/'], // Pages to exclude from redirect
    // },
  }
})