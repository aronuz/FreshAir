import { useMutationObserver } from '@vueuse/core'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  
  router.beforeEach((to, from) => {
    console.log('Navigation starting:', {
      to: to.path,
      matched: to.matched[0]?.components?.default?.__name
    })
    return true
  })

  router.beforeResolve(async (to) => {
    const component = to.matched[0]?.components?.default
    console.log('Component resolving:', {
      path: to.path,
      component: component?.__name,
      hasSetup: !!component?.setup,
      props: component?.props
    })
    return true
  })

  router.afterEach((to) => {
    const component = to.matched[0]?.components?.default
    
    // Try to access component internals
    nextTick(() => {
      console.log('Component state after navigation:', {
        path: to.path,
        name: component?.__name,
        hasInstance: !!component?.__instance,
        setup: component?.setup?.toString()
      })

      const el = document?.body
      if (!el) return
      useMutationObserver(el, (mutations) => {
            if (mutations[0]) {
                console.log('DOM updated:', {
                path: to.path,
                updates: mutations.length
                })
            }
        }, {
        attributes: false,
        })
      // Monitor DOM updates
    //   const observer = new MutationObserver((mutations) => {
    //     console.log('DOM updated:', {
    //       path: to.path,
    //       updates: mutations.length
    //     })
    //     observer.disconnect()
    //   })

    //   observer.observe(document.body, {
    //     childList: true,
    //     subtree: true
    //   })
    })
  })
})