<template>
  <UModal
    v-model:open="isOpen"
    :title="isReview ? 'New Review' : `${user}'s Appointments`"
    :close="{
      color: 'info',  
      variant: 'outline',
      class: 'rounded-full',
      onClick: () => {isOpen = false}
    }"
    :ui="{content: 'lg:left-[35%]', body: 'bg-linear-to-b from-sky-100 to-sky-400'}"
  >
    <template #body>
      <NewReview v-if="isReview" v-bind="$attrs" />
      <ListView v-else v-bind="$attrs" />
    </template>  
  </UModal>   
</template>

<script lang="ts" setup>
    interface Props {
      modelValue: boolean,
      user?: string,
      isReview: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
      modelValue: false,
      isReview: false
    })

    const emit = defineEmits(['update:modelValue'])

    const isOpen = computed({
        get: () => props.modelValue,
        set: (val: Boolean) => {
            emit('update:modelValue', val)
        }
    })
</script>