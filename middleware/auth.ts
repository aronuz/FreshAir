const userRole = useState<string | null>('userRole', () => null)

export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log('to', to, 'from', from)
    const supabase = useSupabaseClient()
    const guestUser = useGuestUser()

    // Wait for the session to be retrieved from Supabase
    const { data: { session } } = await supabase.auth.getSession()
    // !user.value && 
    // If there is no session or no user, redirect to the login page
    
    await new Promise((resolve) => {
        setTimeout(() => resolve('Success!'), 1000);
    })
    console.log('session:',session)
    if (!guestUser.value && (!session || !session.user)) {
        return navigateTo('/login')
        // if(!['/login','/registration'].includes(from.path)) {
        //     return navigateTo('/login')
        // } else {
        //     console.log('an')
        //     return abortNavigation()
        // }
    } else if (session?.user) {
        console.log('before cr')
        const userId = session.user.id
        userRole.value = await useCheckRole(userId)
        if (!userRole.value) {
            console.log('before sr')
            await useSetRole(userId)
        }
    }

    // // const user = useGuestUser() ?? useSupabaseUser()
    // await new Promise((resolve) => {
    //     setTimeout(resolve, 1000)
    // })
    // console.log('user', user.value)
    // if(to.fullPath.includes('code')) {
    //     console.log('-fp-', to.fullPath)
    //     return navigateTo(to.path)
    // } else {
    // // if(!user.value) {
    //     if(!['/login','/registration'].includes(from.path)) {
    //         return navigateTo('/login')
    //     } else {
    //         return abortNavigation()
    //     }
    // }
})

