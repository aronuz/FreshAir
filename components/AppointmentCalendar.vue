<template>
  <div class="grid grid-cols-12 grid-rows-1 gap-2">
    <UCard class="col-span-12 md:col-span-1">
        <UButton v-if="!isOpen" icon="i-heroicons-plus-circle" color="#FFF" variant="solid" :label="addLabel" @click="setValues; isOpen = true"/>
        <UButton v-if="!isOpen && selectedAppointment" icon="i-heroicons-x-circle" color="#FFF" variant="solid" label="Remove" @click="handleRemove"/>
        <FormModal v-model="isOpen" @saved="reload"/>
    </UCard>
        
    <UCard class="col-span-12 md:col-span-9">      
      <FullCalendar :data-set="eventsParsed" @event="selectAppointment"/>
    </UCard>

    <UCard class="col-span-12 md:col-span-2">
      <section v-if="eventsParsed.length">
        <h2>Existing Appointments</h2>
      <div v-for="event in events" :key="event.id">
        <p>{{ event.title }} @ {{ event.start_date }}</p>
        <button @click="selectAppointment(event.id)">Edit</button>
      </div>
      <button v-if="selectedAppointment" @click="updateAppointment">Update Appointment</button>
      <button v-if="selectedAppointment" @click="deleteAppointment">Delete Appointment</button>
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
const addLabel = ref('Schedule Service')
const appointments = ref(null)
const events = []
let eventsParsed = ref([])
const selectedAppointment = useState('selectedAppointment', () => null)
const updatedAppointment =  useState('updatedAppointment', () => null)

const { fetchAppointments,
        updateAppointment,
        deleteAppointment,
      } = useFetchQueries()

watch(() => selectedAppointment, (value) => {value ? addLabel.value = 'Reschedule Service' : 'Schedule Service'})      
const onError = (status, message = 'An unknown error has occured.') => {
  toastBar('Error', `Error ${status}`, message)
  throw createError({ statusCode: status, message: message});
}

const reload = async () => {
  const {data, isPending, error, status} = await fetchAppointments(pending)
  isOpen.value = false
  pending.value = isPending.value
  if(error){
    onError(status, error)
    return
  }
  appointments.value = data
  events.splice(0)
  eventsParsed.value.splice(0)
  if(appointments.value) {
    for (const key in appointments.value) {
      if (Object.hasOwnProperty.call(appointments.value, key)) {
        events.push(appointments.value[key]);
      }
    }
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
    eventsObject.forEach(event => eventsParsed.value.push({...event}))
  }
}

reload()

const selectAppointment = (id) => {
  selectedAppointment.value = events.find(item => item && item.id === id);
}

const setValues = () => {  
  if(selectedAppointment.value) updatedAppointment.value = selectedAppointment.value
}

const handleRemove = () => {
  deleteAppointment(selectedAppointment.value.id)
}

useHead({
  title: 'Book HVAC Service - HVAC Fresh Air',
  meta: [
    {name: 'description', content: 'Schedule your HVAC service appointment today.'}
  ]
})
</script>