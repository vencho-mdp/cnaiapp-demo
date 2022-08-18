<template>
  <button
    class="rounded-md shadow bg-primary-blue text-white text-xs py-1 px-2 font-bold"
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
