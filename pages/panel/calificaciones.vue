<template>
  <main class="p-8" v-if="shouldRender">
    <div>
      <!-- <v-subtitle class="mb-8"> Calificaciones </v-subtitle> -->
      <span class="p-4 shadow rounded-lg flex flex-col flex-wrap w-fit h-fit">
        <span class="flex justify-between items-center">
          <h3 class="text-sm font-bold text-black">Exámenes</h3>
          <SmallButton
            class="!w-min whitespace-nowrap my-2"
            @click.native="addExam = true"
            >Añadir Examen</SmallButton
          >
        </span>
        <span class="w-96">
          <OutlinedPrimaryButton
            v-for="(exam, idx) in evaluativeActivities"
            :class="{ ' ml-8 ': idx > 0 }"
            :key="exam.id"
            class="!text-xs !font-medium !px-3 !rounded-full m-1 inline-block !border-primary-blue !shadow-none"
            @click.native="updateExamSelected(exam)"
          >
            <span class="inline-flex items-center">
              {{ exam.title }}
              <img
                src="~/assets/images/pencil.svg"
                class="h-4 w-4 ml-4"
                alt="Editar"
              />
            </span>
          </OutlinedPrimaryButton>
        </span>
      </span>
      <span
        class="flex max-w-lg flex-col mb-8 mt-8 p-4 border rounded-md w-min mr-auto border-gray-light"
        v-if="
          evaluativeActivitiesForFilter.length > 0 &&
          classesForFilter.length > 0
        "
      >
        <h3 class="text-sm font-bold text-black mb-4">Calificar</h3>
        <span class="flex flex-wrap md:flex-nowrap items-center">
          <div class="flex flex-col mr-16">
            <v-label class="mb-2">Examen</v-label>
            <v-dropdown
              v-model="examToCorrect"
              ref="dropdown-filter-exam"
              :options="evaluativeActivitiesForFilter"
            ></v-dropdown>
          </div>
          <div class="flex flex-col">
            <v-label class="mb-2">Clase</v-label>
            <v-dropdown
              v-model="selectedClassFilter"
              ref="dropdown-filter-class"
              :options="classesForFilter"
            ></v-dropdown>
          </div>
          <!-- remove filters buttons -->
          <icon-button
            :disabled="!(selectedClassFilter || parsedExamToCorrect)"
            class="hover-effect ml-20 h-9 w-9 mt-2"
            :class="[
              selectedClassFilter || parsedExamToCorrect
                ? 'bg-red-light'
                : 'bg-gray-light',
            ]"
            @click.native="removeFilters()"
          >
            <img
              src="~/assets/images/trash.svg"
              :style="{
                filter: !(selectedClassFilter || parsedExamToCorrect)
                  ? 'brightness(0) invert(0.45)'
                  : null,
              }"
              alt="Eliminar Filtros"
            />
          </icon-button>
        </span>
      </span>
    </div>

    <transition name="fade">
      <VTable
        v-if="examToCorrect"
        :items="filteredStudents"
        :headers="tableHeaders"
        @editGrades="editGrades"
      >
        <template #nextToHeader="{ header }">
          <icon-button
            class="w-8 h-8 hover-effect ml-2"
            v-if="headerThatIsBeingEdited !== header.id && header.id"
            @click.native="headerThatIsBeingEdited = header.id"
          >
            <img src="~/assets/images/pencil.svg" alt="Editar" />
          </icon-button>
        </template>
        <template #edit="{ header, item }">
          <v-text-input
            type="number"
            :value="item[header.id]"
            @input.native="
              () => {
                if (
                  Number($event.target.value) > 10 ||
                  Number($event.target.value) < 0
                ) {
                  $event.target.value = '';
                } else {
                  item.listeners.input($event.target.value, item, header);
                }
              }
            "
            class="!w-min"
            v-if="header.grade_type === 'Numérica'"
          />
          <VDropdown
            class="w-full"
            :value="item[header.id]"
            v-else
            :options="
              grade_types.find((el) => el.grade_type === 'Conceptual').grades
            "
            @change.native="
              item.listeners.input($event.target.value, item, header)
            "
          />
        </template>
      </VTable>
    </transition>
    <transition name="fade">
      <lazy-v-sidebar
        v-if="addExam"
        :title="sidebarTitle"
        @closeSidebar="closeSidebar('cross_btn')"
      >
        <template #content>
          <LayoutsExamsForm
            :classes="teacherClasses"
            :removeForm="removeForm"
            :teacher_subjects="teacher_subjects"
            :subjects="subjects"
            :teachers="teachers"
            @closeSidebar="closeSidebar"
            :exam-data="examData"
          />
        </template>
      </lazy-v-sidebar>
    </transition>
    <transition name="fade">
      <feedback-card
        v-if="show_notification"
        class="top-auto mr-2 mb-12 right-0 bottom-0 w-72 z-50 fixed !shadow-lg"
        :is-success="show_notification !== 'error'"
        :title="
          show_notification !== 'error' ? '¡Guardado!' : 'Ha ocurrido un error'
        "
      />
    </transition>
    <transition name="fade">
      <SmallButton
        class="ml-2 !bg-green right-16 bottom-8 z-50 fixed"
        @click.native="updateGrades"
        v-if="updatedGrades.length > 0"
      >
        Guardar
      </SmallButton>
    </transition>
  </main>
</template>

<script>
import { grade_types } from "~/utils/grade_types.js";

export default {
  data() {
    return {
      headerThatIsBeingEdited: null,
      show_notification: false,
      grade_types,
      addExam: false,
      removeForm: false,
      limit: 30,
      selectedClassFilter: null,
      offset: 0,
      updatedGrades: [],
      examToCorrect: null,
      examData: {},
    };
  },
  async asyncData({ store, redirect, $axios, $reportNetworkError }) {
    const groups = store.state.authentication.user_data.groups;
    const teacherClassesIds = store.state.authentication.user_data.classes_ids;
    const getAllClasses = $axios.$get("/api/classes/");
    const getSubjects = $axios.$get("/api/subjects/");
    const getEvaluativeActivities = $axios.$get("/api/evaluative-activities/");
    const getStudents = $axios.$get("/api/students/", {
      params: {
        classes_ids: JSON.stringify(teacherClassesIds),
      },
    });
    const getAllTeachers = $axios.$get("/api/teachers/");
    const teacherClassesNames = store.state.authentication.user_data.subjects;
    if (!groups.includes("teacher")) {
      return redirect("/iniciar-sesion");
    }
    try {
      const [classes, subjects, teachers, students, evaluativeActivities] =
        await Promise.all([
          getAllClasses,
          getSubjects,
          getAllTeachers,
          getStudents,
          getEvaluativeActivities,
        ]);
      const teacherClasses = classes?.filter((classroom) =>
        teacherClassesIds.includes(classroom.id)
      );
      const teacher_subjects = subjects?.filter((subject) =>
        teacherClassesNames.includes(subject.name)
      );
      const studentGrades = Object.fromEntries(
        evaluativeActivities?.flatMap((el) => {
          return el.grades.map((el2) => [
            el2.student_id,
            { [el.id]: el2.grade },
          ]);
        })
      );
      return {
        classes,
        teacherClasses,
        teacher_subjects,
        subjects: subjects?.map(({ name, ...el }) => ({
          class: name,
          ...el,
        })),
        teachers,
        evaluativeActivities,
        // add { exam_id: student_grade }
        students: students.map((el) => {
          return { ...el, ...studentGrades[el.id] };
        }),
      };
    } catch (error) {
      $reportNetworkError(error);
    }
  },
  computed: {
    parsedExamToCorrect() {
      return this.examToCorrect ? JSON.parse(this.examToCorrect) : null;
    },
    sidebarTitle() {
      return this.addExam ? "Añadir Examen" : "Editar Examen";
    },
    shouldRender() {
      return this.$store.state.authentication.user_data?.groups.includes(
        "teacher"
      );
    },
    filteredStudents() {
      const updatedGrades = this.updatedGrades;
      const formattedStudents = this.students.map((el) => ({
        ...el,
        listeners: {
          input($event, item, header) {
            // remove any that had same student_id and same evaluative_activity_id before pushing the new one
            const prevGrade = updatedGrades.findIndex(
              (el) =>
                el.student_id === item.id &&
                el.evaluative_activity_id === header.id
            );
            if (prevGrade !== -1) {
              updatedGrades.splice(prevGrade, 1);
            }
            updatedGrades.push({
              student_id: item.id,
              evaluative_activity_id: header.id,
              grade: $event,
            });
          },
        },
      }));
      return !this.parsedExamToCorrect
        ? formattedStudents.slice(this.offset, this.offset + this.limit)
        : formattedStudents.filter((el) =>
            this.selectedClassFilter
              ? this.selectedClassFilter === el.class_id
              : this.parsedExamToCorrect.classes.includes(el.class_id)
          );
    },
    tableHeaders() {
      return [
        { props: ["student_name"], label: "Nombre" },
        ...(this.parsedExamToCorrect
          ? [this.parsedExamToCorrect]
          : this.evaluativeActivities
        ).map((activity) => ({
          ...activity,
          props: [activity.id],
          label: activity.title,
          mode:
            this.headerThatIsBeingEdited === activity.id ? "edit" : "default",
          fallback: "-",
          classes: ["text-center"],
          spanClasses: ["justify-center"],
        })),
      ];
    },
    classesForFilter() {
      return this.classes
        .filter(
          (el) =>
            (this.parsedExamToCorrect &&
              this.parsedExamToCorrect.classes.includes(el.id)) ||
            (!this.parsedExamToCorrect &&
              this.evaluativeActivities.some((exam) =>
                exam.classes.includes(el.id)
              ))
        )
        .map((el) => ({ value: el.id, label: el.class }));
    },
    evaluativeActivitiesForFilter() {
      return this.evaluativeActivities
        .filter((el) =>
          this.selectedClassFilter && el && el.classes
            ? el.classes.includes(this.selectedClassFilter)
            : true
        )
        .map((el) => ({
          value: JSON.stringify(el),
          label: el.title,
        }));
    },
  },
  watch: {
    class_id() {
      this.examToCorrect = "";
    },
    classesForFilter(new_val, old_val) {
      if (
        new_val.length === 1 &&
        new_val[0] &&
        JSON.stringify(new_val) !== JSON.stringify(old_val)
      ) {
        this.selectedClassFilter = new_val[0].value;
      }
    },
  },
  methods: {
    removeFilters() {
      this.selectedClassFilter = "";
      this.examToCorrect = "";
      // remove value from dropdowns
      this.$nextTick(() => {
        this.$refs["dropdown-filter-class"].$el.value = "";
        this.$refs["dropdown-filter-exam"].$el.value = "";
      });
    },
    updateExamSelected(exam) {
      const not_user = exam.teachers_subjects.filter(
        (el) => el.teacher_id !== this.$store.state.authentication.user_data.id
      );
      this.examData = {
        title: exam.title,
        dates: exam.dates.map((el) => ({
          date: new Date(el),
          id: new Date(el).toISOString(),
        })),
        id: exam.id,
        classes: exam.classes.map((el) =>
          this.classes.find((classroom) => classroom.id === el)
        ),
        min_grade_to_pass: exam.min_grade_to_pass,
        grade_type: exam.grade_type,
        teacher_subject: exam.teachers_subjects.find(
          (el) =>
            el.teacher_id === this.$store.state.authentication.user_data.id
        ).subject_id,
        other_subjects: not_user.map((el) =>
          subjects.find((el2) => el2.id === el.subject_id)
        ),
        other_teachers: not_user.map((el) =>
          teachers.find((el2) => el2.id === el.teacher_id)
        ),
      };
      this.addExam = true;
    },
    closeSidebar(source) {
      this.addExam = false;
      if (source === "cross_btn" || source === "cancel") {
        return;
      }
      if (source === "error") {
        this.show_notification = "error";
        setTimeout(() => {
          this.show_notification = false;
        }, 5000);
        return;
      }
      this.$nuxt.refresh();
      this.show_notification = true;
      this.examData = {};
      setTimeout(() => {
        this.show_notification = false;
      }, 5000);
    },
    editGrades(item) {
      this.itemThatIsBeingEdited = item.id;
    },
    async updateGrades() {
      console.log(
        this.updatedGrades.map((el) => ({
          ...el,
          teacher_id: this.$store.state.authentication.user_data.id,
        }))
      );
      try {
        this.$axios.put("/api/evaluative-activities/grades", {
          grades: this.updatedGrades.map((el) => ({
            ...el,
            teacher_id: this.$store.state.authentication.user_data.id,
          })),
        });
        this.show_notification = true;
        // update updated grades client-side
        this.students = this.students.map((student) => {
          return {
            ...student,
            ...Object.fromEntries(
              this.updatedGrades
                .filter((el) => el.student_id === student.id)
                .map((el) => [el.evaluative_activity_id, el.grade])
            ),
          };
        });
        this.updatedGrades = [];
      } catch (error) {
        this.$reportNetworkError(error);
        this.show_notification = "error";
      }

      this.headerThatIsBeingEdited = null;
      setTimeout(() => {
        this.show_notification = false;
      }, 5000);
    },
  },
};
</script>
