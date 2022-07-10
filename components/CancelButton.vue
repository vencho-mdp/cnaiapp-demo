<template>
  <v-button
    class="bg-red !text-white hover-effect"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </v-button>
</template>

<script>
export default {
  inheritAttrs: false,
};
</script>
