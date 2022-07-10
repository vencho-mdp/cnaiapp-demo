<template>
  <v-button
    class="bg-primary-blue text-white w-24 hover-effect !text-xs"
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
