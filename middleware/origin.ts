export default defineNuxtRouteMiddleware((_to, from) => {
  const previousRoute = useState<string | null>('previousRoute', () => null)
  if(!['/login','/registration'].includes(from.path)) previousRoute.value = from.path
})
