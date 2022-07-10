<template>
  <form
    class="flex flex-col flex-grow mx-4 justify-evenly"
    @submit.prevent="add"
  >
    <div class="flex flex-col flex-grow justify-evenly">
      <div class="flex flex-col justify-between">
        <v-label class="mb-2 !text-white"> Profesor </v-label>
        <v-dropdown
          :options="['', ...teachers]"
          :value="form.teacher_id || ' '"
          class="w-full"
          @change.native="form.teacher_id = $event.target.value"
        />
      </div>
      <div class="flex w-full justify-center items-center">
        <div class="w-96">
          <v-label class="!text-white"> Fechas </v-label>
          <client-only>
            <v-date-picker
              v-model="form.dates"
              is-range
              locale="es"
              :min-date="new Date()"
            >
              <template #default="{ inputValue, inputEvents }">
                <!-- Cambiar fecha de DD/MM/YYYY a MM/DD/YYYY (en atributo value) -->
                <v-text-input
                  data-test="calendar"
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
    </div>

    <form-buttons
      :is-add-button-invalid="$v.$invalid"
      class="my-20"
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
      teachers: [],
      form: {
        teacher_id: this.formData?.teacher_id || "",
        dates: {
          start: this.formData?.start_date || "",
          end: this.formData?.end_date || "",
        },
      },
    };
  },
  async fetch() {
    const teachers = await this.$axios.$get("/api/teachers");
    teachers.forEach((teacher) => {
      teacher.value = teacher.id;
      teacher.label = teacher.full_name;
      delete teacher.id;
      delete teacher.full_name;
    });
    this.teachers = teachers;
  },
  validations: {
    form: {
      dates: {
        $each: {
          required,
        },
      },
      teacher_id: {
        required,
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
        start_date:
          newStartDate === this.formData?.start_date ? null : newStartDate,
        end_date: newEndDate === this.formData?.end_date ? null : newEndDate,
        teacher_id: this.form.teacher_id,
      };

      Object.keys(data).forEach((key) =>
        data[key] === null ? delete data[key] : {}
      );

      if (this.formData) {
        // Es un update
        data.id = this.formData.id;
      }
      try {
        await this.$axios[this.formData ? "$put" : "$post"](
          "/api/absent-teachers",
          data
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

<style></style>
