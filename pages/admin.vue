<template>
    <UContainer class="my-8">
      <FormModal v-model="isOpenUser" :selected-user="selectedUser" @saved="updateSelectedUser"/>
      <EventsModal v-if="selectedUser && isOpenEvents" v-model="isOpenEvents" :groupped-events="appointments" :user="selectedUser.title"/>
        
      <ClientOnly>
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
                    <template v-if="isMD">
                      <UTable ref="userTable" v-model:column-visibility="visibility" v-model:pagination="pagination" :data="users" :columns="columns" :ui="{
                        wrapper: 'overflow-x-auto',
                        thead: 'hidden md:table-header-group',
                        tbody: 'block md:table-row-group'
                      }">
                        <template #appointments-cell="{ row }">
                          <UButton @click="loadUserEvents(row.original as userType)" label="See Appointments" />
                        </template>
                        <template #actions-cell="{ row }">
                          <template v-if="selectedUsers.has((row.original as userType).user_id)">
                            <UButton class="bg-blue-500 text-white px-2 py-1 rounded" @click="handleUpdateUser(row.original as userType)" label="Edit" />
                            <UButton class="bg-red-500 text-white px-2 py-1 rounded" @click="handleDeleteUsers((row.original as userType).user_id)" label="Remove" />
                          </template>
                        </template>
                      </UTable>                  
                      <div class="flex justify-center border-t border-default pt-4">
                        <UPagination
                          :default-page="(userTable?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                          :items-per-page="userTable?.tableApi?.getState().pagination.pageSize"
                          :total="userTable?.tableApi?.getFilteredRowModel().rows.length"
                          @update:page="(p: number) => userTable?.tableApi?.setPageIndex(p - 1)"
                        />
                      </div>
                    </template>                               
                    <template v-else>
                      <UCheckbox :default-value="allSelected" v-model="allSelected" @update:modelValue="updateSelectedUsers($event)" class="m-3" :label="selectAction"/>
                      <div v-for="user in pageUsers" :key="user.user_id" class="flex justify-between p-3 bg-gray-100 rounded">
                        <div class="grid grid-cols-5 grid-rows-1 gap-4">
                          <UCheckbox :default-value="selectedUsers.has(user.user_id)" @update:modelValue="updateSelectedUsers($event, user.user_id)" />
                          <div>{{ user.title }} - {{ user.phone }}<span v-if="user.email">/{{ user.email }}</span></div>
                          <div>Joined On: {{ dayjs(user.created_at).format('DD/MM/YY') }}</div>
                          <UButton class="ml-4" @click="loadUserEvents(user)" label="See Appointments" />
                          <div v-if="selectedUsers.has(user.user_id)" class="space-x-2">
                            <UButton class="bg-blue-500 text-white px-2 py-1 rounded" @click="handleUpdateUser(user)" label="Edit" />
                            <UButton class="bg-red-500 text-white px-2 py-1 rounded" @click="handleDeleteUsers(user.user_id)" label="Remove" />
                          </div>
                        </div>
                      </div>
                      <div class="flex justify-center mt-4">
                        <UPagination
                          v-model:page="currentPage"
                          :items-per-page="itemsPerPage"
                          show-edges
                          :total="total"
                        />
                      </div>
                    </template>
                  </div>
                </template>
                <template v-else-if="item.label === 'Page Access'">
                  <div class="grid grid-cols-2 md:grid-cols-4 font-semibold bg-gray-100 p-2 rounded">
                    <div>Page</div>
                    <div class="hidden md:block">Show/Hide</div>
                    <div class="hidden md:block">Path</div>
                  </div>
                  <div v-for="page in pages" :key="page.to" class="grid grid-cols-2 md:grid-cols-4 grid-rows-3 border-b p-3 bg-gray-100 hover:bg-gray-50 transition rounded">
                    <template v-if="isMD">
                      <div class="col-span-2 md:col-span-1">{{ page.name }}</div>
                      <UCheckbox class="flex-none my-auto" :class="{'col-span-2': !page.allowed}" v-model="page.allowed" :label="page.allowed ? 'Shown' : 'Hidden'"/>
                      <UFormField v-if="page.allowed" class="flex-auto">
                        <USelect v-model="pathPicked[page.name]" :items="[page.to, getOldPath(page)]" value-key="id" class="w-full" label="Path" arrow />
                      </UFormField>
                    </template>
                    <div v-else class="flex justify-start align-bottom">
                      <UCheckbox class="flex-none my-auto" v-model="page.allowed"/>
                      <UFormField v-if="page.allowed" class="flex-auto">
                        <USelect v-model="pathPicked[page.name]" :items="[page.to, getOldPath(page)]" value-key="id" class="w-full" label="Path" arrow />
                      </UFormField> 
                    </div>
                    <UButton class="col-span-2 md:col-span-1 justify-self-end flex items-center justify-center w-1/4 md:w-1/2 bg-blue-500 text-white rounded" @click="savePageInfo(page)" label="Save" />
                  </div> 
                </template>
                <template v-else>
                  <KeepAlive>
                    <Team v-if="showForm === false" admin :profile-updated="profileUpdated" @staff-selected="staff = $event; showForm = true" @delete-staff="deleteStaff" @update:profileUpdated="profileUpdated = false" @show-form="showForm = true"/>
                  </KeepAlive> 
                  <StaffForm v-show="showForm" :staff-selected="staff" @saved="profileUpdated = true" @form-cleared="staff = null" @hide-form="showForm = false"/>
                </template>
                
                <template #footer v-if="item.label === 'User Management'">
                  <UButton icon="i-heroicons-plus-circle" color="primary" variant="solid" label="Add" @click="isOpenUser = true"/>
                  <UButton v-if="selectedUsers.size" icon="i-heroicons-x-circle" color="error" variant="solid" label="Remove" @click="handleDeleteUsers(selectedUsers)"/>
                </template>
              </UCard>
            </template>
          </UTabs>

        </UCard>
      </ClientOnly>
    </UContainer>
</template>

<script lang="ts" setup>
import { h, ref, resolveComponent } from 'vue'
import type { TableColumn, TabsItem } from '@nuxt/ui'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

import { PAGES_CONFIG, ROUTE_CONFIG } from '~/config/routes'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '~/stores/users'
import { getDynamicStore } from '~/stores/events'
import dayjs from 'dayjs'

const UCheckbox = resolveComponent('UCheckbox')
const { toastBar } = useToastBar()
const breakpoints = useBreakpoints(breakpointsTailwind)
const isMD = breakpoints?.greaterOrEqual('md')

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

interface pages {
  name: string,
  to: string,
  allowed?: boolean,
  oldPath?: string | null
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
  },
  {
    label: 'Staff Profiles',
    icon: 'i-lucide-id-card-lanyard',
  }
])

// Hide ID Column
const visibility = ref({
  user_id: false
})

// Pagination for UTable
const userTable = useTemplateRef('userTable')
const pagination = ref({
  pageIndex: 0,
  pageSize: 20
})
// Pagination for mobile view
const currentPage = ref(1);
const itemsPerPage = ref(20)
const total = computed(() => users.value.length)
const pageUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;

  return users.value.slice(start, end);
});


const onError = useNuxtApp().$onError
const users = ref<userType[]>([])
const selectedUser = ref<userType | null | undefined>(null)
const selectedUsers = ref<Set<string>>(new Set())
const appointments = ref<stateType[]>([])

const isOpenUser = ref(false)
const isOpenEvents = ref(false)

const columns = ref<TableColumn<userType>[]>([
  {
    id: 'select',
    header: ({ table }) => {
      return h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>{
          table.toggleAllPageRowsSelected(!!value)
          updateSelectedUsers(value as boolean)
        },
        'aria-label': selectAction.value,
        label: selectAction.value
      })
    },
    cell: ({ row }) => {
      return h(UCheckbox, {
        modelValue: !!selectedUsers.value.has(row.getValue('user_id')) && row.toggleSelected(true)|| row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
          row.toggleSelected(!!value)
          const isSelected = typeof value === 'boolean' ? value : false
          updateSelectedUsers(isSelected, row.getValue('user_id'))
        },
        'aria-label': 'Select user'
      })
    }
  },
  { accessorKey: 'user_id', cell: ({ row }) => row.getValue('title') },
  {
    accessorKey: 'title',
    header: 'Name',
    cell: ({ row }) => row.getValue('title')
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => row.getValue('phone')
  }, 
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const email = row.getValue('email')??'No Email'
      return email
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Joined On',
    cell: ({ row }) => {
      return new Date(row.getValue('created_at')).toLocaleString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        // hour: '2-digit',
        // minute: '2-digit',
        // hour12: true
      })
    }
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => row.getValue('role')
  },
  {
    id: 'appointments'
  },
  {
    id: 'actions'
  }
])

const pageEntries = reactive<pages[]>(PAGES_CONFIG)

let pathPicked: pathType = reactive({})
const pages: pages[] = pageEntries.filter(page => page.to !== '/admin')
pages.forEach((page: pages) => {
  const name = page.name
  const path = ROUTE_CONFIG.find(item => item.name === name)?.path 
  const pickedpath = path ? `/${path}` : page.to 
  pathPicked[name] = pickedpath === '/index' ? '/' : pickedpath
})

// const pathPicked: pathType = reactive({
//   'Home': '/index',
//   'Services': '/gallery', 
//   'Schedule Service': '/booking',
//   'Contact Us': '/contact',
//   'About Us': '/about'
// })

const { getPageAccess,
        updatePageAccess,
        fetchAppointments,
        pending } = useFetchQueries()

const usersStore = useUsersStore()
const { fetchUsers, deleteUser, updateUser } = usersStore

const { usersByName, getUserById } = storeToRefs(usersStore)

const updateSelectedUser = (event: userType | null) => {
  selectedUser.value = null
  if (event) {
    users.value = users.value.map(user => {
      if (user.user_id === event.user_id) {
        return {...user, ...event}
      }
      return user
    })
  }
} 

const updateSelectedUsers = async (event: boolean, id: string | null = null) => {
  if(id){
    if (event) selectedUsers.value.add(id)
    else selectedUsers.value.delete(id) //selectedUsers.value.filter(item => item !== id)
  } else {
    if (event) {
      // Add all user IDs to selectedUsers
      const allUserIds = users.value.map(user => user.user_id)
      selectedUsers.value = new Set(allUserIds)
    } else {
      // Clear all selections
      selectedUsers.value.clear()
    }
  }
}

const handleLoadUsers = async () => {
  try {
    pending.value = true
    const { data, error, isPending } = await fetchUsers(pending.value)
    pending.value = isPending!.value
    if (error) {
      onError(500, error)
      return
    }
    users.value = data || []
  } catch (error) {
    console.log(error)
    onError(500, error)
    pending.value = false
  }
}

const handleDeleteUsers = async (ids: string | Set<string>) => {
  try {
    const user_ids = !(ids instanceof Set) ? [ids] : Array.from(ids)
    const { error, isPending } = await deleteUser(pending.value, user_ids)
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

const deleteStaff = async ({ id: staffId, image_url }: { id: number, image_url: string }) => {
  try {
    const { error } = await useFetchQueries().deleteStaffProfile(staffId, image_url)
    if (error) {
      onError(500, error)
      return
    }
    toastBar('success', 'Staff profile deleted successfully')
    profileUpdated.value = true
    if(staff.value) staff.value = null
    showForm.value = false
  } catch (error) {
    onError(500, error)
  }
}

const allSelected = computed(() => {
  return selectedUsers.value.size === users.value.length
})

const selectAction = computed(() => {
  return `${allSelected.value ? 'Deselect' : 'Select'} All`
})

onMounted(async () => {
  await handleLoadUsers()
  
  getPageAccess().then(({data, error}) => {
    if(error) {
      onError(500, error)
      return
    }
    if(data) {
      let pageItem: pages
      pages.forEach((pages: pages) => {
        const item: pages | undefined = data.find((page: pages) => page.name === pages.name)
        if (item){
          pageItem = item
          pathPicked[pageItem.name] = pageItem.to === 'index' ? '/' : pageItem.to
          pages.oldPath = pageItem.oldPath || null
          pages.allowed = pageItem ? pageItem.allowed : true
        }
      })
      console.log('Page access loaded:', pages)
    }
  }).catch(error => { 
    onError(500, error)
  })
})  

const handleUpdateUser = async (user: userType) => {
  const { error, status } = await updateUser(user)
  if(error){
    onError(status, error)
  }
  selectedUser.value = user
  isOpenUser.value = true
}

const loadUserEvents = async (user: userType) => {
  const storeId = { range: null, type: 'month', user_id: user.user_id }
  const eventsStore = getDynamicStore(storeId)
  const { data, isPending, error, status } = await eventsStore.fetchEvents({ pending, limit: 0, user_id: user.user_id, list: true })
  //await fetchAppointments(pending, 0, user.user_id, true)
  pending.value = isPending.value
  if(error){
    onError(status, error)
    return
  }
  selectedUser.value = user
  appointments.value = data ?? []
  isOpenEvents.value = true
}

watch(isOpenUser, (val) => {
  if (!val) selectedUser.value = null
})

const getOldPath = (page: pages | string) => {
  return typeof page === 'string' ? page : page.oldPath ?? '/construction'
}
// {pageName: page.name, path: pathPicked[page.name], allowed: !!page.allowed, oldPath: page.to}
const savePageInfo = async ({ name, to, allowed, oldPath }: pages) => {
  try {
    const savedPath = oldPath && pathPicked[name] === getOldPath(oldPath) ? null : to,
      newPath = pathPicked[name]
    const {error} = await updatePageAccess({ name, to: newPath, allowed, oldPath: savedPath })
    if (error) {
      onError(500, error.message)
      return
    }
    toastBar('success', 'Page access updated successfully')
  } catch (error) {
    onError(500, error)
  }
}

const staff = ref<any>(null)
const profileUpdated = ref(false)

const showForm = ref(false)
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
  layout: "default",
  pageTransition: false
})
</script>

<style scoped>
#calendar {
  width: 80%;
  margin: 20px auto;
}
</style>