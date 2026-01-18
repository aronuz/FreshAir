export const useSupabaseCustom = (): unknown => {
  const client = useSupabaseCustom()
  
  if (!client) {
    throw new Error('Supabase client is not available in current context')
  }
  
  return client
}
