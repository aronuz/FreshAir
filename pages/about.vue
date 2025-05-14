<template>
  <!-- <div>
    <h1>About Us</h1>
    <p>We are a family-owned HVAC company dedicated to providing excellent service.</p>
    {/* ... more about us content */}
  </div> -->
  <section class="pt-6">
    <h2 class="text-3xl font-bold text-gray-800 text-center text-shadow-lg text-shadow-cyan-500 mb-8">About Fresh Air HVAC</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
      <div class="grid justify-items-center md:justify-items-start w-full h-full">
        <NuxtImg src="/images/about-us.png" alt="Our Team" class="rounded-lg shadow-lg w-full" />
      </div>
      <div class="font-bold text-white bg-gray-500 ml-0 p-4 rounded opacity-70">
        <p class="text-lg mb-4">
          Welcome to Fresh Air HVAC, your trusted partner for all your heating, ventilation, and air conditioning needs in the [Your Service Area] area. With over [Number] years of experience in the industry, we have built a reputation for providing reliable, efficient, and high-quality HVAC services to residential and commercial clients alike.
        </p>
        <p class="text-lg mb-4">
          Our mission is simple: to ensure your comfort and satisfaction by delivering exceptional service and expert solutions. We understand the importance of a comfortable indoor environment, and our team of certified technicians is dedicated to keeping your HVAC systems running smoothly and efficiently, no matter the season.
        </p>
        <p class="text-lg">
          At Fresh Air HVAC, we believe in honesty, integrity, and transparent communication. We take the time to understand your specific needs and provide tailored solutions that fit your budget and requirements. Our commitment to quality workmanship and customer care sets us apart.
        </p>
      </div>
    </div>
  </section>

  <section class="py-6 bg-white rounded-lg shadow-md my-8">
    <h2 class="text-2xl font-bold text-gray-800 text-center text-shadow-lg text-shadow-cyan-500 mb-6">Our Values</h2>
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
  </section>

  <section class="py-6 bg-gray-100 rounded-lg shadow-md mb-8">
    <h2 class="text-2xl font-bold text-gray-800 text-center text-shadow-lg text-shadow-cyan-500 mb-6">Meet Our Team</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="text-center">
        <UAvatar src="/images/team-member-1.jpg" size="xl" class="mx-auto" />
        <h3 class="font-semibold text-lg mt-2">John Doe</h3>
        <p class="text-gray-600 text-sm">Lead Technician</p>
      </div>
      </div>
  </section>
</template>

<script setup>
  definePageMeta({
    layout: "default"
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