<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Customers Say
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400">
            Don't just take our word for it - hear from our clients!
        </p>
        </div>

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
                    <span>{{ review.date }}</span>
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

    <UModal 
        v-model:open="isOpen"
        title="New Review"
        :close="{
            color: 'info',  
            variant: 'outline',
            class: 'rounded-full',
            onClick: () => {isOpen = false; hasErrors = false}
        }"
        :ui="{content: 'lg:left-[35%]'}"
    >
        <UForm class="grid bg-gradient-to-b from-white to-blue-300 -m-4 sm:-m-6 p-4 pt-6" style="grid-template-rows: repeat(6, minmax(0, .99fr));" :state="formdata" :schema="schema" ref="reviewform" @submit.prevent="submitForm" @error="onError">
            <div class="grid grid-cols-2">
                <UFormField required label="Name" name="name">
                    <UInput placeholder="Name" v-model="formdata.name"/>
                </UFormField>
                <UFormField label="Rating" name="rating" required>
                    <div class="flex items-center gap-2">
                        <UButton
                            v-for="star in [1, 2, 3, 4, 5]"
                            :key="star"
                            @click="formdata.rating = star"
                            @mouseenter="hoverRating = star"
                            @mouseleave="hoverRating = 0"
                            class="transition-transform hover:scale-110"
                        >
                            <UIcon
                                name="i-heroicons-star-solid"
                                :class="star <= (hoverRating || newReview.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                                class="w-8 h-8"
                            />
                        </UButton>
                        <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            {{ formdata.rating ? `${formdata.rating} star${formdata.rating !== 1 ? 's' : ''}` : 'Select rating' }}
                        </span>
                    </div>
                </UFormField>
            </div>
            <UFormField label="Your Review" name="review">
                <UTextarea
                    v-model="formdata.content"
                    placeholder="Share your experience..."
                    :rows="5"
                    size="lg"
                />
            </UFormField>
        </UForm>
    </UModal>
</template>

<script lang="ts" setup>
    import { z } from 'zod'

    import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'

    interface reviewType {
        id?: number
        name: string,
        rating: number,
        content: string,
        date?: Date,
        verified?: boolean,
    }

    const { toastBar } = useToastBar()

    const { fetchReviews, addReview } = useFetchQueries()
    
    const reviews = ref<reviewType[]>([])
    
    const loadReviews = async () => {
        const { data, error, status } = await fetchReviews()
        if(data) reviews.value.push(...(data as reviewType[]))
    }

    loadReviews()

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

    const newReview = reactive({
        name: '',
        rating: 0,
        content: '',
    })

    const isOpen = ref(false)
    
    const hoverRating = ref(0)

    const reviewform = ref()

    const formdata = reactive({...newReview})

    const hasErrors = ref(false)

    const schema = z.object({
        name: z.string(),
        content: z.string().min(4, "It looks like your input got cut off.").max(255, "Please limit your review to 255 characters!").optional(),  
        rating: z.number().min(1, "Please give us a rating!"),
    })
    
    const submitForm = async (event: FormSubmitEvent<reviewType>) => {
        if (reviewform.value?.errors?.length) {
            let errors = ''
            for (const error in reviewform.value.errors) {
                errors += `${error} `
            }
            toastBar('error', '500', errors.trim())
            return
        }
        const { error, status } = await addReview(event.data)
        if (error) {
            toastBar('error', `Unfortunately, failed to add your review. ${status}`, (error && typeof error === 'object' && 'message' in error ? (error as any).message : 'Unknown error'))
            return
        }
        reviews.value.push(event.data)
    }

    const onError = async (event: FormErrorEvent) => {
        if (event?.errors.length){
            hasErrors.value = true
            for(const error of event.errors){
                setTimeout(() => showError(error.message), 1000)
            }
            if (event.errors[0]?.id) {
                const element = document.getElementById(event.errors[0].id)
                element?.focus()
            }
        }
    }
 </script>