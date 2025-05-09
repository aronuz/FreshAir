<template>
  <section class="pt-6 mb-8">
    <h2 class="text-3xl font-bold text-gray-800 text-center mb-8">Our Services</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="service in services" :key="service.id" class="flex-container bg-white rounded-lg shadow-sm p-4 pt-8">
          <div class="flex-items">
            <h3 class="font-semibold text-lg text-gray-700 mb-2">{{ service.name }}</h3>
            <p class="text-gray-600 text-sm">{{ service.description }}</p>
          </div>
          <div class="flex-items">
            <GalleryItem :image-src="service.type" :alt-text="service.description" loading="lazy"/>
          </div>      
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
const services = [
  {id: 1, name: 'Air Conditioning', type: 'ac', description: 'Installation, repair, and maintenance of all types of air conditioning systems.'},
  {id: 2, name: 'Heating Systems', type: 'heating', description: 'Expert services for furnaces, heat pumps, and other heating solutions.'},
  {id: 3, name: 'Ventilation', type: 'ventilation', description: 'Improving indoor air quality with effective ventilation systems.'},
  {id: 4, name: 'Ductwork', type: 'ductwork', description: 'Installation, cleaning, and repair of ductwork for optimal airflow.'},
  {id: 5, name: 'Maintenance Plans', type: 'plans', description: 'Regular maintenance services to keep your HVAC system running smoothly.'},
  {id: 6, name: 'Emergency Services', type: 'emergency', description: '24/7 emergency repair services when you need them most.'}
]

definePageMeta({
  layout: "default"
})

useHead({
  title: 'Gallery - HVAC Fresh Air',
  meta: [ { name: 'description', content: 'View our HVAC gallety.'}]
  title: 'Our HVAC Services - Frsh Air',
  meta: [
    {
      name: 'description',
      content: 'Explore our comprehensive HVAC services, including installation, maintenance, and emergency repairs. We ensure top-quality air conditioning, heating, and ventilation solutions.'
    },
    {
      property: 'og:title',
      content: 'Our HVAC Services - Frsh Air'
    },
    {
      property: 'og:description',
      content: 'Discover our wide range of HVAC solutions, from system installation to duct cleaning, ensuring optimal indoor air quality and comfort.'
    },
    {
      property: 'og:image',
      content: '/images/services-cover.jpg'
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
      content: 'HVAC services, air conditioning installation, heating repair, duct cleaning, HVAC maintenance, emergency HVAC repair, indoor air quality, ventilation systems'
    }

  ]
})

</script>

<style scoped>
  .flex-container {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: flex-start;
    align-content: stretch;
    min-height: 200px;
  }

  .flex-items:nth-child(1) {
    display: block;
    flex-grow: 0;
    flex-shrink: 1;
    flex-basis: auto;
    align-self: auto;
    order: 0;
  }

  .flex-items:nth-child(2) {
    display: block;
    flex-grow: 0;
    flex-shrink: 1;
    flex-basis: auto;
    align-self: auto;
    order: 0;
    max-height: 100%;
  }
</style>