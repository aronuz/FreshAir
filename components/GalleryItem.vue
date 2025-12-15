<template>
  <div class="gallery-item">
    <NuxtImg :src="imagePath" :alt="altText" 
      class="w-48 md:w-36 lg:w-24 rounded-sm md:rounded-xl shadow-lg"
    />
  </div>
      <!-- width="250px" height="250px" sizes="sm:100px md:140px lg:200px xl:300px"  -->
</template>

<script lang="ts" setup>
const props = defineProps({
  imageSrc: String,
  altText: String
})
const imagePath = ref(`/images/${props.imageSrc}.png`)
</script>

<style scoped>
  .gallery-item {
    margin: 10px;
  }
  /* .img {
    width: 100%;
    height: auto;
  } */
</style>