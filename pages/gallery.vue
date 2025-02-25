<template>
  <div class="gallery">
    <h1>Our Work</h1>
    <div class="gallery-grid">
      <GalleryItem v-for="(item, i) in galleryItems" :key="i" :image-src="item.src" :alt-text="item.alt"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
const galleryItems = [{src: '/images/image.jpg', alt: 'HVAC service'}]

useHead({
  title: 'Gallery - HVAC Fresh Air',
  meta: [ { name: 'description', content: 'View our HVAC gallety.'}]
})
</script>

<style scoped>
  .gallery {
    padding: 2em;
    text-align: center;
  }
  .gallery-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>