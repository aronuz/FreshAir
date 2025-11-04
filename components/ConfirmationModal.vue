<template>
    <UModal 
        v-model:open="isOpen"        
        :title="page === 'phone' ? message : title"
        :close="{
        color: 'primary',
        variant: 'outline',
        class: 'rounded-full',
        onClick: () => closeModal(false)
        }"
        :ui="{content: 'lg:left-[35%]', body: 'bg-linear-to-b from-sky-100 to-sky-400'}"
    >
        <template #body>
            <UTextarea v-if="page === 'phone'" v-model="customMessage" :rows="4" class="w-full"/>
            <div v-else class="p-4">
                <p>{{ message }}</p>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2 w-full">
                <UButton color="primary" variant="ghost"
                trailing-icon="i-heroicons-x-mark"
                @click="closeModal(false)">
                    Cancel
                </UButton>
                <UButton :color="page === 'phone' ? 'success' : 'error'" 
                :trailing-icon = "page === 'phone' ? 'i-heroicons-paper-airplane' : 'i-heroicons-trash'"
                @click="closeModal(true, customMessage)">
                    {{ confirmText }}
                </UButton>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: 'Confirm Deletion',
  },
  page: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: 'this item',
  },
  defaultMessage: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: 'Delete',
  },
})

const emit = defineEmits(['close'])

const isOpen = ref(false)
// const resolvePromise = ref(null)

const closeModal = (result: boolean, customMessage: string | null = null) => {
  isOpen.value = false
  emit('close', { result, customMessage })
//   resolvePromise.value(result)
}

const open = () => {
  isOpen.value = true
  return new Promise((resolve) => {
    resolve(false)
  })
}

const message = computed(() => {
  const message = props.page === 'phone' 
    ? props.message
    : `Are you sure you want to delete ${props.message}? \n
        This action cannot be undone.`

  return message
})

const customMessage = ref(props.defaultMessage)

defineExpose({
  open,
})
</script>