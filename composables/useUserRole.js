
export const useSetRole = async (userId, role = 'user') => {
  const { toastBar } = useToastBar()
  const userRole = useState('userRole')
  const addRoleRecord = useNuxtApp().$addRoleRecord

  const error = await addRoleRecord(userId, role)
  if (error) {
    toastBar('error', 'Failed to assign user role', error.toString())
    
    return error
  }

  userRole.value = role
}

export const useCheckRole = async (id) => {
  const { toastBar } = useToastBar()
  const supabase = useSupabaseClient()

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', id)
    
  if(!error && !data.length) return null
  else if (error) {
    toastBar('error', 'Failed to fetch user role', error.toString())
    return null
  }

  return data[0].role
}
