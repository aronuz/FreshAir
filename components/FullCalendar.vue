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
      validator: (value: unknown): boolean => {
        if (!Array.isArray(value)) {
          console.error('Prop "items" must be an array.');
          return false;
        }

        return value.every((item, index) => {
          if (typeof item !== 'object' || item === null) {
            console.error(`Item at index ${index} in prop "items" must be an object.`);
            return false;
          }

          for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
              const itemValue = item[key];

              if (key === 'id') {
                if (typeof itemValue !== 'number' || !Number.isInteger(itemValue)) {
                  console.error(`Property "${key}" in item at index ${index} of prop "items" must be an integer number.`);
                  return false;
                }
              } else if (key === 'phone' || key === 'email') {
                if (itemValue !== null && typeof itemValue !== 'string') {
                  console.error(`Property "${key}" in item at index ${index} of prop "items" must be a string or null.`);
                  return false;
                }
              } else if (key === 'date' || key === 'time') {
                const date = key === 'date' ? itemValue : `2000-01-01 ${itemValue}`
                const parsedDate = Date.parse(date);
                return !isNaN(parsedDate); 
              } else {
                if (typeof itemValue !== 'string') {
                  console.error(`Property "${key}" in item at index ${index} of prop "items" must be a string.`);
                  return false;
                }
              }
            }
          }
          return true;
        })
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