export const useFetchQueries = () => {
    const supabase = useSupabaseClient()
    const error = ref('');
    const pending = ref(false)
    const blankState = useState('blankState')
    const selectedAppointment = useState('selectedAppointment')
    const updatedAppointment = useState('updatedAppointment') //ref(blankState.value)

    const fetchAppointments = async (pending, limit = null, list = false, dateRange = null) => {
        pending.value = true
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
        const today = new Date()
        const dateFrom = dateRange?.value?.from ? dateRange.value.from : today.toISOString().split('T')[0]
        const dateTo = dateRange?.value?.to ? dateRange.value.to : new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

        let prefix = 'all'
        const query = supabase.from('appointments').select('*').gte('start_date', dateFrom)
        .or(`end_date.lt.${dateTo},end_date.is.null`).order('start_date', { ascending: true }).order('start_time', { ascending: true })
        if (limit) {
            query.limit(limit)
            prefix = 'limit'
        }
        
        let dataSet = []
        for(let i = 0; i < 2; i++){    
            const { data } = await useAsyncData(`${prefix}-${dateFrom}-${dateTo}`, async () => {
                const { data, error } = await query
                if (error) {
                    saveError = error
                    saveStatus = '500'
                    return null; // Or throw an error to be caught by useAsyncData
                } 
                return { data };
            })
            if(data && data.value) dataSet = data.value
        }
        if (dataSet) {
            dataSet = list ? groupByDate(dataSet.data) : dataSet.data
        } else if (error){
            saveError = error
            saveStatus = '500'
        }
        let timesData = []
        if(!limit) {
            const response = await useAsyncData(`times-${dateFrom}-${dateTo}`, async () => {
                const { data: timesData, error } = await supabase.from('times').select('*')
                if (error) {
                    saveError = error
                    saveStatus = '500'
                    return null; // Or throw an error to be caught by useAsyncData
                }            
                return { timesData }
            })
            const dataValue = response.data?.value?.timesData
            if (dataValue && dataValue.length) timesData = dataValue
        }
        return { data: dataSet, timesData, isPending: pending, error: saveError, status: saveStatus }
    }

    const submitAppointment = async (appointment) => {
        let saveError = null
        let saveStatus = null
        let actionType = 'create'
        if (selectedAppointment.value) {
            const { error, status } = await updateAppointment(appointment)
            actionType = 'update'
            saveError = error
            saveStatus = status
        } else {
            try {
                pending.value = true
                const { data, error } = await supabase.from('appointments').insert([appointment]).select('id, start_date, start_time').single()
                // await $fetch('/api/appointments', {
                // method: 'POST',
                // body: appointment.value,
                // });
                
                if (error) {
                    saveError = error.message ?? 'Uknown error'
                    saveStatus = error.code ?? ''
                } else if (data && Object.keys(data).length) {
                    const { ['id']: value, ...rest } = data
                    const timesData = { ['record_id']: value, ...rest }
                    const { error } = await supabase.from('times').insert([timesData])
                }
            } catch (error) {
                saveError = error;
                saveStatus = "500"
            } finally {
                pending.value = false
            }
        }
        return { error: saveError, status: saveStatus, type: actionType, pending }
    };

    const updateAppointment = async (appointment) => {
        let saveStatus = null
        let saveError = null
        const changedValues = {}
        if (!appointment || !Object.keys(appointment).length) {
            saveError = "Failed to fetch selected appoinment" 
            saveStatus = "500"
        } else {
            for (const key in appointment) {
                if (key in appointment && key in selectedAppointment.value && appointment[key] !== selectedAppointment.value[key]) {
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
                        pending.value = true
                        const id = selectedAppointment.value.id
                        const { error } = await supabase.from('appointments').update(updatedValues).eq('id', id)
                        // await $fetch(`/api/appointments/${selectedAppointment.value.id}`, {
                        //     method: 'PUT',
                        //     body: appointment.value,
                        // });
                        if (error) {
                            saveError = error.message ?? 'Unkown error'
                            saveStatus = error.code ?? ''
                        } else {
                            const data = { start_date: appointment.start_date, start_time: appointment.start_time }
                            const { error } = await supabase.from('times').update(data).eq('record_id', id)      
                            selectedAppointment.value = null
                            updatedAppointment.value = null //blankState.value
                        }
                    } catch (error) {
                        saveError = error;
                        saveStatus = "500"
                    } finally {;
                        pending.value = false
                    }
                }
            }
        }
        return { error: saveError, status: saveStatus }
    }
      
    const deleteAppointment = async (pending) => {
        let deleteError = null
        let deleteStatus = null
        if (!selectedAppointment.value) {
            deleteError = "Unable to remove selected appoinment"
            deleteStatus = "500"
        } else {
            pending.value = true
            try {
                const id = selectedAppointment.value.id
                const { error } = await supabase.from('appointments').delete().eq('id', id)
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
                pending.value = false
            }
        }
        return { error: deleteError, isPending: pending, status: deleteStatus }
    };

    return {
        fetchAppointments,
        submitAppointment,
        updateAppointment,
        deleteAppointment,
        pending,
        updatedAppointment
    }
}