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
          <UButton v-if="user && !gustUser" class="h-fit" color="secondary" variant="ghost" @click="handleLogout" label="Log Out" />
          <div v-else class="flex h-fit flex-row gap-2">
            <UButton color="secondary" variant="solid" to="/login" label="Log In" />
            <UButton color="secondary" variant="solid" to="/registration" label="Register" />
          </div>
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
          <NuxtLink to="/" ref="/" class="w-fit h-10 bg-gray-400 px-5 rounded-lg text-shadow-lg text-shadow-yellow-900 hover:text-shadow-blue-900">Home</NuxtLink>
          <NuxtLink to="/gallery" ref="/gallery" class="w-fit h-10 bg-gray-400 px-5 rounded-lg text-shadow-lg text-shadow-yellow-900 hover:text-shadow-blue-900">Services</NuxtLink>
          <NuxtLink to="/booking" ref="/booking" class="w-fit h-10 bg-gray-400 px-5 rounded-lg text-shadow-lg text-shadow-yellow-900 hover:text-shadow-blue-900">Schedule Service</NuxtLink>
          <NuxtLink to="/contact" ref="/contact" class="w-fit h-10 bg-gray-400 px-5 rounded-lg text-shadow-lg text-shadow-yellow-900 hover:text-shadow-blue-900">Contact Us</NuxtLink>
          <NuxtLink to="/about" ref="/about" class="w-fit h-10 bg-gray-400 px-5 rounded-lg text-shadow-lg text-shadow-yellow-900 hover:text-shadow-blue-900">About Us</NuxtLink>
        </nav>
      </div>
      <UCard v-if="isMobileMenuOpen" class="md:hidden absolute z-100 right-10" variant="outline" :ui="{root: 'bg-default text-default'}">
        <nav class="flex flex-col gap-4 text-4xl">
          <NuxtLink to="/" @click="isMobileMenuOpen = false">Home</NuxtLink>
          <NuxtLink to="/gallery" @click="isMobileMenuOpen = false">Services</NuxtLink>
          <NuxtLink to="/booking" @click="isMobileMenuOpen = false">Schedule Service</NuxtLink>
          <NuxtLink to="/contact" @click="isMobileMenuOpen = false">Contact Us</NuxtLink>
          <NuxtLink to="/about" @click="isMobileMenuOpen = false">About Us</NuxtLink>
          <NuxtLink v-if="isAdmin" to="/admin" label="Admin" @click="isMobileMenuOpen = false" />
          <UButton v-if="user && !gustUser" class="text-4xl m-auto" color="info" variant="ghost" @click="handleLogout; isMobileMenuOpen = false" label="Log Out" />
          <UButtonGroup v-else class="m-auto">
            <UButton class="text-4xl/15 pb-4" color="info" variant="outline" @click="handleLogin; isMobileMenuOpen = false" label="Log In" />
            <UButton class="text-4xl/15 pb-4" color="info" variant="outline" @click="handleRegister; isMobileMenuOpen = false" label="Register" />
          </UButtonGroup>
        </nav>
            
        <!-- <div class="grid drid-cols-6 gap-8">
          <UNavigationMenu orientation="vertical" :items="links" class="data-[orientation=vertical]:w-48 col-span-2" />
        </div> -->
      </UCard>
  </UContainer>
</template>

<script lang="ts" setup>
  const gustUser = ref(useGuestUser().value) 
  const user = gustUser.value ?? useSupabaseUser();
  const supabase = useSupabaseClient();
  const router = useRouter(); 
  const { toastBar } = useToastBar()
  // const props = defineProps({
  //   user: Boolean, //Object,
  //   isAdmin: Boolean
  // })

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


  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toastBar('error', 'Logout failed.', JSON.stringify(error))
    } else {
      toastBar('success', `You have been logged out.`)
      await router.push('/');
    }
  }

  const handleLogin = () => {
    navigateTo('/login', )
  }
  const handleRegister = () => {
    navigateTo('/registraition', )
  }
</script>

<style>
.btn-card div {
  padding: 40px !important;
  padding-top: 50px !important;
}
</style>