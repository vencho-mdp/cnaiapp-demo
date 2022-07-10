<template>
  <!-- eslint-disable prettier/prettier -->
  <the-side-navbar>
    <Nuxt />
    <transition name="fade">
      <feedback-card
        v-if="$store.state.show_toast"
        data-test="feedback_card"
        class="mr-20 mb-12 right-0 bottom-0 w-96 z-50 fixed !shadow-lg"
        :title="$store.state.toast_content"
        :is-success="$store.state.show_toast === 'success'"
      />
    </transition>
  </the-side-navbar>
</template>

<script>
import head from "../mixins/head.js";
export default {
  mixins: [head],
  name: "dashboard",
};
</script>
