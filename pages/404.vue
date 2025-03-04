<template>
  <div class="error-page">
    <h1>Oops! Page Not Found</h1>
    <p>The page you're looking for doesn't exist. How about going back to the <nuxt-link to="/">homepage</nuxt-link> or using the search bar below?</p>
    <input type="text" placeholder="Search...">
    <p>Or, check out some of our popular pages:</p>
    <ul>
      <li><nuxt-link to="/about">About Us</nuxt-link></li>
      <li><nuxt-link to="/contact">Contact</nuxt-link></li>
      <li><nuxt-link to="/blog">Blog</nuxt-link></li>
    </ul>
    <p>If you think this is a mistake, <a href="mailto:support@example.com">let us know</a>.</p>
  </div>
</template>

<style scoped>
.error-page {
  text-align: center;
  padding: 2rem;
}
</style>
