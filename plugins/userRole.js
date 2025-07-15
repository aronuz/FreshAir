export default defineNuxtPlugin((nuxtApp) => {
  
  const addRoleRecord = async (userId, role) => {
    const supabase = useSupabaseClient()
    const id = typeof userId === 'string' ? 'user_id' : 'id'
    const { error } = await supabase.from('user_roles').
    upsert([{ [id]: userId, role }], { onConflict: id }) 

    return error
  }

  nuxtApp.provide('addRoleRecord', addRoleRecord);
});
