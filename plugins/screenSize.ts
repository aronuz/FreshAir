import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

export default defineNuxtPlugin((nuxtApp) => {
    const breakpoints = useBreakpoints(breakpointsTailwind) 
        const bp = breakpoints?.greaterOrEqual('lg') ? 'lg' : 
            breakpoints?.greaterOrEqual('md') ? 'md' : 
            breakpoints?.greaterOrEqual('sm') ? 'sm' : 'xs'

    nuxtApp.provide('screenSize', bp);
})
