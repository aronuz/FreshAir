<template>
  <UContainer>
    <h2 class="text-3xl font-bold text-gray-800 text-center text-shadow-lg text-shadow-cyan-500 mb-8">About Fresh Air HVAC</h2>
    <MyBlock class="flex md:justify-center w-fit mx-auto" pad-size='large'>
      <div class="dialog-container p-4 rounded w-full md:w-sm text-box m-auto">Welcome to Fresh Air HVAC, your trusted partner for all your heating, ventilation, and air conditioning needs in the [Your Service Area] area. With over [Number] years of experience in the industry, we have built a reputation for providing reliable, efficient, and high-quality HVAC services to residential and commercial clients alike.</div>
    </MyBlock>
    <div class="flex md:gap-4 flex-col md:flex-row md:justify-center items-center w-full">     
      <MyBlock class="flex-1/5" pad-size='large' spacing="compact">
        <div class="dialog-container p-4 rounded w-full md:w-sm text-box m-auto">
          Our mission is simple: to ensure your comfort and satisfaction by delivering exceptional service and expert solutions. We understand the importance of a comfortable indoor environment, and our team of certified technicians is dedicated to keeping your HVAC systems running smoothly and efficiently, no matter the season.
        </div>
      </MyBlock>
      <MyBlock class="hidden md:flex justify-center w-fit h-full align-middle" pad-size='small'>
        <NuxtImg src="/images/about-us.png" alt="AC System" format="webp" class="rounded-lg shadow-lg w-3/4" />
      </MyBlock>
      <MyBlock class="flex-1/5" pad-size='large' spacing="compact">
        <div class="dialog-container p-4 rounded w-full md:w-sm text-box m-auto">
          At Fresh Air HVAC, we believe in honesty, integrity, and transparent communication. We take the time to understand your specific needs and provide tailored solutions that fit your budget and requirements. Our commitment to quality workmanship and customer care sets us apart.
        </div>
      </MyBlock>
    </div>

    <MyBlock class="flex flex-col justify-center items-center w-fit mx-auto" padSize="small">
      <h2 class="text-2xl font-bold text-gray-800 text-center text-shadow-lg text-shadow-cyan-500 mb-6">Meet Our Team</h2>
      <Team />
    </MyBlock>

    <MyBlock class="flex flex-col justify-center items-center" padSize="large">
      <div class="w-fit h-fit px-2 mx-auto bg-white rounded-lg">
        <div class="flex md:justify-center w-fit mx-auto">
          <h2 class="text-2xl font-bold text-gray-800 text-shadow-lg text-shadow-cyan-500 mb-6">Our Values</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <UIcon name="i-heroicons-hand-thumb-up" class="text-primary-500 text-4xl mx-auto mb-2" />
            <h3 class="font-semibold text-lg text-gray-700">Integrity</h3>
            <p class="text-gray-600">We operate with honesty and transparency in all our dealings.</p>
          </div>
          <div class="text-center">
            <UIcon name="i-heroicons-light-bulb" class="text-green-500 text-4xl mx-auto mb-2" />
            <h3 class="font-semibold text-lg text-gray-700">Expertise</h3>
            <p class="text-gray-600">Our technicians are highly trained and knowledgeable in the latest HVAC technologies.</p>
          </div>
          <div class="text-center">
            <UIcon name="i-heroicons-heart" class="text-red-500 text-4xl mx-auto mb-2" />
            <h3 class="font-semibold text-lg text-gray-700">Customer Focus</h3>
            <p class="text-gray-600">Your satisfaction is our top priority, and we strive to exceed your expectations.</p>
          </div>
        </div>
      </div>
    </MyBlock>

    <MyBlock>
      <h2 class="text-2xl font-bold text-gray-800 text-center text-shadow-lg text-shadow-cyan-500 mb-6">
        Don't just take our word for it - hear from our clients!
      </h2>
      <Reviews />
    </MyBlock>
  </UContainer>
</template>

<script lang="ts" setup>
import Reviews from '~/components/Reviews.vue'

    onMounted(async () => {
      const unlink = useState('unlink')
      if(unlink.value) document.querySelector(`#${unlink.value}`)!.classList.remove('router-link-active')
    })

  definePageMeta({
    layout: "default",
    middleware: ['origin']
  })

  useHead({
  title: 'About Us - Fresh Air',
  meta: [
    {
      name: 'description',
      content: 'Learn more about our company, values, and mission. At Frsh Air we are committed to providing top-quality HVAC services with excellence and dedication.'
    },
    {
      property: 'og:title',
      content: 'About Us - Fresh Air'
    },
    {
      property: 'og:description',
      content: 'Reliable, efficient, and high-quality HVAC services to residential and commercial clients alike.'
    },
    {
      property: 'og:image',
      content: '/images/about-cover.png'
    }
  ]
})
</script>

<style>
  .text-box {
    max-width: 400px;
    min-height: 200px;
  }
</style>