const supabase = useSupabaseClient()
const { toastBar } = useToastBar()

const userRole = useState('userRole')

export const useSetRole = async (userId, role = 'user') => {
  const { $addRoleRecord } = useNuxtApp();
  const error = await $addRoleRecord(userId, role)

  if (error) {
    toastBar('error', 'Failed to assign user role', error.toString())
    return null
  }

  userRole.value = role
}

export const useCheckRole = async (id) => {
  console.log('cr...')
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', id)
    .single()
  console.log('in cr')
  if (error) {
    toastBar('error', 'Failed to fetch user role', error.toString())
    return null
  }

  return data?.role
}
