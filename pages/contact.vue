<template>
  <UContainer>
    <!-- Contact Section -->
    <section class="flex flex-col pt-6 pb-3">
      <h2 class="text-3xl font-bold text-gray-800 text-center text-shadow-lg text-shadow-cyan-500 mb-8">
        Contact Us
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-100 p-4 rounded">
        <!-- Contact Information -->
        <div class="flex flex-col gap-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-700">Get in Touch</h3>
          </div>
          
          <!-- Address -->
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-1">
              <UIcon name="i-heroicons-map-pin" class="text-primary-500 shrink-0" />
              <span class="text-gray-700 font-semibold">Address:</span>
              <span class="text-gray-600 font-bold grow text-right">123 Main Street, Anytown, NY 10001</span>
            </div>
          </div>
          
          <!-- Phone -->
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-1">
              <UIcon name="i-heroicons-phone" class="text-primary-500 shrink-0" />
              <span class="text-gray-700 font-semibold">Phone:</span>
              <span class="text-gray-600 font-bold grow text-right">{{ phoneNumber }}</span>
            </div>
            <div class="flex items-center gap-2 ml-6 text-right">              
              <PhoneActions 
                v-if="!isMobile"
                :phone-number="phoneNumber"
                :default-message="defaultMessage"
              />
            </div>
          </div>
          
          <!-- Email -->
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-1">
              <UIcon name="i-heroicons-envelope" class="text-primary-500 shrink-0" />
              <span class="text-gray-700 font-semibold">Email:</span>
              <span class="text-gray-600 font-bold ml-6 grow text-right">{{ email }}</span>
            </div>
            <div class="flex items-center gap-2 ml-6 text-right">
              <EmailAction :default-message="defaultMessage" />
            </div>
          </div>
          
          <div class="flex flex-col text-gray-600 font-bold">
            <span>We're here to help with all your HVACs needs.</span>
            <span class="text-right">Feel free to reach out!</span>
          </div>  
        </div>
                
        <!-- Business Hours -->
        <div class="flex">
          <div class="flex flex-col">
            <h4 class="text-xl font-semibold text-gray-700 mb-4">Business Hours</h4>
            <div class="flex flex-col gap-1">
              <p class="text-gray-600 font-bold">Monday - Friday: 9:00 AM to 5:00 PM</p>
              <p class="text-gray-600 font-bold">Saturday: 10:00 AM to 2:00 PM (Emergency Services Only)</p>
              <p class="text-gray-600 font-bold">Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Location Section -->
    <section class="flex flex-col py-6 mb-8">
      <h2 class="text-3xl font-bold text-gray-900 text-center text-shadow-lg text-shadow-cyan-500 mb-6">
        Our Location
      </h2>
      
      <div class="flex rounded-lg shadow-md overflow-hidden bg-gray-100" style="aspect-ratio: 16/9;">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.716780802983!2d-74.00597312373348!3d40.7127753713898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a2e1ddb5d05%3A0xcf469f26915f761!2sWall%20Street!5e0!3m2!1sen!2sus!4v1715165487838!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style="border:0;"
          allowfullscreen="false"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          class="w-full h-full"
        ></iframe>
      </div>
    </section>
  </UContainer>
</template>
  
  <script lang="ts" setup>
    onBeforeMount(() => {
      console.log('Contact page before mount')
    })

    onErrorCaptured((err) => {
      console.error('Error captured in contact page:', err)
      return false // prevents error propagation
    })

    try {
      onMounted(async () => {      
        console.log('Contact page mounted')
        console.log('Current route:', useRoute().path)
        const unlink = useState('unlink')
        if(unlink.value && document.querySelector(`#${unlink.value}`)) {
          document.querySelector(`#${unlink.value}`)?.classList.remove('router-link-active')
        }
      })
    } catch (error) {
      console.error('Caught error in onMounted setup:', error)
    }
    
    onBeforeUnmount(() => {
      console.log('Contact page before unmount')
    })

    const phoneNumber = ref('+1 (555) 123-4567')
    const email = ref('info@fahvac.com')
    const defaultMessage = ref("Hi, I'm interested in your services!")

    const isMobile = computed(() => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    })

    definePageMeta({
      layout: "default",
    })
      // middleware: ['origin']

    useHead({
      title: 'Contact Us - Fresh Air',
      meta: [
        {
          name: 'description',
          content: 'Get in touch with us! Whether you need HVAC support, maintenance, or emergency repairs, we are here to help. Contact us today.'
        },
        {
          property: 'og:title',
          content: 'Contact Us - Fresh Air'
        },
        {
          property: 'og:description',
          content: 'Need assistance? Reach out to us for expert HVAC services and customer support.'
        },
        {
          property: 'og:image',
          content: '/images/contact-cover.png'
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
        }
      ]
    })
  </script>
  
  <style scoped>
  </style>