export default defineNuxtRouteMiddleware((to, from) => {
  const origin = useState<string | null>('origin', () => null)
  const unlink = useState<string | null>('unlink', () => null)
  if((from.path === '/login' && to.path === '/registration') || (to.path === '/login' && from.path === '/registration')) origin.value = null
  else origin.value = from.path === '/' ? 'index' : from.path.slice(1)
  if(['/login','/registration'].includes(from.path)) {
    const user = useSupabaseUser()
    if(!user.value) {
      if(to.path === '/booking') abortNavigation()
      else {
        if(document) {
          const id = document.querySelectorAll('.router-link-active')[0].getAttribute('id')
          if(!to.query.l && id) unlink.value = id
        }
      }
    }
  } else {
    unlink.value = null
  }
  console.log('ov', origin.value)
})