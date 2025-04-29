<template>
  <FullCalendar :options="calendarOptions" />
</template>

<script lang="ts" setup>
  import FullCalendar from '@fullcalendar/vue3'
  import dayGridPlugin from '@fullcalendar/daygrid'
  import interactionPlugin from '@fullcalendar/interaction'
  import timegrid from '@fullcalendar/timegrid'
  import list from '@fullcalendar/list'

  const props = defineProps({
    selectedId: {type: Number, required: false},
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
                  return false
                }
              } else if (key === 'start' || key === 'end') {
              const itemValue = item[key];
                const parsedDate = Date.parse(itemValue)
                return !isNaN(parsedDate); 
              } else {
                if (typeof itemValue !== 'string') {
                  console.error(`Property "${key}" in item at index ${index} of prop "items" must be a string.`);
                  return false
                }
              }
            }
          }
          return true;
        })
      }
    }
  })

  const emit = defineEmits(['select', 'deselect'])
  
  const events = ref([])
  watch(() => props.dataSet, (dataSet) => {
    events.value.splice(0)
    dataSet.forEach(event => events.value.push({...event}))
  }, { deep: true, immediate: true }
  )
  
  const handleDateClick = (arg: { dateStr: string }) => {
    alert('date click! ' + arg.dateStr)
  }

  const handleEventClick = (arg: { el: any; event: any }) => {
    console.log(props.selectedId)
    if (arg.event.id == props.selectedId){
      console.log(arg.el.classList)
      arg.el.classList.remove('selected-slot')
      emit('deselect', arg.event.id)
      console.log(arg.el)
    }
    document.querySelectorAll('.selected-slot').forEach(e => e.classList.remove('selected-slot'))
    arg.el.classList.add('selected-slot')
    emit('select', arg.event.id)
  }

  const calendarOptions = {
        plugins: [ dayGridPlugin, interactionPlugin, timegrid, list ],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        height: "auto",
        initialView: 'dayGridMonth',
        dateClick: handleDateClick,
        eventClick: handleEventClick,
        views: {
          dayGrid: {
            // options apply to dayGridMonth, dayGridWeek, and dayGridDay views
            titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' }
          },
          timeGrid: {
            // options apply to timeGridWeek and timeGridDay views
          },
        },
        events: events.value
  }
</script>

<style>
.selected-slot{
    background-color: #418899;
    color: #FFF;
}
</style>