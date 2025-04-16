<template>
  <!-- <div id="calendar"></div> -->
  <FullCalendar :options="calendarOptions" />
</template>

<script lang="ts" setup>
  import FullCalendar from '@fullcalendar/vue3'
  import dayGridPlugin from '@fullcalendar/daygrid'
  import interactionPlugin from '@fullcalendar/interaction'
  import timegrid from '@fullcalendar/timegrid'
  import list from '@fullcalendar/list'

  const props = defineProps({
    dataSet: Array<Object>
  })

  // const initCalendar = () => {
  //   new FullCalendar(document.getElementById('calendar'), {
  //     plugins: [dayGridPlugin],
  //     initialView: 'dayGridMonth',
  //     events: props.dataSet,
  //   }).render();
  // }

  //   initCalendar();

  const handleDateClick = (arg: never) => {
      alert('date click! ' + arg.dateStr)
    }

  const calendarOptions = {
        plugins: [ dayGridPlugin, interactionPlugin, timegrid, list ],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        initialView: 'dayGridMonth',
        dateClick: handleDateClick,
        events: props.dataSet
      }
</script>

<style>

</style>