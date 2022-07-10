<template>
  <v-button
    class="!text-white bg-green hover-effect"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </v-button>
</template>

<script>
export default {
}
</script>
