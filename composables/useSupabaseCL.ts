export const useSupabaseCL = () => {
  return useNuxtApp().$supabase; // Access the globally injected Supabase client
}