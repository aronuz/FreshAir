<template>
  <div class="grid grid-cols-12 grid-rows-1 gap-2 w-fit lg:w-full" :class="{'md:flex md:justify-center': guestUser}">
    <div v-if="user || guestUser" class="col-span-12 h-full lg:flex" :class="{ 'lg:col-span-12 lg:justify-center': guestUser, 'lg:col-span-3 lg:justify-end': !guestUser }">
      <UCard v-if="!isOpen" class="lg:fixed bg-linear-to-b from-sky-100 to-sky-300 h-fit">
        <ClientOnly>
          <USwitch
            v-if="!guestUser"
            unchecked-icon="i-lucide-x"
            checked-icon="i-lucide-check"
            v-model="isCalendar"
            :label="isCalendar ? 'Calendar' : 'List'"
            :disabled="!isMD"
            class="flex justify-end mb-4" 
            :ui="{ root: 'items-center', label: 'md:lg:text-xl lg:text-2xl align-top' }"
          />
          <div v-if="!loadingList">
            <UButton class="flex flex-wrap flex-row justify-between text-4xl md:text-lg p-3" block :icon="`i-heroicons${addIcon}`" size="xl" color="secondary" variant="solid" :label="addLabel" :ui="{leadingIcon: 'size-10'}" @click="setValues"/>
            <UButton v-if="selectedAppointment" class="flex flex-row justify-between text-4xl md:text-lg mt-4 p-3 pr-11" block icon="i-heroicons-x-circle" size="xl" color="error" variant="solid" label="Remove" :ui="{leadingIcon: 'size-10'}" @click="handleRemove"/>
          </div>
        </ClientOnly>
        <USkeleton v-if="user && loadingList" class="mx-auto mt-8 h-8 w-[5vw] bg-gray-600" as="div"/>
      </UCard>
    </div>
    <FormModal v-model="isOpen" :selected-date="selectedDate" :existing-records="existingRecords" :service="service" @saved="reload"/>
    <ClientOnly>
      <UCard v-if="user && showCalendar" class="lg:col-span-9 bg-linear-to-b from-sky-100 to-sky-400" :class="{ hidden: !isCalendar, 'col-span-12': isCalendar }">
        <FullCalendar v-show="isReady" :data-set="eventsParsed" @calendar-ready="isReady=true" @dataChanged="updateStoreName" @date-clicked="createEvent" @select="selectAppointment" @deselect="deselectAppointment"/> 
      </UCard>
      <template v-else-if="user" class="col-span-12 lg:col-span-9">
        <ListView :groupped-events="grouppedEvents" />
      </template>
    </ClientOnly>
    <UCard v-if="user && loadingList" class="w-[50vw] bg-linear-to-b from-sky-100 to-sky-400">
      <USkeleton v-for="i in 3" class="mx-auto my-4 h-8 w-5/6 bg-gray-600" as="div"/>
    </UCard>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

import dayjs from 'dayjs'

import { storeToRefs } from 'pinia'
import { getDynamicStore } from '~/stores/events'


const props = defineProps({
  service: String | undefined
})

const defaultDate = dayjs(new Date()).format('MMMM')
let storeId = { range: defaultDate, type: 'month', user_id: null }
let eventsStore = getDynamicStore(storeId)

const { toastBar } = useToastBar()
const user = useSupabaseUser()
const guestUser = useGuestUser()
const onError = useNuxtApp().$onError
const isCalendar = ref(true)
const pending = ref(false)
const isOpen = ref(false)
const isReady = ref(false)
const addIcon = ref('squares-plus')
const addLabel = ref('Book Now')
const appointments = ref(null)
const events = []
const existingRecords = ref([])
const selectedAppointment = useState('selectedAppointment', () => null)
const updatedAppointment =  useState('updatedAppointment', () => null)
const selectedDate = ref(null)

watchEffect(() => {
  isOpen.value = !!props.service
})

const updateStoreName = ({ date, type }) => {
  const range = date ?? defaultDate
  let viewType = 'month'
  if (type && type.includes('Grid')) {
    const regex = /(Grid|List)(\w*)$/
    const match = type.match(regex)
    viewType = match[2].toLowerCase()
  }
  storeId = { range, type: viewType, user_id: null }
}
watchEffect(() => {
  eventsStore = getDynamicStore(storeId)
})
const { events: storedEvents, loading, error } = storeToRefs(eventsStore)
// const { fetchAppointments,
//         updateAppointment,
//         deleteAppointment,
//       } = useFetchQueries()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMD = breakpoints?.greaterOrEqual('md')
console.log('isMD', isMD.value)

watch(() => isMD.value, (value) => isCalendar.value = value, {immediate: true})

const showCalendar = computed(() => {
  console.log('ic: ', isCalendar.value, 'bp: ', breakpoints.greaterOrEqual('md').value)
  return isCalendar.value && isMD.value
})

const loadingList = computed(() => {
  return (!showCalendar && !grouppedEvents) || (showCalendar && !isReady)
})

watch(() => isOpen.value, (value) => {
  if(!value) selectedDate.value = null
})

watch(() => selectedAppointment.value, (value) => {
  addIcon.value = value ? '-pencil-square': '-squares-plus'
  addLabel.value = value ? 'Make a change' : 'Book Now'
}, {immediate: true})  

const reload = async () => {
  if(guestUser.value) return
  try {
    pending.value = true
    const {data, timesData, error, status, isPending} = await eventsStore.fetchEvents({ pending: pending.value })
    // await fetchAppointments(pending)

    pending.value = isPending.value
    if(error){
      onError(status, error)
      return
    } else if (data){
      const mergedData = data.map((item) => {
        const { users, ...rest } = item
        return { ...rest, ...users, id: rest.id, created_at: rest.created_at }
      })

      appointments.value = mergedData

      existingRecords.value = timesData
      events.splice(0, events.length, ...mergedData);
    }
  } catch (error) {
    onError(500, error instanceof Error ? error.message : 'Failed to fetch events')
    return
  }
}

const eventsParsed = computed(() => {
  const list = appointments.value
  if(!showCalendar.value || !list) return []
  const eventsObject = list.map(item => {
    const { id, title, start_date: start, end_date: end } = item

    const startTime = `${item.start_date}T${item.start_time}`
    
    let endTime = null
    if(item.end_date) {
      const timeString = item.end_time ? `T${item.end_time}` : ''
      endTime = `${item.end_date}${timeString}`
    }

    const event = { id, title, start: startTime, end: endTime }

    return event
    }
  )
  return eventsObject
})

const grouppedEvents = computed( () => {
    const list = appointments.value
    if (showCalendar.value || !list) return null
    let group = {}
    for (const entry of list){
        const date = entry.start_date
        if(!group[date]){
            group[date] = []
        }
        group[date].push(entry)
    }
    return group
})

const currentPage = ref(1);
const itemsPerPage = ref(20)
const total = computed(() => grouppedEvents ? Object.keys(grouppedEvents).length : 0)

const pageEvents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  console.log('grouppedEvents', grouppedEvents)
  const eventArray = grouppedEvents.value ? Object.entries(grouppedEvents.value).map(([key, val]) => {
    return { [key]: val };
  }) : [];
  return eventArray.slice(start, end);
});

reload()

const createEvent = (event) => {
  if(event){
    selectedDate.value = event
    isOpen.value = true
  } else {
    onError('400', 'Please select a future date for your appointment.')
  }
}

const selectAppointment = (id) => {
  try {
    events.forEach(e => {
      if(e.id == id) {
        selectedAppointment.value = {...e}
        throw new Error()
      }
    })
  } catch (e){
  }
}

const deselectAppointment = () => {
  selectedAppointment.value = null
  updatedAppointment.value = null
}
const setSelectedClass = (event, id) => {
  const el = event.target
  el.classList.add('selected-slot')
  el.setAttribute('data-event-id', id);
  selectAppointment(id)
}

const updateEventEl = (event, id) => {
    if(selectedAppointment.value){
      const selectedEl = document.querySelectorAll(`.selected-slot`)[0];
      if (selectedEl) selectedEl.classList.remove('selected-slot')
    
      if (selectedAppointment.value.id === id) deselectAppointment()
      else setSelectedClass(event, id)
    } else setSelectedClass(event, id)
  }


const setValues = () => {  
  if(selectedAppointment.value) updatedAppointment.value = {...selectedAppointment.value}
  isOpen.value = true
}

const handleRemove = async () => {
  pending.value = true
  const id = selectedAppointment.value.id
  const { error, status, isPending } = await eventsStore.deleteEvent(id, pending)
  //await deleteAppointment(id, pending)
  pending.value = isPending.value
  if (error) {
    onError(status, error)
    return
  }
  const selectedEl = document.querySelector(`.fc-event[data-event-id="${id}"]`);
  if (selectedEl) selectedEl.remove()
  toastBar('success', `Service appointment removed`)
}

useHead({
  title: 'Book HVAC Service - HVAC Fresh Air',
  meta: [
    {name: 'description', content: 'Schedule your HVAC service appointment today.'}
  ]
})
</script>

<style scoped>
:deep() {
  .iconify{
    font-size: 2em;
  }
  .selected-slot {
      background-color: #418899;
      color: #FFF;
  }
}
</style>