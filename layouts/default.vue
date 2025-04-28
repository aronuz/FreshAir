<template>
  <div v-if="client" class="container mx-auto max-w-4xl">
    <Header :user="user" :is-admin="isAdmin" />
    <nav>
      <NuxtLink to="/about">About</NuxtLink>
      <NuxtLink to="/gallery">Gallery</NuxtLink>
      <NuxtLink to="/contact">Contact</NuxtLink>
      <NuxtLink to="/booking">Service</NuxtLink>
    </nav>
    <div class="grid drid-cols-6 gap-8">
      <UNavigationMenu orientation="vertical" :items="links" class="data-[orientation=vertical]:w-48 col-span-2" />
      <!-- <div class="col-span-4" >
        <slot />
      </div> -->
    </div>
    <slot />
    <Footer />
  </div>
</template>

<script setup>    
  const links = [
    {label: '',
      to: '/'
    },
  ]
  const user = ref(false) //= false; useSupabaseUser()
  const isAdmin = ref(false)
const client = ref(true)
  onMounted(() => {
    client.value = true
  })

  useHead({
    link: [{
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'stylesheet',
      href: 'href://fonts.googleapis.com/css2?family=Inter&display=swap',
      crossorigin: ''
    }]
  })
</script>

<style scoped>
    nav {
      display: flex;
      justify-content: space-around;
      padding: 10px;
      background-color: #f0f0f0;
    }
    
    footer {
      text-align: center;
      padding: 10px;
      background-color: #f0f0f0;
    }
</style>