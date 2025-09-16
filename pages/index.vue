<template>
    <section class="pb-12 text-center font-bold bg-gray-100 h-full w-1/2 mx-auto opacity-80 rounded-lg shadow-md">
        <h2 class="text-4xl text-gray-800 text-shadow-lg text-shadow-cyan-500 mt-6">Reliable HVAC Services You Can Trust</h2>
        <p class="text-lg text-gray-600 mt-4 max-w-xl mx-auto">
        We provide top-notch heating, ventilation, and air conditioning services for residential and commercial clients.
        Our experienced technicians are dedicated to ensuring your comfort all year round.
        </p>
        <div class="mt-8 space-x-4 font-bold">
        <UButton to="/contact" label="Request Service" color="info" size="lg" />
        <UButton to="/gallery" label="Our Services" variant="outline" color="info" size="lg" />
        </div>
    </section>

    <section class="py-12 bg-gray-100 rounded-lg shadow-md mt-8">
        <h2 class="text-2xl font-bold text-gray-800 text-center text-shadow-lg text-shadow-cyan-500 mb-6">Why Choose Us?</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
            <UIcon name="i-heroicons-cog-6-tooth" class="text-primary-500 text-4xl mx-auto mb-2" />
            <h3 class="font-semibold text-lg text-gray-700">Expert Technicians</h3>
            <p class="text-gray-600">Our team consists of highly trained and certified HVAC professionals.</p>
        </div>
        <div class="text-center">
            <UIcon name="i-heroicons-check-circle" class="text-green-500 text-4xl mx-auto mb-2" />
            <h3 class="font-semibold text-lg text-gray-700">Quality Service</h3>
            <p class="text-gray-600">We are committed to providing reliable and efficient HVAC solutions.</p>
        </div>
        <div class="text-center">
            <UIcon name="i-heroicons-clock" class="text-yellow-500 text-4xl mx-auto mb-2" />
            <h3 class="font-semibold text-lg text-gray-700">Prompt Response</h3>
            <p class="text-gray-600">We understand the urgency of HVAC issues and respond quickly.</p>
        </div>
        </div>
    </section>

    <section class="mt-8 text-center text-white shadow-md">
        <div v-if="hiddenPages.includes('/booking')" class="p-4 bg-gray-200 rounded-lg">
            <ContactForm />
        </div>
        <div v-else class="p-4 font-bold bg-secondary-500 rounded-lg">
            <h2 class="text-3xl text-shadow-lg text-shadow-cyan-500 mb-4">Schedule an Appointment Today!</h2>
            <p class="text-lg mb-6">Get your HVAC system checked by a professional. Book your appointment today.</p>
            <UButton to="/booking" label="Book Appointment" color="neutral" size="lg" />
        </div>
    </section>

    <section v-if="showTable" class="py-12 mt-8 bg-white rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-gray-800 text-center text-shadow-lg text-shadow-cyan-500 mb-6">Upcoming Appointments</h2>
         <UTable v-if="scheduledServices?.length > 0" class="mx-auto w-5/6" :data="scheduledServices" :columns="serviceColumns" />
         <USkeleton v-else v-for="i in 3" class="mx-auto mt-8 h-8 w-5/6 bg-gray-600" as="div"/>
    </section>

</template>
  
<script lang="ts" setup>
    import dayjs from 'dayjs'
    import customParseFormat from 'dayjs/plugin/customParseFormat'
    dayjs.extend(customParseFormat)
    
    interface Appointment {
        [key: string]: number | string | null;
    }

    const hiddenPages = useState('hiddenPages').value as string[]

    const globalUser = useState('globalUser', () => null)

    const appointments = ref<Appointment[]>([]);
    const showTable = ref(false)

    const services = [{label: 'Air Conditioning', id: 1}, {label: 'Heat Systems', id: 2}, {label: 'Ventilation', id: 3}, {label: 'Ductwork', id: 4}, {label: 'Maintenance', id: 5}, {label: 'Emergency', id: 6}]
  
    const serviceColumns = [
        { accessorKey: 'date', header: 'Date' },
        { accessorKey: 'time', header: 'Time' },
        { accessorKey: 'service', header: 'Service' },
    ]

    const scheduledServices = computed(() => {
        return appointments.value.map(appt => ({
            id: appt.id,
            date: appt.start_date,
            time: dayjs(appt.start_time, 'HH:mm:ss').format('h:mm A'),
            service: appt.service ? services.find(item => item.id === appt.service)?.label : 'Unspecified'
        }));
    });
    
    const pending = ref(false)
    const limit = 3  
    let storeId = { range: `limit_${limit}`, type: 'month', user_id: null }
    let eventsStore = getDynamicStore(storeId)
    
    const loadAppointments = async () => {
        console.log('loadAppointments called')
        const { data, error, status, isPending } = await eventsStore.fetchEvents({ pending: pending, limit, index: true })
        pending.value = isPending.value
        console.log('Store returned:', { dataLength: data?.length, error, status })
        
        if(error) {
            console.error('Error fetching appointments:', error, status)
        }
        
        // Always update the component state with whatever data we got
        appointments.value = data ?? []
        showTable.value = !error && data && data.length > 0
        
        console.log('Component updated, appointments length:', appointments.value.length)
    }

    onBeforeMount(async () => {
        await loadAppointments()
    })
    onMounted(async () => {
        const unlink = useState('unlink')
        if(unlink.value) document.querySelector(`#${unlink.value}`)!.classList.remove('router-link-active')
    })

    import { useHead } from '#imports'

    definePageMeta({
        layout: "default",
        middleware: ['origin']
    })

    useHead({
    title: 'Fresh Air | HVAC Experts - Installation, Maintenance & Repairs',
    meta: [
            {
            name: 'description',
            content: 'Your trusted HVAC experts, providing top-quality heating, cooling, ventilation, and air conditioning services. Book an appointment today and explore our full range of HVAC solutions.'
            },
            {
            property: 'og:title',
            content: 'Fresh Air | HVAC Experts - Installation, Maintenance & Repairs'
            },
            {
            property: 'og:description',
            content: 'Reliable HVAC solutions tailored for residential and commercial spaces. Schedule an appointment today and browse our services.'
            },
            {
            property: 'og:image',
            content: '/images/home-cover.jpg'
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
            content: 'contact@yourcompany.com'
            },
            {
            name: 'address',
            content: '123 Main Street, City, State, ZIP'
            },
            {
            name: 'keywords',
            content: 'HVAC experts, heating and cooling, air conditioning installation, HVAC maintenance, emergency repairs, ventilation systems, ductwork cleaning, indoor air quality, book HVAC service'
            }
        ]
    })
</script>