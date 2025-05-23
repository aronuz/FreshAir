<template>
    <UCard v-if="success">
        <template #header>
            Confirmation link has been sent to:
        </template>
        <div class="text-center">{{ email }}</div>
        <template #footer>
            Please check your email.
        </template>
    </UCard>
    <UCard v-else> 
        <template #header>
            Welcome!
        </template>

        <UForm @submit="handleOTPLogin">
            <UFormField label="Email" name="email" class="mb-4" required help="A confirmation link will be emailed to your email.">
                <UInput v-model="email" type="email" placeholder="Email" required />
            </UFormField>

            <UButton type="submit" variant="solid" color="black" :label="sendLabel" :loading="pending"/>
        </UForm>

        <template #footer>
            Don't have an account? Enter as <UButton variant="ghost" @click="setUser">guest</UButton> or register <NuxtLink to="/register">here.</NuxtLink>
        </template>
    </UCard>
</template>

<script setup>    
    const { toastBar } = useToastBar()
    const supabase = useSupabaseClient()
    const success = ref(false)
    const email = ref('')
    const sendLabel = ref('Send Link')
    const pending = ref(false)

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
                toastBar('success', 'The link has been successfuly sent. Please check your email.')
            }
        } catch (e) {
            toastBar('error', 'Authientication Error', 'Failed to Authienticate. Please try again.')
        } finally {
            pending.value = false
        }
    }
    
    const setUser = () => {
        globalUser.value = {
            id: 0,
            email: ''        }
    }
    
    definePageMeta({
        layout: "default"
    })
</script>