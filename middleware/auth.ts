import { useGuestUser } from "~/composables/useGuestUser"

export default defineNuxtRouteMiddleware((to, from) => {
    const user = useGuestUser() ?? useSupabaseUser()
    if(!user.value) {
        if(!['/login','/registration'].includes(from.path)) {
            const dest = useState<string | null>('destRoute', () => null)
            dest.value = to.path
            return navigateTo('/login')
        } else {
            return abortNavigation()
        }
    }
})

