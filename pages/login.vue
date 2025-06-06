<template>
    <UCard v-if="success" class="w-fit mx-auto">
        <template #header>
            <div class="text-lg">Confirmation link has been sent to {{ loginState.email }}</div>
        </template>
        <div class="text-center">
            <label for="code">Use the link in the email or use the one time code:</label>
            <input id="code" v-model="otpCode" placeholder="One Time Code" type="text" />
        </div>
        <template #footer>
            <div>Please check your email.</div>
            <UButton v-if="!otpCode" :to="fromPage" variant="solid" color="success" label="OK" />
            <UButton v-else variant="solid" color="success" label="Verify" @click="verifyOtpCode"/>
        </template>
    </UCard>
    <UCard v-else class="w-fit mx-auto max-w-lg"> 
        <template #header>
            <div class="grid grid-rows-2 text-lg/6">
               <div>Welcome! Please sign in using a confirmation link,</div>
               <div>or enter as guest to schedule a new appointment!</div>
            </div>
        </template>

        <UForm :state=loginState :schema="schema" @submit.prevent="handleOTPLogin" @error="onError">
            <UFormField required label="Email" name="email" class="mb-4" help="A confirmation link will be sent to your email.">
                <UInput v-model="loginState.email" type="email" placeholder="Email" />
            </UFormField>

            <UButton type="submit" variant="solid" color="info" :label="sendLabel" :loading="pending" :disabled="pending"/>
            <UButton :to="fromPage" class="ml-2" variant="outline" color="warning" label="Cancel" :disabled="pending"/>
        </UForm>

        <template #footer>
            <div class="grid grid-rows-2 gap-2">
                <div>Click <UButton to="/registration">here</UButton> to sign in or register using an email and password.</div>
                <div>Click <UButton variant="ghost" @click="setUser">here</UButton> to continue as guest to add an appointment.</div>
            </div>
        </template>
    </UCard>
</template>

<script lang="ts" setup>
    import type { FormErrorEvent } from '@nuxt/ui'
    import { z } from 'zod'

    const router = useRouter()

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
        email: z.string().email("Invalide email address"),
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

    const verifyOtpCode = async () => { 
        const { error } = await supabase.auth.verifyOtp({
            email: loginState.email as string,
            token: otpCode.value ?? '',
            type: 'email',
        });

        if (error) {
            toastBar('error', 'Authientication Error', error.message)
        } else {
            toastBar('success', 'Welcome to Fresh Air!')
            navigateTo('/booking');
        }
    }

    definePageMeta({
        layout: "default",
        middleware: ['origin']
    })
</script>