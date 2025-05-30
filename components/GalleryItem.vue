<template>
  <div class="gallery-item">
    <NuxtImg :src="imagePath" :alt="altText" 
      width="250px" height="250px" 
      class="rounded-xl shadow-lg w-full"
      sizes="sm:100px md:140px lg:200px xl:300px" 
    />
  </div>
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