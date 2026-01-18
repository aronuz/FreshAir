interface reviewType {
  id?: number
  name: string,
  rating: number,
  content: string,
  created_at?: Date,
  verified?: boolean,
}

export const useFetchReviews = () => {
  const supabase = useSupabaseCustom()
  const { error, isPending, setError, setLoading, reset } = useAsyncError()

  const fetchReviews = async (all: boolean) => {
    let fetchData = null,
        fetchError = null,
        fetchStatus = null

    try {
        let query = supabase.from('reviews').select('*').order('created_at', { ascending: false })
        if (!all) query = query.limit(3)
        const { data, error } = await query
        if (error) {
            fetchError = error.message ?? 'Unkown error while creating user'
            fetchStatus = error.code ?? ''                
        }
        if (data) fetchData = data
    } catch (error) {
        fetchError = error;
        fetchStatus = "500"
    }
    return { data: fetchData, error: fetchError, status: fetchStatus }
  }

  const addReview = async (review: reviewType) => {
    let saveData = null
    let saveError = null
    let saveStatus = null

    try {
        const { data, error } = await supabase.from('reviews').insert([review] as never).select('id, name, rating, content, verified, created_at').single()
        if (error) {
            saveError = error.message ?? 'Uknown error - appointment data not saved'
            saveStatus = error.code ?? ''
        } else {
            saveData = data
        }

    } catch (error) {
        saveError = `${saveError}\n${error}`;
        saveStatus = "500"
    }
    return { data: saveData, error: saveError, status: saveStatus }
  }
  
  return {
    fetchReviews,
    addReview,
    error
  }
}