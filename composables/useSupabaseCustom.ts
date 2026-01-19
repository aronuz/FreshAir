export const useSupabaseCustom = (): unknown => {
  const client = useSupabaseClient()
  
  if (!client) {
    throw new Error('Supabase client is not available in current context')
  }
  
  return client
}