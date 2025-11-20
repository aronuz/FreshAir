<template>
  <UModal
    v-model:open="isOpen"
    :title="title"
    :close="{
      color: 'info',  
      variant: 'outline',
      class: 'rounded-full',
      onClick: () => {isOpen = false}
    }"
    :ui="{content: 'lg:left-[35%]', body: 'bg-linear-to-b from-sky-100 to-sky-400'}"
  >
    <template #body>
      <NewReview v-if="newReview === 1" v-bind="$attrs" />
      <ListView :event-list="newReview === -1" v-else v-bind="$attrs" />
    </template>  
  </UModal>   
</template>

<script lang="ts" setup>
    interface Props {
      modelValue: boolean,
      user?: string,
      newReview: number
    }

    const props = withDefaults(defineProps<Props>(), {
      modelValue: false,
      newReview: -1
    })

    const emit = defineEmits(['update:modelValue'])

    const title = computed(() => {
      let title = `${props.user}'s Appointments`
      if (props.newReview === 0) title = `Our reviews`
      else if (props.newReview === 1) title = "New Review"
      return title
    })

    const isOpen = computed({
        get: () => props.modelValue,
        set: (val: Boolean) => {
            emit('update:modelValue', val)
        }
    })
</script>