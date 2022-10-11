<template>
  <span class="w-full max-w-md flex justify-between items-center pr-2 mx-auto">
    <button
      v-for="(option, i) in options"
      :key="option.label"
      :class="[
        { 'mr-4': i === 0 },
        activeTab === i ? 'border-b-primary-blue ' : 'border-b-gray-light',
      ]"
      class="w-full text-sm text-black border-b-2 pb-2 font-bold"
      @click="
        () => {
          $emit('tabClick', option);
          activeTab = i;
        }
      "
    >
      {{ option.label }}
    </button>
  </span>
</template>
<script>
export default {
  props: {
    options: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      activeTab: 0,
    };
  },
  methods: {
    active(index) {
      this.$emit(
        "options",
        this.options.map((option, i) => {
          if (i === index) {
            option.active = true;
          } else {
            option.active = false;
          }
          return option;
        })
      );
    },
  },
};
</script>
