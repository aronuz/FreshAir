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
        {rel: 'icon', type: 'image/x-icon', href: '/favicon'}
      ]
    }
  },
  modules: [// Install this module
  '@nuxtjs/sitemap', '@nuxtjs/supabase', '@nuxt/ui'],
  // css: ['~/assets/css/main.css'],
  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        path: '*',
        component: resolve(__dirname, 'layouts/error.vue')
      });
    },
    middleware: ['errorMiddleware']
  },
  supabase: {
    redirect: false //Redirects to login
  }
})