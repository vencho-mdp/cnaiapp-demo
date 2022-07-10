<template>
  <v-button
    class="!text-white bg-primary-darkblue hover-effect"
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
