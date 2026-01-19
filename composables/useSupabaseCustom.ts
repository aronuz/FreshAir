import type { SupabaseClient } from '@supabase/supabase-js'

export const useSupabaseCustom = (): SupabaseClient => {
  const client = useSupabaseClient()
  
  if (!client) {
    throw new Error('Supabase client is not available in current context')
  }
  
  return client
}