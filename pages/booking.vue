<template>
  <div class="flex flex-col items-center">
    <h2 class="text-3xl font-bold text-gray-800 text-center text-shadow-lg text-shadow-cyan-500 mb-8">Book your HVAC Service</h2>
    <AppointmentCalendar/>
  </div>
</template>

<script lang="ts" setup>
import AppointmentCalendar from '../components/AppointmentCalendar.vue'

const origin = useState('origin')
const supabase = useSupabaseClient()
const guestUser = useGuestUser()

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!guestUser.value && (!session || !session.user)) {
    const { history } = useRouter().options
    const stateBack = history.state.back as string
    const fromPage = stateBack === '/' ? 'index' : stateBack.slice(1)
    origin.value = `${fromPage}_booking`
    return navigateTo('/login')
  }
})

// definePageMeta({
//   middleware: 'errorMiddleware'
// });

definePageMeta({
  layout: "default",
  // middleware: ['auth']
})

useHead({
  title: 'Schedule & Update HVAC Appointments | Freash Air',
  meta: [
    {
      name: 'description',
      content: 'Easily schedule, view, and update your HVAC service appointments online. Book installation, maintenance, or emergency repairs with our experienced team.'
    },
    {
      property: 'og:title',
      content: 'Schedule & Update HVAC Appointments | Freash Air'
    },
    {
      property: 'og:description',
      content: 'Book an HVAC service appointment hassle-free! Choose a time that works for you and get professional heating, cooling, and ventilation solutions.'
    },
    {
      property: 'og:image',
      content: '/images/appointment-cover.jpg'
    },
    {
      name: 'robots',
      content: 'index, follow'
    },
    {
      name: 'telephone',
      content: '+1-234-567-8901'
    },
    {
      name: 'email',
      content: 'appointments@yourcompany.com'
    },
    {
      name: 'address',
      content: '123 Main Street, City, State, ZIP'
    },
    {
      name: 'keywords',
      content: 'HVAC appointment, schedule service, book HVAC repair, heating and cooling scheduling, emergency HVAC booking, maintenance appointments, HVAC service management'
    }
  ]
})
</script>