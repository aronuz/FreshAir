<template>
  <UCard class="w-fit mx-auto">
    <template #header>
      <div class="text-lg">Client registration form</div>
    </template>
    <UForm :state=regState :schema="schema" @submit.prevent="handleRegister" @error="onError">
      <div class="grid grid-cols-2">
        <UFormField required label="Email" name="email">
          <UInput placeholder="Email" v-model="regState.email"/>
        </UFormField>
        <div class="grid grid-rows-2">
          <UFormField required label="Password" name="password1">
            <UInput type="password" placeholder="password" v-model="regState.password1"/>
          </UFormField>
          <UFormField required label="Confirm Password" name="password2">
            <UInput type="password" placeholder="password" v-model="regState.password2"/>
          </UFormField>
        </div>
      </div>
      <div class="flex justify-center self-center m-4">      
        <UButton class="px-8" type="submit" color="info" variant="solid" :label="regLabel" :loading="pending" />
      </div>
    </UForm>
    <template #footer>
      <div class="grid grid-rows-2 gap-2">
        <div>Click <UButton to="/login">here</UButton> to add or update your appointment.</div>
        <div>Click <UButton variant="ghost" @click="setUser">here</UButton> to continue as guest to add a new appointment.</div>
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
  import type { FormErrorEvent } from '@nuxt/ui'
  import { z } from 'zod'
  import { useGuestUser } from '~/composables/useGuestUser'

  const origin = useState('origin')
    
  watch(() => document, (value) => {
      if (value) {
          document.querySelectorAll('.router-link-active')[0]!.classList.remove('router-link-active')
          document.querySelector(`#${origin.value}`)!.classList.add('router-link-active')
      }
  }, {immediate: true})

  interface regType {
    email: string | undefined,
    password1: string | undefined,
    password2: string | undefined,
  }

  const initState: regType = {
    email: undefined,
    password1: undefined,
    password2: undefined,
  }

  const { toastBar } = useToastBar()
  const supabase = useSupabaseClient();
  const guestUser = useGuestUser()
  const pending = ref(false);
  const regform = ref()
  const regLabel = ref('Register')
  const regState = reactive({...initState})

  const setUser = () => {
    guestUser.value = {
      id: 0,
      email: ''
    }
  }

  const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(50, 'Password must not exceed 50 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/\d/, 'Password must contain at least one digit.')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character.')
    .refine(
      (password) => !/\s/.test(password),
      'Password cannot contain spaces or other whitespace.'
    )

  const schema = z.object({
    email: z.string().email("Invalide email address"),
    password1: passwordSchema,
    password2: passwordSchema,
  }).refine((data) => data.password1 === data.password2, {
    message: "Passwords don't match.",
    path: ['password2'],
  });

  const handleRegister = async () => {
    pending.value = true
    try {
      const { error } = await supabase.auth.signUp({
        email: regState.email as string,
        password: regState.password1 as string,
      })
      if (error) throw error
      guestUser.value = null
      toastBar('success', 'Registration successful!', 'Please check your email to confirm your account.')
      await navigateTo('/login');
    } catch (error) {
      toastBar('error', 'Registration failed.', JSON.stringify(error))
      console.error('Registration error:', error);
      Object.assign(regState, initState)
      regform.value.clear()
    } finally {
      pending.value = false;
    }
  }

  const onError = async (event: FormErrorEvent) => {
    if (event?.errors.length){
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
      
  definePageMeta({
      layout: "default",
      middleware: ['origin']
  })
</script>

