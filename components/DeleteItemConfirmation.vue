<template>
  <div class="h-full flex justify-center items-center pb-32">
    <form-buttons
      add-button-text="Confirmar"
      class="px-4"
      :cancelButtonText="cancelButtonText"
      :is-add-button-invalid="false"
      v-on="$listeners"
      :addButtonText="addButtonText"
    />
  </div>
</template>

<script>
export default {
  props: {
    cancelButtonText: {
      type: String,
      default: "Cancelar",
    },
    addButtonText: {
      type: String,
      default: "Confirmar",
    },
  },
};
</script>

<style></style>
