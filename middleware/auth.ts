import { useGuestUser } from "~/composables/useGuestUser"

export default defineNuxtRouteMiddleware((to, from) => {
    if(!['/login','/registration'].includes(from.path)) {
        const user = useGuestUser() ?? useSupabaseUser()
        if(!user.value) {
            const dest = useState<string | null>('destRoute', () => null)
            dest.value = to.path
            return navigateTo('/login')
        }
    }
})

