<template>
  <nuxt-child />
</template>

<script>
export default {
  layout: 'dashboard',
  middleware: 'authentication',
  pageTransition: 'fade'
}
</script>

<style></style>
