<template>
    <UModal 
        v-model:open="isOpen"        
        :title="title"
        :close="{
        color: 'primary',
        variant: 'outline',
        class: 'rounded-full',
        onClick: () => closeModal(false)
        }"
        :ui="{content: 'lg:left-[35%]', body: 'bg-linear-to-b from-sky-100 to-sky-400'}"
    >
        <template #body>
          <slot name="content">
            <div class="p-4">
                <p>{{ message }}</p>
            </div>
          </slot>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2 w-full">
                <UButton color="primary" variant="ghost"
                trailing-icon="i-heroicons-x-mark"
                @click="closeModal(false)">
                    Cancel
                </UButton>
                <UButton :color="confirmText === 'Delete' ? 'error' : 'success'" 
                :trailing-icon = "confirmIcon"
                @click="closeModal(true)">
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
  message: {
    type: String,
    default: 'this item',
  },
  confirmText: {
    type: String,
    default: 'Delete',
  },
  confirmIcon: {
    type: String,
    default: 'i-heroicons-trash',
  },
})

const emit = defineEmits(['close'])

const isOpen = ref(false)
// const resolvePromise = ref(null)

const closeModal = (result: boolean) => {
  isOpen.value = false
  emit('close', result)
//   resolvePromise.value(result)
}

const open = () => {
  isOpen.value = true
  return new Promise((resolve) => {
    resolve(false)
  })
}

const message = computed(() => {
  const message = `Are you sure you want to delete ${props.message}? \n
        This action cannot be undone.`
  return message
})

defineExpose({
  open,
})
</script>