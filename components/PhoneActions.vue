<template>
  <UContainer class="contact-actions">
    <!-- Call button -->
    <UButton 
      @click="handleCall" 
      collor="primary"
      variant="solid"
      :disabled="!phoneNumber"
      trailing-icon="i-heroicons-phone"
    >
      Call
    </UButton>
    
    <!-- SMS button -->
    <UButton 
      @click="handleSMS" 
      collor="primary"
      variant="solid"
      :disabled="!phoneNumber"
      trailing-icon="i-heroicons-chat-bubble-oval-left"
    >
      Text
    </UButton>
    
    <!-- SMS with Custom Message Modal -->
    <UButton 
      @click="showSMSModal = true"
      collor="primary"
      variant="solid"
      :disabled="!phoneNumber"
      trailing-icon="i-heroicons-chat-bubble-oval-left-ellipsis"
    >
      Custom SMS
    </UButton>
    
    <!-- Modal for Custom SMS -->
    <UModal v-if="showSMSModal"> 
      <!-- class="modal" -->
        <UCard class="modal-content">
            <template #header>
                <h3>Send SMS to {{ formattedNumber }}</h3>
            </template>
             <UTextarea v-model="customMessage" :rows="4" />  
            <template #footer>
                <div class="modal-actions">
                    <UButton @click="sendCustomSMS" 
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
        </UCard>
    </UModal>
  </UContainer>
</template>

<script setup lang="ts">

interface Props {
  phoneNumber: string
  defaultMessage: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultMessage: ''
})

const showSMSModal = ref(false)
const customMessage = ref(props.defaultMessage)

const formattedNumber = computed(() => {
  // Remove all non-digit characters except +
  const number = props.phoneNumber.replace(/[^\d+]/g, '')
  return number
})

const handleCall = () => {
  window.location.href = `tel:${formattedNumber.value}`
}

const handleSMS = () => {
  window.location.href = `sms:${formattedNumber.value}`
}

const sendCustomSMS = () => {
  const encodedMessage = encodeURIComponent(customMessage.value)
  window.location.href = `sms:${formattedNumber.value}?body=${encodedMessage}`
  showSMSModal.value = false
}
</script>

<style scoped>
.contact-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-call {
  background-color: #10b981;
  color: white;
}

.btn-call:hover:not(:disabled) {
  background-color: #059669;
}

.btn-sms {
  background-color: #3b82f6;
  color: white;
}

.btn-sms:hover:not(:disabled) {
  background-color: #2563eb;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 90%;
}

.modal-content textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin: 1rem 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style>