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
            :label="showCalendar ? 'Calendar' : 'List'"
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
      <UCard v-if="user && showCalendar" class="lg:col-span-9 bg-linear-to-b from-sky-100 to-sky-400" :class="{ hidden: !showCalendar, 'col-span-12': showCalendar }">
        <AppointmentFilter :event-store-id="eventStoreID" @dateRangeChanged="setRangeDates"/>
        <FullCalendar :data-set="eventsParsed" @dataChanged="updateStoreName" @date-clicked="createEvent" @select="selectAppointment" @deselect="deselectAppointment"/> 
      </UCard>
      <div v-else-if="user" class="grid grid-cols-12 grid-rows-2 col-span-12 lg:col-span-9">
        <template v-if="isXS">
          <UButton class="w-fit" :label="!showRange ? 'Pick Date Range' : 'Hide Date Range Panel'" @click="showRange = !showRange"/>
          <Transition enter-active-class="transition-transform duration-200 ease-in-out"                      
                      enter-from-class="-translate-y-full"
                      enter-to-class="translate-y-0"
                      leave-active-class="transition-transform duration-200 ease-in-out"
                      leave-from-class="translate-y-0"
                      leave-to-class="-translate-y-full">       
            <div v-if="showRange" class="fixed top-0 left-0 shadow-lg z-[100] max-w-min">
              <AppointmentFilter :event-store-id="eventStoreID" @dateRangeChanged="setRangeDates"/>
            </div>
          </Transition>
        </template>  
        <AppointmentFilter v-else :event-store-id="eventStoreID" @dateRangeChanged="setRangeDates"/>
        <ListView event-list :groupped-events="grouppedEvents"  />
      </div>
    </ClientOnly>
    <UCard v-if="user && loadingList" class="w-[50vw] bg-linear-to-b from-sky-100 to-sky-400">
      <USkeleton v-for="i in 3" class="mx-auto my-4 h-8 w-5/6 bg-gray-600" as="div"/>
    </UCard>
  </div>
</template>

<script setup>
import { ref } from 'vue';

import dayjs from 'dayjs'

import { storeToRefs } from 'pinia'
import { getDynamicStore } from '~/stores/events'

const props = defineProps({
  service: String | undefined
})

const defaultDate = dayjs(new Date()).format('MMMM')
const eventStoreID = ref(null)
let storeId = reactive({ range: defaultDate, type: 'month', user_id: null })
eventStoreID.value = {...storeId}
let eventsStore = getDynamicStore(storeId)

const { toastBar } = useToastBar()
const user = useSupabaseUser()
const guestUser = useGuestUser()
const onError = useNuxtApp().$onError
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
const startDate = ref(null)
const endDate = ref(null)
const showRange = ref(false)

watchEffect(() => {
  isOpen.value = !!props.service
})

const setRangeDates = ({ start, end }) => {
  startDate.value = start
  endDate.value = end
  if(start || end) {
    const rangeString = `${start ?? ''}-${end ?? ''}`
    updateStoreName({ date: rangeString, type: 'month' })
  } else { 
    updateStoreName({ type: 'month' })
  }
  reload()
}

const updateStoreName = ({ date = null, type }) => {
  const range = date ?? defaultDate
  let viewType = 'month'
  if (type && type.includes('Grid')) {
    const regex = /(Grid|List)(\w*)$/
    const match = type.match(regex)
    viewType = match[2].toLowerCase()
  }
  Object.assign(storeId, { range, type: viewType, user_id: null })
  eventStoreID.value = storeId
  eventsStore = getDynamicStore(storeId)
}

// const { events: storedEvents, loading, error } = storeToRefs(eventsStore)
const { searchTerm, filteredEvents } = storeToRefs(eventsStore);

// const { fetchAppointments,
//         updateAppointment,
//         deleteAppointment,
//       } = useFetchQueries()

const screenSize = computed(() => useNuxtApp().$screenSize)

const isMD = computed(() => ['md', 'lg'].includes(screenSize.value))
const isXS = computed(() => screenSize == 'xs')

const showCalendar = ref(isMD.value)

const isCalendar = computed({
  get: () => {
    return showCalendar.value
  },
  set: (value) => {
    showCalendar.value = value
  }    
})

const loadingList = computed(() => {
  return (!isCalendar.value && !grouppedEvents) || (isCalendar && !isReady)
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
    const {data, timesData, error, status, isPending} = await eventsStore.fetchEvents({ pending: pending.value, startDate, endDate })
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
  } finally {
    nextTick(() => {
      isReady.value = true
      //console.log('calendar ready isReady')
    })
  }
}

const eventList = computed(() => {
  let list = appointments.value

  if (searchTerm.value) list = appointments.value.filter(app => filteredEvents.value.includes(app.id))

  return list
})

const eventsParsed = computed(() => {
  const list = eventList.value

  if(!isCalendar.value || !list) return []

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
    const list = eventList.value

    if (isCalendar.value || !list) return null

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
  //console.log('grouppedEvents', grouppedEvents)
  const eventArray = grouppedEvents.value ? Object.entries(grouppedEvents.value).map(([key, val]) => {
    return { [key]: val };
  }) : [];
  return eventArray.slice(start, end);
});

onMounted(() => {  
  reload()
})

onUnmounted(() => {
  searchTerm.value = ''
})

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

<style>
  /* .slide-enter-from,
  .slide-leave-to {
    transform: translateY(-100%);
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: transform 0.2s ease-in-out;
  }

  .slide-enter-to,
  .slide-leave-from {
    transform: translateX(0);
  }

  .slideout-panel {
    position: absolute;
    top: 0;
    left: 0; 
    width: 250px;  Adjust as needed 
    height: 100vh;
    background-color: #f0f0f0;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    z-index: 100;
  } */
</style>