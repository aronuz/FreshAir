import type { RouterConfig } from '@nuxt/schema'

export const router: RouterConfig = {
    scrollBehavior(to, _from, savedPosition) {
        // If there's a saved position (e.g., from using the back button),
        // return to that position.
        console.log('Scrolling:',to, savedPosition)
        debugger
        if (savedPosition) {
            return savedPosition
        }
        debugger
        return new Promise((resolve) => {
            setTimeout(() => {
                let scrollObject: { el: string; behavior: ScrollBehavior } | { top: number; behavior: ScrollBehavior }
                // If navigating to a new route with a hash, scroll to that element.
                if (to.hash) {
                    scrollObject = {
                        el: to.hash,
                        behavior: 'smooth',
                    }
                } else {
                    scrollObject = { top: 10, behavior: 'smooth' } // Default scroll to top
                }
                console.log('Scrolling to:', scrollObject)
                resolve(scrollObject)
            }, 500) // Delay to allow page content to load
        })
    }
}