<template>
  <div>    
    <FullCalendar :data-set="appointments" />
    <FormModal v-model="isOpen" @saved="reload"/>
    <UButton v-if="!isOpen" icon="i-heroicons-plus-circle" color="#FFF" variant="solid" label="Add" @click="isOpen = true"/>

    <!-- <section v-if="!pending && appointments.length">
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
    </section> -->
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isOpen = ref(false)
const appointments = ref(null)

const selectedAppointment = useState('selectedAppointment', () => null)

const { fetchAppointments,
        updateAppointment,
        deleteAppointment,
        pending } = useFetchQueries()


const onError = (status, message = 'An unknown error has occured.') => {
  toastBar('Error', `Error ${status}`, message)
  throw createError({ statusCode: status, message: message});
}

const reload = async () => {
  const {data, pending, error} = await fetchAppointments(onError, pending)
  appointments.value = data
  console.log('appointments')
  console.log(appointments.value)
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