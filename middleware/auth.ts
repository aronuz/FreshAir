export default defineNuxtRouteMiddleware((to, from) => {
    const user = useState(globalUser) ?? useSupabaseUser(); 
    if (!user.value) {
        return navigateTo('/login');
    }
})
