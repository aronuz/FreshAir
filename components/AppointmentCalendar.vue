<template>
  <div>    
    <FullCalendar :data-set="dataSet" />
    <FormModal v-model="isOpen" @saved="handleSave"/>
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

const isOpen = ref(false)
const dataSet = ref(null)

const { fetchAppointments,
        updateAppointment,
        deleteAppointment,
        pending } = useFetchQueries()

const handleSave = async () => {
  dataSet = await fetchAppointments() ?? []
  console.log(dataSet)
}

handleSave()

const selectAppointment = (appt) => {
  selectedAppointment.value = appt;
  appointment.value = { ...appt };
};

useHead({
  title: 'Book HVAC Service - HVAC Fresh Air',
  meta: [
    {name: 'description', content: 'Schedule your HVAC service appointment today.'}
  ]
})
</script>