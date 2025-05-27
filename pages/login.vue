<template>
    <UCard v-if="success" class="w-fit mx-auto">
        <template #header>
            <div class="text-lg">Confirmation link has been sent to:</div>
        </template>
        <div class="text-center">{{ loginState.email }}</div>
        <template #footer>
            Please check your email.
        </template>
    </UCard>
    <UCard v-else class="w-fit mx-auto"> 
        <template #header>
            <div class="grid grid-rows-2 text-lg">
               <div>Please use your email to add or update your appointment,</div>
               <div>or enter as guest to schedule a new appointment!</div>
            </div>
        </template>

        <UForm :state=loginState :schema="schema" @submit.prevent="handleOTPLogin" @error="onError">
            <UFormField required label="Email" name="email" class="mb-4" help="A confirmation link will be sent to your email.">
                <UInput v-model="loginState.email" type="email" placeholder="Email" />
            </UFormField>

            <UButton type="submit" variant="solid" color="info" :label="sendLabel" :loading="pending" :disabled="pending"/>
            <UButton :to="fromPage" variant="outline" color="warning" label="Cancel" :disabled="pending"/>
        </UForm>

        <template #footer>
            <div class="grid grid-rows-2 gap-2">
                <div>Click <UButton to="/registration">here</UButton> to use an email and password.</div>
                <div>Click <UButton variant="ghost" @click="setUser">here</UButton> to continue as guest to add an appointment.</div>
            </div>
        </template>
    </UCard>
</template>

<script lang="ts" setup>
    import type { FormErrorEvent } from '@nuxt/ui'
    import { z } from 'zod'
    import { useGuestUser } from '~/composables/useGuestUser'

    const router = useRouter()

    const origin = useState('origin')
    const fromPage = ref<string>('/')
    console.log('we: ', origin.value)
    if(origin.value !== 'login'){
        fromPage.value = `/${origin.value === 'index' ? '' : origin.value}?l=1`
    }
    let fromPageLink: HTMLElement | null
    watch(() => document, (value) => {
        if (value && origin.value && origin.value !== 'login') {
            fromPageLink = document.querySelector(`#${origin.value}`)
           fromPageLink!.classList.add('router-link-active')
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
        
        router.push({ path: "/booking" })
    }

    definePageMeta({
        layout: "default",
        middleware: ['origin']
    })
</script>