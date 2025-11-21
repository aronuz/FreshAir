<template>
    <ClientOnly>
        <UCard class="col-span-12 lg:col-span-12 text-4xl" :ui="{ body: 'max-h-90 overflow-y-scroll!', footer: 'bg-sky-400'}">
            <section>
                <template v-if="!loadingList && pageItems && pageItems.length" >
                    <template v-for="(item, arrIx) in pageItems" :key="arrIx" class="mb-4">
                        <EventCard v-if="eventList" :groups="item"/>
                        <ReviewCard v-else all :review="item" />
                    </template>
                </template>
                <div v-else-if="eventList">No Appointments</div>
                <div v-else>Be the first to give us feedback!</div>
            </section>
            <template v-if="!loadingList && pageItems && pageItems.length" #footer>
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
    import type { PropType } from 'vue'

    interface EventType {
        id: number,
        address: string,
        service: string,
        title: string
    }
    
    interface ReviewType {
        id?: number
        name: string,
        rating: number,
        content: string,
        created_at?: Date,
        verified?: boolean,
    }
    
    const props = defineProps({
        eventList: {type: Boolean, default: false},
        grouppedEvents: {
            type: Object as PropType<Record<string, EventType[]>> | null,
        },
        reviews: {type: Array<ReviewType>, default: []},
        loadingList: {type: Boolean, default: false}
    })

    const emit = defineEmits(['update:modelValue'])

    const currentPage = ref(1)
    const itemsPerPage = ref(20)
    const itemList = props.eventList && props.grouppedEvents ? Object.keys(props.grouppedEvents) : props.reviews
    const total = computed(() => itemList ? itemList.length : 0)
    const totalPages = computed(() => Math.ceil(total.value / itemsPerPage.value))

    const pageItems = computed((): Array<typeof props.grouppedEvents | ReviewType> => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value

      const eventArray = props.grouppedEvents ? Object.entries(props.grouppedEvents).map(([key, val]) => {
        return { [key]: val }
      }) : props.reviews;

      return eventArray.slice(start, end)
    })
</script>
