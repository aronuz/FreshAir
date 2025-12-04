export default defineNuxtRouteMiddleware((to, from) => {
  const user = useGuestUser().value ?? useSupabaseUser().value
  const origin = useState<string | null>('origin', () => null)
  const unlink = useState<string | null>('unlink', () => null)
  // if(((from.path === '/loginLink' && to.path === '/registration') 
  //   || (to.path === '/loginLink' && from.path === '/registration')) 
  // && !origin.value) origin.value = 'index'
  // else 
  if(!['/loginLink','/registration'].includes(from.path)
    && !(!user && origin.value?.includes('_booking')
    && ['/loginLink','/registration'].includes(to.path)))
      origin.value = from.path === '/' ? 'index' : from.path.slice(1)
      
  if(['/loginLink','/registration'].includes(from.path)) {
    if(!user) {
      if(to.path === '/booking') abortNavigation()
      else if(document && origin.value && !origin.value!.includes(to.name as string)) { //&& !to.query.l
        const idList = document.querySelectorAll('.router-link-active')
        if(idList.length) {
          const id = idList[0].getAttribute('id')
          if(id) unlink.value = id
        }
      }
    }
  } else {
    unlink.value = null
  }
  //console.log('ov', origin.value)
})