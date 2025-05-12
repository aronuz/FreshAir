<template>
  <UContainer class="py-4">
    <div class="flex flex-row nowrap justify-between">
      <div class="nav-top-left">
        <UButton color="secondary" class="w-fit hover:cursor-pointer p-1 bg-[url('/images/ac_unit.png')] bg-cover" @click.native="navigateTo('/')">
          <UCard class="w-fit font-bold opacity-80 btn-card">
            <h1 class="text-2xl font-bold text-secondary-500">Fresh Air HVAC</h1>
            <p class="text-sm text-bold text-gray-500">Your Comfort, Our Priority</p>
          </UCard>
        </UButton>
      </div>

      <div class="justify-between align-center hidden md:flex">
          <NuxtLink v-if="isAdmin" to="/admin">Admin</NuxtLink>
          <UButton v-if="isUser" color="secondary" variant="ghost" @click="handleSignout" label="Log Out" />
          <UButton v-else color="secondary" variant="ghost" @click="handleSignin" label="Log In" />
      </div>
      <UButton
        icon="i-heroicons-bars-3-bottom-left"
        size="xl"
        color="secondary"
        variant="solid"
        class="md:hidden w-20 h-20 m-auto p-5"
        @click="toggleMobileMenu"
        :ui="{leadingIcon: 'size-10'}"
      />
    </div>
  
      <div class="hidden md:block">
        <nav class="flex shrink justify-between p-3 md:text-lg lg:text-xl xl:text-2xl font-bold text-white rounded-sm">
          <NuxtLink to="/" class="w-fit h-10 bg-gray-400 px-5 rounded-lg">Home</NuxtLink>
          <NuxtLink to="/gallery" class="w-fit h-10 bg-gray-400 px-5 rounded-lg">Services</NuxtLink>
          <NuxtLink to="/booking" class="w-fit h-10 bg-gray-400 px-5 rounded-lg">Schedule a Service</NuxtLink>
          <NuxtLink to="/contact" class="w-fit h-10 bg-gray-400 px-5 rounded-lg">Contact Us</NuxtLink>
          <NuxtLink to="/about" class="w-fit h-10 bg-gray-400 px-5 rounded-lg">About Us</NuxtLink>
        </nav>
      </div>
      <UCard v-if="isMobileMenuOpen" class="md:hidden absolute z-100 right-10" variant="outline" :ui="{root: 'bg-default text-default'}">
        <nav class="flex flex-col gap-4 text-4xl">
          <NuxtLink to="/" @click="isMobileMenuOpen = false">Home</NuxtLink>
          <NuxtLink to="/gallery" @click="isMobileMenuOpen = false">Services</NuxtLink>
          <NuxtLink to="/booking" @click="isMobileMenuOpen = false">Schedule a Service</NuxtLink>
          <NuxtLink to="/contact" @click="isMobileMenuOpen = false">Contact Us</NuxtLink>
          <NuxtLink to="/about" @click="isMobileMenuOpen = false">About Us</NuxtLink>
          <NuxtLink v-if="isAdmin" to="/admin" label="Admin" @click="isMobileMenuOpen = false" />
          <UButton v-if="isUser" class="text-4xl m-auto" color="info" variant="ghost" @click="handleSignout; isMobileMenuOpen = false" label="Log Out" />
          <UButton v-else class="text-4xl m-auto" color="info" variant="ghost" @click="handleSignin; isMobileMenuOpen = false" label="Log In" />
        </nav>
            
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

<style>
.btn-card div {
  padding: 40px !important;
  padding-top: 50px !important;
}
</style>