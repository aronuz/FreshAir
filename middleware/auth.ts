import { useGuestUser } from "~/composables/useGuestUser"

export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log('to', to, 'from', from)
    const user = useGuestUser() ?? useSupabaseUser()
    await new Promise((resolve) => {
        setTimeout(resolve, 1000)
    })
    console.log('user', user.value)
    if(to.fullPath.includes('code')) {
        console.log('-fp-', to.fullPath)
        return navigateTo(to.path)
    } else {
    // if(!user.value) {
        if(!['/login','/registration'].includes(from.path)) {
            return navigateTo('/login')
        } else {
            return abortNavigation()
        }
    }
})

