<template>
  <div>    
    <FullCalendar :data-set="eventsParsed" />
    <FormModal v-model="isOpen" @saved="reload"/>
    <UButton v-if="!isOpen" icon="i-heroicons-plus-circle" color="#FFF" variant="solid" label="Add" @click="isOpen = true"/>

    <section v-if="!pending && appointments.length">
        <h2>Existing Appointments</h2>
      <div v-for="appt in appointments" :key="appt.id">
        <p>{{ appt.name }} - {{ appt.dateTime }}</p>
        <button @click="selectAppointment(appt)">Edit</button>
      </div>
      <button v-if="selectedAppointment" @click="updateAppointment">Update Appointment</button>
      <button v-if="selectedAppointment" @click="deleteAppointment">Delete Appointment</button>
    </section>
    <section v-if="pending">
      <USkeleton class="h=4 w-full mb-2" />
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const { toastBar } = useToastBar()
const pending = ref(false)
const isOpen = ref(false)
const appointments = ref(null)
const events = []
let eventsParsed = ref([])
const selectedAppointment = useState('selectedAppointment', () => null)

const { fetchAppointments,
        updateAppointment,
        deleteAppointment,
      } = useFetchQueries()

const onError = (status, message = 'An unknown error has occured.') => {
  toastBar('Error', `Error ${status}`, message)
  throw createError({ statusCode: status, message: message});
}

const reload = async () => {
  const {data, isPending, error} = await fetchAppointments(onError, pending)
  pending.value = isPending.value
  appointments.value = data
  console.log('appointments')
  console.log(appointments.value)
  events.splice(0)
  eventsParsed.splice(0)
  if(appointments.value) {
    for (const key in appointments.value) {
      if (Object.hasOwnProperty.call(appointments.value, key)) {
        events.push(appointments.value[key]);
      }
    }
    // console.log(events)
    const eventsObject = events.map(item => {
      const { id, title, start_date: start, end_date: end } = item

      const startTime = `${item.start_date}T${item.start_time}`
      const endTime = `${item.end_date}T${item.end_time}`

      const event = { id, title, start: startTime, end: endTime }

      return event
      }
    )
    for(const event of eventsObject){
      eventsParsed.value.push(event)
    }
    console.log('---------')
    console.log(eventsParsed.value)
  }
}

reload()

const selectAppointment = (appt) => {
  selectedAppointment.value = appt
}

useHead({
  title: 'Book HVAC Service - HVAC Fresh Air',
  meta: [
    {name: 'description', content: 'Schedule your HVAC service appointment today.'}
  ]
})
</script>