<template>
  <client-only>
    <vue-simple-suggest
      ref="component"
      :list="options"
      mode="select"
      value-attribute="value"
      :destyled="true"
      v-bind="$attrs"
      :filter-by-query="true"
      display-attribute="label"
      class="inp border-primary-lightblue border-2 rounded-xl transition duration-500 focus:border-primary-blue"
      @select="onSelect"
      v-on="$listeners"
    >
      <!-- Filter by input text to only show the matching results -->
    </vue-simple-suggest>
  </client-only>
</template>

<script>
import VueSimpleSuggest from "vue-simple-suggest";
import "vue-simple-suggest/dist/styles.css"; // Using a css-loader

export default {
  components: {
    VueSimpleSuggest,
  },
  props: {
    options: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    onSelect() {
      this.$nextTick(() => {
        this.$refs.component.$el.querySelector("input").blur();
        this.$refs.component.setText("");
      });
    },
  },
};
</script>
<style scoped>
.inp {
  @apply relative !px-0.5 !py-0.5;
}

.inp :deep(.default-input) {
  @apply !border-transparent !min-w-full !min-h-full focus-visible:!outline-none !p-1;
}

.inp :deep(.suggestions) {
  @apply !border-none shadow rounded-md min-w-full mt-2 bg-white-full;
}

.inp :deep(.suggestions) {
  /* Little to adjust to select */
  /* Don't know why */
  right: 0.3px;
  @apply border-none absolute z-30;
}

.inp :deep(.hover) {
  @apply !bg-gray-light;
}

.inp :deep(.suggest-item) {
  @apply !my-1 !p-2;
}
</style>
