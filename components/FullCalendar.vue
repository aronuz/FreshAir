<template>
  <FullCalendar ref="FullCalendarGrid" :options="calendarOptions" />
</template>

<script lang="ts" setup>
  import FullCalendar from '@fullcalendar/vue3'
  import dayGridPlugin from '@fullcalendar/daygrid'
  import interactionPlugin from '@fullcalendar/interaction'
  import timegrid from '@fullcalendar/timegrid'
  import list from '@fullcalendar/list'

  import type { DatesSetArg, ViewApi, CalendarOptions } from '@fullcalendar/core'

  import dayjs from 'dayjs'

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

  const emit = defineEmits(['dataChanged', 'select', 'deselect', 'calendarReady', 'dateClicked'])
  
  const FullCalendarGrid = ref<typeof FullCalendar | null>(null)

  // Computed properties with calendar values
  const currentViewType = ref<string | null>(null)
  //   FullCalendarGrid.value ? FullCalendarGrid.value.getApi().view.type : 'dayGridMonth'
  // })
  const currentDate = ref<Date>(new Date())
  //   FullCalendarGrid.value ? FullCalendarGrid.value.getApi().getDate() : 'all'
  // })
  let viewType: string | null = currentViewType.value ? currentViewType.value : 'dayGridMonth'
  let range: string = currentDate.value ? dayjs(currentDate.value).format('MMMM') : 'all'

  // watch(currentViewType, (view) => {
  //   viewType = view ?? 'dayGridMonth'
  //   emit('viewChanged', viewType)
  // }, {immediate: true})

  // watch(currentDate, (Date) => {
  //   range = Date ? dayjs(Date).format('MMMM') : 'all'
  //   emit('dateChanged', range)
  // }, {immediate: true})

  const events = ref([])
  watch(() => props.dataSet, (dataSet) => {
    events.value.splice(0)
    dataSet.forEach(event => events.value.push({...event}))
  }, { deep: true, immediate: true }
  )
  
  let setId: number | null = null

  const handleDateClick = (arg: { date: Date, dateStr: string }) => {
    // alert('date click! ' + arg.dateStr)
    const dateClicked = dayjs(arg.date)
    const today = dayjs(new Date()).hour(0).minute(0).second(0)
    emit('dateClicked', dateClicked.diff(today) > 0 ? arg.dateStr : null)
  }

  const handleEventClick = (arg: { el: any; event: any }) => {
    const el = arg.el
    const id = arg.event.id
    if(setId){
      const selectedEl = document.querySelectorAll(`.selected-slot`)[0] //(`.fc-event[data-event-id="${setId}"]`);
      if (selectedEl) selectedEl.classList.remove('selected-slot')
    }
    if (setId === id){ 
      setId = null
      emit('deselect', id)
    } else {
      el.classList.add('selected-slot')
      el.setAttribute('data-event-id', id);
      setId = id
      emit('select', id)
    }
  }

  // Reactive state that mirrors calendar state
  const currentView = ref('')

  const calendarOptions: CalendarOptions = {
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
    events: events.value,
    // eventsSet: () => { emit('calendarReady') },
    // Update reactive state when calendar changes
    datesSet: (dateInfo: DatesSetArg) => {
      currentView.value = dateInfo.view.type
      currentDate.value = dateInfo.view.currentStart
    },    
    viewDidMount: (viewInfo: { view: ViewApi }) => {
      currentView.value = viewInfo.view.type
      nextTick(() =>  
        emit('calendarReady')
      )
    }
  }

  watch(currentView, (view) => {
    viewType = view ?? 'dayGridMonth'
    emit('dataChanged', viewType)
  }, {immediate: true})

  watch(currentDate, (Date) => {
    range = Date ? dayjs(Date).format('MMMM') : 'all'
    emit('dataChanged', range)
  }, {immediate: true})
</script>
