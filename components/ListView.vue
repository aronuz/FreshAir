<template>
    <ClientOnly>
        <UCard class="col-span-12 text-4xl w-full lg:col-span-9" :ui="{ body: 'max-h-90 overflow-y-scroll!', footer: 'bg-sky-400'}">
            <section>
                <template v-if="!loadingList && pageEvents && pageEvents.length" >
                    <template v-for="(pageEvent, arrIx) in pageEvents" :key="arrIx" class="mb-4"> 
                        <template v-for="(group, key, index) in pageEvent" :key="key">
                            <div class="flex justify-end">{{ key }}</div>
                            <UCard v-for="event in group" :key="event.id" class="flex flex-col" :class="`even:bg-sky-${index + 1 < 7 ? index + 1 : 7}00 odd:bg-sky-${group.length + (2 * index + 1) < 9 ? group.length + (2 * index + 1) : 9}00`">
                            <span v-if="event.service">{{ event.service }}</span>
                            <span v-else>Service</span> 
                            @ {{ event.address }}
                            </UCard>
                        </template>
                    </template>
                </template>
                <div v-else>No Appointments</div>
            </section>
            <template v-if="!loadingList && pageEvents && pageEvents.length" #footer>
                <div class="flex justify-center mt-4">
                    <UPagination
                        v-model:page="currentPage"
                        :items-per-page="itemsPerPage"
                        :show-controls="totalPages > 1"
                        show-edges
                        :total="total"
                    />
                </div>
            </template>    
        </UCard>
    </ClientOnly>
</template>

<script lang="ts" setup>

    const props = defineProps({
        grouppedEvents: Object,
        loadingList: {type: Boolean, default: false}
    })

    const emit = defineEmits(['update:modelValue'])

    const currentPage = ref(1)
    const itemsPerPage = ref(20)
    const total = computed(() => props.grouppedEvents ? Object.keys(props.grouppedEvents).length : 0)
    const totalPages = computed(() => Math.ceil(total.value / itemsPerPage.value))

    const pageEvents = computed((): Array<typeof props.grouppedEvents> => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value

      const eventArray = props.grouppedEvents ? Object.entries(props.grouppedEvents).map(([key, val]) => {
        return { [key]: val }
      }) : [];

      return eventArray.slice(start, end)
    })
</script>
