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
            <div class="p-4">
                <p>{{ message }}</p>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2 w-full">
                <UButton color="primary" variant="ghost" @click="closeModal(false)">
                    Cancel
                </UButton>
                <UButton color="error" @click="closeModal(true)">
                    {{ confirmText }}
                </UButton>
            </div>
        </template>
    </UModal>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Confirm Deletion',
  },
  item: {
    type: String,
    default: 'this item',
  },
  confirmText: {
    type: String,
    default: 'Delete',
  },
})

const emit = defineEmits(['close'])

const isOpen = ref(false)
// const resolvePromise = ref(null)

const closeModal = (result) => {
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
  return `Are you sure you want to delete ${props.item}? \n
        This action cannot be undone.`
})

defineExpose({
  open,
})
</script>