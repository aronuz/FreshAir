<template>
  <section class="pt-6 mb-8">
    <h2 class="text-3xl font-bold text-gray-800 text-center text-shadow-lg text-shadow-cyan-500 mb-8">Our Services</h2>
    <ClientOnly>
      <TransitionGroup name="service" tag="div" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(service, i) in services" :key="service.id" class="slide bg-white rounded-lg shadow-sm p-4 py-4 w-fit h-fit" :style="displayStyle[i]">
          <!-- :style="`display: ${hidden ? 'none': 'flex'}`" -->
          <div class="flex-container pb-4">
            <div class="flex-items h-fit">
              <h3 class="font-semibold text-2xl md:text-lg text-gray-700 mb-2">{{ service.name }}</h3>
              <p class="text-gray-600 text-2xl md:text-sm h-fit">{{ service.description }}</p>
              <UButton
                v-if="service.type !== 'plans'"
                class="mt-2"
                color="primary"
                variant="solid"
                label="Request Service"
                @click="$router.push({path: '/booking', query: {service: service.name}})"/>
            </div>
            <div class="flex-items">
              <GalleryItem :image-src="service.type" :alt-text="service.description" loading="lazy"/>
            </div> 
          </div>
        </div>
      </TransitionGroup>
    </ClientOnly>  
  </section>
</template>

<script lang="ts" setup>
import { services } from '~/data/constants.json'

const displayStyle: Array<Object> = reactive([])
for (const i in services){
  displayStyle[i] = {display: 'none'}
}
const showEl = () => { 
  displayStyle.forEach( async (_, i) => {
    const delay = 200 * (i)
    await new Promise(function (resolve) { 
        setTimeout(() => {resolve(true)}, delay); 
    })
    displayStyle[i] = {display: 'block'}
  })
} 

if (process.client) {
//   onMounted(() => {
    showEl()
    const unlink = useState('unlink')
    if(unlink.value) document.querySelector(`#${unlink.value}`)!.classList.remove('router-link-active')
//   })
}

definePageMeta({
  layout: "default",
  middleware: ['origin']
})

useHead({
  title: 'Gallery - HVAC Fresh Air',
  meta: [ { name: 'description', content: 'View our HVAC gallety.'}],
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
  }

  .slide {
    opacity: 1;
    transform: translateY(0px);
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  }

  .flex-items {
    display: block;
    flex-grow: 0;
    flex-shrink: 1;
    flex-basis: auto;
    align-self: auto;
  }

  .flex-items:nth-child(1) {
    order: 0;
  }

  .flex-items:nth-child(2) {
    order: 1;
    max-height: 100%;
  }

  .service-enter-active {
    transition: all 0.5s ease;
  }
  .service-enter-from {
    opacity: 1;
    transform: translateY(0);
  }
  .service-enter-to {
    opacity: 0;
    transform: translateY(-60px);
  }
</style>