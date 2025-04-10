const useFetchQueries = () => {
    const supabase = useSupabaseClient()
    const error = ref(null);
    const pending = ref(true)
    const appointments = ref([]);
    const appointment = ref({ name: '', email: '', dateTime: '', notes: '' });

    const fetchAppointments = async (list = false, dateRange = null) => {
        pending.value = true
        const groupByDate = (data) => {
            let group = {}
            for (const entry of data){
                const date = new Date(entry.date)
                if(!group[date]){
                    group[date] = []
                }
                group[date].push(entry)
            }
            return group
        }
        let dataSet
        const dateFrom = dateRange.value ? dateRange.value.from.toDateString() : '2000-01-01'
        const dateTo = dateRange.value ? dateRange.value.to.toDateString() : '3000-01-01'
        const { data } = await useAsyncData(`range-${dateFrom}-${dateTo}`, async () => {
            const { data, error } = await supabase.from(appointments).select('*').gte('date', dateFrom)
            .lte('date', dateTo).order('created_at', { ascending: true })
        
            if (data.value) {
                dataSet = list ? groupByDate(data.value) : data.value
            } else {
                onError('500', error ? error.value : 'No records found')
            }
        })
        pending.value = false
        return dataSet
    };

    const submitAppointment = async () => {
        if (selectedAppointment.value) {
            await updateAppointment();
            return;
        }
        pending.value = true
        try {
            const { error } = await supabase.from('appointmemts').insert([appointment.value])
            // await $fetch('/api/appointments', {
            // method: 'POST',
            // body: appointment.value,
            // });
            if(error) throw(error)
            else useToastBar('Success', 'Appointment removed')
        } catch (e) {
            error.value = e;
            onError( '500', `Unable to create a new appoinment record.\n${error.value}`)
        }
        await fetchAppointments();
        appointment.value = { name: '', email: '', dateTime: '', notes: '' };
    };

    const updateAppointment = async () => {
        if (!selectedAppointment.value) return;
        try {
        pending.value = true 
        appointment.value.id = selectedAppointment.value.id
        const { error } = await supabase.from('appointmemts').upsert([appointment.value])
        // await $fetch(`/api/appointments/${selectedAppointment.value.id}`, {
        //     method: 'PUT',
        //     body: appointment.value,
        // });
        if(error) throw(error)
        await fetchAppointments();
        appointment.value = { name: '', email: '', dateTime: '', notes: '' };
        selectedAppointment.value = null;
        } catch (e) {
            error.value = e;
            onError( '500', `Unable to update your appoinment.\n${error.value}`)
        }
    }
      
    const deleteAppointment = async () => {
        if (!selectedAppointment.value) return;
        pending.value = true
        try {
          await supabase.from('appointments').delete().eq('id', selectedAppointment.value.id)
          await fetchAppointments();
          appointment.value = { name: '', address: '', email: '', phone: '', date: '', time: '', notes: '' };
          selectedAppointment.value = null
          useToastBar('Success', 'Appointment removed')
        } catch (e) {
          error.value = e;
          onError( '500', `Unable to remove selected appoinment\n${error.value}`)
        } finally {    
          pending.value = false
        }
    };

    const onError = (status, message = 'An unknown error has occured.') => {
        useToastBar('Error', `Error ${status}`, message)
        throw createError({ statusCode: status, message: message});
    }

    return {
        querries: {
            fetchAppointments,
            submitAppointment,
            updateAppointment,
            deleteAppointment,
            pending
        }
    }
}