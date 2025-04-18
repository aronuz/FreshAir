<template>
  <header class="flex justify-between items-center mt-5">
    <NuxtLink to="/" class="text-xl font-bold p-2 hover:bg-gray-200">Home</NuxtLink>
    <nav class="flex space-x-4 font-mono">
      <div>
        {{ user ? user.email : 'Guest' }}
      </div>
      <div>      
        <NuxtLink v-if="isAdmin" to="/admin">Admin</NuxtLink>
      </div>
      <div>
        <UButton v-if="user" @click="handleSignout">Logout</UButton>
      </div>
    </nav>
  </header>
</template>

<script lang="ts" setup>
  import { ref, useState } from 'vue';
  
  const props = defineProps({
    user: Object,
    isAdmin: Boolean
  })

  const user = useSupabaseUser()
  const isAdmin = ref(false)

  watch (user, (user: User | null) => {
    if (user) {
      //isAdmin.value = user.role = "admin"
      isAdmin.value = useState('isAdmin', (user: User | null) => false); // Example admin state
    }
  }, { immediate: true })

  const handleSignout = () => {
    supabase.auth.signOut()
    navigateTo('/login', )
  }

</script>

<style>
body {
  font-family: 'Inter';
}
body {
  @apply dark:bk-gray-900 bg-white
}
</style>