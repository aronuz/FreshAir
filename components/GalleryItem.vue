<template>
  <div class="gallery-item">
    <img :src="imagePath" :alt="altText">
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
    max-height: 100%;
    margin: 10px;
  }
  .img {
    width: 100%;
    height: auto;
    border-radius: 5px;
  }
</style>