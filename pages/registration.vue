<template>
  <login childRef="guestUser" page="registration" :type="type" :email="regState.email" :success="success">
    <template #prompt>
      Please sign in with an email and password,
    </template>

    <template #default="{onError, fromPage}">
      <UForm
        class="w-fit mx-auto"
        :state=regState
        :schema="schema"
        @submit.prevent="handleAuthentication"
        @error="onError"
      >
        <div class="grid grid-rows-[repeat(2,_minmax(auto,130px))] sm:grid-rows-2 grid-cols-1 sm:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-2">
          <div class="flex flex-col sm:flex-row gap-4 sm:gap-12">
            <UFormField required label="Email" name="email">
              <UInput
                v-model="regState.email"
                placeholder="Email"
                :disabled="!!resetEmail"
              />
            </UFormField>
            <UFormField required label="Password" name="password1">
              <UInput
                v-model="regState.password1"
                type="password"
                placeholder="password"
              />
            </UFormField>
          </div>
          <div class="grid grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 flex flex-col sm:flex-row sm:justify-between gap-4 h-14">
            <UCheckbox
              v-if="!resetEmail" 
              v-model="newUser"
              :ui="{
                base: 'bg-gray-100 dark:bg-gray-700',
                label: 'w-fit'
              }"
              label="New User"
            />
            <MyButton 
              v-if="!newUser"
              :to="{ path: '/loginLink', state: { email: regState.email, reset: true } }"
              class="w-fit h-fit justify-self-start sm:justify-self-end hover:cursor-pointer"
              btnType="warning"
              label="Forgot Password"
              :disabled="pending"
            />
            <UFormField 
              v-if="newUser || !!resetEmail"
              class="ml-0 sm:ml-4"
              label="Confirm Password" 
              name="password2"
            >
              <UInput
                v-model="regState.password2"
                type="password"
                placeholder="password"
              />
            </UFormField>
          </div>
        </div>
        <div class="flex flex-wrap justify-center self-center m-4 gap-2 w-full">
          <div v-show="hasErrors" class="col-span-2">          
            <UFormField name="errors"/>
          </div>      
          <MyButton
            class="px-8"
            type="submit"
            :label="submitLabel"
            :loading="pending"
          />
          <MyButton
            :to="fromPage"
            btnType="primaryOutline"
            label="Cancel"
            class="hover:cursor-pointer"
            :disabled="pending"
          />
        </div>
      </UForm>
    </template>

    <template #switch>
      Click <MyButton to="/loginLink">here</MyButton> to sign in or register using a confirmation link.
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
  
  const route = useRoute();
  const resetEmail = ref<string | undefined>(route.query.email as string | undefined)

  const initState: regType = {
    email: resetEmail.value,
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
  const newUser = ref(false)

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
    if(!!resetEmail.value){
      submitLabel.value = 'Reset Password'
    } else {
      submitLabel.value = value ? regLabel.value : loginLabel.value
    }
  })

  const handleAuthentication = () => {
    if (!!resetEmail.value) {
      handleResetPassword()
    } else if (regState.password2) {
      handleRegister()
    } else {
      handleLogin()
    }
  }

  const handleResetPassword = async () => {
    pending.value = true
    regLabel.value = "Waiting..."
    hasErrors.value = false
    try {
      const { error } = await supabase.auth.updateUser({
        password: regState.password1 as string
      })      
      if (error) throw error
      toastBar('success', 'Password reset successful!', 'You can now log in with your new password.')
      await supabase.auth.signOut()
      await navigateTo('/loginLink')
    } catch (error) {
      toastBar('error', 'Password reset failed.', JSON.stringify(error))
      console.error('Password reset error:', error);
      Object.assign(regState, initState)
      regform.value.clear()
    } finally {      
      regLabel.value = "Reset Password"
      pending.value = false;
    }
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
          emailRedirectTo: `${window.location.origin}/booking`
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

