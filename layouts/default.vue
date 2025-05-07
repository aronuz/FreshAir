<template>
  <!-- container mx-auto max-w-4xl"> -->
  <div class="bg-gray-100">
    <UContainer class="grid place-content-around mb-8 pb-8"> 
      <Header :user="user" :is-admin="isAdmin" />
      <NuxtPage />
      <Footer />
    </UContainer>
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
</style>