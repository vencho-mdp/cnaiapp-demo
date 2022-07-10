<template>
  <div class="w-full flex justify-between">
    <add-button
      data-test="add_btn"
      :disabled="isAddButtonInvalid"
      v-bind="$attrs"
      v-on="$listeners"
    >
      {{ addButtonText }}
    </add-button>
    <cancel-button
      type="button"
      @click.native="$emit('handleCancelButtonClick')"
    >
      Cancelar
    </cancel-button>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    isAddButtonInvalid: {
      type: Boolean,
      default: true
    },
    addButtonText: {
      type: String,
      default: 'Guardar'
    }
  }
}
</script>

<style></style>
