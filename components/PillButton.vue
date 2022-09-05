<template>
  <button
    class="rounded-md shadow bg-primary-blue text-white text-xs px-2 py-1 font-semibold"
    :class="{ 'hover-effect': shouldTransition }"
  >
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    shouldTransition: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style></style>
