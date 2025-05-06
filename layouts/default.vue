<template>
  <!-- container mx-auto max-w-4xl"> -->
  <UContainer class="grid place-content-around h-screen"> 
    <Header :user="user" :is-admin="isAdmin" />
    <NuxtPage />
    <Footer />
  </UContainer>
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