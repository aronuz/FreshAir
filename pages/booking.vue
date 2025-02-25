<template>
  <div>
    <h1>Book your HVAC Service</h1>
    <BookingCalendar/>
  </div>
</template>

<script lang="ts" setup>
import BookingCalendar from './BookingCalendar.vue';
useHead({
  title: 'Book HVAC Service - HVAC Fresh Air',
  meta: [
    {name: 'description', content: 'Schedule your HVAC service appointment today.'}
  ]
})
</script>