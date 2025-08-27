<template>
  <UModal
    v-model:open="isOpen"
    :title="`${user}\'s Appointments`"
    :close="{
      color: 'info',  
      variant: 'outline',
      class: 'rounded-full',
      onClick: () => {isOpen = false}
    }"
    :ui="{content: 'lg:left-[35%]', body: 'bg-linear-to-b from-sky-100 to-sky-400'}"
  >
    <template #body>      
      <ListView v-bind="$attrs" />
    </template>  
  </UModal>   
</template>

<script lang="ts" setup>
    const props = defineProps({
        modelValue: Boolean,
        user: String
    })

    const emit = defineEmits(['update:modelValue'])

    const isOpen = computed({
        get: () => props.modelValue,
        set: (val: Boolean) => {
            emit('update:modelValue', val)
        }
    })
</script>