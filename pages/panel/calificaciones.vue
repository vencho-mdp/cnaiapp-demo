<template>
  <main class="p-8" v-if="shouldRender">
    <span
      class="flex flex-col mb-8 mt-8 p-4 border rounded-md mr-auto border-gray-light"
    >
      <span class="flex items-center mb-4">
        <h3 class="text-sm font-bold text-black">Calificar</h3>
        <icon-button
          class="bg-primary-darkblue shadow-md duration-500 hover:scale-105 h-6 w-6 !p-1.5 ml-4"
          @click.native="addExam = true"
        >
          <img src="~/assets/images/plus.svg" alt="Eliminar" />
        </icon-button>
      </span>
      <span class="flex flex-wrap md:flex-nowrap items-center"
        ><div class="flex flex-col">
          <v-label class="mb-2">Clase</v-label>
          <v-dropdown
            v-model="selectedClassFilter"
            :options="classesForFilter"
          ></v-dropdown>
        </div>
        <div class="flex flex-col mx-8">
          <v-label class="mb-2">Materia</v-label>
          <v-dropdown
            v-model="selectedSubjectFilter"
            :options="subjectsForFilter"
          ></v-dropdown>
        </div>
        <div class="flex flex-col">
          <v-label class="mb-2">Evaluación</v-label>
          <v-dropdown
            v-model="examToCorrect"
            :options="evaluativeActivitiesForFilter"
          ></v-dropdown>
        </div>
        <!-- remove filters buttons -->
        <icon-button
          :disabled="!(selectedClassFilter || parsedExamToCorrect)"
          class="hover-effect ml-12 h-10 w-10 p-2 mt-2"
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
            class="w-8 h-8"
            alt="Eliminar Filtros"
          />
        </icon-button>
        <SmallButton
          @click.native="exportGrades"
          class="!w-min ml-auto"
          :disabled="!isExportGradesBtnValid"
        >
          <img
            src="~/assets/images/export.svg"
            class="h-8 w-6 !max-w-max"
            alt="Exportar"
          />
        </SmallButton>
      </span>
    </span>
    <transition name="fade">
      <VTable
        v-if="
          examToCorrect && selectedClassFilter && filteredStudents.length > 0
        "
        :items="filteredStudentsWithGradeColorIndicator"
        :headers="tableHeaders"
        @editGrades="editGrades"
      >
        <template #nextToHeader="{ header }">
          <icon-button
            class="w-8 h-8 hover-effect ml-2"
            v-if="
              headerThatIsBeingEdited !== header.id &&
              header.id &&
              parsedExamToCorrect.id === header.id
            "
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
              function () {
                const parsedVal = Number($event.target.value);
                if (
                  parsedVal > 10 ||
                  parsedVal < 0 ||
                  (header.type === 'final_grade' &&
                    parsedVal % 1 !== 0 &&
                    parsedVal % 1 !== 0.5)
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
        class="ml-2 !bg-green mt-8"
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

const EVAL_TYPES_NAMES = {
  exam: "Examen",
  practical_work: "Trabajo Práctico",
  makeup: "Recuperatorio",
};

export default {
  data() {
    return {
      headerThatIsBeingEdited: null,
      show_notification: false,
      grade_types,
      addExam: false,
      removeForm: false,
      selectedClassFilter: null,
      updatedGrades: [],
      examToCorrect: null,
      selectedSubjectFilter: null,
      typeOfEval: null,
      examData: {},
    };
  },
  async asyncData({ store, redirect, $axios, $reportNetworkError }) {
    const groups = store.state.authentication.user_data.groups;
    const teacherClassesIds = store.state.authentication.user_data.classes_ids;
    const getAllClasses = $axios.$get("/api/classes/");
    const getSubjects = $axios.$get("/api/subjects/");
    const getEvaluativeActivities = $axios.$get("/api/evaluative-activities/");
    const is_extracurricular_teacher =
      store.state.authentication.user_data.subjects.some((el) =>
        store.state.EXTRA_CURRICULAR_SUBJECTS.includes(el)
      );
    const getStudents = $axios.$get("/api/students/", {
      params: {
        classes_ids: JSON.stringify(teacherClassesIds),
        include_students_from_subjects: is_extracurricular_teacher,
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
        }) || []
      );
      return {
        classes,
        teacherClasses,
        teacher_subjects,
        subjects: subjects?.map?.(({ name, ...el }) => ({
          class: name,
          ...el,
        })),
        teachers,
        evaluativeActivities,
        // add { exam_id: student_grade }
        students: students?.map((el) => {
          return { ...el, ...studentGrades[el.id] };
        }),
      };
    } catch (error) {
      $reportNetworkError(error);
    }
  },
  computed: {
    filteredStudentsWithGradeColorIndicator() {
      if (!this.examToCorrect) {
        return this.filteredStudents;
      }
      const common_classes = "font-bold";
      const failed_classes = `${common_classes} text-red-500`;
      const passed_classes = `${common_classes} text-green-500`;
      // const min_grade = this.parsedExamToCorrect?.min_grade_to_pass;
      // const prop = `classes_${this.parsedExamToCorrect?.id}`;
      return this.filteredStudents.map((s) => {
        const { student_name, class_id, listeners, id, ...eval_activs } = s;
        const result = { student_name, class_id, listeners, id };
        for (const [key, value] of Object.entries(eval_activs)) {
          result[key] = value;
          const evaluative_activity = this.evaluativeActivities.find(
            (el) => el.id === key
          );
          const prop = `classes_${evaluative_activity.id}`;
          const min_grade = evaluative_activity.min_grade_to_pass;
          if (evaluative_activity.grade_type === "Numérica") {
            result[prop] =
              Number(value) < min_grade ? failed_classes : passed_classes;
          }
          if (this.parsedExamToCorrect.grade_type === "Conceptual") {
            const conceptualGrades = grade_types.find(
              (el) => el.grade_type === "Conceptual"
            ).grades;
            result[prop] =
              conceptualGrades.indexOf(value) <
              conceptualGrades.indexOf(min_grade)
                ? failed_classes
                : passed_classes;
          }
        }
        return result;
      });
    },
    typesOfEval() {
      const typesWithDuplicates = this.evaluativeActivities.map((el) => ({
        value: el.type,
        label: EVAL_TYPES_NAMES[el.type],
      }));
      // remove duplicates
      return typesWithDuplicates.filter(
        (el, index, self) =>
          index === self.findIndex((t) => t.value === el.value)
      );
    },
    parsedExamToCorrect() {
      return this.examToCorrect
        ? this.evaluativeActivities.find((el) => el.id === this.examToCorrect)
        : null;
    },
    sidebarTitle() {
      return this.addExam ? "Añadir Evaluación" : "Editar Evaluación";
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
            if (!item || !header) return;
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
        ? formattedStudents
        : formattedStudents.filter((el) =>
            this.selectedClassFilter
              ? this.selectedClassFilter.startsWith("[")
                ? JSON.parse(this.selectedClassFilter).includes(el.class_id)
                : this.selectedClassFilter === el.class_id
              : this.parsedExamToCorrect.classes.includes(el.class_id)
          );
    },
    tableHeaders() {
      return [
        { props: ["student_name"], label: "Nombre" },
        ...(this.parsedExamToCorrect &&
        this.parsedExamToCorrect.type !== "final_grade"
          ? [this.parsedExamToCorrect]
          : // move selected exam to first position
            this.evaluativeActivities
        )
          .filter((el) => {
            if (!this.selectedClassFilter) return true;
            return (
              el.classes.some((el) =>
                this.selectedClassFilter[0] === "["
                  ? !el
                  : el === this.selectedClassFilter
              ) &&
              //  ensure that at least one student has a grade on the exam or it is the selected exam
              (this.students.some((student) => student[el.id]) ||
                this.parsedExamToCorrect.id === el.id)
            );
          })
          .map((activity) => ({
            ...activity,
            props: [activity.id],
            label: activity.title,
            mode:
              this.headerThatIsBeingEdited === activity.id ? "edit" : "default",
            fallback: "-",
            classes: ["text-center"],
            spanClasses: ["justify-center"],
            order:
              this.parsedExamToCorrect?.id === activity.id ? Infinity : null,
          })),
      ];
    },
    classesForFilter() {
      const result = this.classes
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
      if (
        this.$store.state.authentication.user_data.subjects.some((el) =>
          this.$store.state.EXTRA_CURRICULAR_SUBJECTS.includes(el)
        )
      ) {
        const all5thGradeIds = this.classes
          .filter((el) => el.class.includes("5to"))
          .map((el) => el.id);
        const all6thGradeIds = this.classes
          .filter((el) => el.class.includes("6to"))
          .map((el) => el.id);
        if (all5thGradeIds.length > 0) {
          result.push({
            value: JSON.stringify(all5thGradeIds),
            label: "5tos",
          });
        }
        if (all6thGradeIds.length > 0) {
          result.push({
            value: JSON.stringify(all6thGradeIds),
            label: "6tos",
          });
        }
      }
      return result;
    },
    evaluativeActivitiesForFilter() {
      if (!this.selectedClassFilter || !this.selectedSubjectFilter) return [];
      const result = this.evaluativeActivities
        .filter(
          (el) =>
            // is array
            (this.selectedClassFilter[0] === "["
              ? el.classes.includes(null)
              : el.classes.includes(this.selectedClassFilter)) &&
            el.teachers_subjects
              .map((el) => el.subject_id)
              .includes(this.selectedSubjectFilter)
        )
        .map((el) => ({
          value: el.id,
          label: el.title,
        }));
      return result;
    },
    isExportGradesBtnValid() {
      return (
        this.filteredStudents.filter((el) => !el[this.parsedExamToCorrect?.id])
          .length === 0 && this.parsedExamToCorrect?.type === "final_grade"
      );
    },
    subjectsForFilter() {
      return this.$store.state.authentication.user_data?.subjects.map((el) => ({
        value: this.subjects.find((subject) => subject.class === el).id,
        label: el,
      }));
    },
  },
  watch: {
    class_id() {
      this.examToCorrect = null;
    },
  },
  methods: {
    async exportGrades() {
      const gradeHeader = this.parsedExamToCorrect.title
        .replaceAll("Nota", "Calificación")
        .split(" - ")[0];
      const students = this.parsedExamToCorrect.grades.map((el) => [
        this.students.find((el2) => el2.id === el.student_id)?.student_name,
        el.grade,
      ]);
      let [{ jsPDF }, autotable] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      autotable = autotable.default;
      const doc = new jsPDF({
        compress: true,
      });
      doc.setFontSize(17);
      doc.setFont("Helvetica", "bold");
      doc.text("Colegio Nacional Doctor Arturo Illia", 65, 22);
      // add school loho
      const img = new Image();
      img.src = `${window.location.href.split("/")[0]}/icon.png`;
      console.log(img.src);
      doc.addImage(img, "png", 35, 10, 20, 20, undefined, "FAST");
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(14);
      doc.text(
        "Profesor: " + this.$store?.state.authentication.user_data.name,
        15,
        40
      );
      doc.setFontSize(14);
      doc.text(
        "Clase: " +
          this.classes.find((el) => el.id === this.selectedClassFilter).class,
        150,
        40
      );
      autotable(doc, {
        body: students,
        head: [["Nombre", gradeHeader]],
        startY: 50,
        theme: "plain",
        tableLineColor: [38, 38, 38],
        tableLineWidth: 0.5,
        styles: {
          lineColor: [60, 68, 77],
          lineWidth: 0.2,
        },
      });
      doc.setFillColor(0, 0, 0);
      doc.rect(15, doc.lastAutoTable.finalY + 25, 100, 0, "S");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Firma", 55, 32 + doc.lastAutoTable.finalY);
      doc.save("Reporte de calificaciones.pdf");
    },
    removeFilters() {
      this.selectedClassFilter = null;
      this.examToCorrect = null;
      this.selectedSubjectFilter = null;
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
        type_of_eval: exam.type,
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
