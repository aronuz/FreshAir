<template>
    <EventsModal v-if="isOpen" v-model="isOpen" isReview @saved="onSave" @update:modelValue="isOpen = false"/>
    <UContainer>
        <div class="max-w-7xl mx-auto px-2 sm:px-1 lg:px-4 py-3">
            <UCard
                v-for="review in reviews"
                :key="review.id"
                :ui="{ body: 'p-6' }"
            >
                <template #header>
                    <div class="flex items-center gap-4">
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-900 dark:text-white">
                            {{ review.name }}
                            </h3>
                        </div>
                        <div
                            v-for="star in 5"
                            :key="star"
                            class="relative w-5 h-5"
                        >
                            <!-- Background (empty) star -->
                            <UIcon
                                name="i-heroicons-star-solid"
                                class="absolute inset-0 w-5 h-5 text-gray-300 dark:text-gray-600"
                            />
                            <!-- Filled star with clipping -->
                            <div
                                class="absolute inset-0 overflow-hidden"
                                :style="{ width: getStarFillPercentage(star, review.rating) }"
                            >
                                <UIcon
                                    name="i-heroicons-star-solid"
                                    class="w-5 h-5 text-yellow-400"
                                />
                            </div>
                        </div>
                    </div>
                </template>

                <div class="space-y-4">
                    <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                        "{{ review.content }}"
                    </p>
                    <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                        <span>{{ review.created_at }}</span>
                    </div>
                </div>

                <template #footer>
                    <UBadge v-if="review.verified"
                        :color="review.verified ? 'primary' : 'secondary'"
                        variant="subtle"
                        size="xs"
                    >
                        <UIcon
                            name="i-heroicons-check-badge"
                            class="w-3 h-3"
                        />
                        Verified Customer
                    </UBadge>
                </template>
            </UCard>

            <div class="flex flex-row text-center mt-12">
                <UButton
                    size="lg"
                    variant="outline"
                    trailing-icon="i-heroicons-arrow-right"
                >
                    View All Reviews
                </UButton>
                <UButton
                    size="lg"
                    variant="outline"
                    trailing-icon="i-heroicons-plus"
                    @click="isOpen = true"
                >
                    Add Your Review
                </UButton>
            </div>
        </div>
    </UContainer>
</template>

<script lang="ts" setup>
    interface reviewType {
        id?: number
        name: string,
        rating: number,
        content: string,
        created_at?: Date,
        verified?: boolean,
    }

    const { fetchReviews } = useFetchQueries()

    const { toastBar } = useToastBar()
    
    const reviews = ref<reviewType[]>([])
    
    const loadReviews = async () => {
        const { data, error, status } = await fetchReviews()
        if(error){
            toastBar('error', `Unfortunately, failed to add your review. ${status}`, (error && typeof error === 'object' && 'message' in error ? (error as any).message : 'Unknown error'))
            return
        }
        if(data) reviews.value.push(...(data as reviewType[]))
    }

    loadReviews()

    const isOpen = ref(false)

    // Calculate the fill percentage for each star
    const getStarFillPercentage = (starIx: number, rating: number) => {
        let fill = '0%'
        if (rating >= starIx) {
            fill = '100%'
        } else if (rating > starIx - 1) {
            const amount = (rating - (starIx - 1)) * 100
            fill = `${amount}%`
        }
        return fill
    }

    const onSave = (review: reviewType) => {
        isOpen.value = false
        reviews.value.push(review)
    }
 </script>