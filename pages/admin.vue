<template>
  <ClientOnly>
    <FormModal v-model="isOpenUser" :selected-user="selectedUser" @saved="selectedUser=null; isOpenUser=false"/>
    <EventsModal v-if="selectedUser && isOpenEvents" v-model="isOpenEvents" :groupped-events="appointments" :user="selectedUser.title"/>
      
    <UCard>
      <template #header class="text-xl font-semibold">Admin Panel</template>

      <UTabs :unmount-on-hide="false" :items="tabItems" class="w-full">
        <template #content="{ item }">
          <UCard>
            <template #header class="text-xl font-semibold">{{ item.label }}</template>
            <template v-if="item.label === 'User Management'">
              <div v-if="!users.length && !pending">No Users</div>
              <template v-else-if="!users.length && pending">
                <USkeleton v-for="i in 3" class="mx-auto mt-1 h-2 w-full bg-gray-600" as="div"/>
              </template>
              <div v-else>
                <div v-for="user in users" :key="user.user_id" class="flex justify-between p-3 bg-gray-100 rounded">
                  <UCheckbox @changed="updateSelectedUsers($event, user.user_id)" />
                  <span>{{ user.title }} - {{ user.phone }}</span><span v-if="user.email">/{{ user.email }}</span><span>&nbsp;- {{ user.role }} - Profile created on: {{ user.created_at }}</span>
                  <UButton @click="loadUserEvents(user)" label="See Appointments" />
                
                  <div class="space-x-2">
                    <UButton class="bg-blue-500 text-white px-2 py-1 rounded" @click="handleUpdateUser(user)" label="Edit" />
                    <UButton class="bg-red-500 text-white px-2 py-1 rounded" @click="handleDeleteUsers(user.user_id)" label="Remove" />
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div v-for="page in pages" :key="page.to" class="flex justify-between p-3 bg-gray-100 rounded">
                <span>{{ page.name }}</span>
                <UCheckbox v-model="page.allowed" :label="page.allowed ? 'Shown' : 'Hidden'"/>
                <UFormField v-if="page.allowed" label="Page path">
                  <USelect v-model="pathPicked[page.name]" :items="[page.to, '/construction']" value-key="id" class="w-full" label="Path" arrow @update:modelValue="updateService(page.name, pathPicked[page.name])"/>
                </UFormField>
                <UButton class="bg-blue-500 text-white px-2 py-1 rounded" @click="updatePageAccess(page)" label="Edit" />
              </div>
            </template>
            
            <template #footer v-if="item.label === 'User Management'">
              <UButton icon="i-heroicons-plus-circle" color="primary" variant="solid" label="Add" @click="isOpenUser = true"/>
              <UButton icon="i-heroicons-plus-circle" color="primary" variant="solid" label="Remove" @click="handleDeleteUsers(selectedUsers)"/>
            </template>
          </UCard>
        </template>
      </UTabs>

    </UCard>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabsItem } from '@nuxt/ui'

interface userType {
  title: string,
  phone: string,
  email: string | undefined,
  role: string | undefined,
  user_id: string,
  created_at: string,
}

interface stateType {
  address?: string | undefined,
  start_date?: Date | string | undefined,
  start_time?: string | undefined,
  end_date?: Date | string | undefined,
  end_time?: string | undefined,
  service?: number | undefined,
  notes?: string | undefined,
  zip?: string | undefined,
}

interface pageItem {
    name: string,
    to: string,
    allowed: boolean,
}

interface pathType {
  [key: string]: string
}

const tabItems = ref<TabsItem[]>([
  {
    label: 'User Management',
    icon: 'i-lucide-user',
  },
  {
    label: 'Page Access',
    icon: 'i-lucide-library',
  }
])

const onError = useNuxtApp().$onError
const users = ref<userType[]>([])
const selectedUser = ref<userType | null>(null)
const selectedUsers = ref<string[]>([])
const appointments = ref<stateType[]>([])

const isOpenUser = ref(false)
const isOpenEvents = ref(false)

const pages = reactive([{ name: 'Home', to: '/index', allowed: true }, 
{ name: 'Services', to: '/services', allowed: true }, 
{ name: 'Schedule Service', to: '/booking', allowed: true }, 
{ name: 'Contact Us', to: '/contact', allowed: true }, 
{ name: 'About Us', to: '/about', allowed: true }])

const pathPicked: pathType = reactive({
  'Home': '/index',
  'Services': '/services', 
  'Schedule Service': '/booking',
  'Contact Us': '/contact',
  'About Us': '/about'
})

const { getPageAccess,
        updatePageAccess,
        fetchUsers,
        deleteUsers,
        fetchAppointments,
        pending } = useFetchQueries()

const updateSelectedUsers = async (event: boolean, id: string) => {
  if (event) selectedUsers.value.push(id)
  else selectedUsers.value = selectedUsers.value.filter(item => item !== id)
}

const handleLoadUsers = async () => {
  try {
    const { data, error, isPending } = await fetchUsers(pending)
    pending.value = isPending.value
    if (error) {
      onError(500, error)
      return
    }
    users.value = data || []
  } catch (error) {
    onError(500, error)
  }
}

const handleDeleteUsers = async (ids: string | string[]) => {
  try {
    const user_ids = !Array.isArray(ids) ? [ids] : ids
    const { error, isPending } = await deleteUsers(pending, user_ids)
    pending.value = isPending.value
    if (error) {
      onError(500, error)
      return
    } else {
      users.value = users.value.filter(user => !(user.user_id in user_ids))
    }
  } catch (error) {
    onError(500, error)
  } 
}

onMounted(async () => {
  await handleLoadUsers()
  
  getPageAccess().then(({data, error}) => {
    if(error) {
      onError(500, error)
      return
    }
    if(data) {
      data.forEach((pageItem: pageItem) => {
      const item = pages.find((page) => {
        page.name === pageItem.name
      })
      item!.to = pageItem.to
      item!.allowed = pageItem.allowed
      })
    }
  }).catch(error => { 
    onError(500, error)
  })
})  

const handleUpdateUser = async (user: userType) => {
  selectedUser.value = user
  isOpenUser.value = true
}

const loadUserEvents = async (user: userType) => {
  const {data, isPending, error, status} = await fetchAppointments(pending, 0, user.user_id, true)
  pending.value = isPending.value
  if(error){
    onError(status, error)
    return
  }
  selectedUser.value = user
  appointments.value = data
  isOpenEvents.value = true
}

watch(isOpenUser, (val) => {
  if (!val) selectedUser.value = null
})

const updateService = (pageName: string, path: string) => {
  const item = pages.find(page => page.name = pageName)
  item!.to = path
}

// const sendEmail = async () => {
//   try {
//     await $fetch('/api/send-email', {
//       method: 'POST',
//       body: emailData.value,
//     });
//   } catch (e) {
//     error.value = e;
//     onError( 500, error.value)
//   }
//   emailData.value = { to: '', subject: '', body: '' };
// };

definePageMeta({
  layout: "default"
})
</script>

<style scoped>
#calendar {
  width: 80%;
  margin: 20px auto;
}
</style>