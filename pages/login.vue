<template>
    <div class="h-screen flex items-start justify-center font-sans">
        <ConfirmationCard v-if="success" :type="type" :email="loginState.email" :from-page="fromPage"/>
        <UCard v-else :ui="{header: 'p-2 sm:p4', body: 'p-2 sm:p4', footer: 'p-2 sm:p4'}" class="dialog-container max-w-xl px-2 rounded-lg sm:mx-4 sm:px-6 w-fit mx-auto"> 
            <template #header>
                <div class="grid grid-rows-auto text-lg/6 mb-4">
                <h1 class="text-3xl text-white font-bold mb-2">Welcome!</h1>
                <h2 class="font-semibold">Please sign in using a confirmation link,</h2>
                <h2 class="font-semibold">or enter as guest to schedule a new appointment!</h2>
                </div>
            </template>

            <UForm :state=loginState :schema="schema" @submit.prevent="handleOTPLogin" @error="onError">
                <UFormField required label="" name="email" class="mb-4 w-full">
                    <div class="flex items-center gap-2 w-full">
                    <label for="email" class="text-base font-semibold whitespace-nowrap mr-2">Email</label>
                    <UInput id="email" v-model="loginState.email" type="email" placeholder="Email" class="flex-1" />
                    </div>
                    <div class="text-xs text-gray-900 mt-1">A confirmation link will be sent to your email.</div>
                </UFormField>

                <UButton type="submit" class="mb-2" variant="solid" color="info" :label="sendLabel" :loading="pending" :disabled="pending"/>
                <UButton :to="fromPage" class="ml-2" variant="outline" color="warning" label="Cancel" :disabled="pending"/>
            </UForm>

            <template #footer>
                <div class="dialog-details grid grid-rows-2 gap-2 text-sm leading-4 md:text-lg md:leading-6">
                    <p class="sm:whitespace-nowrap">Click <UButton to="/registration">here</UButton> to sign in or register using an email and password.</p>
                    <p class="sm:whitespace-nowrap">Click <UButton variant="outline" @click="setUser">here</UButton> to continue as guest to add an appointment.</p>
                </div>
            </template>
        </UCard>
    </div>
</template>

<script lang="ts" setup>
    import type { FormErrorEvent } from '@nuxt/ui'
    import { z } from 'zod'

    const router = useRouter()

    const type = 'Login'

    const origin = useState('origin')
    const fromPage = ref<string>('/') //useRouter().options.history.state.back
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

    interface loginType {
        email: string | undefined,
    }

    const initState: loginType = {
        email: undefined,
    }

    const schema = z.object({
        email: z.string().email("Invalid email address"),
    })

    const { toastBar } = useToastBar()
    const supabase = useSupabaseClient()
    const success = ref(false)
    const sendLabel = ref('Send Link')
    const loginState = reactive({...initState})
    const pending = ref(false)
    const guestUser = useGuestUser()
    const otpCode = ref(null)

    watch(() => pending.value, (value) => sendLabel.value = value ? 'Sending link...' : 'Send Link')

    const handleOTPLogin = async () => {
        pending.value = true  

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: loginState.email as string,
                options: {
                    emailRedirectTo: 'http://localhost:3000/booking'
                }
            })

            if(error) {
                throw(error)
            } else {
                success.value = true
                guestUser.value = null
                toastBar('success', 'The link has been successfuly sent. Please check your email.')
            }
        } catch (e) {
            toastBar('error', 'Authientication Error', 'Failed to Authienticate. Please try again.')
        } finally {
            pending.value = false
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

    const setUser = () => {
        guestUser.value = {
            id: 0,
            email: ''
        }
        const idList = document.querySelectorAll('.router-link-active')
        if(idList.length) idList[0].classList.remove('router-link-active')
        router.push({ path: "/booking" })
    }

    // const verifyOtpCode = async () => { 
    //     const { error } = await supabase.auth.verifyOtp({
    //         email: loginState.email as string,
    //         token: otpCode.value ?? '',
    //         type: 'email',
    //     });

    //     if (error) {
    //         toastBar('error', 'Authientication Error', error.message)
    //     } else {
    //         toastBar('success', 'Welcome to Fresh Air!')
    //         navigateTo('/booking');
    //     }
    // }

    definePageMeta({
        layout: "default",
        middleware: ['origin']
    })
</script>