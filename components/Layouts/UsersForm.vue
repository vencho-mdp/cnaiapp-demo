<template>
  <delete-item-confirmation
    v-if="deleteUser"
    @handleCancelButtonClick="$emit('closeSidebar')"
    @click="$emit('handleClickForDeletion')"
  />
  <form v-else @submit.prevent="send_data()"></form>
</template>
<script>
export default {
  props: {
    deleteUser: {
      type: Boolean,
      default: false,
    },
    isEditingOrAddingUser: {
      type: [String, Object],
      default: false,
    },
  },
  data() {
    return {
      form: {
        first_name: isEditingOrAddingUser.first_name ?? "",
        last_name: isEditingOrAddingUser.last_name ?? "",
        groups: isEditingOrAddingUser.groups ?? [],
        subjects: isEditingOrAddingUser.subjects ?? [],
        classes: isEditingOrAddingUser.classes ?? [],
      },
    };
  },
  methods: {
    async send_data() {},
  },
};
</script>
