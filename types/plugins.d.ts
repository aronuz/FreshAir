import { NuxtApp } from 'nuxt/app'

declare module '#app' {
  interface NuxtApp {
    $onError: (status: number | string | null, message: sring) => void
  }
}

export {}