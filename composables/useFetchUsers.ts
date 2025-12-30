/**
 * User management composable
 * Handles: fetch users, create user, update user, delete users
 */

export interface UserData {
  id?: number
  user_id: string
  title: string
  email?: string
  phone: string
  role?: string
}

export const useFetchUsers = () => {
  const supabase = useSupabaseClient()
  const { error, isPending, setError, setLoading, reset } = useAsyncError()

  const fetchUsers = async (userId: string | undefined = undefined) => {
    let fetchData: UserData[] | null = null
    let fetchError: string | null = null
    let fetchStatus: string | null = null

    // setLoading(pending)

    try {
      const { data, error: dbError } = await supabase.rpc('get_user_data_and_role', { user_uuid: userId } as any)
      
      if (dbError) {
        fetchError = dbError.message ?? 'Unknown error while fetching users'
        fetchStatus = dbError.code ?? ''
      }
      
      if (data) fetchData = data
    } catch (err: any) {
      fetchError = err?.message || 'Unknown error'
      fetchStatus = '500'
    } finally {
      setLoading(false)
    }

    return { data: fetchData, error: fetchError, status: fetchStatus }
  }

  const createUser = async (user: UserData | string) => {
    let saveData: UserData | null = null
    let saveError: string | null = null
    let saveStatus: string | null = null

    try {
      let userObj: UserData

      if (typeof user === 'string') {
        userObj = {
          user_id: user,
          title: '',
          phone: ''
        }
      } else {
        userObj = user
      }

      const { data, error: dbError } = await supabase
        .from('users')
        .upsert([userObj as never], { onConflict: 'user_id' })

      if (dbError) {
        saveError = dbError.message ?? 'Unknown error while creating user'
        saveStatus = dbError.code ?? ''
      } else {
        saveData = data?.[0] || null
      }
    } catch (err: any) {
      saveError = err?.message || 'Unknown error'
      saveStatus = '500'
    }

    return { data: saveData, error: saveError, status: saveStatus }
  }

  const updateUser = async (user: Partial<UserData>) => {
    let saveData: Partial<UserData> | null = null
    let saveError: string | null = null
    let saveStatus: string | null = null

    try {
      setLoading(true)

      const userData = {
        title: user.title,
        email: user.email,
        phone: user.phone
      } as Partial<UserData>

      let query = supabase.from('users').select('*')

      if (user.id) {
        query = query.eq('id', user.id)
      } else if (user.user_id) {
        query = query.eq('user_id', user.user_id)
      }

      const { data: userInfo, error: dbError } = await query.single()

      if (dbError) {
        saveError = dbError.message ?? 'Unknown error'
        saveStatus = dbError.code ?? ''
      } else if (userInfo) {
        const {title, email, phone} = userInfo
        const data: Record<string, string | number> = {title, email, phone}
        const isChanged = Object.keys(userData).some(
          (key) => userData[key as keyof typeof userData] !== data[key]
        )

        if (isChanged) {
          Object.assign(userData, { id: data.id })
          const { error: updateError } = await supabase.from('users').upsert(userData as never)

          if (updateError) {
            saveError = updateError.message ?? 'Unknown error while updating user data'
            saveStatus = updateError.code ?? ''
          } else {
            saveData = { id: data.id as number, user_id: data.user_id as string}
          }
        } else {
          saveData = { user_id: data.user_id as string}
        }
      } else {
        // User doesn't exist, create new
        const { data: newData, error: createError, status: createStatus } = await createUser(userData as UserData)

        if (createError) {
          saveError = createError
          saveStatus = createStatus
        } else if (newData) {
          saveData = { user_id: (newData as Partial<UserData>).user_id }
        }
      }
    } catch (err: any) {
      saveError = err?.message || 'Unknown error'
      saveStatus = '500'
    } finally {
      setLoading(false)
    }

    return { data: saveData, error: saveError, status: saveStatus, isPending }
  }

  const deleteUsers = async (user_ids: Array<number | string> = []) => {
    let deleteError: string | null = null
    let deleteStatus: string | null = null

    if (!user_ids || !user_ids.length) {
      deleteError = 'Unable to remove selected user(s)'
      deleteStatus = '500'
    } else {
      // setLoading(pending)

      try {
        const { error: dbError } = await supabase.from('users').delete().in('user_id', user_ids)

        if (dbError) {
          deleteError = dbError.message ?? 'Unknown error'
          deleteStatus = dbError.code ?? ''
        }
      } catch (err: any) {
        deleteError = err?.message || 'Unknown error'
        deleteStatus = '500'
      } finally {
        setLoading(false)
      }
    }

    return { error: deleteError, status: deleteStatus }
  }

  return {
    fetchUsers,
    createUser,
    updateUser,
    deleteUsers,
    error
  }
}
