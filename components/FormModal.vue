<template>
  <UModal
    v-model:open="isOpen"
    :title="!updatedAppointment ? 'New Appointment' : 'Make a change'"
    :close="{
      color: 'info',  
      variant: 'outline',
      class: 'rounded-full',
      onClick: () => {isOpen = false; hasErrors = false}
    }"
    :ui="{content: 'lg:left-[35%]'}"
  >
    <template #body>
        <UForm class="grid bg-linear-to-b from-white to-blue-300 -m-4 sm:-m-6 p-4 pt-6" style="grid-template-rows: repeat(6, minmax(0, .99fr));" :state=appointment :schema="schema" ref="appform" @submit.prevent="saveAppointment" @error="onError">
          <div class="grid grid-cols-2">
            <UFormField required label="Name" name="title">
              <UInput placeholder="Name" v-model="appointment.title"/>
            </UFormField>
            <UFormField label="Email" name="email">
              <UInput placeholder="Email" v-model="appointment.email"/>
            </UFormField>
          </div>
          <div class="grid grid-cols-3">
            <UFormField required label="Phone" name="phone">
              <UInput placeholder="Phone" v-model="appointment.phone"/>
            </UFormField>
            <UFormField required label="Address" name="address">
              <UInput type="address" v-model="appointment.address" placeholder="Address" />
            </UFormField>
            <UFormField required label="Zip" name="zip">
              <UInput v-model="appointment.zip" placeholder="Zip Code" />
            </UFormField>
          </div>          
          <div class="grid grid-cols-3">
            <UFormField required label="Start Date" name="start_date">
              <UInput type="date" v-model="formattedStartDate" @update:modelValue="updateStartDate"/>
            </UFormField>
            <UFormField required label="Start Time" name="start_time">
              <UInput type="time" v-model="appointment.start_time" />
            </UFormField>
          </div>
          <div class="grid grid-cols-3">
            <UFormField label="End Date" name="end_date">
              <UInput type="date" v-model="formattedEndDate" @update:modelValue="updateEndDate"/>
            </UFormField>
            <UFormField label="End Time" name="end_time" :required="!!appointment.end_date">
              <UInput type="time" v-model="appointment.end_time" />
            </UFormField>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div class="flex justify-start">
              <UFormField label="Service" name="service" class="w-full">
                <USelect v-model="servicePicked" :items="services" value-key="id" class="w-full" placeholder="Service reason" arrow @update:modelValue="updateService"/>
              </UFormField>
            </div>
            <div class="col-span-2">
              <UFormField label="Notes" name="notes">
                <UTextarea class="w-[100%]" :rows="2" :maxrows="2" resize="none" :autoresize="false" variant="outline" v-model="appointment.notes" placeholder="Request details" />
              </UFormField>
            </div>
          </div>
          <div class="grid grid-rows-2 grid-cols-3 content-around"> 
            <div class="col-span-3 flex justify-center self-center">      
              <UButton class="px-8" type="submit" color="primary" variant="solid" :label="saveLabel" :loading="pending" @onClick="" />
            </div>
            <div v-show="hasErrors" class="col-span-3">          
              <UFormField name="errors"/>
            </div>
          </div>
        </UForm>
    </template>
  </UModal>   
</template>

<script lang="ts" setup>
  import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
  import { z } from 'zod'
  import dayjs from 'dayjs'
  
  import { useFetchQueries} from '~/composables/useFetchQueries'

  interface stateType {
    id?: number,
    title: string | undefined,
    email: string | undefined,
    phone: string | undefined,
    address: string | undefined,
    zip: string | undefined,
    start_date: Date | string | undefined,
    start_time: string | undefined,
    end_date: Date | string | undefined,
    end_time: string | undefined,
    service: number | undefined,
    notes: string | undefined
  }
  
  const { toastBar } = useToastBar()

  const initState: stateType = {
    title: undefined,
    email: undefined,
    phone: undefined,
    address: undefined,
    zip: undefined,
    start_date: undefined,
    start_time: undefined,
    end_date: undefined,
    end_time: undefined,
    service: undefined,
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
    existingRecords: Object,
    selectedDate: String as PropType<string|null>,
  })
  const emit = defineEmits(['update:modelValue', 'saved'])

  const schema = z.object({
    title: z.string(),
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid Phone number'),
    address: z.string().min(1, "Address is required").max(255, "Address is too long"),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code'),
    start_date: z.coerce.date().refine((date) => {
      const datePicked = dayjs(date)
      const today = dayjs(new Date()).hour(0).minute(0).second(0)
      return datePicked.diff(today) > 0
    }, {
      message: 'Pick a future date", //must be in the future.',
    }),
    start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)/, {
      message: "Invalid format", // (expected HH:mm)",
    }), 
    end_date: z.coerce.date().optional(),
    end_time: z.string().optional(),
    notes: z.string().max(255, "Text is too long").optional(),
  }).refine((data) => {
    return /^\+?[1-9]\d{1,14}$/.test(data.phone)
  }, {
    message: "Please provide a valid phone number",
    path: ['errors'],
  },
  ).refine(
    (data) => {
      const hasCoverage = isCoveredZip(data.zip)
      return hasCoverage
    },
    {
      message: 'Unfortunately, we do not service this zip code at this time.',
    }

  ).refine(
    (data) => {
      const hasOverlap = isTimeOverlap(data.start_date, data.start_time)
      return hasOverlap
    },
    {
      message: 'Selected time is not available. Please choose a different time.',
      path: ['errors'],
    }
  ).refine(
    (data) => {
      if (!data.end_date || (data.end_date && data.start_date && data.start_date <= data.end_date)) {
        return true
      }
      return false
    },
    {
      message: 'End date must be after the start date.',
      path: ['errors'],
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
      path: ['errors'],
    }
  ).refine(
    (data) => {
      if (data.end_time) {
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/
        const time = data.end_time
        return regex.test(time)
      }
      return true
    },
    {
      message: "Invalid time format (expected HH:mm)",
      path: ['errors'],
    }
  )

  const appform = ref()

  const saveLabel = ref('Save')

  const appointment = reactive({...initState})

  const hasErrors = ref(false)

  const blankForm = () => {
    formattedStartDate.value = null
    formattedEndDate.value = null
    Object.assign(appointment, initState)
    appform.value.clear()
  } 

  const services = ref([{label: 'Air Conditioning', id: 1}, {label: 'Heat Systems', id: 2}, {label: 'Ventilation', id: 3}, {label: 'Ductwork', id: 4}, {label: 'Maintenance', id: 5}, {label: 'Emergency', id: 6}])
  const servicePicked = ref(0)

  // A computed property or watcher to format the Date object
  const formattedStartDate = ref(appointment.start_date ? (appointment.start_date as Date).toISOString().split('T')[0]: null)

  // To handle changes from UInput and update the original Date object
  function updateStartDate(newDateString: string) {
    appointment.start_date = new Date(newDateString)
    formattedStartDate.value = newDateString // Keep the formatted string in sync
  }

  // To handle changes from USelect and update service
  function updateService(service: number) {
    appointment.service = service
  }

  // A computed property or watcher to format the Date object
  const formattedEndDate = ref(appointment.end_date ? (appointment.end_date as Date).toISOString().split('T')[0]: null)

  // To handle changes from UInput and update the original Date object
  function updateEndDate(newDateString: string) {
    appointment.end_date = new Date(newDateString)
    formattedEndDate.value = newDateString // Keep the formatted string in sync
  }

  // const disabled = computed(() => {
  //   const disabled = updatedAppointment.value && JSON.stringify(appointment) === JSON.stringify(updatedAppointment.value)
  //   console.log('is eq:',JSON.stringify(appointment) === JSON.stringify(updatedAppointment.value))
  //   return disabled
  // })

  const saveAppointment = async (event: FormSubmitEvent<typeof appointment>) => {
    const noChange = updatedAppointment.value && JSON.stringify(appointment) === JSON.stringify(updatedAppointment.value)
    if(noChange) return
    console.log('Form Data:', event)
    if (appform.value.errors.length) {
      let errors = ''
      for (const error in appform.value.errors) {
        errors += `${error} `
      }
      showError(errors, '500')
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
        showError(status as string, `Unable to ${action} appoinment record.\n${JSON.stringify(error)}`)
      } else {
        toastBar('success', `Service ${type === 'update' ? 'updated':'scheduled'}`)
        isOpen.value = false
        emit('saved')
      }
    }
  }

  const onError = async (event: FormErrorEvent) => {
    if (event?.errors.length){
      hasErrors.value = true
      for(const error of event.errors){
        setTimeout(() => showError(error.message), 1000)
      }
      if (event.errors[0]?.id) {
        const element = document.getElementById(event.errors[0].id)
        element?.focus()
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  watch(() => props.selectedDate, (value) => formattedStartDate.value = value as string | null)

  watch(updatedAppointment as Ref<stateType>, (value) => {
    if (value){
      // appointment = {...value, email: value.email ?? '', end_time: value.end_time ?? '', notes: value.notes ?? ''}
      Object.assign(appointment, {...value, email: value.email ?? undefined, end_time: value.end_time ?? undefined, notes: value.notes ?? undefined})
      appointment.start_date = new Date(value.start_date as string)
      formattedStartDate.value = value.start_date as string
      if(value.end_date) {
        appointment.end_date = new Date(value.end_date as string)
        formattedEndDate.value = value.end_date as string
      }
      else {
        appointment.end_date = undefined
        formattedEndDate.value = null
      }
      servicePicked.value = value.service ?? 0
      saveLabel.value = 'Update'
      console.log(value.service)
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
      const selectedEl = document.querySelector('.selected-slot') //(`.fc-event[data-event-id="${selectedAppointment.value.id}"]`)
      if (selectedEl) selectedEl.classList.remove('selected-slot')
      selectedAppointment.value = null
      updatedAppointment.value = null 
      delete appointment.id
    }
  })

  const zipCodes = [11201, 11203, 11204, 11205, 11206, 11207, 11208, 11209, 11210, 11211, 11212, 11213, 11214, 11215, 11216, 11217, 11218, 11219, 11220, 11221, 11222, 11223, 11224, 11225, 11226, 11228, 11229, 11230, 11231, 11232, 11233, 11234, 11235, 11236, 11237, 11238, 11239, 11241, 11243, 11249]
  const isCoveredZip = (zip: string) => {
    return zipCodes.includes(parseInt(zip))
  }

  const isTimeOverlap = (newStartDate: Date, newStartTime: string) => {
    if(updatedAppointment) {
      const appt = {...updatedAppointment.value}
      const newDate = newStartDate.toISOString().split('T')[0]
      if(appt.start_date === newDate && appt.start_time === newStartTime) return true
    }
    const diffInMs = 2 * 3600 * 1000 // Two hours in milliseconds

    const newAppointmentDay = newStartDate.toDateString()
    const newStartDateISO = newStartDate.toISOString().split('T')[0]
    const newAppointmentTime = new Date(`${newStartDateISO}T${newStartTime}`).getTime()

    for (const { start_date, start_time } of props.existingRecords) {
      const existingRecordDate = new Date(start_date) 
      const existingRecordDay = existingRecordDate.toDateString()
      const existingRecordTime = new Date(`${start_date}T${start_time}`).getTime()

      // Check if the appointments are on the same day
      if (newAppointmentDay === existingRecordDay) {
        // Check if within two hours
        const timeDiff = Math.abs(newAppointmentTime - existingRecordTime)
        if (timeDiff < diffInMs) {
          return false
        }
      }
    }

    return true // No overlap found
  }

  //const onError = (status, message) => {throw createError({ statusCode: status, message: message || 'An unknown error has occured.'})}
  const showError = (error: string, status = 'Form Error') => {
    toastBar('error', status, error.trim())
  }
</script>

<style>
  div[role="dialog"] div {
    overflow: hidden;
  }
</style>