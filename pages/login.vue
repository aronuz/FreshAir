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

        <form @submit="handleLogin">
            <UFormGroup label="Email" name="email" class="mb-4" required help="A confirmation link will be emailed to your email.">
                <UInput v-model="email" type="email" placeholder="Email" required />
            </UFormGroup>

            <UButton type="submit" variant="solid" color="black" :loading="pending">Sign in</UButton>
        </form>
    </UCard>
</template>

<script setup>
    const supabase = useSupabaseClient()
    const success = ref(false)
    const email = ref('')
    const pending = ref(false)
    const toast = useToast()

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
            useToast({title: 'Failed to Authienticate. Please try again.', description: e.message, color: 'red'})
        } finally {
            pending.value = false
        }
    }
</script>