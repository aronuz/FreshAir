<template>
  <div>
    <h1>Book your HVAC Service</h1>
    <AppointmentCalendar/>
  </div>
</template>

<script lang="ts" setup>
import AppointmentCalendar from '../components/AppointmentCalendar.vue'

// definePageMeta({
//   middleware: 'errorMiddleware'
// });

useHead({
  title: 'Book HVAC Service - HVAC Fresh Air',
  meta: [
    {name: 'description', content: 'Schedule your HVAC service appointment today.'}
  ]
})
</script>