export const useFetchPages = () => {
  const supabase = useSupabaseCustom()
  const { error, isPending, setError, setLoading, reset } = useAsyncError()

  const getPageAccess = async () => {
    const { data, error } = await supabase
        .from('page_access')
        .select('*')
    return { data, error }
  }

  const updatePageAccess = async (page: any) => {
    const { error } = await supabase
        .from('page_access')
        .update(page as never).eq('name', page.name)
    return { error }
  }

  return {
    getPageAccess,
    updatePageAccess,
    error
  }
}