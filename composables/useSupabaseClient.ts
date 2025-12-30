/**
 * Shared composable to safely access Supabase client
 * Throws error if client is not available in current context
 */
export const useSupabaseClient = (): unknown => {
  const client = useSupabaseClient()
  
  if (!client) {
    throw new Error('Supabase client is not available in current context')
  }
  
  return client
}
