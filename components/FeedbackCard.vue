<template>
  <div :class="[isSuccess ? 'bg-green-200' : 'bg-red-200']" class="rounded flex flex-col h-auto shadow w-48 justify-start items-start">
    <slot>
      <span :class="[isSuccess ? 'text-green-600' : 'text-red-600']" class="font-bold text-sm px-4 py-4 ">
        {{ title }}
      </span>
      <v-paragraph v-if="subtitle" class="mt-4 text-xs px-4" :class="[isSuccess ? '!text-green-600' : '!text-red-600']">
        {{ subtitle }}
      </v-paragraph>
    </slot>
  </div>
</template>

<script>
export default {
  props: {
    isSuccess: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    }
  }
}
</script>
