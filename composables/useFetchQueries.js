export const useFetchQueries = () => {
    const error = ref(''), 
        isPending = ref(false),
        selectedAppointment = useState('selectedAppointment'),
        updatedAppointment = useState('updatedAppointment')

    const getSupabase = () => {
        const client = useSupabaseClient();
        if (!client) {
            throw new Error('Supabase client is not available in current context');
        }
        return client;
    }

    const fetchUsers = async (pending, userId = null) => {
        let fetchData = null,
            fetchError = null,
            fetchStatus = null

        isPending.value = pending

        try {
            const supabase = getSupabase()
            const { data, error } = await supabase.rpc('get_user_data_and_role', { user_uuid: userId })
            if (error) {
                fetchError = error.message ?? 'Unkown error while creating user'
                fetchStatus = error.code ?? ''                
            }
            if (data) fetchData = data
        } catch (error) {
            fetchError = error;
            fetchStatus = "500"
        } finally {    
            isPending.value = false
        }
        
        return { data: fetchData, error: fetchError, status: fetchStatus, isPending }
    }

    const createUser = async (user) => {
        let saveData = null
            saveError = null, 
            saveStatus = null
        try {
            const supabase = getSupabase()
            let userObj
            if (typeof user === 'string') {
                userObj = {
                    user_id: user,
                    title: '',
                    phone: ''
                }
            } else {
                userObj = user
            }
            const { data, error } = await supabase.from('users').upsert([userObj], { onConflict: 'user_id' })
            
            if (error) {
                saveError = error.message ?? 'Unkown error while creating user'
                saveStatus = error.code ?? ''
            } else saveData = data
        } catch (error) {
            saveError = error;
            saveStatus = "500"
        }
        return { data: saveData, error: saveError, status: saveStatus }
    };

    const deleteUsers = async (pending, user_ids) => {
        let deleteError = null, 
            deleteStatus = null
        if (!user_ids || !user_ids.length) {
            deleteError = "Unable to remove selected user(s)"
            deleteStatus = "500"
        } else {
            isPending.value = pending
            try {
                const supabase = getSupabase()
                const { error } = await supabase.from('users').delete().in('user_id', user_ids)
                if (error) {
                    deleteError = error.message ?? 'Uknown error'
                    deleteStatus = error.code ?? ''
                }
            } catch (error) {
                deleteError = `${deleteError ?? ''}\n${error instanceof Error ? error.message : String(error)}`
                deleteStatus = "500"
            } finally {    
                isPending.value = false
            }
        }
        return { error: deleteError, status: deleteStatus, isPending }
    };

    const updateUser = async (user) => {
        let saveData = null
        let saveStatus = null
        let saveError = null
        try {
            const supabase = getSupabase(),
                userData = { title: user.title, email: user.email, phone: user.phone }
            
            let query = supabase.from('users').select('*')
            if (user.id) {
                query = query.eq('id', user.id)
            } else if (user.user_id) {
                query = query.eq('user_id', user.user_id)
            }
            const { data, error } = await query.single()
            if (error) {
                saveError = error.message ?? 'Unkown error'
                saveStatus = error.code ?? ''
            } else {
                if (data) {
                    const isChanged = Object.keys(userData).some(key => userData[key] !== data[key])
                    if (isChanged) {
                        Object.assign(userData, { id: data.id })
                        const { error } = await supabase.from('users').upsert(userData)
                        if (error) {
                            saveError = error.message ?? 'Unkown error while updating user data'
                            saveStatus = error.code ?? ''
                        } else {
                            saveData = {id: data.id, user_id: data.user_id} 
                        } 
                    } else {
                        saveData = {user_id: data.user_id}
                    }
                } else {
                    const { data, error, status } = await createUser(userData)
                    if (error) {
                        saveError = error
                        saveStatus = status
                    } else if (data) {
                        saveData = {user_id: data.user_id}
                    }
                }
            }
        } catch (error) {
            saveError = error;
            saveStatus = "500"
        } finally {;
            isPending.value = false
        }
        return { data: saveData, error: saveError, status: saveStatus, isPending }
    }

    const updatePageAccess = async (page) => {
        const supabase = getSupabase()
        const { error } = await supabase
            .from('page_access')
            .update(page).eq('name', page.name)
        return { error }
    }

    const getPageAccess = async (page) => {
        const supabase = getSupabase()
        const { data, error } = await supabase
            .from('page_access')
            .select('*')
        return { data, error }
    }

    const fetchAppointments = async ({pending, limit = 0, id = null, list = false, index = false, startDate = null, endDate = null}) => {
        console.log('fetchAppointments called')
        isPending.value = pending.value
        let saveError = null
        let saveStatus = null
        const groupByDate = (data) => {
            let group = {}
            for (const entry of data){
                const date = entry.start_date
                if(!group[date]){
                    group[date] = []
                }
                group[date].push(entry)
            }
            return group
        }
        const supabase = getSupabase(),
            today = new Date(),
            dateFrom = startDate?.value ? startDate.value : today.toISOString().split('T')[0],
            dateTo = endDate?.value ? endDate.value : new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

        let prefix = 'all'
        const query = supabase.from('appointments').select('*, users!inner(*)')
        
        if(id){
            query.eq('user_id', id)
            prefix = `id_${id}`
        }

        query.gte('start_date', dateFrom)
        .or(`end_date.lt.${dateTo},end_date.is.null`).order('start_date', { ascending: true }).order('start_time', { ascending: true })
        
        if (limit) {
            query.limit(limit)
            prefix = `${prefix}_limit`
        }
        
        let eventData = null
        
        if(index) {
            const { data, error } = await query
            if (error) {
                saveError = error
                saveStatus = '500'
            } else if (data && data.length) {
                eventData = data
            }
        } else {
            // Use useAsyncData but always return the data, whether from cache or fresh fetch
            const { data } = await useAsyncData(`${prefix}-${dateFrom}-${dateTo}`, async () => {
                console.log('useAsyncData callback executing - fetching from database')
                const { data, error } = await query
                if (error) {
                    saveError = error
                    saveStatus = '500'
                    return null;
                } 
                return { data };
            })//, { server: false, lazy: true }
            if (data) eventData = data?.value?.data || []
        }
                
        let dataSet = null, timesData = []
        // Always return the data, whether it came from cache or fresh fetch
        if(eventData && eventData.length > 0) {
            dataSet = list ? groupByDate(eventData) : eventData
                    
            if(!limit && !id) {
                const response = await useAsyncData(`times-${dateFrom}-${dateTo}`, async () => {
                    const { data: timesData, error } = await supabase.from('times').select('*')
                    if (error) {
                        saveError = error
                        saveStatus = '500'
                        return null;
                    }            
                    return { timesData }
                })
                const dataValue = response.data?.value?.timesData
                if (dataValue && dataValue.length) timesData = dataValue
            }
        }
        
        return { data: dataSet, timesData, isPending, error: saveError, status: saveStatus }
    }

    const submitAppointment = async (appointment) => {
        let saveData = null
        let saveError = null
        let saveStatus = null
        let actionType = 'create'
        if (selectedAppointment.value) {
            const { data, error, status } = await updateAppointment(appointment)
            actionType = 'update'
            saveData = data
            saveError = error
            saveStatus = status
        } else {
            try {
                isPending.value = true
                
                const supabase = getSupabase()
                const { title, email, phone, ...rest } = appointment
                const appoinmentData = { ...rest }
                const userData = { title, email, phone }
                const { data, error } = await supabase.from('appointments').insert([appoinmentData]).select('id, start_date, start_time, user_id').single()
               
                // await $fetch('/api/appointments', {
                // method: 'POST',
                // body: appointment.value,
                // });
                
                if (error) {
                    saveError = error.message ?? 'Uknown error - appointment data not saved'
                    saveStatus = error.code ?? ''
                } else if (data && Object.keys(data).length) {
                    saveData = data
                    const { error: userError, status } = await updateUser({ ...userData, user_id: data.user_id })
                    if (userError) {
                        saveError = userError
                        saveStatus = status
                    }
                    const { ['id']: value, start_date, start_time } = data
                    const timesDataRow = { ['record_id']: value, start_date, start_time }
                    const { error: timesError } = await supabase.from('times').insert([timesDataRow]).select('*').single()
                    if (timesError) {
                        saveError = timesError.message ?? 'Uknown error - times data not updated'
                        saveStatus = timesError.code ?? ''
                    }
                }
            } catch (error) {
                saveError = error;
                saveStatus = "500"
            } finally {
                isPending.value = false
            }
        }
        return { data: saveData, error: saveError, status: saveStatus, type: actionType, isPending }
    };

    const updateAppointment = async (appointment) => {
        let saveData = null
        let saveStatus = null
        let saveError = null
        const changedValues = {}
        if (!appointment || !Object.keys(appointment).length) {
            saveError = "Failed to fetch selected appoinment" 
            saveStatus = "500"
        } else {
            for (const key in appointment) {
                if (key in selectedAppointment.value && appointment[key] !== selectedAppointment.value[key]) {
                    changedValues[key] = !['start_date', 'end_date'].includes(key) ? appointment[key] : new Date(appointment[key]).toISOString().split('T')[0]
                }
            }
            if (Object.keys(changedValues).length) {
                const updatedValues = Object.fromEntries(
                    Object.entries(changedValues).filter(([_key, value]) => value !== '')
                ) 
                if (!Object.keys(updatedValues).length) {                
                    saveError = "Failed to update selected appoinment" 
                    saveStatus = "500"
                }else{
                    try {
                        isPending.value = true

                        const supabase = getSupabase()
                        const { title, email, phone, ...rest } = updatedValues
                        const userData = { title, email, phone }
                        const id = selectedAppointment.value.id
                        const { data, error } = await supabase.from('appointments').update({...rest}).eq('id', id).select('*').single()
                        // await $fetch(`/api/appointments/${selectedAppointment.value.id}`, {
                        //     method: 'PUT',
                        //     body: appointment.value,
                        // });
                        if (error) {
                            saveError = error.message ?? 'Unkown error'
                            saveStatus = error.code ?? ''
                        } else {
                            saveData = data
                            const { error: userError, status } = await updateUser({ ...userData, user_id: data.user_id })
                            if (userError) {
                                saveError = userError
                                saveStatus = status
                            }
                            const timesDataRow = { ['record_id']: id, start_date: appointment.start_date, start_time: appointment.start_time }
                            const { error: timesError } = await supabase.from('times').upsert(timesDataRow).onconflict('record_id').select('*').single()
                            if (timesError) {
                                saveError = userError.message ?? 'Uknown error - times data not updated'
                                saveStatus = userError.code ?? ''
                            }
                               
                            selectedAppointment.value = null
                            updatedAppointment.value = null //blankState.value
                        }
                    } catch (error) {
                        saveError = error;
                        saveStatus = "500"
                    } finally {
                        isPending.value = false
                    }
                }
            }
        }
        return { data: saveData, error: saveError, status: saveStatus }
    }
      
    const deleteAppointment = async (id, pending) => {
        let deleteError = null
        let deleteStatus = null
        if (!selectedAppointment.value) {
            deleteError = "Unable to remove selected appoinment"
            deleteStatus = "500"
        } else {
            isPending.value = true
            try {
                const supabase = getSupabase()
                const { error } = await supabase.from('users').delete().eq('id', id)
                if (error) {
                    deleteError = error.message ?? 'Uknown error'
                    deleteStatus = error.code ?? ''
                } else {
                    const { error } = await supabase.from('times').delete().eq('record_id', id)
                    selectedAppointment.value = null
                }
            } catch (error) {
                deleteError = `${deleteError}\n${error}`;
                deleteStatus = "500"
            } finally {    
                isPending.value = false
            }
        }
        return { error: deleteError, status: deleteStatus, isPending }
    };

    const fetchStaffProfiles = async () => {
        let fetchData = null,
            fetchError = null,
            fetchStatus = null

        try {
            const supabase = getSupabase()
            const { data, error }  = await supabase.from('staff').select('*')
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

    const saveStaffProfile = async (filePath, file, profile, id) => {
        let saveError = null, 
            saveStatus = null
        try {
            const supabase = getSupabase()
            
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

            let query = supabase.from('staff')
            if (id) {
                query = query.update(profile).eq('id', id)
            } else {    
                query = query.insert([profile])
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

    return {
        fetchUsers,
        createUser,
        updateUser,
        deleteUsers,
        getPageAccess,
        updatePageAccess,
        fetchAppointments,
        submitAppointment,
        updateAppointment,
        deleteAppointment,
        fetchStaffProfiles,
        saveStaffProfile,
        pending: isPending,
        updatedAppointment
    }
}