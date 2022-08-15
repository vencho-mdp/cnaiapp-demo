<template>
  <div class="flex flex-col min-h-screen justify-between" v-if="$store">
    <transition name="fade">
      <bug-reporting-sidebar />
    </transition>
    <transition name="fade">
      <bigger-img v-if="$store.state.see_img_bigger" />
    </transition>
    <TheNavbar />
    <Nuxt class="flex-grow h-full mb-auto" />
    <transition name="fade">
      <feedback-card
        v-if="$store.state.show_toast"
        data-test="feedback_card"
        class="md:mr-20 mb-12 right-8 bottom-0 z-50 fixed !shadow-lg"
        :title="news_content"
        :is-success="$store.state.show_toast === 'success'"
      />
    </transition>
    <TheFooter />
  </div>
</template>
<script>
import head from "../mixins/head.js";

export default {
  name: "default",
  mixins: [head],
  computed: {
    news_content() {
      if (this?.$store.state.show_toast === "success") {
        return "¡Reporte enviado!";
      }
      return "Ha ocurrido un error";
    },
  },
};
</script>
