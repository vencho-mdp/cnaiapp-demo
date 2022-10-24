<template>
  <!-- <delete-item-confirmation
    v-if="removeForm"
    @handleCancelButtonClick="$emit('closeSidebar', 'cross_btn')"
  /> -->
  <form
    class="flex flex-col flex-grow mx-4 gap-8 justify-evenly"
    @submit.prevent="send_data"
  >
    <div class="flex">
      <div class="flex flex-col flex-grow mr-2 justify-between">
        <v-label class="mb-2 !text-white"> Título </v-label>
        <v-text-input
          class="w-full"
          :value="form.title"
          @input.native="form.title = $event.target.value"
        />
      </div>
    </div>
    <div class="flex">
      <div class="flex flex-col flex-grow mr-2 justify-between">
        <v-label class="mb-2 !text-white"> Tipo de nota </v-label>
        <VDropdown
          class="w-full"
          :options="grade_types.map((el) => el.grade_type)"
          :value="form.grade_type"
          @change.native="form.grade_type = $event.target.value"
        />
      </div>
    </div>
    <div class="flex">
      <div class="flex flex-col flex-grow mr-2 justify-between">
        <v-label class="mb-2 !text-white"> Mínima nota aprobatoria </v-label>
        <VDropdown
          class="w-full"
          v-if="form.grade_type !== 'Numérica'"
          :options="
            form.grade_type
              ? grade_types.find((el) => el.grade_type === form.grade_type)
                  .grades
              : []
          "
          :value="form.min_grade_to_pass"
          @input.native="form.min_grade_to_pass = $event.target.value"
        />
        <v-text-input
          class="w-full"
          v-else
          :value="form.min_grade_to_pass"
          @input.native="
            () => {
              if ($event.target.value > 10 || $event.target.value < 0) {
                form.min_grade_to_pass = $event.target.value = '';
              } else {
                form.min_grade_to_pass = Number($event.target.value);
              }
            }
          "
          type="number"
        />
      </div>
    </div>
    <div class="flex flex-col mb-1 justify-between">
      <v-label class="mb-2 !text-white"> Fecha/s </v-label>
      <v-calendar
        :is-expanded="true"
        :attributes="attributes"
        @dayclick="onDayClick"
        :popover="{ visibility: null }"
        locale="es"
        is-required
        :disabled-dates="{ weekdays: [1, 7] }"
        multiple
      />
    </div>
    <div class="flex flex-col mb-1 justify-between">
      <v-label class="mb-2 !text-white"> Clases </v-label>
      <multiselect
        v-model="form.classes"
        class="border-2 rounded-xl !w-full border-gray-light bg-white-full !box-border py-1 multiselect"
        :options="classes"
        :multiple="true"
        :hide-selected="true"
        select-label=""
        :show-no-results="false"
        placeholder=""
        label="class"
        maxElements=" "
        track-by="id"
      >
        <template #tag="{ option, remove }">
          <span
            class="bg-primary-lightblue font-bold flex justify-around items-center p-2 w-min rounded-sm text-black"
          >
            {{ option.class.replaceAll(" ", "&nbsp;") }}
            <icon-button
              class="!p-0.5 !rounded-sm h-4 w-4 bg-red ml-2 !block"
              type="button"
              @click.native="remove(option)"
            >
              <img src="~/assets/images/close-icon.svg" alt="Eliminar" />
            </icon-button>
          </span>
        </template>
      </multiselect>
    </div>
    <div class="flex flex-col mb-1 justify-between">
      <v-label class="mb-2 !text-white"> Materia </v-label>
      <VDropdown
        :options="
          teacher_subjects.map((el) => ({
            label: el.name,
            value: el.id,
          }))
        "
        :value="form.teacher_subject"
        @input.native="form.teacher_subject = $event.target.value"
      />
    </div>
    <div
      class="flex items-center justify-between shadow border border-gray-200 rounded p-2"
    >
      <v-label for="checked-checkbox" class="ml-2 !text-white"
        >¿Es interdisciplinario?</v-label
      >
      <input
        checked
        id="checked-checkbox"
        type="checkbox"
        v-model="showSubjectsInput"
        value=""
        class="w-4 h-4 accent-primary-blue bg-white rounded border-primary-lightblue focus:ring-blue-500 focus:ring-2 shadow"
      />
    </div>
    <div class="flex flex-col mb-1 justify-between" v-if="showSubjectsInput">
      <v-label class="mb-2 !text-white"> Materias </v-label>
      <multiselect
        v-model="form.other_subjects"
        class="border-2 rounded-xl !w-full border-gray-light bg-white !box-border py-1 multiselect"
        :options="subjects.filter((el) => el.id !== form.teacher_subject)"
        :multiple="true"
        :hide-selected="true"
        select-label=""
        :show-no-results="false"
        placeholder=""
        label="class"
        maxElements=" "
        no-options="No hay materias"
        track-by="id"
      >
        <template #tag="{ option, remove }">
          <span
            class="bg-primary-lightblue font-bold flex justify-around items-center p-2 w-min rounded-sm text-black"
          >
            {{ option.class.replaceAll(" ", "&nbsp;") }}
            <icon-button
              class="!p-0.5 !rounded-sm h-4 w-4 bg-red ml-2 !block"
              type="button"
              @click.native="remove(option)"
            >
              <img src="~/assets/images/close-icon.svg" alt="Eliminar" />
            </icon-button>
          </span>
        </template>
      </multiselect>
    </div>
    <div class="flex flex-col mb-1 justify-between" v-if="showSubjectsInput">
      <v-label class="mb-2 !text-white"> Profesores </v-label>
      <multiselect
        v-model="form.other_teachers"
        class="border-2 rounded-xl !w-full border-gray-light bg-white-full !box-border py-1 multiselect"
        :options="otherTeacherOptions"
        :multiple="true"
        :hide-selected="true"
        select-label=""
        :show-no-results="false"
        :searchable="false"
        placeholder=""
        label="full_name"
        track-by="id"
      >
        <template #tag="{ option, remove }">
          <span
            class="bg-primary-lightblue font-bold flex justify-around items-center p-2 w-min rounded-sm text-black"
          >
            {{ option.full_name.replaceAll(" ", "&nbsp;") }}
            <icon-button
              class="!p-0.5 !rounded-sm h-4 w-4 bg-red ml-2 !block"
              type="button"
              @click.native="remove(option)"
            >
              <img src="~/assets/images/close-icon.svg" alt="Eliminar" />
            </icon-button>
          </span>
        </template>
        <template #noOptions> No hay profesores disponibles </template>
      </multiselect>
    </div>
    <form-buttons
      class="my-6"
      type="submit"
      :is-add-button-invalid="!isFormValid"
      @handleCancelButtonClick="$emit('closeSidebar', 'cancel')"
    />
  </form>
</template>
<script>
import multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
import removeTimeFromDate from "~/utils/removeTimeFromDate";
import { grade_types } from "../../utils/grade_types";
export default {
  components: {
    multiselect,
  },
  props: {
    examData: {
      type: Object,
      default: () => {},
    },
    classes: {
      type: Array,
      default: () => [],
    },
    removeForm: {
      type: Boolean,
      default: false,
    },
    teacher_subjects: {
      type: Array,
      default: () => [],
    },
    subjects: {
      type: Array,
      default: () => [],
    },
    teachers: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      showSubjectsInput: this.examData?.other_teachers?.length > 0,
      grade_types,
      form: {
        title: this.examData.title || "",
        classes: this.examData.classes || [],
        teacher_subject: this.examData.teacher_subject || "",
        other_subjects: this.examData.other_subjects || [],
        other_teachers: this.examData.other_teachers || [],
        dates: this.examData.dates || [],
        grade_type: this.examData.grade_type || "",
        min_grade_to_pass: this.examData.min_grade_to_pass || "",
        // TODO:
        // typeOfGradeSystem: this.examData.typeOfGradeSystem || "Numérica",
      },
    };
  },
  methods: {
    async send_data() {
      const data = {
        dates: this.dates.map((el) => removeTimeFromDate(el)),
        title: this.form.title,
        classes: this.form.classes.map((el) => el.id),
        grade_type: this.form.grade_type,
        min_grade_to_pass: this.form.min_grade_to_pass,
        subjects_and_teachers_involved: [
          {
            teacher_id: this.$store.state.authentication.user_data.id,
            subject_id: this.form.teacher_subject,
          },
          ...this.form.other_teachers.map((el) => ({
            teacher_id: el.id,
            subject_id: el.subject.id,
          })),
        ],
      };
      if (this.examData.id) {
        data.id = this.examData.id;
      }
      try {
        await this.$axios[this.examData.id ? "$put" : "$post"](
          "/api/evaluative-activities/",
          data
        );
        this.$emit("closeSidebar", "success");
      } catch (error) {
        console.log(error);
        this.$emit("closeSidebar", "error");
      }
    },
    onDayClick(day) {
      const idx = this.form.dates.findIndex((d) => d.id === day.id);
      const isDayWeekend = day.weekday === 1 || day.weekday === 7;
      if (isDayWeekend) return;
      if (idx >= 0) {
        this.form.dates.splice(idx, 1);
      } else {
        this.form.dates.push({
          id: day.id,
          date: day.date,
        });
      }
    },
  },
  watch: {
    showSubjectsInput() {
      if (!this.showSubjectsInput) {
        this.form.other_subjects = [];
        this.form.other_teachers = [];
      }
    },
    "form.grade_type"() {
      if (this.form.grade_type === "Conceptual") {
        this.form.min_grade_to_pass = "Bien";
      } else if (this.form.grade_type === "Numérica") {
        this.form.min_grade_to_pass = 7;
      }
    },
  },
  computed: {
    isFormValid() {
      return (
        this.form.title &&
        this.form.teacher_subject &&
        this.form.dates.length >= 1 &&
        this.form.other_subjects.length === this.form.other_teachers.length
      );
    },
    otherTeacherOptions() {
      const possibleSubjects = this.form.other_subjects.filter(
        (el) =>
          !this.form.other_teachers.some((el2) =>
            el.teachers_ids.includes(el2.id)
          )
      );
      return this.teachers
        .map(({ ...el }) => ({
          subject: possibleSubjects.find((el2) =>
            el2.teachers_ids.includes(el.id)
          ),
          ...el,
        }))
        .filter((el) => el.subject);
    },
    dates() {
      return this.form.dates.map((day) => day.date);
    },
    attributes() {
      return this.dates.map((date) => ({
        highlight: true,
        dates: date,
      }));
    },
  },
};
</script>
<style scoped>
@import "~/assets/css/third_party_components.css";
</style>
