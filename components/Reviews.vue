<template>
    <ListModal v-if="isOpen" v-model="isOpen" :new-review="newReview" :reviews="reviews" @saved="onSave" @update:modelValue="isOpen = false"/>
    <UContainer>
        <div class="w-full md:max-w-7xl mx-auto px-2 sm:px-1 lg:px-4 py-3">
            <div class="flex flex-col lg:flex-row sm:mx-[25%] lg:mx-10 gap-3">
                <ReviewCard 
                    v-for="review in reviewsTop"
                    :key="review.id"
                    :review="review"
                />
            </div>

            <div class="flex justify-center mt-6 gap-2">
                <UButton
                    size="lg"
                    color="success"
                    icon="i-heroicons-arrow-right"
                    @click="loadReviews('all')"
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
    
    const reviewsTop = ref<reviewType[]>([])
    const reviews = ref<reviewType[]>([])
    let lastFetched: Date
    let expireAt: Date
    
    const loadReviews = async (all = '') => {
        const { data, error, status } = await fetchReviews(all)
        if(error){
            toastBar('error', `Unfortunately, failed to get reviews. ${status}`, (error && typeof error === 'object' && 'message' in error ? (error as any).message : 'Unknown error'))
            return
        }
        if(data) {
            if (all) {
                isOpen.value = true
                if (!lastFetched || expireAt && new Date() > expireAt) {
                    lastFetched = new Date()
                    expireAt = new Date(lastFetched.getTime() + 5 * 60 * 1000)
                    reviews.value.splice(0, reviews.value.length)
                    reviews.value.push(...(data as reviewType[]))
                }
            } else {
            reviewsTop.value.push(...(data as reviewType[]))                
            }
        }
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