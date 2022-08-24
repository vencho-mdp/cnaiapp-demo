<template>
  <nuxt-child />
</template>

<script>
export default {
  layout: "panel",
  middleware: "authentication",
  pageTransition: "fade",
};
</script>

<style></style>
