<template>
  <div class="flex flex-col justify-between">
    <v-label
      v-if="!created_img"
      for="file"
      class="text-sm bg-primary-blue rounded-md duration-300 hover:shadow-md cursor-pointer p-4 !text-white"
    >
      Agregar una imagen
    </v-label>
    <input
      v-if="!created_img"
      id="file"
      accept="image/png, image/jpeg, image/jpg"
      class="invisible hidden"
      type="file"
      name="image"
      @change="update_image"
    />
    <div
      v-else-if="image || (formData && is_form_image_a_url)"
      :style="`background: url(${created_img})`"
      :class="{ 'image-shadow': show_img_delete_button }"
      class="h-48 w-72 flex justify-center items-center !bg-contain !bg-no-repeat !bg-center rounded shadow"
      @mouseover="show_img_delete_button = true"
      @mouseleave="show_img_delete_button = false"
    >
      <icon-button
        v-if="show_img_delete_button"
        class="bg-red-light duration-500 hover:scale-105 z-50"
        @click.native="$emit('update:image', null)"
      >
        <img src="~/assets/images/trash.svg" alt="Eliminar" />
      </icon-button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // eslint-disable-next-line vue/require-prop-types
    image: {
      default: () => null,
    },
    formData: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      show_img_delete_button: false,
      image_previous_val: undefined,
    };
  },
  computed: {
    created_img() {
      if (this.image) {
        URL.revokeObjectURL(this.image_previous_val);
        const img = this.is_form_image_a_url
          ? this.image
          : URL.createObjectURL(this.image);
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.image_previous_val = img;
        return img;
      }
      return undefined;
    },
    is_form_image_a_url() {
      try {
        const url = new URL(this.image);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch (_) {
        return false;
      }
    },
  },
  methods: {
    update_image(event) {
      this.$emit("update:image", event.target.files[0]);
    },
  },
};
</script>

<style></style>
