<template>
  <form
    class="flex flex-col flex-grow mx-4 justify-evenly"
    @submit.prevent="add()"
  >
    <div class="flex flex-col justify-between my-8">
      <v-label class="mb-2 !text-white"> Título </v-label>
      <!-- v-model no funciona con v-on $listeners
      https://github.com/vuejs/vue/issues/7042
       -->
      <v-text-input
        data-test="title"
        class="w-full"
        :value="form.title"
        @input.native="form.title = $event.target.value"
      />
    </div>
    <div class="flex flex-col justify-between my-8">
      <v-label class="mb-2 !text-white"> Contenido </v-label>
      <client-only>
        <vue-editor
          v-model="form.content"
          :editor-toolbar="customToolbar"
          class="rounded-xl"
          data-test="content"
        />
      </client-only>
    </div>
    <file-input
      :image.sync="form.image"
      data-test="file_uploader"
      :form-data="formData"
      class="mt-16"
    />
    <form-buttons
      :is-add-button-invalid="$v.$invalid"
      class="my-12"
      @handleCancelButtonClick="$emit('closeSidebar', 'cancel')"
    />
  </form>
</template>

<script>
import { required } from "vuelidate/lib/validators";

export default {
  props: {
    formData: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      form: this.formData || {
        content: undefined,
        title: undefined,
        image: undefined,
      },
      customToolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
      ],
    };
  },
  validations: {
    form: {
      title: {
        required,
      },
      content: {
        required,
      },
    },
  },
  methods: {
    async add() {
      // Sacar atributos del componente card
      const { label, desc, ...data } = this.form;
      const form = new FormData();

      form.append("title", data.title);
      form.append("content", data.content);

      if (data.image) {
        form.append("image", this.form.image);
      }

      if (this.formData?.id) {
        form.append("id", this.formData.id);
      }

      if (this.formData?.original_image_extension) {
        form.append(
          "original_image_extension",
          this.formData.original_image_extension
        );
      }

      try {
        await this.$axios[this.formData ? "$put" : "$post"]("/api/news", form);
        this.$emit("closeSidebar");
      } catch (error) {
        this.$reportNetworkError(error);
      }
    },
  },
};
</script>

<style>
.image-shadow {
  box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.2);
}

.ql-editor {
  min-height: 48px !important;
  @apply bg-white rounded-b-xl max-h-40;
}
.ql-toolbar {
  @apply bg-white rounded-t-xl;
}
.ql-editor p,
.ql-editor strong,
.ql-editor u,
.ql-editor em,
.ql-editor li {
  @apply !text-black;
}
#quill-container {
  @apply !border-none;
}
</style>
