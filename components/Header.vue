<template>
  <UContainer class="py-4">
    <div class="nav-container">
      <UCard>
        <h1 class="text-2xl font-bold text-primary-500">Fresh Air HVAC</h1>
        <p class="text-sm text-gray-500">Your Comfort, Our Priority</p>
      </UCard>
      <nav class="nav-top-left">
        <NuxtLink to="/">Home</NuxtLink>
        <UButton
          icon="i-heroicons-bars-3-bottom-left"
          color="primary"
          variant="ghost"
          class="md:hidden"
          @click="toggleMobileMenu"
        />
      </nav>

      <nav class="nav-top-right hidden md:flex">
          <NuxtLink v-if="isAdmin" to="/admin">Admin</NuxtLink>
          <UButton v-if="isUser" color="primary" variant="ghost" @click="handleSignout" label="Log Out" />
          <UButton v-else color="primary" variant="ghost" @click="handleSignin" label="Log In" />
      </nav>
    </div>
  
    <nav class="nav-bottom">
      <NuxtLink to="/about">About</NuxtLink>
      <NuxtLink to="/gallery">Gallery</NuxtLink>
      <NuxtLink to="/contact">Contact</NuxtLink>
      <NuxtLink to="/booking">Service</NuxtLink>
    </nav>
    <UCard v-if="isMobileMenuOpen">
      <div class="flex flex-col gap-4">
        <NuxtLink to="/" label="Home" @click="isMobileMenuOpen = false" />
        <NuxtLink v-if="isAdmin" to="/admin" label="Admin" @click="isMobileMenuOpen = false" />
        <UButton v-if="isUser" color="primary" variant="ghost" @click="handleSignout; isMobileMenuOpen = false" label="Log Out" />
        <UButton v-else color="primary" variant="ghost" @click="handleSignin; isMobileMenuOpen = false" label="Log In" />
        </div>
          
      <!-- <div class="grid drid-cols-6 gap-8">
        <UNavigationMenu orientation="vertical" :items="links" class="data-[orientation=vertical]:w-48 col-span-2" />
      </div> -->
    </UCard>
  </UContainer>
</template>

<script lang="ts" setup>  
  // const props = defineProps({
  //   user: Boolean, //Object,
  //   isAdmin: Boolean
  // })

  const isUser = ref(true) //useSupabaseUser()
  const isAdmin = ref(false)

  // watch (user, (user: User | null) => {
  //   if (user) {
  //     //isAdmin.value = user.role = "admin"
  //     isAdmin.value = useState('isAdmin', (user: User | null) => false); // Example admin state
  //   }
  // }, { immediate: true })

  const isMobileMenuOpen = ref(false);

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
  };

  const handleSignout = () => {
    // supabase.auth.signOut()
    navigateTo('/login', )
  }
  const handleSignin = () => {
    // supabase.auth.signOut()
    navigateTo('/login', )
  }

</script>

<style scoped>
.nav-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: flex-start;
}
nav {
  display: flex;
  flex-grow: 0;
  flex-shrink: 1;
}
.nav-top-left{
  justify-content: justify-between;
  align-items: center;
}
.nav-bottom {
  justify-content: space-around;
  padding: 10px;
  background-color: #f0f0f0;
}
</style>