<template>    
    <login ref="childRef" :email="loginState.email" :success="success">  
        <template #prompt>
            Please sign in using a confirmation link,
        </template>

        <template #default="{onError, fromPage}">
            <UForm :state=loginState :schema="schema" @submit.prevent="handleOTPLogin" @error="onError">
                <UFormField required label="" name="email" class="mb-4 w-full">
                    <div class="flex items-center gap-2 w-full">
                        <label for="email" class="text-base font-semibold whitespace-nowrap mr-2">Email</label>
                        <UInput id="email" v-model="loginState.email" type="email" placeholder="Email" class="flex-1" />
                    </div>
                    <div class="text-xs text-gray-900 mt-1">A confirmation link will be sent to your email.</div>
                </UFormField>

                <UButton type="submit" class="mb-2" variant="solid" color="info" :label="sendLabel" :loading="pending" :disabled="pending"/>
                <UButton :to="fromPage" class="ml-2" variant="outline" color="neutral" label="Cancel" :disabled="pending"/>
            </UForm>
        </template>

        <template #switch>
            Click <UButton to="/registration">here</UButton> to sign in or register using an email and password.
        </template>
    </login>
</template>

<script lang="ts" setup>
    import { z } from 'zod'

    interface childRefType {
        guestUser: any
    }

    interface loginType {
        email: string | undefined,
    }

    const initState: loginType = {
        email: undefined,
    }

    const schema = z.object({
        email: z.string().email("Invalid email address"),
    })
    
    const childRef = ref<childRefType | null>(null)

    const { toastBar } = useToastBar()
    const supabase = useSupabaseClient()
    const success = ref(false)
    const sendLabel = ref('Send Link')
    const loginState = reactive({...initState})
    const pending = ref(false)

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
                childRef.value!.guestUser = null
                toastBar('success', 'The link has been successfuly sent. Please check your email.')
            }
        } catch (e) {
            toastBar('error', 'Authientication Error', 'Failed to Authienticate. Please try again.')
        } finally {
            pending.value = false
        }
    }

    definePageMeta({
        layout: "default",
        middleware: ['origin']
    })
</script>