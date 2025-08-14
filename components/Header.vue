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
          <UButton v-if="user" class="h-fit" color="secondary" variant="solid" @click="handleLogout" label="Log Out" />
          <div v-else class="flex h-fit flex-row gap-2">
            <UBadge v-if="guestUser" color="success" size="xl">Guest</UBadge>
            <UButton v-if="notOnLogin" color="secondary" variant="solid" to="/loginLink" label="Log In" />
            <UButton v-if="notOnLogin" color="secondary" variant="solid" to="/registration" label="Register" />
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
        <!-- md:text-lg lg:text-xl xl:text-2xl -->
        <nav class="flex shrink justify-between p-3 font-bold text-white rounded-sm">
          <template v-for="link in siteLinks" :key="link.path">
            <NuxtLink v-if="link.path !== '/admin' || userRole === 'admin'" :to="link.path === '/index' ? '/' : link.path" :id="link.path" class="w-fit h-10 bg-gray-400 px-5 py-[5px] lg:py-[2px] xl:py-0 rounded-lg text-[clamp(.82rem,1vw+.34rem,1.5rem)] text-shadow-lg text-shadow-yellow-900 hover:text-shadow-blue-900">{{link.label}}</NuxtLink>
          </template>        
          
          <!-- <NuxtLink to="/" id="index" class="w-fit h-10 bg-gray-400 px-5 rounded-lg text-shadow-lg text-shadow-yellow-900 hover:text-shadow-blue-900">Home</NuxtLink>
          <NuxtLink to="/gallery" id="gallery" class="w-fit h-10 bg-gray-400 px-5 rounded-lg text-shadow-lg text-shadow-yellow-900 hover:text-shadow-blue-900">Services</NuxtLink>
          <NuxtLink to="/booking" id="booking" class="w-fit h-10 bg-gray-400 px-5 rounded-lg text-shadow-lg text-shadow-yellow-900 hover:text-shadow-blue-900">Schedule Service</NuxtLink>
          <NuxtLink to="/contact" id="contact" class="w-fit h-10 bg-gray-400 px-5 rounded-lg text-shadow-lg text-shadow-yellow-900 hover:text-shadow-blue-900">Contact Us</NuxtLink>
          <NuxtLink to="/about" id="about" class="w-fit h-10 bg-gray-400 px-5 rounded-lg text-shadow-lg text-shadow-yellow-900 hover:text-shadow-blue-900">About Us</NuxtLink> -->
        </nav>
      </div>
      <UCard v-if="isMobileMenuOpen" class="md:hidden absolute z-100 right-10" variant="outline" :ui="{root: 'bg-default text-default'}">
        <nav class="flex flex-col gap-4 text-4xl">
          <template v-for="link in siteLinks" :key="link.path">
            <NuxtLink v-if="link.path !== '/admin' || userRole === 'admin'" :to="link.path === '/index' ? '/' : link.path" @click="isMobileMenuOpen = false">{{link.label}}</NuxtLink>
          </template>  
          <!-- <NuxtLink to="/" @click="isMobileMenuOpen = false">Home</NuxtLink>
          <NuxtLink to="/gallery" @click="isMobileMenuOpen = false">Services</NuxtLink>
          <NuxtLink to="/booking" @click="isMobileMenuOpen = false">Schedule Service</NuxtLink>
          <NuxtLink to="/contact" @click="isMobileMenuOpen = false">Contact Us</NuxtLink>
          <NuxtLink to="/about" @click="isMobileMenuOpen = false">About Us</NuxtLink>
          <NuxtLink v-if="isAdmin" to="/admin" label="Admin" @click="isMobileMenuOpen = false" /> -->
          <UButton v-if="user" class="text-4xl/15 m-auto" color="info" variant="outline" @click="isMobileMenuOpen = false; handleLogout()" label="Log Out" />
          <UButtonGroup v-else class="m-auto">
            <UButton v-if="notOnLogin" class="text-4xl/15 pb-4" color="info" variant="outline" @click="handleLogin; isMobileMenuOpen = false" label="Log In" />
            <UButton v-if="notOnLogin" class="text-4xl/15 pb-4" color="info" variant="outline" @click="handleRegister; isMobileMenuOpen = false" label="Register" />
          </UButtonGroup>
        </nav>
            
        <!-- <div class="grid drid-cols-6 gap-8">
          <UNavigationMenu orientation="vertical" :items="links" class="data-[orientation=vertical]:w-48 col-span-2" />
        </div> -->
      </UCard>
  </UContainer>
</template>

<script lang="ts" setup>
  import { removeAllStores } from '~/stores/events'

  const { getPageAccess } = useFetchQueries()
  const guestUser = useGuestUser()
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const route = useRoute()
  const router = useRouter(); 
  const { toastBar } = useToastBar()
  // const props = defineProps({
  //   user: Boolean, //Object,
  //   isAdmin: Boolean
  // })
  
  const userRole = useState('userRole')
  const isAdmin = ref(userRole.value === 'admin')

  const siteLinks = ref([
    { path: '/index', label: 'Home' },
    { path: '/gallery', label: 'Services' },
    { path: '/booking', label: 'Schedule Service' },
    { path: '/contact', label: 'Contact Us' },
    { path: '/about', label: 'About Us' },
    { path: '/admin', label: 'Site Settings' }
  ])
  
  onBeforeMount(async () => {
    const { data, error } = await getPageAccess()
    if (error) return
    if (data) {
      data.forEach((page: { to: string; name: string }) => {
        if (page.name !== 'Construction') {
          const pagePath = page.to === '/index' ? '/' : page.to
          const linkIndex = siteLinks.value.findIndex(link => link.label !== page.name)
          if (linkIndex !== -1){
            // Replace path of existing link
            siteLinks.value.map((link) => {
              if (link.label === page.name) {
                link.path = pagePath
              }
            })
          } else {
            // Add new link
            siteLinks.value.push({ path: pagePath, label: page.name })
          }
        }
      })
    }
  })

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

  let notOnLogin = ref(true)
  // watch(() => )
  // const notOnLogin = computed(() => {
  //   const { history } = useRouter().options
  //   const currentPage = history.state.current as string
  //   return !['/login', '/registraition'].includes(currentPage)
  // })
  watch(
      () => route.path, (currentPage) => {
        notOnLogin.value = !['/loginLink', '/registration'].includes(currentPage)
      }, {immediate: true}
    )

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toastBar('error', 'Logout failed.', JSON.stringify(error))
    } else {
      userRole.value = null
      isAdmin.value = false
      useState('user_id', () => null)
      removeAllStores()
      toastBar('success', `You have been logged out.`)
      await router.push('/');
    }
  }

  const handleLogin = () => {
    navigateTo('/loginLink', )
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