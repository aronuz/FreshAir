<template>
    <UCard v-if="success" class="w-fit mx-auto">
        <template #header>
            <div class="text-lg">Confirmation link has been sent to:</div>
        </template>
        <div class="text-center">{{ email }}</div>
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

            <UButton type="submit" variant="solid" color="info" :label="sendLabel" :loading="pending"/>
        </UForm>

        <template #footer>
            <div class="grid grid-rows-2 gap-2">
                <div>Click <UButton to="/registration">here</UButton> to register with an email and password.</div>
                <div>Click <UButton variant="ghost" @click="setUser">here</UButton> to continue as guest to add an appointment.</div>
            </div>
        </template>
    </UCard>
</template>

<script lang="ts" setup>
    import type { FormErrorEvent } from '@nuxt/ui'
    import { z } from 'zod'

    const origin = useState('origin')
    console.log('we: ', origin)
    watch(() => document, (value) => {
        if (value) {
            document.querySelector(`#${origin}`)!.classList.add('router-link-active')
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
    const email = ref('')
    const sendLabel = ref('Send Link')
    const loginState = reactive({...initState})
    const pending = ref(false)
    const guestUser = useGuestUser()

    watch(() => pending.value, (value) => sendLabel.value = value ? 'Sending link...' : 'Send Link')

    const handleOTPLogin = async () => {
        pending.value = true  

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email.value,
                options: {
                    emailRedirectTo: 'http://localhost:3000'
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
    }

    definePageMeta({
        layout: "default",
        middleware: ['origin']
    })
</script>