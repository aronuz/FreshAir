<template>
  <footer>
    <p>&copy; {{ new Date().getFullYear() }} Your HVAC Company</p>
  </footer>
</template>

<style>
footer {
  position: fixed;
  z-index: 100;
  bottom: 0;
  width: 100%;
  text-align: center;
  padding: 10px;
  background-color: #fdf9f9;
}
</style>