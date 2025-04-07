const useFetchQuerries = () => {
    const supabase = useSupabaseClient()
    const error = ref(null);
    const pending = ref(true)
    const appointments = ref([]);
    const appointment = ref({ name: '', email: '', dateTime: '', notes: '' });

    const fetchAppointments = async (dateRange = null) => {
        pending.value = true
        const { data, pending } = await useAsyncData(`range-${dateRange ? dateRange.value.from.toDateString() : 0}-${dateRange ? dateRange.value.to.toDateString() : 0}`, async () => {
            const {data, error} = await supabase.from(appointments).select().order('created_at', { ascending: true })
        
            if (error) {
            onError('500', error.value)
            } else if (data.value) {
            appointments.value = data.value;
        
            const groupByDate = computed(() => {
                let group = {}
                for (const entry of appointments.value){
                const date = new Date(entry.date)
                if(!group[date]){
                    group[date]
                }
                group[date].push(entry)
                }
                return group
            })
            }
        })
        pending.value = false
    };

    const submitAppointment = async () => {
        if (selectedAppointment.value) {
            await updateAppointment();
            return;
        }
        pending.value = true
        try {
            await $fetch('/api/appointments', {
            method: 'POST',
            body: appointment.value,
            });
        } catch (e) {
            error.value = e;
            onError( '500', error.value)
        }
        await fetchAppointments();
        appointment.value = { name: '', email: '', dateTime: '', notes: '' };
    };

    const updateAppointment = async () => {
        if (!selectedAppointment.value) return;
        pending.value = true
        await $fetch(`/api/appointments/${selectedAppointment.value.id}`, {
            method: 'PUT',
            body: appointment.value,
        });
        await fetchAppointments();
        appointment.value = { name: '', email: '', dateTime: '', notes: '' };
        selectedAppointment.value = null;
    };
      
    const deleteAppointment = async () => {
        if (!selectedAppointment.value) return;
        pending.value = true
        try {
          await supabase.from('appointments').delete().eq('id', selectedAppointment.value.id)
          await fetchAppointments();
          appointment.value = { name: '', address: '', email: '', phone: '', date: '', time: '', notes: '' };
          selectedAppointment.value = null
          useToast({title: 'Appointment removed', icon: 'i-heroicons-check-circle', color: 'green'})
        } catch (e) {
          error.value = e;
          useToast({title: 'Unable to remove selected appoinment', icon: 'i-heroicons-exclamation-circle', color: 'red'})
          onError( '500', error.value)
        } finally {    
          pending.value = false
        }
    };

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