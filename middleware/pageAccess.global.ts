interface AccessRule {
  to: string;
  allowed: boolean;
}

interface AccessRulesResponse {
  data: AccessRule[];
  error?: string;
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

  const { data } = await useFetch<AccessRulesResponse>(`/api/page-access?path=${to.path}`)
  if(data.value) {
    if (data.value.error && userRole.value === 'admin') {
      toastBar('error', 'Access list is missing', data.value.error)
    }
    const accessRules: AccessRule[] = data.value.data

    if (userRole.value !== 'admin' && accessRules && accessRules.length) {
      const denied = accessRules.find((page: AccessRule) => page.to === to.path && !page.allowed )
      if (denied) {
        toastBar('error', 'Under construction', `${denied.to} is being updated. Please try again later!`)  
        return navigateTo('/from')
      }
    }
  }
})
