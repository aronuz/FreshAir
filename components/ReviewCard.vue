<template>
  <UCard
    class="w-full md:w-fit"
    :ui="{ body: 'px-6 sm:px-6 py-3 sm:py-3' }"
  >
    <template #header>
        <div class="flex items-center gap-4">
            <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ review.name }}
                </h3>
                <UBadge v-if="review.verified"
                    color="primary"
                    variant="subtle"
                    size="xs"
                >
                    <UIcon
                        name="i-heroicons-check-badge"
                        class="w-3 h-3"
                    />
                </UBadge>
            </div>
            <div class="grid grid-cols-5">
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
        </div>
    </template>

    <div class="grid grid-rows-2 gap-2">
        <div class="text-gray-700 dark:text-gray-300 leading-relaxed">
            "{{ review.content }}"
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
            <span>{{ review.created_at }}</span>
        </div>
    </div>
  </UCard>
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

    defineProps<{ review: reviewType }>()

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
</script>
