export default defineNuxtPlugin((nuxtApp) => {
  
  const addRoleRecord = async (userId, role) => {
    const supabase = useSupabaseClient()
    const { error } = await supabase.from('user_roles').
    upsert([{ id: userId, role }])  

    return error
  }

  nuxtApp.provide('addRoleRecord', addRoleRecord);
});
