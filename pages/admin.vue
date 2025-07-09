<template>
  <ClientOnly>
    <FormModal v-model="isOpenUser" :selected-user="selectedUser" @saved="selectedUser=null; isOpenUser=false"/>
    <EventsModal v-if="selectedUser && isOpenEvents" v-model="isOpenEvents" :groupped-events="appointments" :user="selectedUser.title"/>
      
    <UCard>
      <template #header class="text-xl font-semibold">Admin Panel</template>
      <UCard>
        <template #header class="text-xl font-semibold">User Management</template>
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
        <template #footer>
          <UButton icon="i-heroicons-plus-circle" color="primary" variant="solid" label="Add" @click="isOpenUser = true"/>
          <UButton icon="i-heroicons-plus-circle" color="primary" variant="solid" label="Remove" @click="handleDeleteUsers(selectedUsers)"/>
        </template>
      </UCard>
      <UserModal v-model="isOpenPages" @saved="handlePageUpdate" />
      <UCard>
        <template #header class="text-xl font-semibold">Page Access</template>
        <div v-for="page in pages" :key="page.to" class="flex justify-between p-3 bg-gray-100 rounded">
          <span>{{ page.name }}</span>
          <UCheckbox v-model="page.allowed" :label="page.allowed ? 'Shown' : 'Hidden'"/>
          <UFormField v-if="page.allowed" label="Page path">
            <USelect v-model="pathPicked[page.name]" :items="[page.to, '/construction']" value-key="id" class="w-full" label="Path" arrow @update:modelValue="updateService(page)"/>
          </UFormField>
          <UButton class="bg-blue-500 text-white px-2 py-1 rounded" @click="updatePageAccess(page)" label="Edit" />
        </div>
      </UCard>
    </UCard>
  </ClientOnly>
</template>

<script setup>
import { ref } from 'vue'
import { array } from 'zod'

const onError = useNuxtApp().$onError
const users = ref([])
const selectedUser = ref(null)
const selectedUsers = ref([])
const appointments = ref(null)
const pages = reactive([{ name: 'Home', to: '/dashboard', allowed: true }, 
{ name: 'Services', to: '/services', allowed: true }, 
{ name: 'Schedule Service', to: '/booking', allowed: true }, 
{ name: 'Contact Us', to: '/contact', allowed: true }, 
{ name: 'About Us', to: '/about', allowed: true }])
const isOpenUser = ref(false)
const isOpenEvents = ref(false)

const error = ref(null)

const { getPageAccess,
        updatePageAccess,
        fetchUsers,
        deleteUsers,
        fetchAppointments,
        pending } = useFetchQueries()

const updateSelectedUsers = async (event, id) => {
  if (event) selectedUsers.value.push(id)
  else selectedUsers = selectedUsers.filter(item => item !== id)
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

const handleDeleteUsers = async (pending, ids) => {
  try {
    const user_ids = !typeof ids === array ? [ids] : ids
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
    data.forEach((pageItem) => {
     const item = pages.find((page) => {
      page.name === pageItem.name
     })
     item.to = pageItem.to
     item.allowed = pageItem.allowed
    })
  }).catch(error => { 
    onError(500, error)
  })
})  

const handleUpdateUser = async (user) => {
  selectedUser.value = user
  isOpenUser.value = true
}

const loadUserEvents = async (user) => {
  const {data, isPending, error, status} = await fetchAppointments(pending, null, user.user_id, true)
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

const updateService = (pageItem, path) => {
  const item = pages.find(page => page.name = pageItem.name)
  item.to = path
}

const pathPicked = reactive({
  'Home': null,
  'Services': null, 
  'Schedule Service': null,
  'Contact Us': null,
  'About Us': null
})

const sendEmail = async () => {
  try {
    await $fetch('/api/send-email', {
      method: 'POST',
      body: emailData.value,
    });
  } catch (e) {
    error.value = e;
    onError( 500, error.value)
  }
  emailData.value = { to: '', subject: '', body: '' };
};

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