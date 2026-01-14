  
<template>
  <login page="Confirmation">
    <template #prompt>
      <div class="text-lg">{{ type }} link has been sent to {{ email }}</div>
    </template>

    <div v-if="reset">
      Follow the link in the email to reset your password.
    </div>
    <div v-else>
      <label for="code">Follow the link in the email or use the one time code:</label>
      <input class="bg-[light-dark(var(--color-white),var(--color-gray-950))]: ml-4 w-[8ch] border border-gray-500 rounded px-2 py-1" id="code" v-model="otpCode" placeholder="000000" type="text" />
    </div>

    <template #switch>
      <div class="flex justify-between">
        <span>Please check your email.</span>
        <div>
          <MyButton v-if="!otpCode" :to="reset ? '/registration' : fromPage" label="OK" />
          <MyButton v-else-if="!reset" @click="verifyOtpCode"/>
        </div>
      </div>
    </template>
  </login>
</template>

<script lang="ts" setup>
  const props = defineProps({
    type: String,
    email: String,
    reset: Boolean,
    fromPage: String
  })

  const emit = defineEmits(['verify-code'])

  const { toastBar } = useToastBar()
  const supabase = useSupabaseClient();

  const otpCode = ref(null)

  const verifyOtpCode = async () => { 
    const { error } = await supabase.auth.verifyOtp({
        email: props.email as string,
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
</script>