interface Event {
    id: number;             // Unique identifier for the event
    start_date: string;     // Start date in ISO format (YYYY-MM-DD)
    start_time: string;     // Start time in HH:MM:SS format
    end_date: string;       // End date in ISO format (YYYY-MM-DD)
    end_time: string;       // End time in HH:MM:SS format
    title: string;          // Title or description of the event
  }
  type Entry = {
    start_date: string;
    [key: string]: any; // Other fields in entry
  };
  
  type GroupObject = Record<string, Array<Entry>>;
  
const useFetchQueries = () => {
    const supabase = useSupabaseClient()
    const error = ref('');
    const pending = ref(true)
    const appointments = ref([]);
    const blankState = useState('blankState')
    const selectedAppointment = useState('selectedAppointment')
    const updatedAppointment = ref(blankState.value);

    const fetchAppointments = async (list = false, dateRange = null) => {
        pending.value = true
        const groupByDate = (data: Event[]) => {
            let group: GroupObject = {}
            for (const entry of data){
                const date = entry.start_date
                if(!group[date]){
                    group[date] = []
                }
                group[date].push(entry)
            }
            return group
        }
        const dateFrom = dateRange && dateRange.value ? dateRange.value.from.toDateString() : '2000-01-01'
        const dateTo = dateRange && dateRange.value ? dateRange.value.to.toDateString() : '3000-01-01'
        const { data } = await useAsyncData(`range-${dateFrom}-${dateTo}`, async () => {
            const { data, error } = await supabase.from('appointments').select('*').gte('date', dateFrom)
            .lte('date', dateTo).order('created_at', { ascending: true })
        
            let dataSet = []
            if (data && data.value) {
                dataSet = list ? groupByDate(data.value) : data.value
            } else {
                onError(500, error ? error.value : 'No records found')
            }
            return dataSet
        })
        pending.value = false
        return data
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
            error.value = e as string;
            onError( 500, `Unable to create a new appoinment record.\n${error.value}`)
        }
        await fetchAppointments();
        updatedAppointment.value = blankState.value;
    };

    const updateAppointment = async () => {
        if (!selectedAppointment.value) return;
        try {
        pending.value = true 
        updatedAppointment.value.id = selectedAppointment.value.id
        const { error } = await supabase.from('appointmemts').upsert([updatedAppointment.value])
        // await $fetch(`/api/appointments/${selectedAppointment.value.id}`, {
        //     method: 'PUT',
        //     body: appointment.value,
        // });
        if(error) throw(error)
        await fetchAppointments();
        updatedAppointment.value = blankState.value;
        selectedAppointment.value = null;
        } catch (e) {
            error.value = e as string;;
            onError( 500, `Unable to update your appoinment.\n${error.value}`)
        }
    }
      
    const deleteAppointment = async () => {
        if (!selectedAppointment.value) return;
        pending.value = true
        try {
          await supabase.from('appointments').delete().eq('id', selectedAppointment.value.id)
          await fetchAppointments();
          updatedAppointment.value = blankState.value;
          selectedAppointment.value = null
          useToastBar('Success', 'Appointment removed')
        } catch (e) {
          error.value = e as string;
          onError( 500, `Unable to remove selected appoinment\n${error.value}`)
        } finally {    
          pending.value = false
        }
    };

    const onError = (status: number, message = 'An unknown error has occured.') => {
        useToastBar('Error', `Error ${status}`, message)
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