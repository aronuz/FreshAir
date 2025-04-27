<template>
      <UCard variant="soft">
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
            <UInput type="date" v-model="appointment.start_date" />
          </UFormField>
          <UFormField label="Start Time" name="start_time">
            <UInput type="time" v-model="appointment.start_time" />
          </UFormField>
          <UFormField label="End Date" name="end_date">
            <UInput type="date" v-model="appointment.end_date" />
          </UFormField>
          <UFormField label="End Time" name="end_time" :required="!!appointment.end_date">
            <UInput type="time" v-model="appointment.end_time" />
          </UFormField>
          <UFormField label="Notes" name="notes">
            <UTextarea variant="outline" v-model="appointment.notes" placeholder="Notes" />
          </UFormField>
          <UButton type="submit" color="primary" variant="solid" label="Save" :loading="pending" />
        </UForm>
        <!-- template #footer>Add Appointment</template -->
      </UCard>
</template>

<script lang="ts" setup>
  import { z } from 'zod'
  
  import { useFetchQueries} from '~/composables/useFetchQueries'

  interface stateType {
    title: string | undefined,
    email: string | undefined,
    phone: string | undefined,
    address: string | undefined,
    start_date: string | undefined,
    start_time: string | undefined,
    end_date: string | undefined,
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

  const { 
        submitAppointment,
        updatedAppointment,
        pending
      } = useFetchQueries()

  const props = defineProps({
    modelValue: Boolean
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
    start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "Invalid time format (expected HH:mm)",
    }), 
    end_date: z.coerce.date().optional(),
    end_time: z.string().optional(),
    notes: z.string().optional(),
  }).refine(
    (data) => {
      if (data.end_date && data.start_date && data.start_date <= data.end_date) {
        return false;
      }
      return true;
    },
    {
      message: 'End date must be after the start date.',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.end_date && !data.end_time) {
        return false;
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
        return regex.test(time);
      }
      return true
    },
    {
      message: "Invalid time format (expected HH:mm)",
      path: ['endTime'],
    }
  )

  const appform = ref()

  const appointment: Ref<stateType> = ref({...initState})

  const blankForm = () => {
    Object.assign(appointment.value, initState)
    appform.value.clear()
  } 

  const saveAppointment = async () => {
    if (appform.value.errors.length) {
      let errors = ''
      for (const error in appform.value.errors) {
        errors += `${error} `
      }
      showError('500', errors)
    } else {
      const {data, error, type} = await submitAppointment(appointment) 
      if(data){
        toastBar('Success', `Service ${type === 'update' ? 're':''}scheduled`)
      } else {
        const action = type === 'create' ? 'create a new': 'update'
        showError('500', `Unable to ${action} appoinment record.\n${error}`)
      }
    }
  }

  watch(updatedAppointment as Ref<stateType>, (value: stateType) => appointment.value = value)

  const isOpen = computed({
    get: () => props.modelValue,
    set: (val: Boolean) => {
      if (!val) blankForm()
      emit('update:modelValue', val)
    }
  })

  //const onError = (status, message) => {throw createError({ statusCode: status, message: message || 'An unknown error has occured.'});}
  const showError = (error: string, status = 'Form Error') => {
    toastBar('Error', status, error.trim())
  }
</script>