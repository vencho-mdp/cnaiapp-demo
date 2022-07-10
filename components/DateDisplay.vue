<template>
  <span
    class="flex font-semibold my-3 !text-primary-lightblue text-sm items-center"
  ><img src="~/assets/images/date.svg" alt="Reloj" class="mr-2">
    {{ dates.map(el => formatDate(el)).join(' - ') }}</span>
</template>

<script>
import formatDate from '../utils/formatDate'

export default {
  props: {
    dates: {
      type: Array,
      default: () => [new Date()]
    }
  },
  methods: {
    formatDate (date) {
      return formatDate(date)
    }
  }
}
</script>

<style></style>
