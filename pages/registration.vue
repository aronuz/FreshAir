<template>
  <ConfirmationCard v-if="success" :type="type" :email="regState.email" :from-page="fromPage"/>
  <UCard v-else class="w-fit mx-auto">
    <template #header>
      <div class="grid grid-rows-2 text-lg">
        <div>Welcome! Please sign in with an email and password,</div>
        <div>or enter as guest to schedule a new appointment!</div>
      </div>
    </template>
    <UForm class="w-fit" :state=regState :schema="schema" @submit.prevent="handleAuthentication" @error="onError">
      <!-- <div class="flex"> -->
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
      <!-- </div> -->
      <div class="flex flex-wrap justify-center self-center m-4 gap-2 w-full">
        <div v-show="hasErrors" class="col-span-2">          
          <UFormField name="errors"/>
        </div>      
        <UButton class="px-8" type="submit" color="info" variant="solid" :label="submitLabel" :loading="pending"/>
        <UButton :to="fromPage" variant="outline" color="warning" label="Cancel" :disabled="pending"/>
      </div>
    </UForm>
    <template #footer>
      <div class="grid grid-rows-2 gap-2 w-fit">
        <div>Click <UButton to="/login">here</UButton> to sign in or register using a confirmation link.</div>
        <div>Click <UButton variant="ghost" @click="setGuestUser">here</UButton> to continue as guest to add a new appointment.</div>
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
  import type { FormErrorEvent } from '@nuxt/ui'
  import { z } from 'zod'
  
  const router = useRouter()

  const type = 'Confirmation'

  const origin = useState('origin')
  const fromPage = ref<string>('/')
  console.log('we: ', origin.value)
  let origin_value = origin.value as string
  if (origin_value && origin_value.includes('_')) {
        origin_value = origin_value.slice(0, origin_value.indexOf('_')) 
    }
  if(origin_value && origin_value !== 'index') fromPage.value+=origin_value
  let fromPageLink: HTMLElement | null
  watch(() => document, (value) => {
      if (value && origin_value && !['login', 'registration'].includes(origin_value)) {
          fromPageLink = document.querySelector(`#${origin_value}`)
          fromPageLink?.classList.add('router-link-active')
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
  const success = ref(false)
  const guestUser = useGuestUser()
  const pending = ref(false);
  const regform = ref()
  const submitLabel = ref('Login')
  const loginLabel = ref('Login')
  const regLabel = ref('Register')
  const regState = reactive({...initState})

  const hasErrors = ref(false)

  const setGuestUser = () => {
    guestUser.value = {
      id: 0,
      email: ''
    }
    const idList = document.querySelectorAll('.router-link-active')
    if(idList.length) idList[0].classList.remove('router-link-active')
    router.push({ path: "/booking" })
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
    // if(!regState.password2) {
    //   const element: HTMLElement | null = document.querySelector("[name='password2']")
    //   element?.focus()
    //   toastBar('error', 'Registration failed.', 'Please confirm your password!')
    //   return
    // }
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
      guestUser.value = null
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
      guestUser.value = null
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

  const onError = async (event: FormErrorEvent) => {
    if (event?.errors.length){
      hasErrors.value = true
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


  // const verifyOtpCode = async (optCode: string) => { 
  //   const { error } = await supabase.auth.verifyOtp({
  //       email: regState.email as string,
  //       token: optCode ?? '',
  //       type: 'email',
  //   });

  //   if (error) {
  //       toastBar('error', 'Authientication Error', error.message)
  //   } else {
  //       toastBar('success', 'Welcome to Fresh Air!')
  //       navigateTo('/booking');
  //   }
  // }

  definePageMeta({
      layout: "default",
      middleware: ['origin']
  })
</script>

