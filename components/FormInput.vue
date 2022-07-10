<template>
  <div class="flex flex-col items-stretch w-full">
    <v-label class="mb-2">
      {{ label }}
    </v-label>
    <div class="relative w-full">
      <img
        v-if="error"
        src="~/assets/images/warning-sign.svg"
        class="pointer-events-none w-8 h-8 absolute top-1/2 transform -translate-y-1/2 right-3"
        alt="Warning"
      >
      <v-text-input
        v-bind="$attrs"
        :class="[error ? '!border-red' : null]"
        class="w-full"
        :value="value"
        v-on="$listeners"
        @input="$emit('update:value', $event.target.value)"
      />
    </div>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    label: {
      type: String,
      default: 'Input'
    },
    error: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ''
    }
  }
}
</script>
