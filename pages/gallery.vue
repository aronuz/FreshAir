<template>
  <UContainer>
    <section class="pt-6 mb-8">
      <h2 class="text-3xl font-bold text-gray-800 text-center text-shadow-lg text-shadow-cyan-500 mb-8">Our Services</h2>
      <div class="relative grid grid-cols-2 grid-rows-3 gap-3 w-full h-full mx-auto">
      <ClientOnly>
        <ServiceBlock :services="services.slice(0, 3)" :col="1"/>
        <ServiceBlock :services="services.slice(3, 6)" :col="2"/>
      </ClientOnly>  
          </div>
    </section>
  </UContainer>
</template>

<script lang="ts" setup>
import { services } from '~/data/constants.json'

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

<style>
/*     
    @keyframes move-1 {
        0% { 
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 0;
        }
        50% {
            transform: translate(-50px, -100px) scale(0.8) rotate(180deg);
            opacity: 0.8;
        }
        100% { 
            transform: translate(-100px, -200px) scale(1) rotate(360deg);
            opacity: 1;
        }
    }
    
    @keyframes move-2 {
        0% { 
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 0;
        }
        50% {
            transform: translate(50px, -50px) scale(0.8) rotate(-180deg);
            opacity: 0.8;
        }
        100% { 
            transform: translate(100px, -200px) scale(1) rotate(-360deg);
            opacity: 1;
        }
    }
    
    @keyframes move-3 {
        0% { 
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 0;
        }
        50% {
            transform: translate(-80px, 50px) scale(0.8) rotate(270deg);
            opacity: 0.8;
        }
        100% { 
            transform: translate(-100px, -100px) scale(1) rotate(540deg);
            opacity: 1;
        }
    }
    
    @keyframes move-4 {
        0% { 
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 0;
        }
        50% {
            transform: translate(80px, 80px) scale(0.8) rotate(-270deg);
            opacity: 0.8;
        }
        100% { 
            transform: translate(100px, -100px) scale(1) rotate(-540deg);
            opacity: 1;
        }
    }
    
    @keyframes move-5 {
        0% { 
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 0;
        }
        50% {
            transform: translate(-120px, 120px) scale(0.8) rotate(450deg);
            opacity: 0.8;
        }
        100% { 
            transform: translate(-100px, 0px) scale(1) rotate(720deg);
            opacity: 1;
        }
    }
    
    @keyframes move-6 {
        0% { 
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 0;
        }
        50% {
            transform: translate(120px, -120px) scale(0.8) rotate(-450deg);
            opacity: 0.8;
        }
        100% { 
            transform: translate(100px, 0px) scale(1) rotate(-720deg);
            opacity: 1;
        }
    }

    .move-1 { animation: move-1 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
    .move-2 { animation: move-2 1.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
    .move-3 { animation: move-3 1.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
    .move-4 { animation: move-4 1.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
    .move-5 { animation: move-5 2.0s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
    .move-6 { animation: move-6 2.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; } */
</style>