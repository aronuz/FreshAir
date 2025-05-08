<template>
  <div class="grid grid-cols-12 grid-rows-1 gap-2">
    <UCard class="col-span-12 md:col-span-3">
      <div v-if="eventsParsed.length">
        <UButton v-if="!isOpen" class="flex flex-row justify-between text-4xl md:text-3xl p-4" block :icon="`i-heroicons-${addIcon}`" size="2xl" color="secondary" variant="solid" :label="addLabel" @click="setValues">{{ addLabel }}</UButton>
        <UButton v-if="!isOpen && selectedAppointment" class="flex flex-row justify-between text-4xl md:text-3xl mt-4 p-4 pr-8" block icon="i-heroicons-x-circle" size="2xl" color="error" variant="solid" label="Remove" @click="handleRemove">Remove</UButton>
      </div>
      <div v-else>
        <USkeleton class="h=4 w-full mb-2" />
      </div>
    </UCard>
    <FormModal v-model="isOpen" :existing-records="existingRecords" @saved="reload"/>
      
    <UCard class="col-span-12 md:col-span-9 hidden md:flex">
      <ClientOnly>
        <FullCalendar v-show="isReady" :data-set="eventsParsed" @calendarReady="isReady = true" @select="selectAppointment" @deselect="deselectAppointment"/>
      </ClientOnly>
      <div v-if="!isReady">
        <USkeleton class="h=4 w-full mb-2" />
      </div>
    </UCard>

    <UCard class="col-span-12 md:hidden text-4xl w-100 mx-auto">
        <section v-if="eventsParsed.length">
          <div v-for="(group, key) in grouppedEvents" :key="key">
            <div>{{ key }}</div>
            <UCard v-for="event in group" :key="event.id" class="flex flex-col odd:bg-white even:bg-gray-100">
              <div @click="updateEventEl($event, event.id)">{{ event.title }}</div>
            </UCard>
          </div>
        </section>
        <section v-if="pending">
          <USkeleton class="h=4 w-full mb-2" />
        </section>
    </UCard>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const { toastBar } = useToastBar()
const pending = ref(false)
const isOpen = ref(false)
const isReady = ref(false)
const addIcon = ref('plus-circle')
const addLabel = ref('Schedule Service')
const appointments = ref(null)
const events = []
const existingRecords = ref([])
// let eventsParsed = ref([])
const selectedAppointment = useState('selectedAppointment', () => null)
const updatedAppointment =  useState('updatedAppointment', () => null)

const { fetchAppointments,
        updateAppointment,
        deleteAppointment,
      } = useFetchQueries()

watch(() => selectedAppointment.value, (value) => {
  addIcon.value = value ? 'pencil-square': 'plus-circle'
  addLabel.value = value ? 'Reschedule Service' : 'Schedule Service'
})  

const onError = (status, message = 'An unknown error has occured.') => {
  toastBar('error', `Error ${status}`, message)
  throw createError({ statusCode: status, message: message});
}

const reload = async () => {
  const {data, timesData, isPending, error, status} = await fetchAppointments(pending)
  pending.value = isPending.value
  if(error){
    onError(status, error)
    return
  }
  appointments.value = data
  existingRecords.value = timesData
  // events.splice(0)
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      events.push(data[key]);
    }
  }
  // eventsParsed.value.splice(0)
  // if(appointments.value) {
  //   setFullCalendar(appointments.value)
  //   setSideBar(appointments.value)
  // }
}

const eventsParsed = computed(() => {
  const events = appointments.value
  if(!events) return []
  const eventsObject = events.map(item => {
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
  // eventsObject.forEach(event => eventsParsed.value.push({...event}))
})

const grouppedEvents = computed( () => {
    let group = {}
    const events = appointments.value
    for (const entry of events){
        const date = entry.start_date
        if(!group[date]){
            group[date] = []
        }
        group[date].push(entry)
    }
    console.log(group)
    return group
})

reload()

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
  const id = selectedAppointment.value.id
  const { error, isPending } = await deleteAppointment(pending)
  if (error) onError(500, error)
  else {
    const selectedEl = document.querySelector(`.fc-event[data-event-id="${id}"]`);
    if (selectedEl) selectedEl.remove()
    toastBar('success', `Service appointment removed`)
  }
  pending.value = isPending.value
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
}
.selected-slot {
    background-color: #418899;
    color: #FFF;
}
</style>