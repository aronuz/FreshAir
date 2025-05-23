export default defineNuxtRouteMiddleware((_to, from) => {
  const origin = useState<string | null>('origin', () => null)
  if(!['/login','/registration'].includes(from.path)) origin.value = from.path === '/' ? 'index' : from.path.slice(1)
    console.log('ov', origin.value)
})
