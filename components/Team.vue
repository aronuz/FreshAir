<template>
    <ConfirmationModal ref="confirmationModal" :item="message" @close="onClose" />
        
    <div v-if="team.length > 0" :class="['grid', 'grid-cols-1', `md:grid-cols-${count - 2}`, `lg:grid-cols-${count - 1}`, 'gap-8']">
      <div v-for="staff in team" :key="staff.id" class="w-fit justify-self-center text-center" @click="$emit('staffSelected', staff)" style="cursor: pointer;">
        <UCard class="flex flex-col items-end gap-2 max-w-xs" variant="soft">
            <UAvatar 
            :src="staff.image_url" 
            :alt="staff.name"
            size="xl" 
            class="mx-auto w-24 h-24"
            icon="i-heroicons-user-20-solid"
            />
                <UBadge
                    v-if="admin"
                    variant="soft"
                    size="md"
                    color="neutral"
                >
                    <UButton
                        variant="subtle"
                        color="warning"
                        label="Delete"
                        @click.stop="handleDeleteStaff({ id: staff.id, name: staff.name, image_url: staff.image_url })"
                    />
                </UBadge>
        </UCard>
        <h3 class="font-semibold text-lg mt-2">{{ staff.name }}</h3>
        <p class="text-gray-600 text-sm">{{ staff.bio }}</p>
      </div>
    </div>
    <div v-else-if="!admin" class="text-center text-gray-600">Something didn't go as planned. Our team is still in business!</div>
</template>

<script lang="ts" setup>
    const props = withDefaults(
        defineProps<{
            admin?: boolean,
            profileUpdated?: boolean
        }>(), {
            admin: false,
            profileUpdated: false
        }
    )

    const emit = defineEmits(['deleteStaff', 'staffSelected', 'update:profileUpdated'])

    const { fetchStaffProfiles } = useFetchQueries()
    const { toastBar } = useToastBar()

    interface staff {
        id: number;
        name: string;
        bio: string;
        'image_url': string;
    }

    const confirmationModal = ref<{ open: () => Promise<boolean> } | null>(null);
    const team = ref<Array<staff>>([])
    const count = ref<number>(0)
    const staffData = ref<{ id: number; name: string; image_url: string } | null>(null)

    const loadTeamMembers = async () => {
        const { data, error, status } = await fetchStaffProfiles()
        if(error){
            toastBar('error', status, `Failed to load team members. ${error.trim()}`)
        } else {
            team.value = data || []
            count.value = team.value.length + 2
        }
    }

    onMounted(async () => {
        loadTeamMembers()
    })

    watch(() => props.profileUpdated, async (newVal) => {
        if (newVal) {
            await loadTeamMembers()
            emit('update:profileUpdated')
        }
    })

    // const handleDeleteStaff = async (staffData: { id: number; image_url: string }) => {
    //     const result = await confirmationModal.value!.open();
    //     if(result) {
    //         emit('deleteStaff', staffData)
    //     }        
    // }

    const message = ref<string>('')

    const handleDeleteStaff = async (staff: { id: number; name: string; image_url: string }) => {
        staffData.value = staff
        message.value = `${staff.name}'s profile`
        await confirmationModal!.value!.open()
    }

    const onClose = (result: boolean) => {
        if(result) emit('deleteStaff', staffData.value)
        else staffData.value = null
    }
</script>