<template>
  <form
    class="flex flex-col flex-grow my-2 mx-4 justify-evenly"
    @submit.prevent="add"
  >
    <div class="flex">
      <div class="flex flex-col flex-grow mr-2 justify-between">
        <v-label class="mb-2 !text-white"> Año </v-label>
        <v-dropdown
          v-model="form.grade"
          :options="filteredCoursesOptions.grades"
          class="w-full"
          data-test="grade"
        />
      </div>
      <div class="flex flex-col flex-grow ml-2 justify-between">
        <v-label class="mb-2 !text-white"> División </v-label>
        <v-dropdown
          v-model="form.grade_number"
          :options="filteredCoursesOptions.gradesNumbers"
          class="w-full"
          date-test="grade_number"
        />
      </div>
    </div>
    <div class="flex flex-col mt-6 justify-between">
      <v-label class="!text-white"> Horario </v-label>
      <slots-accordion
        :teachers="teachers"
        first-prop-to-show="subject_name"
        :assignments.sync="form.assignments"
      />
    </div>
    <form-buttons
      :is-add-button-invalid="$v.$invalid"
      class="my-10"
      type="submit"
      @handleCancelButtonClick="$emit('closeSidebar', 'cancel')"
    />
  </form>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import areObjectsEqual from "@/utils/areObjectsEqual";

const gradesNumbers = ["1ra", "2da", "3ra", "4ta", "5ta"];
const grades = ["1ro", "2do", "3ro", "4to", "5to", "6to"];

const validateArray = (arr) => !!arr[0];
const hasASubjectMinPerDay = (arr) => {
  const days = arr.map((el) => el.weekday);
  const amountOfDaysNotRepeated = [...new Set(days)].length;
  return amountOfDaysNotRepeated === 5;
};

export default {
  props: {
    formData: {
      type: Object,
      default: () => null,
    },
    unsavedChanges: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      form: {
        grade: null,
        grade_number: null,
        assignments: [],
      },
      teachers: [],
      classes: [],
      hasFormBeenFormatted: false,
    };
  },
  watch: {
    form: {
      deep: true,
      handler(new_val) {
        if (areObjectsEqual(new_val, this.formatInitialData())) {
          this.$emit("update:unsavedChanges", false);
        } else {
          this.$emit("update:unsavedChanges", true);
        }
      },
    },
  },
  async fetch() {
    try {
      const classes = await this.$axios.$get("/api/classes");
      const teachers = await this.$axios.$get("/api/teachers");
      this.teachers = teachers.map(({ id, full_name }) => ({
        value: id,
        label: full_name,
      }));
      this.classes = classes.map((el) => el.class);
      if (this.formData) {
        this.form = this.formatInitialData();
      }
    } catch (error) {
      this.$reportNetworkError(error);
    }
  },
  computed: {
    filteredCoursesOptions() {
      const splittedClasses = this.classes.map((el) => el.split(" "));
      const findCoursesGradeNumbersWithSelectedGrade = splittedClasses
        .filter((el) => el[0] === this.form.grade)
        .map((el) => el[1]);
      const gradesThatHaveAllDivisions = splittedClasses
        .reduce((acc, cur) => {
          const index = acc.findIndex((el) => el.name === cur[0]);
          if (index === -1) {
            acc.push({
              name: cur[0],
              timesItAppears: 1,
            });
            return acc;
          }
          ++acc[index].timesItAppears;
          return acc;
        }, [])
        .filter((el) => el.timesItAppears === 5)
        .map((el) => el.name);
      let gradesNumbersFiltered = gradesNumbers.filter(
        (el) => !findCoursesGradeNumbersWithSelectedGrade.includes(el)
      );
      gradesNumbersFiltered = this.formData?.raw_label.split(" ")[1]
        ? [...gradesNumbersFiltered, this.formData?.raw_label.split(" ")[1]]
        : gradesNumbersFiltered;

      return {
        grades: [
          ...new Set(
            grades
              .filter((el) => !gradesThatHaveAllDivisions.includes(el))
              .concat(this?.formData?.raw_label.split(" ")[0])
          ),
        ],
        gradesNumbers: [
          ...new Set(
            gradesNumbersFiltered.concat(
              this?.formData?.raw_label.split(" ")[1]
            )
          ),
        ],
      };
    },
  },

  validations: {
    form: {
      grade: { required },
      grade_number: { required },
      assignments: { validateArray, hasASubjectMinPerDay },
    },
  },
  methods: {
    formatInitialData() {
      const [grade, grade_number] = this.formData.raw_label.split(" ");
      const res = { grade, grade_number, assignments: [] };
      for (const weekday of this.formData.schedule) {
        for (const assignment of weekday.assignments) {
          const {
            end_time,
            start_time,
            teachers_ids,
            subject,
            id,
            subject_id,
            teachers_names,
          } = assignment;
          res.assignments.push({
            weekday: weekday.weekday,
            end_time: end_time.slice(0, -3),
            start_time: start_time.slice(0, -3),
            // ternary for teacher "Natalia Escudero", weird case there
            // TODO: fix this (maybe check seeds)
            teachers:
              teachers_ids.length === 1 && teachers_names.length === 1
                ? [
                    {
                      label: teachers_names[0],
                      value: teachers_ids[0],
                    },
                  ]
                : teachers_ids.map((el) =>
                    this.teachers.find((teacher) => teacher.value === el)
                  ),
            // delete & edit
            local_id: id,
            subject_name: subject,
            subject_id,
          });
        }
      }
      return res;
    },
    async add() {
      const data = this.form.assignments.map(
        ({ local_id, subject_name, teachers, ...el }) => ({
          teachers_ids: teachers.map((el2) => el2?.value).filter(Boolean),
          ...el,
        })
      );
      try {
        if (this.formData) {
          await this.$axios.$put("/api/slots", {
            class_id: this.formData.class_id,
            grade: this.form.grade,
            grade_number: this.form.grade_number,
            assignments: data,
          });
        } else {
          await this.$axios.$post("/api/slots", {
            assignments: data,
            grade: this.form.grade,
            grade_number: this.form.grade_number,
          });
        }
        this.$emit("closeSidebar");
      } catch (error) {
        this.$reportNetworkError(error);
      }
    },
  },
};
</script>
