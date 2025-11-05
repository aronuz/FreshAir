<template>
  <UContainer>
    <ConfirmationModal v-bind="$attrs" ref="confirmationModal" title="Email Us" confirm-text="Send Message" confirm-icon="i-heroicons-envelope" :loading="loading" @close="onClose">
      <template #content>
        <UForm :state="emailState" :schema="schema" ref="emailform" class="flex flex-col" @submit.prevent="sendEmail" @error="onError">
          <UFormField label="Name" name="name">
            <UInput class="flex" v-model="emailState.name" placeholder="Your Name" />
          </UFormField>
          <UFormField label="Email" name="email">
            <UInput class="flex" v-model="emailState.email" type="email" placeholder="Your Email" />
          </UFormField>
          <UFormField label="Phone (Optional)" name="phone" optional>
            <UInput class="flex" v-model="emailState.phone" placeholder="Your Phone" />
          </UFormField>
          <UFormField label="Subject" name="subject">
            <UInput class="flex" v-model="emailState.subject" placeholder="Subject" />
          </UFormField>
          <UFormField label="Message" name="message">
            <UTextarea class="flex" v-model="emailState.message" autoresize placeholder="Your Message" />
          </UFormField>
          <button type="submit" class="hidden">Send Message</button> 
        </UForm>
      </template>
    </ConfirmationModal>
  </UContainer>
</template>

<script lang="ts" setup>
  import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
  import { z } from 'zod'
  import ConfirmationModal from './ConfirmationModal.vue';
 
  interface constactStateType {
    name : string | undefined,
    email: string | undefined,
    phone: string | undefined,
    subject : string,
    message: string,
  }

  const props = defineProps({
    defaultMessage: {
      type: String,
      default: '',
    },
  })

  const emit = defineEmits(['close'])

  const loading = ref(false)
  const submissionSuccess = ref(false)
  const submissionError = ref(false)
  
  const { toastBar } = useToastBar()

  const contactInitState = reactive<constactStateType>({
    name: undefined,
    email: undefined,
    phone: undefined,
    subject: "Service Inquiry",
    message: props.defaultMessage,
  });

console.log("CF default message:", props.defaultMessage)
  const emailform = ref()

  const emailState = reactive({...contactInitState})

  const confirmationModal = ref<InstanceType<typeof ConfirmationModal> | null>(null);
  onMounted(async () => {
    await confirmationModal!.value!.open()
  })

  const schema = z.object({
    name: z.string(),
    email: z.string().email("Please provide a valide email address"),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
      message: "Please provide a valid phone number",
    }).optional(),
    subject: z.string().min(1, "Blank subject").max(50, "Subject is too long"),
    message: z.string().min(10, "Please provide a detailed message").max(255, "Message is too long"),
  })

  const onClose = (result: boolean) => {
    if(result) {
      sendEmail({ data: emailState } as FormSubmitEvent<typeof emailState>)
    }
    console.log("closing contact form")
    emit('close')
  }

  const sendEmail = async (email: FormSubmitEvent<typeof emailState>) => {       
    submissionSuccess.value = false;
    submissionError.value = false;
    loading.value = true
    try {
      const data = email.data
      const subject = encodeURIComponent(data.subject!)
      const message = encodeURIComponent(data.message)
      const response = await fetch("/api/send-email", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: subject,
          message: message,
          phone: data.phone
        })
      })

      const resp = await response.json();
      console.log("Success:", resp);
      if (resp.success) {
        Object.assign(emailState, contactInitState)
        emailform.value.clear()
        submissionSuccess.value = true
        toastBar('success', `Message sent successfully! We'll get back to you soon.`)
      } else {
        showError(`There was an error sending your message. Please try again later.\n${resp.error}`, '500')
      }
    } catch (error) {
      console.error("error:", error.message);
      showError(`There was an error sending your message. Please try again later.\n${error.message}`, '500')
    }
    
    loading.value = false
  }

  const onError = async (event: FormErrorEvent) => {
    if (event?.errors.length){
      let fieldName: string
    for(const error of event.errors){
      fieldName = error.name!.charAt(0).toUpperCase() + error.name!.slice(1)
      showError(`${fieldName} is missing`, error.message)
      await nextTick()
    }}
    if (event.errors[0]?.id) {
      const element = document.getElementById(event.errors[0].id)
      element?.focus()
    }
  }

  const showError = (error: string | undefined, status = 'Email Error') => {
    toastBar('error', status, error?.trim())
  }
</script>

<style scoped>
:deep(){
  form .text-sm {
    margin-bottom: 10px !important;
  }
}
</style>