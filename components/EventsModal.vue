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
    :ui="{content: 'lg:left-[35%]'}"
  >
    <ClientOnly>
        <UCard v-if="grouppedEvents && Object.keys(grouppedEvents).length" class="col-span-12 text-4xl w-full bg-linear-to-b from-sky-100 to-sky-400" :class="{'lg:hidden': showCalendar, 'lg:col-span-9': !showCalendar }">
            <div v-for="(group, key) in grouppedEvents" :key="key">
                <div class="flex justify-end">{{ key }}</div>
                <UCard v-for="event in group" :key="event.id" class="flex flex-col odd:bg-white even:bg-gray-400">
                    {{ event.title }}
                </UCard>
            </div>    
        </UCard>
    </ClientOnly>    
  </UModal>   
</template>

<script lang="ts" setup>
    const props = defineProps({
        modelValue: Boolean,
        grouppedEvents: Object,
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