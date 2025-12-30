import type { UserData } from './useFetchUsers'

import type { TimesDataItem } from '../stores/events'

interface FetchOptions {
  id?: number | null
  limit: number
  list: boolean
  index: boolean
  startDate?: Ref<string> | null,
  endDate?: Ref<string> | null
}

export interface AppointmentData {
  id?: number | null
  user_id: string
  title: string
  email?: string
  phone: string
  start_date: string
  start_time: string
  end_date?: string | null
  end_time?: string | null
  notes?: string | null
}

const groupByDate = (data: AppointmentData[]) => {
  let group: { [key: string]: AppointmentData[] } = {}
  for (const entry of data){
      const date = entry.start_date
      if(!group[date]){
          group[date] = []
      }
      group[date].push(entry)
  }
  return group
}

export const useFetchAppointments = () => {
  const supabase = useSupabaseClient()
  const { error, isPending, setError, setLoading, reset } = useAsyncError()

  const fetchAppointments = async ({limit = 0, id = null, list = false, index = false, startDate = null, endDate = null}: Partial<FetchOptions>) => {
    //console.log('fetchAppointments called')
    
    let saveError = null
    let saveStatus = null
    
    const today = new Date(),
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
    
    let eventData: AppointmentData[] | null = null
    
    if(index) {
        const { data, error } : { data: AppointmentData[] | null, error: any } = await query
        if (error) {
            saveError = error
            saveStatus = '500'
        } else if (data && data.length) {
            eventData = data
        }
    } else {
        // Use useAsyncData but always return the data, whether from cache or fresh fetch
        const { data } = await useAsyncData(`${prefix}-${dateFrom}-${dateTo}`, async () => {
            //console.log('useAsyncData callback executing - fetching from database')
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
            
    let dataSet = null, timesData: TimesDataItem[] = []
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
    
    return { data: dataSet, timesData, error: saveError, status: saveStatus }
  }

  const submitAppointment = async (appointment: Omit<AppointmentData, 'id'> | Partial<AppointmentData>) => {
    let saveData: Partial<AppointmentData> | null = null
    let saveError = null
    let saveStatus = null
    let actionType = 'create'
    const selectedAppointment = useState<AppointmentData | null>('selectedAppointment')
    if (selectedAppointment.value) {
        const { data, error, status } = await updateAppointment(appointment, selectedAppointment)
        actionType = 'update'
        saveData = data
        saveError = error
        saveStatus = status
    } else {
      setLoading(true)
      try {                
        const supabase = useSupabaseClient()
        const { title, email, phone, ...rest } = appointment
        const appoinmentData = { ...rest }
        const userData = { title, email, phone }
        const { data, error } : { data: Partial<AppointmentData> | null, error: any } = await supabase.from('appointments').insert([appoinmentData] as never).select('id, start_date, start_time, user_id').single()
        
        // await $fetch('/api/appointments', {
        // method: 'POST',
        // body: appointment.value,
        // });
        
        if (error) {
          saveError = error.message ?? 'Uknown error - appointment data not saved'
          saveStatus = error.code ?? ''
        } else if (data && Object.keys(data).length) {
          saveData = data
          const { updateUser } = useFetchUsers()
          const { error: userError, status } = await updateUser({ ...userData, user_id: saveData.user_id })
          if (userError) {
              saveError = userError
              saveStatus = status
          }
          const { ['id']: value, start_date, start_time } = data
          const timesDataRow = { ['record_id']: value, start_date, start_time }
          const { error: timesError } = await supabase.from('times').insert([timesDataRow] as never).select('*').single()
          if (timesError) {
              saveError = timesError.message ?? 'Uknown error - times data not updated'
              saveStatus = timesError.code ?? ''
          }
        }
      } catch (error) {
          saveError = error;
          saveStatus = "500"
      } finally {
          setLoading(false)
      }
    }
    return { data: saveData, error: saveError, status: saveStatus, type: actionType }
  };

  const updateAppointment = async (appointment: Omit<AppointmentData, 'id'> | Partial<AppointmentData>, selectedAppointment: Ref<AppointmentData | null>) => {
    let saveData: Partial<AppointmentData> | null = null
    let saveStatus = null
    let saveError = null
    const changedValues: AppointmentData | {} = {}
    if (!appointment || !Object.keys(appointment).length) {
        saveError = "Failed to fetch selected appoinment" 
        saveStatus = "500"
    } else {
        for (const key in appointment) {
            type AppointmentDataWithoutId = Omit<AppointmentData, "id">
            type appValue = AppointmentDataWithoutId[keyof AppointmentDataWithoutId]
          if (key !== 'id') {
            if (selectedAppointment.value && key in selectedAppointment.value && appointment[key as keyof AppointmentDataWithoutId] as appValue !== selectedAppointment.value[key as keyof AppointmentData]) {
              Object.assign(changedValues, { [key]: ['start_date', 'end_date'].includes(key) ? new Date(appointment[key as keyof AppointmentDataWithoutId] as string | number | Date).toISOString().split('T')[0] : appointment[key as keyof AppointmentDataWithoutId] as appValue})
            }
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
                // setLoading(true)
                try {
                    const { title, email, phone, ...rest } = updatedValues
                    const userData = { title, email, phone }
                    const id = selectedAppointment.value!.id
                    const { data, error } : { data: Partial<AppointmentData> | null, error: any } = await supabase.from('appointments').update({...rest} as never).eq('id', id as never).select('*').single()
                    // await $fetch(`/api/appointments/${selectedAppointment.value.id}`, {
                    //     method: 'PUT',
                    //     body: appointment.value,
                    // });
                    if (error) {
                        saveError = error.message ?? 'Unkown error'
                        saveStatus = error.code ?? ''
                    } else if (data && Object.keys(data).length) {
                        saveData = data
                        const { updateUser } = useFetchUsers()
                        const { error: userError, status } = await updateUser({ ...userData, user_id: saveData.user_id } as UserData)
                        if (userError) {
                            saveError = userError
                            saveStatus = status
                        }
                        const timesDataRow = { ['record_id']: id, start_date: appointment.start_date, start_time: appointment.start_time }
                        const { error: timesError } = await supabase.from('times').upsert(timesDataRow as never, {onConflict: 'record_id'}).select('*').single()
                        if (timesError) {
                            saveError = timesError.message ?? 'Uknown error - times data not updated'
                            saveStatus = timesError.code ?? ''
                        }
                            
                        selectedAppointment.value = null
                        const updatedAppointment = useState('updatedAppointment')
                        updatedAppointment.value = null //blankState.value
                    }
                } catch (error) {
                    saveError = error;
                    saveStatus = "500"
                } finally {
                    // isPending.value = false
                }
            }
        }
    }
    return { data: saveData, error: saveError, status: saveStatus }
  }
      
  const deleteAppointment = async (id: number) => {
    let deleteError = null
    let deleteStatus = null
    const selectedAppointment = useState('selectedAppointment')
    if (!selectedAppointment.value) {
      deleteError = "Unable to remove selected appoinment"
      deleteStatus = "500"
    } else {
      setLoading(true)
      try {
        const { error } = await supabase.from('users').delete().eq('id', id)
        if (error) {
            deleteError = error.message ?? 'Unknown error'
            deleteStatus = error.code ?? ''
        } else {
            const { error } = await supabase.from('times').delete().eq('record_id', id)
            selectedAppointment.value = null
        }
      } catch (error) {
        deleteError = `${deleteError}\n${error}`;
        deleteStatus = "500"
      } finally {    
        setLoading(false)
      }
    }
    return { error: deleteError, status: deleteStatus }
  };
  return {
    fetchAppointments,
    submitAppointment,
    updateAppointment,
    deleteAppointment,
    error
  }
}