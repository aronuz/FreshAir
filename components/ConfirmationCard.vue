  
  <template>
    <UCard class="w-fit mx-auto">
        <template #header>
          <div class="text-lg">{{ type }} link has been sent to {{ email }}</div>
        </template>
        <div>
          <label for="code">Use the link in the email or use the one time code:</label>
          <input class="ml-4 w-[8ch] border border-gray-500 rounded px-2 py-1" id="code" v-model="otpCode" placeholder="000000" type="text" />
        </div>
        <template #footer>
          <div class="flex justify-between">
            <span>Please check your email.</span>
            <div>
              <UButton v-if="!otpCode" :to="fromPage" variant="solid" color="success" label="OK" />
              <UButton v-else variant="solid" color="success" label="Verify" @click="verifyOtpCode"/>
            </div>
          </div>
        </template>
  </UCard>
</template>

<script lang="ts" setup>
    const props = defineProps({
        type: String,
        email: String,
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