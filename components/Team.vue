<template>
    <ConfirmationModal ref="confirmationModal" page="team" :message="message" @close="onClose" />
    <div class="flex flex-nowrap justify-center w-full -mt-4 mb-8 px-4">
        <div v-if="team.length > 0" class="grid gap-8 mx-auto border border-gray-300 rounded-lg py-8 bg-white shadow-md overflow-y-scroll overflow-x-hidden h-[300px] pr-4" :style="[gridColumns]">
            <div v-if="admin" class="w-fit justify-self-center text-center cursor-pointer" @click="emit('showForm')">
                <StaffCard v-bind='$attrs' :admin="admin"/>
            </div>
            <div v-for="staff in team" :key="staff.id" class="w-fit justify-self-center text-center cursor-pointer" @click="$emit('staffSelected', staff)">
                <StaffCard ref="staffCard" v-bind='$attrs' :admin="admin" :staff="staff" @open-dialog="openDialog($event)"/>
            </div>
        </div>
        <div v-else-if="admin" class="w-fit justify-self-center text-center cursor-pointer h-[300px]" @click="emit('showForm')">
            <StaffCard v-if="admin" v-bind='$attrs' :admin="admin"/>
        </div>
        <div v-else class="text-center text-gray-600">Something didn't go as planned. Our team is still in business!</div>
    </div>
</template>

<script lang="ts" setup>
    import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

    const props = withDefaults(
        defineProps<{
            admin?: boolean,
            profileUpdated?: boolean,
        }>(), {
            admin: false,
            profileUpdated: false,
        }
    )

    const emit = defineEmits(['staffSelected', 'update:profileUpdated', 'deleteStaff', 'showForm'])

    const { fetchStaffProfiles } = useFetchQueries()
    const { toastBar } = useToastBar()

    interface staff {
        id: number;
        name: string;
        bio: string;
        'image_url': string;
    }

    const confirmationModal = ref<{ open: () => Promise<boolean> } | null>(null);
    const staffCard = ref<{ onClose: () => void }>();
    const team = ref<Array<staff>>([])
    
    const loadTeamMembers = async () => {
        const { data, error, status } = await fetchStaffProfiles()
        if(error){
            toastBar('error', status, `Failed to load team members. ${error.trim()}`)
        } else {
            team.value = data || []
            // count.value = team.value.length + 2
        }
    }

    const gridColumns = computed(() => {
        const count = props.admin ? team.value.length + 1 : team.value.length // +1 for add staff card
        const breakpoints = useBreakpoints(breakpointsTailwind)
 
        const bp = breakpoints?.greaterOrEqual('lg') ? 'lg' : 
            breakpoints?.greaterOrEqual('md') ? 'md' : 
            breakpoints?.greaterOrEqual('sm') ? 'sm' : 'xs'
        
        let base
        switch (bp) {
            case 'lg':
                base = Math.max(1, Math.min(4, count))
                break
            case 'md':
                base = Math.max(1, Math.min(4, count))
                break
            case 'sm':
                base = Math.max(1, Math.min(3, count))
                break
            default:
                base = Math.max(1, Math.min(2, count))
        }

        const mod = count % 4       
        const colsBase = count >= base ? mod === 0 ? base : base + mod : count
        const smCols = Math.max(1, colsBase - mod - 2)
        const mdCols = Math.max(1, colsBase - mod - 1)
        const lgCols = Math.max(1, colsBase - mod)
        
        // Returns different column counts based on screen size
        // This uses CSS media queries in the style attribute
        // return `repeat(auto-fit, minmax(150px, 1fr))`
        return { '--sm-cols': smCols, '--md-cols': mdCols, '--lg-cols': lgCols }
    })

    onMounted(async () => {
        loadTeamMembers()
    })

    watch(() => props.profileUpdated, async (newVal) => {
        if (newVal) {
            await loadTeamMembers()
            emit('update:profileUpdated')
        }
    })

    const staffData = ref<{ id: number; name: string; image_url: string } | null>(null)
    const message = ref<string>('')
    const openDialog = async (staff: staff) => {
        staffData.value = staff
        message.value = `${staff.name}'s profile`
        await confirmationModal!.value!.open()
    }

    const onClose = ({result} : {result: boolean}) => {
        if(result) emit('deleteStaff', staffData.value)
        else staffData.value = null
    }
</script>

<style scoped>
.grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 640px) {
    .grid {
        grid-template-columns: repeat(var(--sm-cols), minmax(0, 1fr));
    }
}

@media (min-width: 768px) {
    .grid {
        grid-template-columns: repeat(var(--md-cols), minmax(0, 1fr));
    }
}

@media (min-width: 1024px) {
    .grid {
        grid-template-columns: repeat(var(--lg-cols), minmax(0, 1fr));
    }
}
</style>