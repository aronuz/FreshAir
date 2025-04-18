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
    dataSet: {
      type: Array,
      required: true,
      validator: (value: any) => {
        // Ensure the array contains only objects with specific structure
        return value.every((item: { date: string|number|Date } ) => 
          (typeof item === 'object' && 
          item.date && 
          !isNaN(new Date(item.date).getTime())) || 
          ['string', 'number'].includes(typeof item)
        )
      }
    }
  })

  const eventParsed = computed(() => props.dataSet ? props.dataSet.map(({id, start_date, start_time, end_date, end_time, name}) => {
    id, startDate: start_date, startTime: start_time, endDate: end_date, endTime: end_time, title: name
  }) : [])

  const eventParsed = computed(() =>
  props.dataSet
    ? props.dataSet.map(({ id, start_date, start_time, end_date, end_time, name }) => ({
        id,
        startDate: start_date,
        startTime: start_time,
        endDate: end_date,
        endTime: end_time,
        title: name
      }))
    : []
);

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