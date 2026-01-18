import type { staff } from '~/components/Team.vue'

export const useFetchStaffProfiles = () => {
  const supabase = useSupabaseCustom()
  const { error, isPending, setError, setLoading, reset } = useAsyncError()

const fetchStaffProfiles = async () => {
    let fetchData: Array<staff> | null = null,
        fetchError: string | null | unknown = null,
        fetchStatus = null

    try {
        const { data, error }= await supabase.from('staff').select('*')
        if (error) {
            fetchError = error.message ?? 'Unkown error while fetching staff'
            fetchStatus = error.code ?? ''                
        }
        if (data) fetchData = data
    } catch (error) {
        fetchError = error;
        fetchStatus = "500"
    }
    
    return { data: fetchData, error: fetchError, status: fetchStatus }
}

const saveStaffProfile = async (filePath: string, file: File, profile: Record<string, string>, id: number) => {
    let saveError = null, 
        saveStatus = null
    try {        
        if(file && filePath) {
            // 1. Upload image to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('images') // Bucket name
                .upload(filePath, file)
            
            if (uploadError) throw uploadError

            // 2. Get public URL for the uploaded image
            const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath)

            profile.image_url = publicUrl
        }

        let query
        if (id) {
            query = supabase.from('staff').update(profile as never).eq('id', id)
        } else {    
            query = supabase.from('staff').insert([profile] as never)
        }
        const { error } = await query
        
        if (error) {
            saveError = error.message ?? 'Unkown error while creating staff profile'
            saveStatus = error.code ?? ''
        }
    } catch (error) {
        saveError = error;
        saveStatus = "500"
    }
    return { error: saveError, status: saveStatus }
};

const deleteStaffProfile = async (id: number, image_url: string) => {
    let deleteError = null, 
        deleteStatus = null
    if (!id) {
        deleteError = "Unable to remove selected staff profile"
        deleteStatus = "500"
    } else {
        try {
            // 1. Delete image from Supabase Storage
            if(image_url) {
                const filePath = image_url.split('/').pop()
                const { error: deleteImageError } = await supabase.storage
                    .from('images').remove([filePath] as never)
                
                if (deleteImageError) throw deleteImageError
            }

            // 2. Delete staff profile from database
            const { error } = await supabase.from('staff').delete().eq('id', id)
            if (error) {
                deleteError = error.message ?? 'Uknown error'
                deleteStatus = error.code ?? ''
            }
        } catch (error) {
            deleteError = `${deleteError}\n${error}`;
            deleteStatus = "500"
        }
    }
    return { error: deleteError, status: deleteStatus }
}

  return {
    fetchStaffProfiles,
    saveStaffProfile,
    deleteStaffProfile,
    error
  }
}