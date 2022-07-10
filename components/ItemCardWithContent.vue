<template>
  <!-- eslint-disable vue/no-v-html -->
  <div class="bg-primary-blue rounded-md shadow-lg p-4 w-80">
    <v-subtitle class="!text-white">
      {{ data.title }}
    </v-subtitle>
    <date-display :dates="data.dates" />
    <div v-html="first_characters_in_content.text" />
    <div
      v-if="
        first_characters_in_content.full_text !==
          first_characters_in_content.text || hasSource
      "
      class="flex w-full justify-end"
    >
      <button
        class="bg-primary-darkblue rounded-full font-bold mt-2 text-primary-lightblue text-sm p-2 hover-effect"
        @click="$emit('openSidebar', data)"
      >
        Ver&nbsp;más
      </button>
    </div>
  </div>
</template>

<script>
import formatDate from "../utils/formatDate";
import replaceNbsps from "../utils/replaceNbsps";

export default {
  props: {
    data: {
      type: Object,
      default: () => ({
        content: "Prueba de nuevo más tarde",
        dates: [new Date()],
        title: "Error al mostrar",
      }),
    },
    hasSource: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    first_characters_in_content() {
      const first_200_characters = `${this.data.content.substring(0, 200)}${
        this.data.content.length >= 200 ? " ..." : ""
      }`;
      return {
        text: replaceNbsps(first_200_characters.trim()),
        full_text: replaceNbsps(this.data.content).trim(),
      };
    },
  },
  methods: {
    formatDate(str) {
      return formatDate(str);
    },
  },
};
</script>
<style scoped>
div :deep(p),
div :deep(span),
div :deep(ul),
div :deep(ol),
div :deep(em),
div :deep(u) {
  @apply text-sm leading-relaxed text-white;
}
div :deep(ul),
div :deep(ol) {
  @apply list-disc ml-4;
}

* {
  max-width: 320px;
  overflow-wrap: break-word;
}
</style>
