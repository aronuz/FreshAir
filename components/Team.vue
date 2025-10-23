<template>
    <div v-if="team.length > 0" :class="['grid', 'grid-cols-1', `md:grid-cols-${count - 2}`, `lg:grid-cols-${count - 1}`, 'gap-8']">
      <div v-for="staff in team" :key="staff.id" class="text-center" @click="$emit('staffSelected', staff)" style="cursor: pointer;">
        <UAvatar 
          :src="staff.image_url" 
          :alt="staff.name"
          size="xl" 
          class="mx-auto w-24 h-24"
          icon="i-heroicons-user-20-solid"
        />
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
            profileAdded?: boolean
        }>(), {
            admin: false,
            profileAdded: false
        }
    )

    defineEmits(['staffSelected'])

    const { fetchStaffProfiles } = useFetchQueries()
    const { toastBar } = useToastBar()

    interface staff {
        id: number;
        name: string;
        bio: string;
        'image_url': string;
    }

    const team = ref<Array<staff>>([])
    const count = ref<number>(0)

    const loadTeamMembers = async () => {
        const { data, error, status } = await fetchStaffProfiles()
        if(error){
            toastBar('error', status, `Failed to load team members. ${error.trim()}`)
        } else {
            team.value = data || []
            count.value = team.value.length === 1 ? 3 : team.value.length
        }
    }

    onMounted(async () => {
        loadTeamMembers()
    })

    watch(() => props.profileAdded, async (newVal) => {
        if (newVal) await loadTeamMembers()
    })
</script>