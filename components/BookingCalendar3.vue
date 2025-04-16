<template>
  <div>
    <!-- Maybe moved to own component -->
    <FormModal v-model="isOpen" @saved="fetchAppointments"/>
    <UModal v-model="isOpen">
      <UCard>
        <template #header>Add Appointment</template>
        <form @submit.prevent="submitAppointment">
          <input type="text" v-model="appointment.name" placeholder="Name" />
          <input type="email" v-model="appointment.email" placeholder="Email" />
          <input type="phone" v-model="appointment.phone" placeholder="Phone" />
          <input type="address" v-model="appointment.address" placeholder="Address" />
          <!-- split date and time -->
          <input type="datetime-local" v-model="appointment.dateTime" />
          <textarea v-model="appointment.notes" placeholder="Notes"></textarea>
          <button type="submit">Submit</button>
        </form>
        <!-- template #footer>Add Appointment</template -->
      </UCard>
    </UModal>
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
import { ref, onMounted, useState } from 'vue';

//const pending = ref(true)//ufq
const isOpen = ref(false)

const { fetchAppointments,
        submitAppointment,
        updateAppointment,
        deleteAppointment,
        pending } = useFetchQueries()

//const supabase = useSupabaseClient()//ufq
//const appointments = ref([]);//ufq
const grouped = ref({});
//const appointment = ref({ name: '', email: '', dateTime: '', notes: '' });//ufq
const selectedAppointment = ref(null);

// const error = ref(null);//ufq

// const fetchAppointments = async () => {
//   const { data, error, status } = await useFetch('/api/appointments');
//   if (error.value) {
//     onError(status.value, error.value)
//   } else if (data.value) {
//     appointments.value = data.value;
//   }
// };

const fetchAppointments = async () => {//ufq
  const { data, pending } = await useAsyncData('appointments', async () => {
    const {data, error} = await supabase.from(appointments).select().order('created_at', { ascending: true })
  
    if (error) {
      onError('500', error.value)
    } else if (data.value) {
      appointments.value = data.value;

      const groupByDate = computed(() => {
        let group = {}
        for (const entry of appointments.value){
          const date = new Date(entry.date)
          if(!group[date]){
            group[date]
          }
          group[date].push(entry)
        }
        return group
      })
    }
  })
};

await fetchAppointments()

const submitAppointment = async () => {//ufq
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

const updateAppointment = async () => {//ufq
    if (!selectedAppointment.value) return;

    await $fetch(`/api/appointments/${selectedAppointment.value.id}`, {
        method: 'PUT',
        body: appointment.value,
    });
    await fetchAppointments();
    appointment.value = { name: '', email: '', dateTime: '', notes: '' };
    selectedAppointment.value = null;
};

// const deleteAppointment = async () => {
//   if (!selectedAppointment.value) return;
//   try {
//     await $fetch(`/api/appointments/${selectedAppointment.value.id}`, {
//       method: 'DELETE',
//     });  
//   } catch (e) {
//     error.value = e;
//     onError( '500', error.value)
//   }
//   await fetchAppointments();
//   appointment.value = { name: '', email: '', dateTime: '', notes: '' };
//   selectedAppointment.value = null;
// };

const deleteAppointment = async () => {//ufq
  if (!selectedAppointment.value) return;
  pending.value = true
  try {
    await supabase.from('appointments').delete().eq('id', selectedAppointment.value.id)
    await fetchAppointments();
    appointment.value = { name: '', address: '', email: '', phone: '', date: '', time: '', notes: '' };
    selectedAppointment.value = null
    useToastBar('Success', 'Appointment removed')
  } catch (e) {
    error.value = e;
    useToast('Error', 'Unable to remove selected appoinment')
    onError( '500', error.value)
  } finally {    
    pending.value = false
  }
};

const selectAppointment = (appt) => {
  selectedAppointment.value = appt;
  appointment.value = { ...appt };
};

const onError = (status, message) => {throw createError({ statusCode: status, message: message || 'An unknown error has occured.'});}

// onMounted(fetchAppointments);
</script>