import type { RouterConfig } from '@nuxt/schema'

export const router: RouterConfig = {
    scrollBehavior(to, _from, savedPosition) {
        // If there's a saved position (e.g., from using the back button),
        // return to that position.
        if (savedPosition) {
            return savedPosition
        }

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
                    scrollObject = { top: 0, behavior: 'smooth' } // Default scroll to top
                }

                resolve(scrollObject)
            }, 500) // Delay to allow page content to load
        })
    }
}