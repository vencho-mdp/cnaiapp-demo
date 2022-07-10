<template>
  <button
    class="shadow px-4 py-1 text-tiny rounded-md disabled:bg-gray disabled:border-0 font-semibold"
    v-on="$listeners"
  >
    <slot />
  </button>
</template>
<script>
export default {
}

</script>
