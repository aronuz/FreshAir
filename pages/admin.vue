<template>
  <div>
    <h1>Admin Panel</h1>
    <div id="calendar"></div>
    <form @submit.prevent="sendEmail">
      <input type="email" v-model="emailData.to" placeholder="To" />
      <input type="text" v-model="emailData.subject" placeholder="Subject" />
      <textarea v-model="emailData.body" placeholder="Body"></textarea>
      <button type="submit">Send Email</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';

const appointments = ref([]);
const emailData = ref({ to: '', subject: '', body: '' });

const error = ref(null);

const fetchAppointments = async () => {
  const { data, error, status  } = await useFetch('/api/appointments');
  if (error.value) {
    onError(status.value, error.value)
  } else if (data.value) {
    appointments.value = data.value.map(appt => ({
      title: appt.name,
      start: appt.dateTime,
    }));
    initCalendar();
  }
};

const initCalendar = () => {
  new FullCalendar(document.getElementById('calendar'), {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    events: appointments.value,
  }).render();
};

const sendEmail = async () => {
  try {
    await $fetch('/api/send-email', {
      method: 'POST',
      body: emailData.value,
    });
  } catch (e) {
    error.value = e;
    onError( '500', error.value)
  }
  emailData.value = { to: '', subject: '', body: '' };
};

onMounted(() => {
  fetchAppointments();
});
</script>

<style scoped>
#calendar {
  width: 80%;
  margin: 20px auto;
}
</style>