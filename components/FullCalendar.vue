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

  const eventParsed = computed(() => props.dataSet ? props.dataSet.map(({eventID, dateStart, dateEnd, name}) => {
    id: eventID, start: dateStart, end: dateEnd, title: name
  }) : [])
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
        views: {
          dayGrid: {
            // options apply to dayGridMonth, dayGridWeek, and dayGridDay views
            titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' }
          },
          timeGrid: {
            // options apply to timeGridWeek and timeGridDay views
          },
        },
        events: eventParsed.value
      }
</script>

<style>

</style>