<template>
    <UContainer class="h-screen flex items-start justify-center font-sans">
        <ConfirmationCard v-if="success" :type="type" :email="email" :from-page="fromPage"/>
        <UCard v-else :ui="{header: 'p-2 sm:p4', body: 'p-2 sm:p4', footer: 'p-2 sm:p4'}" class="dialog-container max-w-xl px-2 rounded-lg sm:mx-4 sm:px-6 w-fit mx-auto"> 
            <template #header>
                <div class="grid grid-rows-auto text-lg/6">
                    <p class="text-3xl text-white font-bold">
                        <span v-if="isConfirmation">Thank you!</span>
                        <span v-else >Welcome!</span>
                    </p>
                    <h2 class="font-semibold">
                        <slot name="prompt"><!-- Prompt content --></slot>
                    </h2>
                    <h2 v-if="!isConfirmation" class="font-semibold">or enter as guest to schedule a new appointment!</h2>
                </div>
            </template>

            <slot :onError="onError" :fromPage="fromPage"><!-- Default slot content --></slot>

            <template #footer>
                <div class="dialog-details grid grid-rows-2 gap-2 text-sm leading-4 md:text-lg md:leading-6">
                    <p class="sm:whitespace-nowrap"><slot name="switch"></slot></p>
                    <p v-if="!isConfirmation" class="sm:whitespace-nowrap">Click <UButton variant="outline" @click="setGuestUser">here</UButton> to continue as guest to add an appointment.</p>
                </div>
            </template>
        </UCard>
    </UContainer>
</template>

<script lang="ts" setup>
    import type { FormErrorEvent } from '@nuxt/ui'

    const router = useRouter()

    const props = defineProps({
        page: {
            type: String,
            default: 'Login'
        },
        type: {
            type: String,
            default: 'Login'
        },
        email: {
            type: String,
            default: ''
        },
        success: {
            type: Boolean,
            default: false
        }
    })

    const isConfirmation = computed(() => props.page === 'Confirmation')
    
    let origin = useState('origin').value as string
    const fromPage = ref<string>('/') //useRouter().options.history.state.back

    if (origin && origin.includes('_')) {
        origin = origin.slice(0, origin.indexOf('_')) 
    }
    if(origin && origin !== 'index') fromPage.value+=origin
    let fromPageLink: HTMLElement | null
    watch(() => document, (value) => {
        if (value && origin && !['login', 'registration'].includes(origin)) {
            fromPageLink = document.querySelector(`#${origin}`)
            fromPageLink?.classList.add('router-link-active')
        }
    }, {immediate: true})

    const guestUser = useGuestUser()

    const onError = async (event: FormErrorEvent) => {
        if (event?.errors.length){
            for(const error of event.errors){
                setTimeout(() => showError(error.message), 1000)
            }
            if (event.errors[0]?.id) {
                const element = document.getElementById(event.errors[0].id)
                element?.focus()
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }

    const setGuestUser = () => {
        guestUser.value = {
            id: 0,
            email: ''
        }
        useState('user_id', () => 0)
        const idList = document.querySelectorAll('.router-link-active')
        if(idList.length) idList[0].classList.remove('router-link-active')
        router.push({ path: "/booking" })
    }

    defineExpose({
        guestUser: guestUser.value,
    })
</script>