<template>
  <UCard>
    <template #header>
      <h1>Registration</h1>
    </template>
    <UForm :state=reg :schema="schema" @submit.prevent="handleRegister" @error="onError">
      <div class="grid grid-rows-3">
        <UFormField required label="Email" name="email">
          <UInput placeholder="Email" v-model="reg.email"/>
        </UFormField>
        <UFormField required label="Password" name="password1">
          <UInput type="password" placeholder="password" v-model="reg.password1"/>
        </UFormField>
        <UFormField required label="Confirm Password" name="password2">
          <UInput type="password" placeholder="password" v-model="reg.password2"/>
        </UFormField>
      </div>
      <div class="flex justify-center self-center">      
        <UButton class="px-8" type="submit" color="primary" variant="solid" :label="regLabel" :loading="pending" />
      </div>
    </UForm>
    <template #footer>
      <NuxtLink to="/login">Already have an account? Login here.</NuxtLink>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
  import type { FormErrorEvent } from '@nuxt/ui'
  import { z } from 'zod'

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
  const supabase = useSupabaseAuthClient();
  const pending = ref(false);
  const regform = ref()
  const regLabel = ref('Register')
  const reg = reactive({...initState})

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
        email: reg.email,
        password: reg.password1,
      });
      if (error) throw error;
      toastBar('success', 'Registration successful!', 'Please check your email to confirm your account.')
      await navigateTo('/login');
    } catch (error) {
      toastBar('error', 'Registration failed.', JSON.stringify(error))
      console.error('Registration error:', error);
      Object.assign(reg, initState)
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
</script>

