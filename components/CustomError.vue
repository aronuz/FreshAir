<template>
  <div class="custom-error">
    <h1>Error {{ error.statusCode }}</h1>
    <p>{{ error.message }}</p>
    <nuxt-link to="/">Go back to home</nuxt-link>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.custom-error {
  text-align: center;
  padding: 2rem;
}
</style>
