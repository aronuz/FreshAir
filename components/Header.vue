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
          <NuxtLink v-if="isAdmin" to="/admin" class="relative bottom-1 bg-[#3ec271] mr-2 p-2 h-fit rounded-xl font-bold" :class="{'bottom-2 border-3 border-[#5879d4]': currentPath === '/admin'}">Admin</NuxtLink>
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
          <template v-for="link in siteLinks" :key="link.to">
            <NuxtLink v-if="link.to !== '/admin' || userRole === 'admin'" :to="link.to === '/index' ? '/' : link.to" :id="link.name" class="w-fit h-10 bg-gray-400 px-5 py-[5px] lg:py-[2px] xl:py-0 rounded-lg text-[clamp(.82rem,1vw+.34rem,1.5rem)] text-shadow-lg text-shadow-yellow-900 hover:text-shadow-blue-900">{{link.name}}</NuxtLink>
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
          <template v-for="link in siteLinks" :key="link.to">
            <NuxtLink v-if="link.to !== '/admin' || userRole === 'admin'" :to="link.to === '/index' ? '/' : link.to" @click="isMobileMenuOpen = false">{{link.name}}</NuxtLink>
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

  import { PAGES_CONFIG } from '~/config/routes'

  interface pages {
    name: string,
    to: string,
    allowed?: boolean,
    oldPath?: string | null
  }

  const { getPageAccess } = useFetchQueries(),
    guestUser = useGuestUser(),
    user = useSupabaseUser(),
    supabase = useSupabaseClient(),
    route = useRoute(),
    router = useRouter(),
    currentPath = ref(route.path)

    const { toastBar } = useToastBar()
  // const props = defineProps({
  //   user: Boolean, //Object,
  //   isAdmin: Boolean
  // })
  
  const userRole = useState('userRole')
  const isAdmin = ref(userRole.value === 'admin')
  const pageConfig = [...PAGES_CONFIG]
  const siteLinks = reactive<pages[]>(pageConfig)
  
  onBeforeMount(async () => {
    const { data, error } = await getPageAccess()
    if (error) return
    const hiddenPages = useState('hiddenPages', () => [] as string[])
    if (data) {
      data.forEach((page: { to: string; name: string; allowed: boolean }) => {
        if (page.name !== 'Construction' && page.allowed) {
          const pagePath = page.to === '/index' ? '/' : page.to
          const linkIndex = siteLinks.findIndex((link: pages) => link.name !== page.name)
          if (linkIndex !== -1){
            // Replace path of existing link
            siteLinks.map((link: pages) => {
              if (link.name === page.name) {
                link.to = pagePath
              }
            })
          } else {
            // Add new link
            siteLinks.push({ to: pagePath, name: page.name })
          }
        } else if (!page.allowed) {
          hiddenPages.value.push(page.to)
        }
      })
      const bookingIndex = data.findIndex((page: {to: string }) => page.to === '/booking')
      if (bookingIndex < 0) hiddenPages.value.push('/booking')
      //console.log('Hidden pages:', hiddenPages.value)   
    }
  })

  watch (user, async (user) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (user && session?.user.id) {
      const usersStore = useUsersStore()
      const { fetchUsers } = usersStore
      const { data, error } = await fetchUsers(true, parseInt(session.user.id))
      if(error) console.error('Error fetching user data:', error) 
      if(data && !error) {
        const userData = data && data.length > 0 ? data[0] : null
        if(userData) useState('user_data', () => userData)
      }
    }
  }, { immediate: true })

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
        //console.log('currentPath', route.path)
        currentPath.value = route.path
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