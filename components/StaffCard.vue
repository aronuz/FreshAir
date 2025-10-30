<template>
    <UCard class="flex flex-col gap-2 w-36 h-36 bg-white-50 text-center" variant="soft">
        <UAvatar 
            :src="staff?.id ? staff.image_url : ''" 
            :alt="staff?.name || 'Add Staff Member'"
            size="xl" 
            class="mx-auto w-24 h-24"
            :icon="staff?.id ? 'i-heroicons-user-20-solid' : 'i-heroicons-plus'"
            :ui="{icon: 'text-neutral-900 size-12'}"
        />
        
            <template #footer>
                <div v-if="staff != null">
                    <h3 class="font-semibold text-lg">{{ staff.name }}</h3>
                    <p class="text-gray-600 text-sm">{{ staff.bio }}</p>
                </div>
                <p  v-else class="font-semibold text-lg">Add Staff Member</p>
   
            </template>
    </UCard>
    <UBadge
        v-if="admin && staff?.id"
        size="md"
        class="relative bottom-35 left-12 z-10 bg-white-50"
    >
        <UButton
            variant="ghost"
            color="error"
            rounded-xl
            size="md"
            icon="i-lucide-trash-2"
            @click.stop="handleDeleteStaff({ id: staff.id, name: staff.name, image_url: staff.image_url })"
        />
    </UBadge>
</template>

<script lang="ts" setup>
    const props = defineProps<{
        staff?: {
            id: number;
            name: string;
            bio: string;
            image_url: string;
        },
        admin?: boolean,
        confirmationModal?: { open: () => Promise<boolean> } | null,
    }>()

    const emit = defineEmits(['openDialog'])

    // const staffData = ref<{ id: number; name: string; image_url: string } | null>(null)

    const handleDeleteStaff = async (staff: { id: number; name: string; image_url: string }) => {
        // staffData.value = staff
        emit('openDialog', staff)
    }

    // const onClose = (result: boolean) => {
    //     if(result) emit('deleteStaff', staffData.value)
    //     else staffData.value = null
    // }

    // defineExpose({
    //     onClose
    // })
</script>