<template>
  <select
    :value="value"
    class="p-1 outline-none border-primary-lightblue h-8 border-2 rounded-xl transition duration-500 focus:border-primary-blue"
    @change="$emit('input', $event.target.value)"
  >
    <option
      v-for="(option, index) in optionsWithDefaultState"
      :key="index"
      :value="option.value || option"
      :selected="(option.value || option) === value"
      :hidden="!option"
    >
      {{ option.label || option }}
    </option>
  </select>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    value: {
      type: String,
      default: "",
    },
  },
  computed: {
    optionsWithDefaultState() {
      const addEmpty = !!this.value;
      return addEmpty ? [...this.options].concat("") : [...this.options];
    },
  },
};
</script>

<style></style>
