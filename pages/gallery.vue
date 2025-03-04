<template>
  <div class="gallery">
    <h1>Our Work</h1>
    <div class="gallery-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <GalleryItem v-for="(item, i) in galleryItems" :key="i" :image-src="item.src" :alt-text="item.alt" loading="lazy"/>
    </div>
  </div>
</template>

<script setup>
// Import images if needed (or use a CMS for dynamic images)
</script>
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