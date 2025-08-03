<template>
  <login childRef="guestUser" page="registration" :type="type" :email="regState.email" :success="success">
    <template #prompt>
      Please sign in with an email and password,
    </template>

    <template #default="{onError, fromPage}">
      <UForm class="w-fit" :state=regState :schema="schema" @submit.prevent="handleAuthentication" @error="onError">
        <div class="grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-2">
          <UFormField required label="Email" name="email">
            <UInput placeholder="Email" v-model="regState.email"/>
          </UFormField>
          <UFormField required label="Password" name="password1">
            <UInput type="password" placeholder="password" v-model="regState.password1"/>
          </UFormField>
          <div class="flex flex-wrap">
            <span class="inline-block">Logging in for the first time?</span>
            <span class="inline-block">Please confirm your password:</span>
          </div>
          <UFormField label="Confirm Password" name="password2">
            <UInput type="password" placeholder="password" v-model="regState.password2"/>
          </UFormField>
        </div>

        <div class="flex flex-wrap justify-center self-center m-4 gap-2 w-full">
          <div v-show="hasErrors" class="col-span-2">          
            <UFormField name="errors"/>
          </div>      
          <UButton class="px-8" type="submit" color="info" variant="solid" :label="submitLabel" :loading="pending"/>
          <UButton :to="fromPage" variant="outline" color="neutral" label="Cancel" :disabled="pending"/>
        </div>
      </UForm>
    </template>

    <template #switch>
      Click <UButton to="/loginLink">here</UButton> to sign in or register using a confirmation link.
    </template>
  </login>
</template>

<script lang="ts" setup>
  import { z } from 'zod'

  const type = 'Confirmation'

  interface childRefType {
    guestUser: any
  }

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

  const childRef = ref<childRefType | null>(null)

  const { toastBar } = useToastBar()
  const supabase = useSupabaseClient();
  const success = ref(false)
  const pending = ref(false);
  const regform = ref()
  const submitLabel = ref('Login')
  const loginLabel = ref('Login')
  const regLabel = ref('Register')
  const regState = reactive({...initState})

  const hasErrors = ref(false)

  const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(50, 'Password must not exceed 50 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/\d/, 'Password must contain at least one digit.')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character.')
    .refine(
      (password) => !/\s/.test(password),
      { 
        message: 'Password cannot contain spaces or other whitespace.',
        path: ['errors']
      }
    )

  const schema = z.object({
    email: z.string().email("Invalid email address"),
    password1: passwordSchema,
    password2: passwordSchema.optional(),
  }).refine((data) => regState.password2 && data.password1 === data.password2, {
    message: "Passwords don't match.",
    path: ['errors'],
  });

  watch(() => regState.password2, (value) => {
    submitLabel.value = value ? regLabel.value : loginLabel.value
  })

  const handleAuthentication = () => {
    if (regState.password2) handleRegister()
    else handleLogin()
  }
  
  const handleRegister = async () => {
    pending.value = true
    regLabel.value = "Waiting..."
    hasErrors.value = false
    try {
      const { error } = await supabase.auth.signUp({
        email: regState.email as string,
        password: regState.password1 as string,
        options: {
          emailRedirectTo: 'http://localhost:3000/booking'
        }
      })
      if (error) throw error
      childRef.value!.guestUser = null
      success.value = true
      toastBar('success', 'Registration successful!', 'Please check your email to confirm your account.')
     } catch (error) {
      toastBar('error', 'Registration failed.', JSON.stringify(error))
      console.error('Registration error:', error);
      Object.assign(regState, initState)
      regform.value.clear()
    } finally {      
      regLabel.value = "Register"
      pending.value = false;
    }
  }

  const handleLogin = async () => {
    pending.value = true    
    loginLabel.value = "Waiting..."
    hasErrors.value = false
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: regState.email as string,
        password: regState.password1 as string,
      })
      if (error) throw error
      childRef.value!.guestUser = null
      toastBar('success', 'Login successful!', 'Welcome back!')
      await navigateTo('/booking');
    } catch (error) {
      toastBar('error', 'Login failed.', JSON.stringify(error))
      console.error('Login error:', error);
      Object.assign(regState, initState)
      regform.value.clear()
    } finally {      
      loginLabel.value = "Login"
      pending.value = false;
    }
  }

  definePageMeta({
      layout: "default",
      middleware: ['origin']
  })
</script>

