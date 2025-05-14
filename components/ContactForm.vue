<template>
  <div>
    <h3 class="text-xl font-semibold text-gray-700 mb-4">Send Us a Message</h3>
    <UForm :state="emailState" :schema="schema" ref="emailform" @submit.prevent="sendEmail" @error="onError">
      <UFormField label="Name" name="name">
        <UInput v-model="emailState.name" placeholder="Your Name" />
      </UFormField>
      <UFormField label="Email" name="email">
        <UInput v-model="emailState.email" type="email" placeholder="Your Email" />
      </UFormField>
      <UFormField label="Phone" name="phone" optional>
        <UInput v-model="emailState.phone" placeholder="Your Phone (Optional)" />
      </UFormField>
      <UFormField label="Subject" name="subject">
        <UInput v-model="emailState.subject" placeholder="Subject" />
      </UFormField>
      <UFormField label="Message" name="message">
        <UTextarea v-model="emailState.message" placeholder="Your Message" />
      </UFormField>
      <UButton type="submit" label="Send Message" color="primary" :loading="loading" />
    </UForm>
  </div>
</template>

<script lang="ts" setup>
  import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
  import { z } from 'zod'
 
  interface constactStateType {
    name : string | undefined,
    email: string | undefined,
    phone: string | undefined,
    subject : string | undefined,
    message: string | undefined
  }

  const loading = ref(false)
  const submissionSuccess = ref(false)
  const submissionError = ref(false)
  
  const { toastBar } = useToastBar()

  const contactInitState = reactive({
    name: undefined,
    email: undefined,
    phone: undefined,
    subject: undefined,
    message: undefined,
  });

  const emailform = ref()

  const emailState = reactive({...contactInitState})

  const schema = z.object({
    name: z.string(),
    email: z.string().email("Please provide a valide email address"),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
      message: "Please provide a valid phone number",
    }).optional(),
    subject: z.string().max(50, "Subject is too long"),
    message: z.string().max(255, "Text is too long"),
  })

  const sendEmail = async (email: FormSubmitEvent<typeof emailState>) => {       
    submissionSuccess.value = false;
    submissionError.value = false;
    loading.value = true
    try {
      const data = email.data
      const response = await fetch("/api/send-email", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
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
    toastBar('error', status, error.trim())
  }
</script>

<style>
</style>