<template>
    <div class="flex flex-row max-sm:justify-center md:items-stretch min-w-min items-center sm:justify-center max-sm:mx-4 md:mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="flex max-sm:flex-wrap gap-4 items-end">
            <div class="flex-1 max-w-min">
                <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">
                Start Date
                </label>
                <input id="startDate" v-model="startDate"
                    type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': dateError }"
                />
            </div>

            <div class="flex-1 max-w-min">
                <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">
                End Date
                </label>
                <input id="endDate" v-model="endDate"
                    type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': dateError }"
                />
            </div>

            <div class="flex gap-2">
                <button @click="setDateRange"
                :disabled="!startDate && !endDate"
                :class="{ 'opacity-50 cursor-not-allowed': !startDate && !endDate }"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >Apply</button>
                
                <button @click="clearDateRange"
                :disabled="!startDate && !endDate"
                :class="{ 'opacity-50 cursor-not-allowed': !startDate && !endDate}"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >Clear</button>
            </div>
        </div>

        <!-- Current filter display -->
        <div v-if="currentDateRange.start || currentDateRange.end" class="mt-3 text-sm text-gray-600">
            <strong>Current filter:</strong>
            <span v-if="currentDateRange.start">From {{ formatDate(currentDateRange.start) }}</span>
            <span v-if="currentDateRange.start && currentDateRange.end"> to </span>
            <span v-if="currentDateRange.end">{{ formatDate(currentDateRange.end) }}</span>
        </div>
    </div>
</template>

<script setup>
    const { toastBar } = useToastBar()
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

    const clearDateRange = () => {
        dateError.value = false
        startDate.value = ''
        endDate.value = ''
        currentDateRange.value = { start: null, end: null }
    }

    watch(currentDateRange, () => emit('dateRangeChanged', currentDateRange.value))
</script>