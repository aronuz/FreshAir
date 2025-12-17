import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' 

export default defineNuxtPlugin((nuxtApp) => {
    let bpValue = ref<Breakpoint>('xs')
    
    if (import.meta.client) {
        const breakpoints = useBreakpoints(breakpointsTailwind)
        bpValue = computed<Breakpoint>(() => {
            if (breakpoints.greaterOrEqual('lg').value) return 'lg'
            if (breakpoints.greaterOrEqual('md').value) return 'md'
            if (breakpoints.greaterOrEqual('sm').value) return 'sm'
            return 'xs'
        })
    }
    
    nuxtApp.provide('screenSize', bpValue)
})
