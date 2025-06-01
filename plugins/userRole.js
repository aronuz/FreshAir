export default defineNuxtPlugin((nuxtApp) => {
  const supabase = useSupabaseClient()

  const addRoleRecord = async (userId, role) => {
    const { error } = await supabase.from('user_roles').
    insert([{ user_id: userId, role }])  

    return error
  }

  nuxtApp.provide('addRoleRecord', addRoleRecord);
});
