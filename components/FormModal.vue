<template>
  <UModal v-model="isOpen">
      <UCard>
        <template #header>Add Appointment</template>

        <UForm :state=appointment :schema="schema" ref="appform" @submit="submitAppointment" :validate-on="[submit]" :error="onError">
          <UFormGroup :required="true" label="name" name="name" class="mb=4">
            <UInput placeholder="Name" v-model="appointment.name"/>
          </UFormGroup>
          <UFormGroup :required="true" label="email" name="email" class="mb=4">
            <UInput placeholder="Email" v-model="appointment.email"/>
          </UFormGroup>
          <UFormGroup :required="true" label="phone" name="phone" class="mb=4">
            <UInput placeholder="Phone" v-model="appointment.phone"/>
          </UFormGroup>
          <UFormGroup :required="true" label="phone" name="phone" class="mb=4">
            <input type="address" v-model="appointment.address" placeholder="Address" />
          </UFormGroup>
          <!-- split date and time -->
          <input type="datetime-local" v-model="appointment.dateTime" />
          <textarea v-model="appointment.notes" placeholder="Notes"></textarea>
          <UButton type="submit" color="black" variant="solid" label="save" :loading="pending" />
        </UForm>
        <!-- template #footer>Add Appointment</template -->
      </UCard>
    </UModal>
</template>

<script lang="ts" setup>
  import { z } from 'zod'

  const props = defineProps({
    modelValue: Boolean
  })
  const emit = defineEmits(['update:modelValue', 'saved'])

  const schema = z.object({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string(),
    address: z.string(),
    dateTime: z.string(), 
    notes: z.string(),
  })

  const supabase = useSupabaseClient()
  const appform = ref()
  const pending = ref(false)

  const submitAppointment = async () => {
    // if(appform.value.errors.length) return

    //update db
    pending.value = true
    try {
      const { error } = await supabase.from('appointments').upsert({ ...appointment.value })
      if(!error) {
        //toast success
        isOpen.value = false
        emit('saved')
        return error
      }
      throw()
    }catch(e){
      //toast error
    }finally{
      pending.value = false
    }
  }

  const appointment = ref({
    name: undefined,
    email: undefined,
    phone: undefined,
    address: undefined,
    dateTime: undefined, 
    notes: undefined,
  })

  const isOpen = computed({
    get: () => props.modelValue,
    set: (val: Boolean) => {
      if (!val) resetForm()
      emit('update:modelValue', val)
    }
  })

  const onError = (error) => {
    useToastBar('Error', 'Form error', error)
  }
</script>