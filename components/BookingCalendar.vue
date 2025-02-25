<template>
    <div class="booking-calendar">
        <h2>Select a Date</h2>
        <VueDatePicker v-model="selectedDate"/>
        <!-- 
          <Calendar v-model="selectedDate" @click="handleDateClick" />
        -->
        <button @click="bookService" :disabled="!selectedDate">Book Now</button>
        <p v-if="confirmation">{{ confirmation }}</p>

        <form @submit.prevent="submitForm">
          <input type="text" v-model="name" placeholder="Your Name" required>
          <input type="email" v-model="email" placeholder="Your Email" required>
          {/* ... other form fields */}
          <button type="submit">Submit</button>
        </form>
    </div>
  </template>
  
  <script lang="ts" setup>
  import VueDatePicker from 'vue3-datepicker'
  import Calendar from 'primevue/calendar'; // Example: using PrimeVue calendar
  import {ref} from 'vue'

  const selectedDate: Date | null = ref(null)
  const confirmation = ref('')
  const name = ref('');
  const email = ref('');

  const bookService = () => {
    if (!!selectedDate?.value ) {
      console.log("Form submitted", name.value, email.value, selectedDate.value);
        confirmation.value = `Booking confirmed for ${(selectedDate.value as Date).toDateString()}!`
    }
  }

  // You'll likely need to integrate a booking system or API here.
  </script>