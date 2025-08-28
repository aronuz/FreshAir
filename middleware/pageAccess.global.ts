interface AccessRule {
  to: string;
  allowed: boolean;
  [key: string]: any;
}

export default defineNuxtRouteMiddleware(async (to, from) => {
  
  // const isClient = Object.prototype.hasOwnProperty.call(import.meta, 'client')

  const showToastBar = (type: 'error' | 'info', title: string, message: string) => {
    // try{
    //   if (isClient) {
    //     const { toastBar } = useToastBar()
    //     toastBar('error', title, message);
    //   } else {
    //     console[type === 'error' ? 'error' : 'log'](`${title}: ${message}`);
    //   }
    // }catch(e){
    //   console.error('Toast bar error:', e);
    // }
  // }
    console[type === 'error' ? 'error' : 'log'](`${title}: ${message}`);
}

  const userRole = useState<string | null>('userRole', () => null)
  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if(session && !userRole.value){
    const userId = session.user.id
    userRole.value = await useCheckRole(userId)
  }

  const pathTo = to.path === '/' ? '/index' : to.path, pathFrom = from.path === '/index' ? '/' : from.path
  const { data, error } = await useFetch<AccessRule>(`/api/page-access?path=${pathTo}`)
  console.log('data: ', data.value)
  if(error.value && userRole.value === 'admin') {
    showToastBar('error', 'Access fetch error', error.value?.statusText || 'Unknown error')
  }
  if(data.value) {
    const accessRule: AccessRule = data.value

    if (pathTo === '/admin' && userRole.value !== 'admin') {
      showToastBar('info', 'Access Denied', `You do not have permission to access ${pathTo}`)
      return navigateTo(pathFrom)
    }
    if (userRole.value !== 'admin' && accessRule && !accessRule.allowed) {
      showToastBar('info', 'Under construction', `${accessRule.to} is being updated. Please try again later!`)  
      return navigateTo(pathFrom)
    }
  }
})
