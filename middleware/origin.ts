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
        if(document && !to.query.l) {
          const idList = document.querySelectorAll('.router-link-active')
          if(idList.length) {
            const id = idList[0].getAttribute('id')
            if(id) unlink.value = id
          }
        }
      }
    }
  } else {
    unlink.value = null
  }
  console.log('ov', origin.value)
})