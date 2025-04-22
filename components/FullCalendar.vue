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

  // const eventParsed = computed(() => props.dataSet ? props.dataSet.map(({id, start_date, start_time, end_date, end_time, name}) => {
  //   id, startDate: start_date, startTime: start_time, endDate: end_date, endTime: end_time, title: name
  // }) : [])

  //   const eventsParsed = computed(() =>
  //   props.dataSet
  //     ? props.dataSet.map((event: { id: string, start_date: string, start_time: string, end_date: string, end_time: string, name: string }) => ({
  //         id: event.id,
  //         startDate: event.start_date,
  //         startTime: event.start_time,
  //         endDate: event.end_date,
  //         endTime: event.end_time,
  //         title: event.name
  //       }))
  //     : []
  // );

  const eventsParsed = computed(() =>
    props.dataSet ? props.dataSet : []
  );

  const handleDateClick = (arg: { dateStr: string }) => {
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
        events: eventsParsed.value
  }
</script>

<style>

</style>