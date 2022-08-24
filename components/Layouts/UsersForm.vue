<template>
  <delete-item-confirmation
    v-if="deleteUser"
    @handleCancelButtonClick="$emit('closeSidebar')"
    @click="$emit('handleClick', deleteUser)"
  />
</template>
<script>
export default {
  props: {
    deleteUser: {
      type: String,
      default: false,
    },
  },
};
</script>
