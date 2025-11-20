<template>
    <EventsModal v-if="isOpen" v-model="isOpen" :new-review="newReview" @saved="onSave" @update:modelValue="isOpen = false"/>
    <UContainer>
        <div class="w-full md:max-w-7xl mx-auto px-2 sm:px-1 lg:px-4 py-3">
            <div class="flex flex-col lg:flex-row sm:mx-[25%] lg:mx-10 gap-3">
                <ReviewCard 
                    v-for="review in reviews"
                    :key="review.id"
                    :review="review"
                />
            </div>

            <div class="flex justify-center mt-6 gap-2">
                <UButton
                    size="lg"
                    color="success"
                    icon="i-heroicons-arrow-right"
                    @click="isOpen = true"
                >
                    View All Reviews
                </UButton>
                <UButton
                    size="lg"
                    color="success"
                    variant="outline"
                    class="bg-white hover:bg-white/60"
                    icon="i-heroicons-plus"
                    @click="addReview"
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

    const newReview = ref(0)

    const addReview = () => {
        newReview.value = 1
        isOpen.value = true
    }

    const onSave = (review: reviewType) => {
        isOpen.value = false
        reviews.value.push(review)
    }

    watch(() => isOpen.value, (val) => {
        if (!val) newReview.value = 0
    })        
 </script>