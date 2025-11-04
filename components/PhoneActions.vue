<template>
  <ConfirmationModal :bind="$attrs" ref="confirmationModal" page="phone" :message="message" confirm-text="Send" @close="onClose" />
  <UContainer class="contact-actions">    
    <!-- Call button -->
    <UButton 
      @click="onClick()" 
      collor="primary"
      variant="solid"
      :disabled="!phoneNumber"
      trailing-icon="i-heroicons-phone"
    >
      Call
    </UButton>
    
    <!-- SMS button -->
    <UButton 
      @click="onClick('sms')" 
      collor="primary"
      variant="solid"
      :disabled="!phoneNumber"
      trailing-icon="i-heroicons-chat-bubble-oval-left"
    >
      Text
    </UButton>

    <!-- SMS with Custom Message Modal -->
    <UButton 
      @click="onClick('sms', true)" 
      color="primary"
      variant="solid"
      :disabled="!phoneNumber"
      trailing-icon="i-heroicons-chat-bubble-oval-left-ellipsis"
    >
      Custom SMS
    </UButton>
    
    <!-- Modal for Custom SMS
    <UModal v-model:open="showSMSModal" title="Send Custom SMS" @close="showSMSModal = false"> 
      <template #content>
            <UTextarea v-model="customMessage" :rows="4" />
      </template>  
      <template #footer>
          <div class="modal-actions">
              <UButton @click="onClick('sms', true)" 
                  color="primary" 
                  variant="solid" 
                  trailing-icon="i-heroicons-paper-airplane">
                      Send
              </UButton>
              <UButton @click="showSMSModal = false" 
                  color="success" 
                  variant="solid"
                  trailing-icon="i-heroicons-x-mark">
                      Cancel
              </UButton>
          </div>
      </template>
    </UModal> -->
  </UContainer>
</template>

<script setup lang="ts">
import ConfirmationModal from './ConfirmationModal.vue';

interface Props {
  phoneNumber: string
}

const props = withDefaults(defineProps<Props>(), {
  phoneNumber: ''
})

const confirmationModal = ref<InstanceType<typeof ConfirmationModal> | null>(null);
const message = ref('')
let actionRoute = ref('')

const formattedNumber = computed(() => {
  // Remove all non-digit characters except +
  const number = props.phoneNumber.replace(/[^\d+]/g, '')
  return number
})

const onClick = async (action: string = 'tel', custom = false) => {
  actionRoute.value = `${action}:${formattedNumber.value}`
  if (action === 'sms' && custom) {    
    message.value = `Send your message to ${formattedNumber.value}`
    await confirmationModal!.value!.open()  
  } else {
    onClose({result: true})
  }
}

const onClose = ({result, customMessage}: {result: boolean, customMessage?: string}) => {
  if(result) {
    if (customMessage) {
      const encodedMessage = encodeURIComponent(customMessage)
      actionRoute.value += `?body=${encodedMessage}`
    }
    navigateTo(actionRoute.value, { external: true })
  }
  actionRoute.value = ''
  message.value = ''
}
</script>

<style scoped>
</style>