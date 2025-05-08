<template>
  <div class="flex flex-col items-center">
    <h2 class="text-3xl font-bold text-gray-800 text-center mb-8">Book your HVAC Service</h2>
    <AppointmentCalendar/>
  </div>
</template>

<script lang="ts" setup>
import AppointmentCalendar from '../components/AppointmentCalendar.vue'

// definePageMeta({
//   middleware: 'errorMiddleware'
// });

definePageMeta({
  layout: "default"
})

useHead({
  title: 'Book HVAC Service - HVAC Fresh Air',
  meta: [
    {name: 'description', content: 'Schedule your HVAC service appointment today.'}
  ]
})
</script>