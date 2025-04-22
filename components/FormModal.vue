<template>
  <UModal v-model="isOpen">
      <UCard>
        <template #header>Add Appointment</template>

        <UForm :state=appointment :schema="schema" ref="appform" @submit="submitAppointment" :validate-on="[submit]" :error="onError">
          <UFormGroup :required="true" label="name" name="name" class="mb=4">
            <UInput placeholder="Name" v-model="appointment.name"/>
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
            <UInput type="date" v-model="appointment.startDate" />
          </UFormField>
          <UFormField label="Start Time" name="start_time">
            <UInput type="time" v-model="appointment.startTime" />
          </UFormField>
          <UFormField label="End Date" name="end_date">
            <UInput type="date" v-model="appointment.endDate" />
          </UFormField>
          <UFormField label="End Time" name="end_time">
            <UInput type="time" v-model="appointment.endTime" />
          </UFormField>
          <textarea v-model="appointment.notes" placeholder="Notes"></textarea>
          <UButton type="submit" color="black" variant="solid" label="Save" :loading="pending" />
        </UForm>
        <!-- template #footer>Add Appointment</template -->
      </UCard>
    </UModal>
</template>

<script lang="ts" setup>
  import { z } from 'zod'
  
  const initState = {
    name: undefined,
    email: undefined,
    phone: undefined,
    address: undefined,
    startDate: undefined,
    startTime: undefined,
    endDate: undefined,
    endTime: undefined,
    notes: undefined
  }
  const blankState = useState('selectedAppointment', () => initState)

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
    name: z.string(),
    email: z.string().optional(),
    phone: z.string(),
    address: z.string(),
    startDate: z.date(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "Invalid time format (expected HH:mm)",
    }), 
    endDate: z.date(),     
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "Invalid time format (expected HH:mm)",
    }), 
    notes: z.string(),
  })

  const appform = ref()

  const appointment = ref({...initState})

  const blankForm = () => {
    Object.assign(appointment.value, initState)
    appform.value.clear()
  } 

  watch(updatedAppointment, (value) => appointment.value = value)

  const isOpen = computed({
    get: () => props.modelValue,
    set: (val: Boolean) => {
      if (!val) blankForm()
      emit('update:modelValue', val)
    }
  })

  //const onError = (status, message) => {throw createError({ statusCode: status, message: message || 'An unknown error has occured.'});}
  const onError = (error: string) => {
    useToastBar('Error', 'Form error', error)
  }
</script>