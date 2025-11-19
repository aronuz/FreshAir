<template>
    <UForm class="grid grid-rows-[80px_1fr_50px] bg-gradient-to-b from-white to-blue-300 -m-4 sm:-m-6 p-4 pt-6" :state="formdata" :schema="schema" ref="reviewform" @submit.prevent="submitForm" @error="onError">
        <div class="grid grid-cols-2">
            <UFormField required label="Name" name="name">
                <UInput placeholder="Name" v-model="formdata.name"/>
            </UFormField>
            <UFormField label="Rate Us" name="rating" required>
                <div class="flex items-center gap-2">
                    <UButton
                        v-for="star in [1, 2, 3, 4, 5]"
                        :key="star"
                        @click="formdata.rating = star"
                        @mouseenter="hoverRating = star"
                        @mouseleave="hoverRating = 0"
                        class="px-1.5"
                    >
                        <UIcon
                            name="i-heroicons-star-solid"
                            :class="star <= (hoverRating || formdata.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                            class="w-4 h-4 transition-transform hover:scale-150"
                        />
                    </UButton>
                    <span v-if="formdata.rating" class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {{ `${formdata.rating} star${formdata.rating !== 1 ? 's' : ''}` }}
                    </span>
                </div>
            </UFormField>
        </div>
        <UFormField label="Your Review" name="review" class="w-full" >
            <UTextarea
                v-model="formdata.content"
                placeholder="Share your experience..."
                :rows="5"
                size="lg"
                class="w-full"
            />
        </UFormField>
        <div class="flex justify-center self-center">      
            <UButton class="px-8" type="submit" color="primary" variant="solid" label="save" />
        </div>
    </UForm>
</template>

<script lang="ts" setup>
    import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
    import { z } from 'zod'

    const emit = defineEmits(['saved'])

    interface reviewType {
        id?: number
        name: string,
        rating: number,
        content: string,
        created_at?: Date,
        verified?: boolean,
    }

    const { addReview } = useFetchQueries()
    
    const { toastBar } = useToastBar()

    const newReview = reactive({
        name: '',
        rating: 0,
        content: '',
    })

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

        const verified = useGuestUser().value !== null
        const reviewData = { verified }
        Object.assign(reviewData, event.data)
        const { error, status } = await addReview(event.data)
        if (error) {
            toastBar('error', `Unfortunately, failed to add your review. ${status}`, (error && typeof error === 'object' && 'message' in error ? (error as any).message : 'Unknown error'))
            return
        }
        emit('saved', event.data)
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