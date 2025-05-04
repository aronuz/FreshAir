<template>
  <UModal 
    v-model:open="isOpen"
    :title="!updatedAppointment ? 'New Appointment' : 'Reschedule Service'"
    :close="{
      color: 'primary',  
      variant: 'outline',
      class: 'rounded-full',
      onClick: () => isOpen = false
    }"
  >
    <template #body>
      <!-- <UCard variant="soft"> -->
        <UForm :state=appointment :schema="schema" ref="appform" @submit.prevent="saveAppointment">
          <UFormField required label="Name" name="title" class="mb=4">
            <UInput placeholder="Name" v-model="appointment.title"/>
          </UFormField>
          <UFormField label="Email" name="email" class="mb=4">
            <UInput placeholder="Email" v-model="appointment.email"/>
          </UFormField>
          <UFormField required label="Phone" name="phone" class="mb=4">
            <UInput placeholder="Phone" v-model="appointment.phone"/>
          </UFormField>
          <UFormField required label="Address" name="address" class="mb=4">
            <UInput type="address" v-model="appointment.address" placeholder="Address" />
          </UFormField>
          <UFormField label="Start Date" name="start_date">
            <UInput type="date" v-model="formattedStartDate" @update:modelValue="updateStartDate"/>
          </UFormField>
          <UFormField label="Start Time" name="start_time">
            <UInput type="time" v-model="appointment.start_time" />
          </UFormField>
          <UFormField label="End Date" name="end_date">
            <UInput type="date" v-model="formattedEndDate" @update:modelValue="updateEndDate"/>
          </UFormField>
          <UFormField label="End Time" name="end_time" :required="!!appointment.end_date">
            <UInput type="time" v-model="appointment.end_time" />
          </UFormField>
          <UFormField label="Notes" name="notes">
            <UTextarea variant="outline" v-model="appointment.notes" placeholder="Notes" />
          </UFormField>
          <UButton type="submit" color="primary" variant="solid" :label="saveLabel" :loading="pending" @onClick="" />
        </UForm>
        <!-- template #footer>Add Appointment</template -->
      <!-- </UCard> -->
    </template>
  </UModal>   
</template>

<script lang="ts" setup>
  import { z } from 'zod'
  
  import { useFetchQueries} from '~/composables/useFetchQueries'

  interface stateType {
    id?: number,
    title: string | undefined,
    email: string | undefined,
    phone: string | undefined,
    address: string | undefined,
    start_date: Date | string | undefined,
    start_time: string | undefined,
    end_date: Date | string | undefined,
    end_time: string | undefined,
    notes: string | undefined
  }
  
  const { toastBar } = useToastBar()

  const initState: stateType = {
    title: undefined,
    email: undefined,
    phone: undefined,
    address: undefined,
    start_date: undefined,
    start_time: undefined,
    end_date: undefined,
    end_time: undefined,
    notes: undefined
  }
  const blankState: Ref<stateType> = useState('selectedAppointment', () => initState)
  const selectedAppointment = useState('selectedAppointment')

  const { 
        submitAppointment,
        updatedAppointment,
        pending
      } = useFetchQueries()

  const props = defineProps({
    modelValue: Boolean,
    existingRecords: Object
  })
  const emit = defineEmits(['update:modelValue', 'saved'])

  const schema = z.object({
    title: z.string(),
    email: z.string().optional(),
    phone: z.string(),
    address: z.string(),
    start_date: z.coerce.date().refine((date) => date > new Date(), {
      message: 'Date must be in the future.',
    }),
    start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)/, {
      message: "Invalid time format (expected HH:mm)",
    }), 
    end_date: z.coerce.date().optional(),
    end_time: z.string().optional(),
    notes: z.string().optional(),
  }).refine(
    (data) => {
      return isTimeOverlap(data.start_date, data.start_time)
    },
    {
      message: 'Selected time is not available. Please choose a different time.',
      path: ['startTime'],
    }
  ).refine(
    (data) => {
      if (data.end_date && data.start_date && data.start_date <= data.end_date) {
        return false
      }
      return true
    },
    {
      message: 'End date must be after the start date.',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.end_date && !data.end_time) {
        return false
      }
      return true
    },
    {
      message: 'End time is required if end date is provided.',
      path: ['endTime'],
    }
  ).refine(
    (data) => {
      if (data.end_time) {
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/
        const time = data.end_time!.toString()
        return regex.test(time)
      }
      return true
    },
    {
      message: "Invalid time format (expected HH:mm)",
      path: ['endTime'],
    }
  )

  const appform = ref()

  const saveLabel = ref('Save')

  const appointment = reactive({...initState})

  const blankForm = () => {
    formattedStartDate.value = null
    formattedEndDate.value = null
    Object.assign(appointment, initState)
    appform.value.clear()
  } 

  // A computed property or watcher to format the Date object
  const formattedStartDate = ref(appointment.start_date ? (appointment.start_date as Date).toISOString().split('T')[0]: null)

  // To handle changes from UInput and update the original Date object
  function updateStartDate(newDateString: string) {
    appointment.start_date = new Date(newDateString)
    formattedStartDate.value = newDateString // Keep the formatted string in sync
  }

  // A computed property or watcher to format the Date object
  const formattedEndDate = ref(appointment.end_date ? (appointment.end_date as Date).toISOString().split('T')[0]: null)

  // To handle changes from UInput and update the original Date object
  function updateEndDate(newDateString: string) {
    appointment.end_date = new Date(newDateString)
    formattedEndDate.value = newDateString // Keep the formatted string in sync
  }

  const saveAppointment = async () => {
    if (appform.value.errors.length) {
      let errors = ''
      for (const error in appform.value.errors) {
        errors += `${error} `
      }
      showError('500', errors)
    } else {
      console.log(appointment)
      const sanitizedAppointment = Object.fromEntries(
        Object.entries(appointment).map(([key, value]) => [key, value === undefined ? null : value])
      )
      sanitizedAppointment.start_date = sanitizedAppointment.start_date
      ? sanitizedAppointment.start_date.toISOString().split('T')[0]
      : null
      sanitizedAppointment.end_date = sanitizedAppointment.end_date
      ? sanitizedAppointment.end_date.toISOString().split('T')[0]
      : null
      const { error, status, type } = await submitAppointment(sanitizedAppointment) 
      if(error){const action = type === 'create' ? 'create a new': 'update'
        showError(status, `Unable to ${action} appoinment record.\n${JSON.stringify(error)}`)
      } else {
        toastBar('Success', `Service ${type === 'update' ? 're':''}scheduled`)
        isOpen.value = false
        emit('saved')
      }
    }
  }

  watch(updatedAppointment as Ref<stateType>, (value) => {
    if (value){
      // appointment = {...value, email: value.email ?? '', end_time: value.end_time ?? '', notes: value.notes ?? ''}
      Object.assign(appointment, {...value, email: value.email ?? '', end_time: value.end_time ?? '', notes: value.notes ?? ''})
      appointment.start_date = new Date(value.start_date as string)
      if(value.end_date) appointment.end_date = new Date(value.end_date as string)
      else appointment.end_date = undefined
      saveLabel.value = 'Update'
      try{
        const val = schema.parse(appointment)
        console.log('Parsed User Data:', val)
      }catch(error){
        console.error('Validation Error:', error.errors)
      }
    } else {
      saveLabel.value = 'Save'
    }
  })

  const isOpen = computed({
    get: () => props.modelValue,
    set: (val: Boolean) => {
      if (!val) blankForm()
      emit('update:modelValue', val)
    }
  })

  watch(isOpen, (value) => {
    if (!value && selectedAppointment.value) {
      const selectedEl = document.querySelector(`.fc-event[data-event-id="${selectedAppointment.value.id}"]`)
      if (selectedEl) selectedEl.classList.remove('selected-slot')
      selectedAppointment.value = null
      updatedAppointment.value = null 
      delete appointment.id
    }
  })

  function isTimeOverlap(newStartDate: Date, newStartTime: string) {
    const diffInMs = 2 * 3600 * 1000 // Two hours in milliseconds

    const newAppointmentDay = newStartDate.toDateString()
    const newAppointmentTime = new Date(`${newStartDate}T${newStartTime}`).getTime()

    for (const { start_date, start_time } of props.existingRecords) {
      const existingRecordDate = new Date(start_date) 
      const existingRecordDay = existingRecordDate.toDateString()
      const existingRecordTime = new Date(`${start_date}T${start_time}`).getTime()

      // Check if the appointments are on the same day
      if (newAppointmentDay === existingRecordDay) {
        // Check if within two hours
        const timeDiff = Math.abs(newAppointmentTime - existingRecordTime)
        if (timeDiff < diffInMs) {
          return true
        }
      }
    }

    return false // No overlap found
  }

  //const onError = (status, message) => {throw createError({ statusCode: status, message: message || 'An unknown error has occured.'})}
  const showError = (error: string, status = 'Form Error') => {
    toastBar('Error', status, error.trim())
  }
</script>