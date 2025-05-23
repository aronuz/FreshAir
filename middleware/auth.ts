export default defineNuxtRouteMiddleware((to, from) => {
    const user = useGuestUser() ?? useSupabaseUser()
    if (!user.value) {
        return navigateTo('/login')
    }
})
