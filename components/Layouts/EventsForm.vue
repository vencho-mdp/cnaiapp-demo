<template>
  <form
    class="flex flex-col flex-grow mx-4 justify-around gap-4"
    @submit.prevent="add"
  >
    <div class="flex flex-col mb-1 justify-between">
      <v-label class="mb-2 !text-white"> Nombre </v-label>
      <v-text-input
        class="w-full"
        data-test="name"
        :value="form.title"
        @input.native="form.title = $event.target.value"
      />
    </div>
    <div class="flex flex-col justify-between mb-12">
      <v-label class="mb-2 !text-white"> Descripción </v-label>
      <client-only>
        <vue-editor
          v-model="form.description"
          :editor-toolbar="customToolbar"
          class="rounded-xl min-h-min"
        />
      </client-only>
    </div>
    <div class="flex justify-center items-center">
      <div class="w-96">
        <v-label class="!text-white"> Fecha/s </v-label>
        <client-only>
          <v-date-picker v-model="form.dates" is-range locale="es">
            <template #default="{ inputValue, inputEvents }">
              <!-- Cambiar fecha de DD/MM/YYYY a MM/DD/YYYY (en atributo value) -->
              <v-text-input
                readonly
                :value="
                  inputValue.start
                    ? `${formatDate(inputValue.start)} - ${formatDate(
                        inputValue.end
                      )}`
                    : ''
                "
                class="mt-2 w-full"
                v-on="inputEvents.start"
              />
            </template>
          </v-date-picker>
        </client-only>
      </div>
    </div>
    <file-input :image.sync="form.image" :form-data="formData" />
    <form-buttons
      :is-add-button-invalid="$v.$invalid"
      class="mt-4 mb-8"
      @handleCancelButtonClick="$emit('closeSidebar', 'cancel')"
    />
  </form>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import formatDate from "../../utils/formatDate";

export default {
  props: {
    formData: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      form: {
        title: this.formData?.title || "",
        description: this.formData?.description || "",
        dates: {
          start: this.formData?.start_date || "",
          end: this.formData?.end_date || "",
        },
        image: this.formData?.image || "",
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
      description: {
        required,
      },
      dates: {
        $each: {
          required,
        },
      },
    },
  },
  methods: {
    async add() {
      const newStartDate = new Date(this.form.dates.start)
        .toISOString()
        .substring(0, 10);
      const newEndDate = new Date(this.form.dates.end)
        .toISOString()
        .substring(0, 10);
      const data = {
        // Si la propiedad es igual a la que ya estaba
        // Que el valor sea null para despues sacarlo
        start_date: newStartDate === this.formData?.start ? null : newStartDate,
        end_date: newEndDate === this.formData?.end ? null : newEndDate,
        title: this.form.title,
        description: this.form.description,
        image: this.form?.image,
        original_image_extension: this.formData?.original_image_extension,
      };

      Object.keys(data).forEach((key) => (!data[key] ? delete data[key] : {}));

      if (this.formData) {
        // Es un update
        data.id = this.formData.id;
      }

      const form = new FormData();

      Object.entries(data).forEach(([key, val]) => {
        form.append(key, val);
      });
      try {
        await this.$axios[this.formData ? "$put" : "$post"](
          "/api/events",
          form
        );
        this.$emit("closeSidebar");
      } catch (error) {
        this.$reportNetworkError(error);
      }
    },
    formatDate(str) {
      // Cambiar valor de DD/MM/YYYY a MM/DD/YYYY
      const split = str.split("/");
      const date = [split[1], split[0], split[2]].join("/");
      return formatDate(date);
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
