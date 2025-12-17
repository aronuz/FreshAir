import type { ComputedRef } from 'vue'

declare module '#app' {
  interface NuxtApp {
    $screenSize: ComputedRef<'xs' | 'sm' | 'md' | 'lg' >
  }
}

export {}