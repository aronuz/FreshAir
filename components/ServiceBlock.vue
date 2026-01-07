<template>
        <MyBlock v-for="(service, i) in services" :key="service.id" class="h-fit -mb-2" padSize="large" spacing="none">
            <div v-show="blockVisible[i]?.visible" v-bind="$attrs" :class="`move-${i}`" :style="{ animation: blockVisible[i]?.animation }" >
                <div class="flex-items h-fit">
                    <h3 class="font-semibold text-2xl md:text-lg text-gray-700 mb-2">{{ service.name }}</h3>
                    <p class="text-gray-600 text-2xl md:text-sm h-fit">{{ service.description }}</p>
                    <MyButton
                        v-if="!isBookingDown"
                        class="mt-2"
                        :label="service.type !== 'plans' ? 'Request Service' : 'Set Up a Plan'"
                        :aria-label="service.type !== 'plans' ? `Request Service for ${service.name}` : 'Set Up a Plan'"
                        @click="$router.push({path: '/booking', query: {service: service.name}})"/>
                </div>
                <div class="flex-items h-full">
                    <GalleryItem :image-src="service.type" :alt-text="service.description" loading="lazy"/>
                </div>
            </div>     
        </MyBlock>
</template>

<script lang="ts" setup>
defineOptions({
    inheritAttrs: false
})

const props = defineProps<{
    services: Array<{id: number; name: string; description: string; type: string}>;
    col: number;
}>()

const hiddenPages = useState<string[] | undefined>('hiddenPages')
const isBookingDown = computed(() => hiddenPages.value?.includes('/booking') ?? false)

const blockVisible = reactive<Array<{ visible: boolean; animation: string }>>([])

const animate = async () => {
    const sheet = (() => { 
            const style = document.createElement('style')
            document.head.appendChild(style)
            return style.sheet 
        })()
    
    let moveTime
    props.services.forEach( async (_, i) => {
        blockVisible.push({ visible: false, animation: '' })
                        
        sheet?.insertRule(`        
            @keyframes move-${i} {
                0% { 
                    transform: translate(0, 0) scale(0) rotate(0deg);
                    opacity: 0;
                }
                25% {
                    transform: translate(0, 0) scale(0.25) rotate(180deg);
                    opacity: 0.25;
                }
                50% {
                    transform: translate(0, 0) scale(0.50) rotate(360deg);
                    opacity: 0.50;
                }
                75% {
                    transform: translate(0, 0) scale(0.75) rotate(180deg);
                    opacity: 0.75;
                }
                100% { 
                    transform: translate scale(1) rotate(360deg);
                    opacity: 1;
                }
            }`, sheet?.cssRules.length)

        // Stagger the appearance of each block
        await new Promise(resolve => setTimeout(resolve, 200))

        blockVisible[i].visible = true;
        moveTime = i * 0.1 + .5
        blockVisible[i].animation = `move-${i} ${moveTime}s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`        
    })
}

onMounted(() => {
    if (import.meta.client) {
        animate()
        const unlink = useState('unlink')
        if(unlink.value) document.querySelector(`#${unlink.value}`)!.classList.remove('router-link-active')
    }
})
</script>

<style>
    .flex-container {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: flex-start;
        align-content: stretch;
    }
</style>