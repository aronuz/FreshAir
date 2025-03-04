<template>
  <div class="error-page">
    <h1>Error {{ statusCode }}</h1>
    <p v-if="statusCode === 404">Page not found</p>
    <p v-else>Something went wrong</p>
    <p>{{ errorMessage }}</p>
    <nuxt-link to="/">Go back to home</nuxt-link>
  </div>
</template>

<script setup>
const { statusCode, errorMessage } = defineNuxtError();
</script>

<style scoped>
.error-page {
  text-align: center;
  padding: 2rem;
}
</style>
