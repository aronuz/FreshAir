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
    <ClientOnly>
        <UCard v-if="pageEvents && pageEvents.length" class="col-span-12 text-4xl w-full lg:col-span-9" :ui="{ body: 'max-h-90 overflow-y-scroll!', footer: 'bg-sky-400'}">
          <div v-for="(pageEvent, arrIx) in pageEvents" :key="arrIx" class="mb-4"> 
            <div v-for="(group, key, index) in pageEvent" :key="key">
              <div class="flex justify-end">{{ key }}</div>
                <UCard v-for="event in group" :key="event.id" class="flex flex-col" :class="`odd:bg-sky-${index + 1 < 7 ? index + 1 : 7}00 even:bg-sky-${group.length + (2 * index + 1) < 9 ? group.length + (2 * index + 1) : 9}00`">
                  <span v-if="event.service">{{ event.service }}</span>
                  <span v-else>Service</span>
                  @ {{ event.address }}
                </UCard>
            </div>
          </div>
          <template #footer>
            <div class="flex justify-center mt-4">
              <UPagination
                v-model:page="currentPage"
                :items-per-page="itemsPerPage"
                show-edges
                :total="total"
              />
            </div>
          </template>    
        </UCard>
    </ClientOnly>  
    </template>  
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

    const currentPage = ref(1);
    const itemsPerPage = ref(20)
    const total = computed(() => props.grouppedEvents ? Object.keys(props.grouppedEvents).length : 0)
    
    const pageEvents = computed((): Array<typeof props.grouppedEvents> => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;

      const eventArray = props.grouppedEvents ? Object.entries(props.grouppedEvents).map(([key, val]) => {
        return { [key]: val };
      }) : [];

      return eventArray.slice(start, end);
    });
</script>