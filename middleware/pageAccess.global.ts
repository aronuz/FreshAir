interface AccessRule {
  to: string;
  allowed: boolean;
  [key: string]: any;
}

export default defineNuxtRouteMiddleware(async (to, from) => {
  
  const isClient = import.meta.client,
    userRole = useState<string | null>('userRole', () => null),
    pathTo = to.path === '/index' ? '/' : to.path, 
    pathFrom = !from || ['/admin', '/index'].includes(from.path) ? '/' : from.path

  const showWarning = (type: 'error' | 'warn', title: string, message: string) => {
    try{
      if (isClient) {
        const { toastBar } = useToastBar()
        toastBar(type, title, message);
      } else {
        // eslint-disable-next-line no-console 
        console[type](`${title}: ${message}`)
      }
    }catch(error){
      // eslint-disable-next-line no-console
      console.error(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  let infoMsg: string

  if (!userRole.value) {
    try {
      const supabase = useSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }))

      if(session) {
        const userId = session.user?.id
        userRole.value = await useCheckRole(userId)
      }
    } catch (error) {
      showWarning('error', 'Error fetching user session.', error instanceof Error ? error.message : 'Unknown error')
    }
  }
  
  if (pathTo === '/admin' && userRole.value !== 'admin') {
    infoMsg = `Non-admin user attempted to access admin page.`
    showWarning('warn', `You do not have permission to access this page`, infoMsg)
    return navigateTo(pathFrom, { redirectCode: 302, replace: true })
  }
    
  if (pathTo === '/admin') return // allow access to admin page for admins

  let accessRule: AccessRule | null = null

  try {
    const { data, error } = await useFetch<AccessRule>('/api/page-access', {
      query: { path: pathTo },
      key: `page_:${pathTo}`,
      server: true,
      default: () => ({ to: '/', allowed: true })
    })

    if(error.value) {
      infoMsg = `Error fetching access rule for ${to.path} page`
      if (import.meta.server) console.error(infoMsg, {
          pathTo,
          statusCode: (error.value as any)?.statusCode,
          statusMessage: (error.value as any)?.statusMessage
        })
      else 
        showWarning('error', error.value.statusText || 'Unknown error', infoMsg)
    }

    accessRule = data.value as AccessRule | null
  } catch (error) {
    infoMsg = `Error fetching access rule for path: ${to.path}.`
    showWarning('error', error instanceof Error ? error.message : 'Unknown error', infoMsg)
    accessRule = null
  }    

  if (userRole.value !== 'admin' && accessRule && !accessRule.error && !accessRule.allowed) {
    infoMsg = `${accessRule.name} is being updated. Please try again later!`
    showWarning('warn', 'Under construction', infoMsg)  
    return navigateTo(pathFrom, { redirectCode: 302, replace: true })
  }

  if (accessRule && accessRule.error) {
    infoMsg = `No access rule found for path: ${pathTo}. Allowing access by default.`
    showWarning('warn', accessRule.error, infoMsg)
  }
})
