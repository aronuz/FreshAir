<template>
  <UModal v-model="isOpen">
      <UCard variant="soft">
        <UForm :state=appointment :schema="schema" ref="appform" @submit="saveAppointment">
          <UFormGroup :required="true" label="name" name="title" class="mb=4">
            <UInput placeholder="Name" v-model="appointment.title"/>
          </UFormGroup>
          <UFormGroup :required="true" label="Email" name="email" class="mb=4">
            <UInput placeholder="Email" v-model="appointment.email"/>
          </UFormGroup>
          <UFormGroup :required="true" label="Phone" name="phone" class="mb=4">
            <UInput placeholder="Phone" v-model="appointment.phone"/>
          </UFormGroup>
          <UFormGroup :required="true" label="Address" name="address" class="mb=4">
            <input type="address" v-model="appointment.address" placeholder="Address" />
          </UFormGroup>
          <UFormField label="Start Date" name="start_date">
            <UInput type="date" v-model="appointment.start_date" />
          </UFormField>
          <UFormField label="Start Time" name="start_time">
            <UInput type="time" v-model="appointment.start_time" />
          </UFormField>
          <UFormField label="End Date" name="end_date">
            <UInput type="date" v-model="appointment.end_date" />
          </UFormField>
          <UFormField label="End Time" name="end_time">
            <UInput type="time" v-model="appointment.end_time" />
          </UFormField>
          <UFormField label="Notes" name="notes">
            <UTextarea variant="outline" v-model="appointment.notes" placeholder="Notes" />
          </UFormField>
          <UButton type="submit" color="black" variant="solid" label="Save" :loading="pending" />
        </UForm>
        <!-- template #footer>Add Appointment</template -->
      </UCard>
    </UModal>
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
        pending,
        updatedAppointment
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
    start_date: z.date(),
    start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "Invalid time format (expected HH:mm)",
    }), 
    end_date: z.date(),     
    end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "Invalid time format (expected HH:mm)",
    }), 
    notes: z.string(),
  })

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
      showError(errors)
    } else {
      submitAppointment(appointment)
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
  const showError = (error: string) => {
    toastBar('Error', 'Form error', error.trim())
  }
</script>