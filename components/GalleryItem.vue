<template>
  <div>
    <div class="gallery-item">
      <img :src="imageSrc" :alt="altText">
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  imageSrc: String,
  altText: String
})
const imagePath = 'images/image.jpg';
const imageUrl = useAssets().getURL(imagePath);
</script>

<style scoped>
  .gallery-item {
    width: 300px;
    margin: 10px;
  }
  .img {
    width: 100%;
    height: auto;
    border-radius: 5px;
  }
</style>