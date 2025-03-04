<template>
  <div>
    <form @submit.prevent="submitAppointment">
      <input type="text" v-model="appointment.name" placeholder="Name" />
      <input type="email" v-model="appointment.email" placeholder="Email" />
      <input type="datetime-local" v-model="appointment.dateTime" />
      <textarea v-model="appointment.notes" placeholder="Notes"></textarea>
      <button type="submit">Submit</button>
    </form>

    <div v-if="appointments.length">
        <h2>Existing Appointments</h2>
      <div v-for="appt in appointments" :key="appt.id">
        <p>{{ appt.name }} - {{ appt.dateTime }}</p>
        <button @click="selectAppointment(appt)">Edit</button>
      </div>
      <button v-if="selectedAppointment" @click="updateAppointment">Update Appointment</button>
      <button v-if="selectedAppointment" @click="deleteAppointment">Delete Appointment</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, useState } from 'vue';

const appointments = ref([]);
const appointment = ref({ name: '', email: '', dateTime: '', notes: '' });
const selectedAppointment = ref(null);

const error = ref(null);

const fetchAppointments = async () => {
  const { data, error, status } = await useFetch('/api/appointments');
  if (error.value) {
    onError(status.value, error.value)
  } else if (data.value) {
    appointments.value = data.value;
  }
};

const submitAppointment = async () => {
  if (selectedAppointment.value) {
    await updateAppointment();
    return;
  }
  try {
    await $fetch('/api/appointments', {
      method: 'POST',
      body: appointment.value,
    });
  } catch (e) {
    error.value = e;
    onError( '500', error.value)
  }
  await fetchAppointments();
  appointment.value = { name: '', email: '', dateTime: '', notes: '' };
};

const updateAppointment = async () => {
    if (!selectedAppointment.value) return;

    await $fetch(`/api/appointments/${selectedAppointment.value.id}`, {
        method: 'PUT',
        body: appointment.value,
    });
    await fetchAppointments();
    appointment.value = { name: '', email: '', dateTime: '', notes: '' };
    selectedAppointment.value = null;
};

const deleteAppointment = async () => {
  if (!selectedAppointment.value) return;
  try {
    await $fetch(`/api/appointments/${selectedAppointment.value.id}`, {
      method: 'DELETE',
    });  
  } catch (e) {
    error.value = e;
    onError( '500', error.value)
  }
  await fetchAppointments();
  appointment.value = { name: '', email: '', dateTime: '', notes: '' };
  selectedAppointment.value = null;
};

const selectAppointment = (appt) => {
  selectedAppointment.value = appt;
  appointment.value = { ...appt };
};

const onError = (status, message) => {throw createError({ statusCode: status || 500, message: message || 'An unknown error has occured.'});}

onMounted(fetchAppointments);
</script>