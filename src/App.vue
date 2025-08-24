<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <RouterView />
  </div>
</template>

<style>
@import url('https://cdn.jsdelivr.net/gh/rastikerdar/shabnam-font@v5.0.1/dist/font-face.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Shabnam', 'Tahoma', sans-serif;
  direction: rtl;
  background-color: #2c1810;
  color: #f5f5f5;
  overflow-x: hidden;
}

.app {
  min-height: 100vh;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #2c1810;
}

::-webkit-scrollbar-thumb {
  background: #d2691e;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #ff7f50;
}
</style>
