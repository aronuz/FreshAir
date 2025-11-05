<template>
  <UContainer class="px-0 sm:px-0 lg:px-0">
    <ConfirmationModal v-bind="$attrs" ref="confirmationModal" :title="message" confirm-text="Send" @close="onClose" >
      <template #content>
        <UTextarea v-model="customMessage" :rows="4" class="w-full"/>
      </template>
    </ConfirmationModal>
   
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
  </UContainer>
</template>

<script setup lang="ts">
import ConfirmationModal from './ConfirmationModal.vue';

interface Props {
  phoneNumber: string,
  defaultMessage: string,
}

const props = withDefaults(defineProps<Props>(), {
  phoneNumber: '', 
  defaultMessage: '',
})

const confirmationModal = ref<InstanceType<typeof ConfirmationModal> | null>(null);
const message = ref('')
let actionRoute = ref('')

const formattedNumber = computed(() => {
  // Remove all non-digit characters except +
  const number = props.phoneNumber.replace(/[^\d+]/g, '')
  return number
})

const customMessage = ref(props.defaultMessage)

const onClick = async (action: string = 'tel', custom = false) => {
  actionRoute.value = `${action}:${formattedNumber.value}`
  if (action === 'sms' && custom) {    
    message.value = `Send your message to ${formattedNumber.value}`
    await confirmationModal!.value!.open()
  } else {
    onClose(true)
  }
}

const onClose = (result: boolean) => {
  if(result) {
    if (customMessage.value && customMessage.value !== '') {
      const encodedMessage = encodeURIComponent(customMessage.value)
      actionRoute.value += `?body=${encodedMessage}`
    }
    if(actionRoute.value !== '') navigateTo(actionRoute.value, { external: true })
  }
  actionRoute.value = ''
  message.value = ''
}
</script>

<style scoped>
</style>