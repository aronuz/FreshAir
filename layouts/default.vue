<template>
  <!-- container mx-auto max-w-4xl"> -->
  <div class="relative overflow-hidden">
    <div class="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 bg-[url('/images/FreshAirHero.png')] background-attachment: fixed;">
      <div class="absolute inset-0 opacity-30"></div>
    </div>
    <div class="relative z-10">
    <UContainer class="w-full grid place-content-around mx-0 mb-8 pb-8 z-10 select-none"> 
      <Header class="w-fit" :user="user" :is-admin="isAdmin" />
      <NuxtPage />
      <Footer />
    </UContainer>
  </div>
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

<style>
.router-link-active {
  background-color: rgb(62, 194, 113);
  color: #fff;
  box-shadow: 0px 5px rgb(88, 121, 212);
}
</style>