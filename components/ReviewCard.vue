<template>
  <UCard
    :class="['flex', 'flex-col', 'w-full', { 'xl:w-full max-sm:w-fit': !all }]"
    :ui="{ body: 'px-6 sm:px-6 py-3 sm:py-3' }"
  >
    <template #header>
        <div class="flex md:justify-between gap-1 flex-wrap items-start">
            <div class="flex flex-col sm:gap-4">
                <h3 :class="['font-semibold text-gray-900 dark:text-white max-w-[100%]', all && isSM? 'w-[40vw]' : 'w-20']">
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
            <div :class="[isLG ? 'w-20' : !all && isSM ? 'w-fit' : 'w-15', {'grid grid-cols-5': all || !isSM}]">
                <div v-if="!all && isSM" class="flex justify-end gap-1 font-semibold text-gray-900 dark:text-white">
                    <div class="whitespace-nowrap">{{ review.rating }} / 5</div>
                    <UIcon
                        name="i-heroicons-star-solid"
                        class="w-fit h-5 text-yellow-400"
                    />
                </div>
                <template v-else>
                    <div
                        v-for="star in 5"
                        :key="star"
                        class="relative w-5 h-5"
                        :class="{'xs:block max-sm:hidden': !all}"
                    >
                        <!-- Background star -->
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
                                class="absolute w-5 h-5 text-yellow-400"
                            />
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </template>

    <div class="grid grid-rows-2 gap-2">
        <div class="text-gray-700 dark:text-gray-300 leading-relaxed">
            {{ review.content }}
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
            <span>{{ dateCreated(review.created_at) }}</span>
        </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
    import dayjs from 'dayjs'
    import LocalizedFormat from 'dayjs/plugin/localizedFormat'; // Required for 'LL' format

    dayjs.extend(LocalizedFormat);

    const { $screenSize } = useNuxtApp()    
    const isSM = computed(() => ['xs', 'sm'].includes((unref($screenSize) as string)))
    const isLG = computed(() => (unref($screenSize) as string) === 'lg')

    interface reviewType {
      id?: number
      name: string,
      rating: number,
      content: string,
      created_at?: Date,
      verified?: boolean,
    }

    import type { PropType } from 'vue'

    const props = defineProps({ 
        review: {type: Object as PropType<reviewType>, required: true}, 
        all: {type: Boolean, default: false }
    })

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

    const dateCreated = (date: Date | undefined) => {
        if (date) return dayjs(date).format('LL')
    }
</script>
