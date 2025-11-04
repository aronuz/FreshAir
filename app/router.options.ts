import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
    scrollBehavior(to, _from, savedPosition) {
        // Scroll to a saved position if exists and not at top
        if (savedPosition && JSON.stringify(savedPosition) !== '{"left":0,"top":0}') {
            return savedPosition
        }
        return new Promise((resolve) => {
             // Scroll after page loaded
            setTimeout(() => {
                let scrollObject: { el: string; behavior: ScrollBehavior } | { top: number; behavior: ScrollBehavior }
                // Scroll to hashed element.
                if (to.hash) {
                    scrollObject = {
                        el: to.hash,
                        behavior: 'smooth',
                    }
                } else {
                    scrollObject = { top: 5, behavior: 'smooth' } // Default scroll to top
                }
                resolve(scrollObject)
            }, 300)
        })
    }
}