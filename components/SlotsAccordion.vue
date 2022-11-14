<template>
  <accordion
    id="c-accordion"
    ref="accordion"
    :items="weekdays"
    class="!border-0"
    :default-index="defaultIndex"
    @accordion:select="scrollDown"
  >
    <template #title="{ item }">
      <span
        :ref="`accordionHead${item.title}`"
        :data-test="item.title"
        class="flex mr-2 w-full justify-between"
      >
        <span class="font-bold text-xs text-black weekday">{{
          item.title
        }}</span>
        <icon-button
          v-if="edit"
          :data-test="item.title.toLowerCase() + '_add_btn'"
          class="bg-primary-darkblue shadow-md p-1.5 duration-500 hover:scale-105"
          type="button"
          @click.native="openForm(item)"
        >
          <img src="~/assets/images/plus.svg" alt="Agregar" class="h-4" />
        </icon-button>
      </span>
    </template>
    <template #content="{ item }">
      <div
        v-show="showAddForm"
        v-if="edit"
        :data-test="item.title.toLowerCase() + '_acc_body'"
      >
        <slots-accordion-form
          :filtered-teachers="filteredTeachers"
          :filtered-subjects="filteredSubjects"
          :selected-teachers.sync="selectedTeachers"
          :selected-subject-id.sync="selectedSubjectId"
          :time.sync="time"
          data-test="slots-accordion-form"
          @add-assignment="addAssignment"
        />
      </div>
      <span v-show="!showAddForm">
        <transition-group name="list" class="h-full w-full">
          <span
            v-for="assignment in assignments.filter(
              (el) => el.weekday === item.title
            )"
            :key="JSON.stringify(assignment)"
            class="flex flex-col flex-wrap w-full justify-between"
          >
            <slots-accordion-item
              :assignment="{
                ...assignment,
                subject_name: subjects_names[assignment.subject_id],
              }"
              :edit="edit"
              data-test="slots-accordion-item"
              :first-prop-to-show="firstPropToShow"
              @delete-assignment="deleteAssignment"
              @edit-assignment="editAssignment"
            />
            <hr class="my-2 text-primary-lightblue w-full" />
          </span>
        </transition-group>
      </span>
    </template>
    <template #toggle="{ active }">
      <img
        v-if="active"
        class="h-6 filter invert"
        src="~/assets/images/close-icon.svg"
        alt="Cerrar"
      />
      <img
        v-else
        class="h-6"
        src="~/assets/images/chevron.svg"
        alt="Abrir"
        @click="showAddForm = false"
      />
    </template>
  </accordion>
</template>

<script>
import accordion from "@dzangolab/vue-accordion";
import "@dzangolab/vue-accordion/dist/accordion.css";
import generate_id from "../mixins/generateId";

export default {
  components: {
    accordion,
  },
  mixins: [generate_id],
  props: {
    assignments: {
      type: Array,
      default: () => [],
    },
    teachers: {
      type: Array,
      default: () => [],
    },
    edit: {
      type: Boolean,
      default: true,
    },
    defaultIndex: {
      type: Number,
      default: 0,
    },
    firstPropToShow: {
      type: String,
      default: "subject",
    },
  },
  data() {
    return {
      weekdays: [
        { title: "Lunes", content: "" },
        { title: "Martes", content: "" },
        { title: "Miércoles", content: "" },
        { title: "Jueves", content: "" },
        { title: "Viernes", content: "" },
      ],
      time: {
        from: undefined,
        to: undefined,
      },
      subjects: [],
      showAddForm: false,
      selectedTeachers: [],
      selectedSubjectId: undefined,
      indexEditing: false,
    };
  },
  async fetch() {
    try {
      const subjects = await this.$axios.$get("/api/subjects");
      this.subjects = subjects.map(({ id, name, ...rest }) => ({
        value: id,
        label: name,
        ...rest,
      }));
    } catch (error) {
      this.$reportNetworkError(error);
    }
  },
  computed: {
    filteredSubjects() {
      if (!this.selectedTeachers[0]) {
        return this.subjects;
      }
      const teachersIds = this.selectedTeachers.map((el) => el.value);
      const subjects = this.subjects.filter((el) =>
        teachersIds.every((t) => el.teachers_ids.includes(t))
      );
      return subjects;
    },
    filteredTeachers() {
      const subjects = this.filteredSubjects.flatMap((el) => el.teachers_ids);
      const validTeachersIdsAccordingToSubject = this.selectedSubjectId
        ? this.subjects.filter((el) => el.value === this.selectedSubjectId)[0]
            .teachers_ids
        : "all";

      // Obtener a los profesores que tienen alguna de esas materia
      // y que concuerdan con la materia seleccionada si el input un valor
      const filtered = this.teachers.filter(
        (el) =>
          subjects.includes(el.value) &&
          (validTeachersIdsAccordingToSubject === "all"
            ? true
            : validTeachersIdsAccordingToSubject.includes(el.value))
      );
      return filtered;
    },
    subjects_names() {
      return Object.fromEntries(
        this.subjects.map((el) => [el.value, el.label])
      );
    },
  },
  watch: {
    filteredSubjects(newValue) {
      // Si hay solo una opción, actualizar el estado
      if (newValue?.length === 1) {
        this.selectedSubjectId = newValue[0].value;
      }
    },
    selectedTeachers(newValue) {
      if (newValue?.length === 0) {
        this.selectedSubjectId = undefined;
      }
    },
  },
  methods: {
    resetValues() {
      this.indexEditing = false;
      this.showAddForm = false;
      this.selectedTeachers = [];
      this.selectedSubjectId = undefined;
      this.indexEditing = false;
      this.time = {
        from: undefined,
        to: undefined,
      };
    },
    openForm(item) {
      this.resetValues();
      this.showAddForm = true;
      // Si ya está abierto el acordión, se va a cerrar
      // por eso es que hay que volverlo a abrir
      if (
        this.weekdays.findIndex(
          (el) => JSON.stringify(el) === JSON.stringify(item)
        ) === this.$refs.accordion.$data.index
      ) {
        setTimeout(() => {
          this.clickAccordion(item.title);
        }, 750);
      }
    },
    clickAccordion(title) {
      this.showAddForm = false;
      this.$refs[`accordionHead${title}`].click();
    },
    addAssignment() {
      // https://stackoverflow.com/questions/8935414/getminutes-0-9-how-to-display-two-digit-numbers
      const getTime = (date) =>
        `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:${
          date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
        }`;
      const title = this.weekdays[this.$refs.accordion.$data.index]?.title;
      this.clickAccordion(title);
      const data = {
        teachers: this.selectedTeachers,
        subject_id: this.selectedSubjectId,
        start_time: getTime(this.time.from),
        end_time: getTime(this.time.to),
        weekday: title,
        local_id: this.generate_id(),
      };
      this.$emit("update:assignments", [
        ...this.assignments.filter((el, index) => index !== this.indexEditing),
        data,
      ]);
      this.resetValues();
      setTimeout(() => {
        this.clickAccordion(title);
      }, 750);
    },
    deleteAssignment(item) {
      const filtered_assignents = this.assignments.filter(
        (el) => el.local_id !== item.local_id
      );
      this.$emit("update:assignments", filtered_assignents);
      const title = this.weekdays[this.$refs.accordion.$data.index]?.title;
      this.clickAccordion(title);
      setTimeout(() => {
        this.clickAccordion(title);
      }, 750);
    },
    editAssignment(item) {
      this.indexEditing = this.assignments.findIndex(
        (el) => item.local_id === el.local_id
      );
      this.$refs[`accordionHead${item.weekday}`].click();
      this.showAddForm = true;
      // Poner valores iniciales
      const setHoursAndMinutes = (time) => {
        const [hours, minutes] = time.split(":");
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return date;
      };
      this.selectedTeachers = item.teachers.filter(Boolean);
      this.selectedSubjectId = item.subject_id;
      this.time.from = setHoursAndMinutes(item.start_time);
      this.time.to = setHoursAndMinutes(item.end_time);
      setTimeout(() => {
        this.$refs[`accordionHead${item.weekday}`] &&
          this.$refs[`accordionHead${item.weekday}`].click();
      }, 750);
    },
    scrollDown(el) {
      this.$emit("update_index", el);
      setTimeout(() => {
        this.$parent.$parent.$el.children[0].scrollTo({
          top: this.$parent.$parent.$el.children[0].scrollHeight / 7,
          behavior: "smooth",
        });
      }, 300);
    },
  },
};
</script>
<style scoped>
#c-accordion :deep(.c-accordion__title) {
  @apply bg-white-full border-0 p-2 !rounded-t;
}
#c-accordion :deep(.c-accordion__item) {
  @apply border-0 my-4;
}
#c-accordion :deep(.c-accordion__content) {
  @apply bg-white-full border-t border-primary-lightblue rounded-b !border-b-0 !p-4;
}

#c-accordion :deep(.c-accordion__body) {
  @apply !overflow-x-hidden !overflow-y-auto;
}
</style>
