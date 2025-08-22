interface AccessRule {
  to: string;
  allowed: boolean;
  [key: string]: any;
}

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { toastBar } = useToastBar()
  const userRole = useState<string | null>('userRole', () => null)
  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if(session && !userRole.value){
    const userId = session.user.id
    userRole.value = await useCheckRole(userId)
  }

  const { data } = await useFetch<AccessRule>(`/api/page-access?path=${to.path}`)
  console.log('data: ', data.value)
  if(data.value) {
    if (data.value.error && userRole.value === 'admin') {
      toastBar('error', 'Access list is missing', data.value.error)
    }
    const accessRule: AccessRule = data.value

    if (to.path === '/admin' && userRole.value !== 'admin') {
      toastBar('error', 'Access Denied', `You do not have permission to access ${to.path}`)
      return navigateTo(from.path)
    }
    if (userRole.value !== 'admin' && accessRule && !accessRule.allowed) {
      toastBar('error', 'Under construction', `${accessRule.to} is being updated. Please try again later!`)  
      return navigateTo(from.path)
    }
  }
})
