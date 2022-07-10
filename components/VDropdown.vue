<template>
  <select
    :value="value"
    class="py-1.5 px-2 outline-none border-primary-lightblue border-2 rounded-xl transition duration-500 focus:border-primary-blue"
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
      default: () => []
    },
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    optionsWithDefaultState () {
      return [...(this.value ? [] : ['']), ...this.options]
    }
  }
}
</script>

<style></style>
