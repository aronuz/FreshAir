<template>
    <div class="flex flex-col max-sm:justify-center md:items-stretch items-center sm:justify-center max-sm:mx-4 md:mb-6 p-4 gap-4 bg-gray-50 rounded-lg col-span-12">
        <div class="flex flex-row w-full">
            <UFormField label="User Data">
                <UInput v-model="searchTerm" icon="i-lucide-search" size="md" variant="outline" placeholder="Search..." @update:modelValue="onChange"/>
            </UFormField>
        </div>
        <div class="flex flex-row max-sm:flex-wrap gap-4 items-end w-full">
            <div class="flex-1 w-[1/3]">
                <UFormField label="Start Date" class="block text-sm font-medium text-gray-700 mb-1">
                    <UInput 
                        v-model="startDate"
                        type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        :class="{ 'border-red-500': dateError }"
                    />
                </UFormField>
            </div>

            <div class="flex-1 w-[1/3]">
                <UFormField label="End Date" class="block text-sm font-medium text-gray-700 mb-1">
                    <UInput
                        v-model="endDate"
                        type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        :class="{ 'border-red-500': dateError }"
                    />
                </UFormField>
            </div>

            <div class="flex flex-wrap gap-2 w-[1/3] mb-2">
                <UButton @click="setDateRange"
                    color="primary" variant="solid" label="Apply Dates" icon="i-heroicons-document-magnifying-glass"
                    :disabled="!startDate && !endDate"
                    :class="{ 'opacity-50 cursor-not-allowed': !startDate && !endDate }"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full flex justify-center"
                />
                
                <UButton @click="clearFilters"
                    color="primary" variant="outline" label="Clear Filters" icon="i-heroicons-backspace"
                    :disabled="!searchWord && !startDate && !endDate"
                    :class="{ 'opacity-50 cursor-not-allowed': !searchWord && !startDate && !endDate}"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full flex justify-center"
                />
            </div>
        </div>

        <!-- Current filter display -->
        <!-- <div class="flex flex-row gap-4">
            <div><strong>Current filter:</strong></div>
            <div v-if="searchWord">{{ searchWord }}</div>
            <div v-if="currentDateRange.start || currentDateRange.end" class="mt-3 text-sm text-gray-600">
                <span v-if="currentDateRange.start">From {{ formatDate(currentDateRange.start) }}</span>
                <span v-if="currentDateRange.start && currentDateRange.end"> to </span>
                <span v-if="currentDateRange.end">{{ formatDate(currentDateRange.end) }}</span>
            </div>
        </div> -->
    </div>
</template>

<script setup>
    const props = defineProps({
        eventStoreId: String | null
    })

    const { toastBar } = useToastBar()

    const searchTerm = ref('')

    const searchWord = computed({
        get() {
            return searchTerm.value
        },
        set(value) {
            const eventsStore = getDynamicStore(props.eventStoreId)
            if (value === '' || !props.eventStoreId) {
                searchTerm.value = ''
            }
            else if (value  === '' || value.length > 2) {
                try {
                    eventsStore.setSearchTerm(value)
                } catch (error) {
                    toastBar('error', 'Data Error', error.message)
                }
            } 
        }
    })

    const onChange = () => {
        searchWord.value = searchTerm.value 
    }

    const dateError = ref(false)
    const startDate = ref('')
    const endDate = ref('')
    const currentDateRange = ref({ start: null, end: null })

    const emit = defineEmits(['dateRangeChanged'])

    const setDateRange = () => {
        const isRangeValid = (!startDate.value || !endDate.value) || (startDate.value && endDate.value && startDate.value <= endDate.value)
        if (!isRangeValid) {
            dateError.value = true
            toastBar('warn', 'Invalid date range: Start Date must be before End Date.')
            return
        }
        dateError.value = false
        currentDateRange.value = { 
            start: startDate.value || null, 
            end: endDate.value || null 
        }
    }

    const clearFilters = () => {
        searchWord.value = ''
        dateError.value = false
        startDate.value = ''
        endDate.value = ''
        currentDateRange.value = { start: null, end: null }
    }

    watch(currentDateRange, () => emit('dateRangeChanged', currentDateRange.value))
</script>