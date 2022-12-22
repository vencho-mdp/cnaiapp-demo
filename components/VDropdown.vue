<template>
  <select
    :value="value"
    class="p-2 md:py-1.5 outline-none border-primary-lightblue border-2 rounded-xl transition duration-500 focus:border-primary-blue"
    @change="$emit('input', $event.target.value)"
  >
    <option
      v-for="(option, index) in !groups ? optionsWithDefaultState : []"
      :key="index"
      :value="option.value || option"
      :selected="(option.value || option) === value"
      :hidden="!option"
    >
      {{ option.label || option }}
    </option>
    <optgroup
      v-for="(group, index) in groups"
      :key="index"
      :label="group.label"
    >
      <option
        v-for="(option, index) in options.filter((el) =>
          group.filter(el.label || el)
        )"
        :key="index"
        :value="option.value || option"
        :selected="(option.value || option) === value"
        :hidden="!option"
      >
        {{ option.label || option }}
      </option>
    </optgroup>
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
    groups: {
      type: [Array, Object],
      default: () => null,
    },
  },
  computed: {
    optionsWithDefaultState() {
      const addEmpty = !this.value;
      return addEmpty ? ["", ...this.options] : [...this.options];
    },
  },
};
</script>

<style></style>
