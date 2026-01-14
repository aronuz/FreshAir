<template>    
    <login ref="childRef" :email="loginState.email" :reset="reset" :reset-email="resetEmail" :success="success">  
        <template #prompt>
            <span v-if="reset">Please enter your email to reset your password.</span>
            <span v-else>Please sign in using a confirmation link,</span>
        </template>

        <template #default="{onError, fromPage}">
            <UForm :state=loginState :schema="schema" @submit.prevent="handleOTPLogin" @error="onError">
                <UFormField :ui="{ label:'text-gray-600 dark:text-gray-500' }" required label="" name="email" class="mb-4 w-full">
                    <div class="flex items-center gap-2 w-full">
                        <label for="email" class="text-base font-semibold whitespace-nowrap mr-2">Email</label>
                        <UInput id="email" v-model="loginState.email" type="email" placeholder="Email" class="flex-1"/>
                    </div>
                    <div class="text-xs text-gray-900 mt-1">A {{ reset ? 'password reset' : 'confirmation' }} link will be sent to your email.</div>
                </UFormField>

                <MyButton type="submit" class="mb-2" btnType="primary" :label="sendLabel" :loading="pending" :disabled="pending"/>
                <MyButton :to="fromPage" class="ml-2 hover:cursor-pointer" btnType="primaryOutline" label="Cancel" :disabled="pending"/>
            </UForm>
        </template>

        <template #switch>
            <div v-if="reset">Remember your password?</div>
            Click <MyButton to="/registration">here</MyButton> to sign in {{ reset ? '' : 'or register' }} using an email and password.
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

    const path = window.location.origin
    const resetEmail = history.state.email ?? undefined
    const reset = history.state.reset ?? false
    const initState: loginType = {
        email: resetEmail,
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
        let otpError: unknown = null
        try {
            if (reset) {
                const { error } = await supabase.auth.resetPasswordForEmail(
                loginState.email as string, {
                    redirectTo: `${path}/registration?email=${loginState.email}`,
                })
                otpError = error
            } else {
                const { error } = await supabase.auth.signInWithOtp({
                    email: loginState.email as string,
                    options: {
                        emailRedirectTo: `${path}/booking`
                    }
                })
                otpError = error
            }

            if(otpError) {
                throw(otpError)
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