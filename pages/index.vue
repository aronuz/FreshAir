<template>
    <section class="py-12 text-center">
        <UImage src="/images/hero.jpg" alt="HVAC System" class="rounded-lg shadow-lg mx-auto max-w-2xl" />
        <h2 class="text-4xl font-bold text-gray-800 mt-6">Reliable HVAC Services You Can Trust</h2>
        <p class="text-lg text-gray-600 mt-4 max-w-xl mx-auto">
        We provide top-notch heating, ventilation, and air conditioning services for residential and commercial clients.
        Our experienced technicians are dedicated to ensuring your comfort all year round.
        </p>
        <div class="mt-8 space-x-4">
        <UButton to="/contact" label="Request Service" color="primary" size="lg" />
        <UButton to="/gallery" label="Our Services" variant="outline" color="primary" size="lg" />
        </div>
    </section>

    <section class="py-12 bg-white rounded-lg shadow-md mt-8">
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Why Choose Us?</h2>
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

    <!-- <section class="py-12 mt-8 bg-gray-100 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Our Services</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-lg text-gray-700 mb-2">Air Conditioning</h3>
            <p class="text-gray-600 text-sm">Installation, repair, and maintenance of all types of air conditioning systems.</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-lg text-gray-700 mb-2">Heating Systems</h3>
            <p class="text-gray-600 text-sm">Expert services for furnaces, heat pumps, and other heating solutions.</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-lg text-gray-700 mb-2">Ventilation</h3>
            <p class="text-gray-600 text-sm">Improving indoor air quality with effective ventilation systems.</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-lg text-gray-700 mb-2">Ductwork</h3>
            <p class="text-gray-600 text-sm">Installation, cleaning, and repair of ductwork for optimal airflow.</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-lg text-gray-700 mb-2">Maintenance Plans</h3>
            <p class="text-gray-600 text-sm">Regular maintenance services to keep your HVAC system running smoothly.</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-lg text-gray-700 mb-2">Emergency Services</h3>
            <p class="text-gray-600 text-sm">24/7 emergency repair services when you need them most.</p>
        </div>
        </div>
        <div class="mt-6 text-center">
        <UButton to="/gallery" label="View All Services" variant="outline" color="primary" />
        </div>
    </section> -->

    <section class="py-12 mt-8 bg-primary-500 text-white rounded-lg shadow-md">
        <div class="text-center">
        <h2 class="text-3xl font-bold mb-4">Schedule an Appointment Today!</h2>
        <p class="text-lg mb-6">Get your HVAC system checked by a professional. Book your appointment today.</p>
        <UButton to="/booking" label="Book Appointment" color="white" size="lg" />
        </div>
    </section>

    <section class="py-12 mt-8 bg-white rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Upcoming Appointments</h2>
        <div v-if="!showTable && scheduledServices && scheduledServices.length > 0" class="overflow-x-auto">
            <UTable :rows="scheduledServices" :columns="serviceColumns">
                <template #note-data="{ row }">
                {{ row.note.slice(0, 50) }}...
                </template>
                <template #date-data="{ row }">
                {{ row.date }}
                </template>
                <template #time-data="{ row }">
                {{ row.time }}
                </template>
            </UTable>
        </div>
        <div class="mt-4 text-center">
            <UButton to="/booking" label="View All Appointments" variant="link" color="primary" />
        </div>
    </section>
</template>
  
<script setup>
    const { fetchAppointments } = useFetchQueries()

    const appointments = ref([]);
    const showTable = ref([false])

    const serviceColumns = [
        { key: 'date', label: 'Date' },
        { key: 'time', label: 'Time' },
        { key: 'note', label: 'Service' },
    ];

    const scheduledServices = computed(() => {
        return appointments.value.map(appt => ({
            id: appt.id,
            date: appt.start_date,
            time: appt.start_time,
            note: appt.notes
        }));
    });
  
    const pending = ref([])
    const limit = 3
    const loadAppointments = async () => {
        const { data, isPending, error } = await fetchAppointments(pending, false, null, limit)
        pending.value = isPending.value
        showTable.value = !!error
        appointments.value = data
    }

    onMounted(async () => {
        loadAppointments()
    });

</script>