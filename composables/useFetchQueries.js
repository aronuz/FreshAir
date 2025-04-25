export const useFetchQueries = () => {
    const supabase = useSupabaseClient()
    const error = ref('');
    const pending = ref(true)
    const appointments = ref([]);
    const blankState = useState('blankState')
    const selectedAppointment = useState('selectedAppointment')
    const updatedAppointment = ref(blankState.value)
    const { toastBar } = useToastBar()

    const fetchAppointments = async (onError, pending, list = false, dateRange = null) => {
        pending.value = true
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
        const dateFrom = dateRange && dateRange.value ? dateRange.value.from.toDateString() : '2025-04-01'
        const dateTo = dateRange && dateRange.value ? dateRange.value.to.toDateString() : '2025-04-30'
        const { data } = await useAsyncData(`range-${dateFrom}-${dateTo}`, async () => {
            console.log('in async')
            const { data, error } = await supabase.from('Appointments').select('*').gte('start_date', dateFrom)
            .lte('start_date', dateTo).order('created_at', { ascending: true })
        
            if (error) {
                console.error('Supabase error:', error);
                return null; // Or throw an error to be caught by useAsyncData
            }
            return data;
        })
        let dataSet = []
        if (data && data.value) {
            dataSet = list ? groupByDate(data.value) : data.value
        } else if (error.value) {
            onError(500, error.value.message || 'Failed to fetch records')
        } else {
            onError(204, 'No records found for the selected date range.')
        }
        return { data: dataSet, isPending: pending, error }
    };

    const submitAppointment = async (appointment) => {
        if (selectedAppointment) {
            await updateAppointment();
            return;
        }
        pending.value = true
        try {
            const { error } = await supabase.from('appointmemts').insert([{...appointment.value}])
            // await $fetch('/api/appointments', {
            // method: 'POST',
            // body: appointment.value,
            // });
            if(error) throw(error)
            else toastBar('Success', 'Appointment removed')
        } catch (e) {
            error.value = e;
            onError( 500, `Unable to create a new appoinment record.\n${error.value}`)
        }
        await fetchAppointments();
        updatedAppointment.value = blankState.value;
    };

    const updateAppointment = async () => {
        if (!selectedAppointment) return;
        try {
        pending.value = true 
        updatedAppointment.value.id = selectedAppointment.value.id
        const { error } = await supabase.from('appointmemts').upsert(updatedAppointment.value)
        // await $fetch(`/api/appointments/${selectedAppointment.value.id}`, {
        //     method: 'PUT',
        //     body: appointment.value,
        // });
        if(error) throw(error)
        await fetchAppointments();
        updatedAppointment.value = blankState.value;
        selectedAppointment.value = null
        } catch (e) {
            error.value = e
            onError( 500, `Unable to update your appoinment.\n${error.value}`)
        }
    }
      
    const deleteAppointment = async () => {
        if (!selectedAppointment.value) return;
        pending.value = true
        try {
          const id = selectedAppointment.value.id 
          await supabase.from('appointments').delete().eq('id', id)
          await fetchAppointments();
          updatedAppointment.value = blankState.value;
          selectedAppointment.value = null
          toastBar('Success', 'Appointment removed')
        } catch (e) {
          error.value = e
          onError( 500, `Unable to remove selected appoinment\n${error.value}`)
        } finally {    
          pending.value = false
        }
    };

    const onError = (status, message = 'An unknown error has occured.') => {
        toastBar('Error', `Error ${status}`, message)
        throw createError({ statusCode: status, message: message});
    }

    return {
        fetchAppointments,
        submitAppointment,
        updateAppointment,
        deleteAppointment,
        pending,
        updatedAppointment
    }
}