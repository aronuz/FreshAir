<template>
  <div>
    <h1>Admin Panel</h1>
    <FullCalendar v-if="!!dataSet" :data-set="dataSet" />
    <!-- Add skeleton on v-else -->
    <FormModal v-model="isOpen" @saved="handleSave" />
    <UButton v-if="!isOpen" icon="i-heroicons-plus-circle" color="#FFF" variant="solid" label="Add" @click="isOpen = true"/>
    <form @submit.prevent="sendEmail">
      <input type="email" v-model="emailData.to" placeholder="To" />
      <input type="text" v-model="emailData.subject" placeholder="Subject" />
      <textarea v-model="emailData.body" placeholder="Body"></textarea>
      <button type="submit">Send Email</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const appointments = ref([]);
const emailData = ref({ to: '', subject: '', body: '' });

const error = ref(null);
const dataSet = ref(null)

const { fetchAppointments,
        updateAppointment,
        deleteAppointment,
        pending } = useFetchQueries()

const handleSave = async () => {
  dataSet = await fetchAppointments()
}

handleSave()

const sendEmail = async () => {
  try {
    await $fetch('/api/send-email', {
      method: 'POST',
      body: emailData.value,
    });
  } catch (e) {
    error.value = e;
    onError( 500, error.value)
  }
  emailData.value = { to: '', subject: '', body: '' };
};

definePageMeta({
  layout: "default"
})
</script>

<style scoped>
#calendar {
  width: 80%;
  margin: 20px auto;
}
</style>