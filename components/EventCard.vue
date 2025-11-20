<template>
  <template v-for="(group, key, index) in groups" :key="key">
    <div class="flex justify-end">{{ key }}</div>
    <UCard v-for="event in group" :key="event.id" class="flex flex-col" :class="`even:bg-sky-${index + 1 < 7 ? index + 1 : 7}00 odd:bg-sky-${group.length + (2 * index + 1) < 9 ? group.length + (2 * index + 1) : 9}00`">
        <strong>
            <span v-if="event.service">{{ event.service }}</span>
            <span v-else>Service</span>
        </strong> 
        <span class="ml-2">@ <strong>{{ event.address }}</strong></span>
        <span v-if="event.title" class="ml-2">for <strong>{{ event.title }}</strong></span> 
    </UCard>
  </template>
</template>

<script lang="ts" setup>
  import type { PropType } from 'vue'

  interface EventType {
    id: number,
    address: string,
    service: string,
    title: string
  }

  const props = defineProps({
    groups: Object as PropType<Record<string, EventType[]>>,
  })
</script>