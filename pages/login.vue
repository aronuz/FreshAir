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

        <UForm @submit="handleLogin">
            <UFormGroup label="Email" name="email" class="mb-4" required help="A confirmation link will be emailed to your email.">
                <UInput v-model="email" type="email" placeholder="Email" required />
            </UFormGroup>

            <UButton type="submit" variant="solid" color="black" :loading="pending">Sign in</UButton>
        </UForm>
    </UCard>
</template>

<script setup>    
    const { toastBar } = useToastBar()
    const supabase = useSupabaseClient()
    const success = ref(false)
    const email = ref('')
    const pending = ref(false)

    const handleLogin = async () => {
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
                success.value = true
            }
        } catch (e) {
            toastBar('Error', 'Authientication Error', 'Failed to Authienticate. Please try again.')
        } finally {
            pending.value = false
        }
    }

    definePageMeta({
        layout: "default"
    })
</script>