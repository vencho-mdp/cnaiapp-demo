<template>
  <main
    v-if="showPage"
    class="flex flex-col min-h-full p-8 justify-center sm:px-24"
  >
    <v-title> Asistencia </v-title>
    <div class="flex flex-wrap mb-auto mt-12 w-full items-start">
      <div class="flex flex-col min-h-full justify-start items-start">
        <v-label class="mb-4 !text-sm"> Fecha </v-label>
        <client-only>
          <v-date-picker
            v-model="date"
            :max-date="new Date()"
            class="calendar"
            locale="es"
            :disabled-dates="{ weekdays: [1, 7] }"
          />
        </client-only>
        <div class="flex flex-col mt-8 items-start">
          <v-label class="mb-2 !text-sm"> Clase </v-label>
          <v-dropdown
            v-model="class_id"
            data-test="class_dropdown"
            style="max-width: 300px"
            class="bg-white-full"
            :options="
              classes
                ? classes.map((c) => ({ label: c.class, value: c.id }))
                : []
            "
          />
        </div>
      </div>
      <div
        class="flex flex-col min-w-full mt-8 gap-12 justify-between items-start"
      >
        <div class="flex flex-col min-w-full gap-2 justify-between items-start">
          <v-label class="mb-2 !text-sm"> Alumnos ausentes </v-label>
          <v-autosuggest
            style="max-width: 300px"
            :options="
              valid_students.map(({ student_name, id }) => ({
                label: student_name,
                value: id,
              }))
            "
            class="mb-8"
            @select="addAbsentStudent"
          />
          <transition name="fade">
            <transition-group
              v-if="!loading"
              mode="out-in"
              tag="div"
              name="list"
              class="flex flex-col flex-wrap list-none mb-8 -ml-12 w-full justify-between items-start"
            >
              <div
                v-for="(el, idx) of absent_students_without_duplicates"
                :key="`${el.id}-${idx}`"
                data-test="absent_student"
                :class="{ 'mb-12': idx + 1 !== absent_students.length }"
                class="bg-white-full rounded-md flex flex-col min-w-full w-72 shadow mr-4 text-sm ml-12 p-4 z-0 justify-around items-start"
              >
                <div
                  class="border-primary-darkblue border-b flex min-w-full pb-4 justify-between"
                >
                  <span class="font-bold mt-auto">
                    {{ el.last_name }}, {{ el.first_name }}
                  </span>
                </div>
                <div
                  class="flex min-w-full h-24 mt-2 items-center justify-between"
                >
                  <div class="w-20">
                    <label class="text-xs"> {{ el.shift }}</label>
                    <div class="mt-4 toggle colour">
                      <input
                        :id="`check-${el.id}-shift`"
                        class="toggle-checkbox hidden"
                        type="checkbox"
                        :checked="el.shift === 'Turno'"
                        :disabled="
                          absent_students.filter(
                            (student) => student.id === el.id
                          ).length === 2 ||
                          // if students has been added 1 time and is not in students list
                          // that means that the other shift has been deleted
                          // and it should not be possible to add it again
                          // therefore, disable this
                          (absent_students.filter(
                            (student) => student.id === el.id
                          ).length === 1 &&
                            !valid_students.some(
                              (student) => student.id === el.id
                            ))
                        "
                        @click="changeShift(el)"
                      />
                      <label
                        :for="`check-${el.id}-shift`"
                        class="rounded-full h-6 transition-color ease-out w-12 duration-150 toggle-label block shift-toggler"
                      ></label>
                    </div>
                  </div>
                  <div class="w-28">
                    <label class="text-xs">
                      {{
                        !el.is_justified ? "No justificado" : "Justificado"
                      }}</label
                    >
                    <div class="mt-4 toggle colour">
                      <input
                        :id="`check-${el.id}-is-justified`"
                        class="toggle-checkbox hidden"
                        type="checkbox"
                        v-model="el.is_justified"
                        @click="
                          openJustificationModal(
                            el.id,
                            !!el.is_justified,
                            el.shift
                          )
                        "
                      />
                      <label
                        :for="`check-${el.id}-is-justified`"
                        class="rounded-full h-6 transition-color ease-out w-12 duration-150 toggle-label block justification-toggler"
                      ></label>
                    </div>
                  </div>
                  <icon-button
                    data-test="absent_student_delete_button"
                    class="max-h-10 bg-red-light hover-effect md:ml-4"
                    @click.native="remove_student_from_list(el.id, el.shift)"
                  >
                    <img src="~/assets/images/trash.svg" alt="Eliminar" />
                  </icon-button>
                </div>
                <div
                  v-if="students_that_appear_twice.includes(el.id)"
                  class="flex min-w-full h-24 mt-2 items-center justify-between"
                >
                  <!-- other shift -->
                  <div class="w-20">
                    <label class="text-xs">
                      {{ el.shift === "Turno" ? "Contraturno" : "Turno" }}
                    </label>
                    <div class="mt-4 toggle colour">
                      <!-- won't be necessary to change, since both possibilities are chosen at this point -->
                      <input
                        :id="`check-${el.id}-other-shift`"
                        class="toggle-checkbox hidden"
                        type="checkbox"
                        :checked="el.shift !== 'Turno'"
                        disabled
                      />
                      <label
                        :for="`check-${el.id}-other-shift`"
                        class="rounded-full h-6 transition-color ease-out w-12 duration-150 toggle-label block shift-toggler"
                      ></label>
                    </div>
                  </div>
                  <div class="w-28">
                    <label class="text-xs">
                      {{
                        // viceversa, since this is the other shift
                        absent_students.find(
                          (s) => s.id === el.id && s.shift !== el.shift
                        ).is_justified
                          ? "Justificado"
                          : "No justificado"
                      }}</label
                    >
                    <div class="mt-4 toggle colour">
                      <input
                        :id="`check-${el.id}-is-justified-other-shift`"
                        class="toggle-checkbox hidden"
                        type="checkbox"
                        v-model="
                          absent_students.find(
                            (s) => s.id === el.id && s.shift !== el.shift
                          ).is_justified
                        "
                        @click="
                          openJustificationModal(
                            el.id,
                            absent_students.find(
                              (s) => s.id === el.id && s.shift !== el.shift
                            ).is_justified,
                            el.shift === 'Turno' ? 'Contraturno' : 'Turno'
                          )
                        "
                      />
                      <label
                        :for="`check-${el.id}-is-justified-other-shift`"
                        class="justification-toggler rounded-full h-6 transition-color ease-out w-12 duration-150 toggle-label block"
                      ></label>
                    </div>
                  </div>
                  <icon-button
                    data-test="absent_student_delete_button"
                    class="max-h-10 bg-red-light hover-effect md:ml-4"
                    @click.native="remove_student_from_list(el.id, el.shift)"
                  >
                    <img src="~/assets/images/trash.svg" alt="Eliminar" />
                  </icon-button>
                </div>
              </div>
            </transition-group>
          </transition>
          <add-button
            data-test="add_absent_student"
            :disabled="!have_absent_students_changed"
            @click.native="save_data()"
            class="w-full sm:w-32"
          >
            Guardar
          </add-button>
        </div>
      </div>
    </div>
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
      <client-only>
        <lazy-v-sidebar
          v-if="show_sidebar"
          :apply-text-margin="false"
          :title="
            show_sidebar === 'reason_of_deletion'
              ? 'Motivo de corrección'
              : show_sidebar === 'justification'
              ? 'Justificación'
              : null
          "
          :sidebar-classes="
            is_mobile ? '!h-60 !min-w-full z-50 mt-auto' : 'z-50'
          "
          @closeSidebar="closeSidebar"
        >
          <template #content>
            <div
              v-if="show_sidebar === 'reason_of_deletion'"
              class="flex max-w-full mt-4 px-8 items-center justify-between"
            >
              <outlined-primary-button
                class="mr-6 !h-12 !w-full"
                @click.native="addAbsentStudentThatWasDeleted(true)"
              >
                Llegó Tarde
              </outlined-primary-button>
              <outlined-primary-button
                class="!h-12 !w-full"
                @click.native="addAbsentStudentThatWasDeleted(false)"
              >
                Error en listado
              </outlined-primary-button>
            </div>
            <div
              class="flex max-w-full px-2 pt-2 gap-2"
              :class="[
                absence_reason === 'Otra'
                  ? 'justify-between items-end'
                  : 'justify-center items-start',
              ]"
              v-else-if="show_sidebar === 'justification'"
            >
              <v-dropdown
                :options="possible_absence_reasons"
                v-model="absence_reason"
                class="max-w-min h-9"
              ></v-dropdown>
              <div
                class="flex flex-col items-start justify-between"
                v-if="absence_reason === 'Otra'"
              >
                <v-label class="mb-1 !text-white">Motivo</v-label>
                <v-text-input
                  class="!w-full"
                  @input="new_justification = $event.target.value"
                  :value="new_justification"
                ></v-text-input>
              </div>
            </div>
            <div class="min-w-full my-4 px-10 self-center">
              <small-button
                class="min-w-full !py-2"
                @click.native="updateJustificationReason()"
                v-if="show_sidebar === 'justification'"
                :disabled="
                  absence_reason === 'Otra'
                    ? !new_justification
                    : !absence_reason
                "
                >Continuar</small-button
              >
            </div>
          </template>
        </lazy-v-sidebar>
      </client-only>
    </transition>
  </main>
</template>

<script>
import removeTimeFromDate from "@/utils/removeTimeFromDate.js";
import getNearestWorkday from "@/utils/getNearestWorkday.js";
import "@/assets/css/toggle.css";

const structuredClonePolyfilled =
  typeof structuredClone === "function"
    ? structuredClone
    : (obj) => JSON.parse(JSON.stringify(obj));

export default {
  middleware: "authentication",
  async asyncData({ $axios, store, $reportNetworkError }) {
    const get_students = $axios.$get("/api/students", {
      params: {
        classes_ids: JSON.stringify(
          store.state.authentication.user_data.classes_ids
        ),
      },
    });
    const get_absent_students = $axios.$get("/api/absent-students", {
      params: {
        date: removeTimeFromDate(getNearestWorkday()),
        classes_ids: JSON.stringify(
          store.state.authentication.user_data.classes_ids
        ),
      },
    });
    const get_classes = $axios.$get("/api/classes");
    try {
      // eslint-disable-next-line prefer-const
      let [students, absent_students, classes] = await Promise.all([
        get_students,
        get_absent_students,
        get_classes,
      ]);
      console.log(absent_students);
      absent_students = absent_students.map((el) => ({
        ...el,
        // replace null with false, or true with true
        is_justified:
          el.is_justified === "true" || el.is_justified === "false"
            ? JSON.parse(el.is_justified)
            : el.is_justified,
      }));
      // Poner primero a las clases del preceptor
      const preceptors_classes = classes.filter((el) =>
        store.state.authentication.user_data.classes_ids.includes(el.id)
      );
      classes = classes.filter(
        (c) => !preceptors_classes.find((el) => el.id === c.id)
      );
      preceptors_classes.forEach((el) => {
        if (!classes.includes(el)) {
          classes.unshift(el);
        }
      });
      const class_id =
        // management team
        classes.length >= 25
          ? ""
          : // preceptor
            classes.find(
              (c) =>
                c?.id === store.state.authentication.user_data.classes_ids[0]
            )?.id;
      return {
        students: students.map(({ student_name, ...el }) => ({
          ...el,
          student_name: student_name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""),
        })),
        original_absent_students: structuredClonePolyfilled(absent_students),
        absent_students,
        classes,
        class_id,
      };
    } catch (error) {
      $reportNetworkError(error);
    }
  },
  data() {
    return {
      date: getNearestWorkday(),
      loading: false,
      show_notification: false,
      is_mobile: true,
      show_sidebar: false,
      current_abs_student: null,
      deleted_students: [],
      absence_reason: null,
      possible_absence_reasons: [
        "Certificado Médico",
        "Evento Escolar",
        "Emergencia Familiar",
        "Paro de Transporte",
        "Otra",
      ],
      new_justification: null,
      current_shift_of_abs_student_to_delete: null,
    };
  },
  computed: {
    defaultInShift() {
      const isMorning = this.date.getHours() < 12 ? true : false;
      const isClassAdvanced = this.class_id
        ? ["4to", "5to", "6to"].includes(
            this.classes
              .find((el) => el.id === this.class_id)
              .class.split(" ")[0]
          )
        : //  arbitrary value
          false;
      return (isClassAdvanced && isMorning) || (!isClassAdvanced && !isMorning)
        ? "Turno"
        : "Contraturno";
    },
    showPage() {
      return (
        this.$store.state.authentication.user_data?.groups.includes(
          "preceptor"
        ) ||
        this.$store.state.authentication.user_data?.groups.includes(
          "management_team"
        )
      );
    },
    valid_students() {
      return this.students
        ? this.$store.state.authentication.user_data.groups.includes(
            "management_team"
          )
          ? this.students
          : this.students.filter(
              (student) =>
                // one student can be 2 times max in the same day
                this.absent_students.filter((el) => el.id === student.id)
                  .length !== 2 && this.class_id === student.class_id
            )
        : [];
    },
    have_absent_students_changed() {
      const original_absent_students = this.original_absent_students;
      const absent_students = this.absent_students;
      return original_absent_students
        ? JSON.stringify([...original_absent_students].sort()) !==
            JSON.stringify([...absent_students].sort())
        : null;
    },
    students_that_appear_twice() {
      const hash = {};
      this.absent_students.forEach((el) => {
        hash[el.id] = hash[el.id] ? hash[el.id] + 1 : 1;
      });
      return Object.keys(hash).filter((el) => hash[el] > 1);
    },
    absent_students_without_duplicates() {
      const absentStudents = this.absent_students;
      return absentStudents.filter(
        (student, index) =>
          absentStudents.findIndex((s) => s.id == student.id) == index
      );
    },
  },
  watch: {
    date(new_val) {
      this.update_absent_students(new_val);
    },
    class_id() {
      this.update_absent_students(this.date, true);
    },
  },
  mounted() {
    this.is_mobile = window.innerWidth < 768;
  },
  methods: {
    closeSidebar() {
      this.show_sidebar = false;
      // case of justification
      const current_absent_student = this.absent_students.find(
        (el) => el.id === this.current_abs_student
      );
      if (current_absent_student) {
        current_absent_student.is_justified = false;
        this.current_abs_student = null;
      }
      this.new_justification = null;
      this.absence_reason = null;
    },
    async changeShift(el) {
      if (el.shift === "Turno") el.shift = "Contraturno";
      else el.shift = "Turno";
      await this.save_data();
    },
    async updateJustificationReason() {
      const current_absent_student = this.absent_students.find(
        (el) =>
          el.id === this.current_abs_student &&
          el.shift === this.current_shift_of_abs_student_to_delete
      );
      current_absent_student.is_justified =
        this.absence_reason === "Otra"
          ? this.new_justification
          : this.absence_reason;
      await this.save_data();
      this.show_sidebar = false;
    },
    addAbsentStudentThatWasDeleted(wasLate) {
      const reason = wasLate ? "Llegó Tarde" : "Error al pasar el listado";
      const student_index = this.absent_students.findIndex(
        (el) => el.id === this.current_abs_student
      );
      this.deleted_students.unshift({
        id: this.current_abs_student,
        deleted_because: reason,
        shift: this.absent_students[student_index].shift,
      });
      this.absent_students.splice(student_index, 1);
      this.show_sidebar = false;
      this.new_justification = null;
      this.absence_reason = null;
      this.save_data();
    },
    addAbsentStudent(data) {
      if (!data) {
        return;
      }
      const studentIfIsAlreadyPresent = this.absent_students.find(
        (el) => el.id === data.value
      );
      const [last_name, first_name] = data.label.split(", ");
      this.absent_students.unshift({
        id: data.value,
        shift: studentIfIsAlreadyPresent?.shift
          ? studentIfIsAlreadyPresent?.shift === "Turno"
            ? "Contraturno"
            : "Turno"
          : this.defaultInShift,
        first_name,
        last_name,
        is_justified: false,
      });
    },
    async openJustificationModal(abs_student, prev_state, shift) {
      if (!prev_state) {
        this.show_sidebar = "justification";
        this.current_abs_student = abs_student;
        this.current_shift_of_abs_student_to_delete = shift;
        return;
      }
      const current_absent_student = this.absent_students.find(
        (el) => el.id === abs_student && el.shift === shift
      );
      current_absent_student.is_justified = false;
      await this.save_data();
    },
    remove_student_from_list(abs_student, shift) {
      // si ya estaba antes, es porque se cambió
      if (this.original_absent_students.some((el) => el.id === abs_student)) {
        this.current_abs_student = abs_student;
        this.current_shift_of_abs_student_to_delete = shift;
        this.show_sidebar = "reason_of_deletion";
        return;
      }
      // si no se guardó todavía
      this.absent_students.splice(this.absent_students.indexOf(abs_student), 1);
    },
    async update_absent_students(date, class_changed = false) {
      this.loading = true;
      const formatted_date = removeTimeFromDate(date);
      let absent_students_in_formatted_date = await this.$axios.$get(
        "/api/absent-students",
        {
          params: {
            date: formatted_date,
            classes_ids: JSON.stringify([this.class_id]),
          },
        }
      );
      absent_students_in_formatted_date = absent_students_in_formatted_date.map(
        (el) => ({
          ...el,
          // replace null with false, or true with true
          is_justified: !!el.is_justified,
        })
      );
      this.absent_students = absent_students_in_formatted_date;
      this.original_absent_students = structuredClonePolyfilled(
        absent_students_in_formatted_date
      );

      if (class_changed) {
        this.students = await this.$axios.$get("/api/students", {
          params: {
            classes_ids: JSON.stringify([this.class_id]),
          },
        });
        this.students = this.students.map(({ student_name, ...el }) => ({
          ...el,
          student_name: student_name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""),
        }));
      }
      this.loading = false;
    },
    async save_data() {
      try {
        const absent_students_with_was_shift_modified_prop =
          this.absent_students.map((el) => {
            //  add was_shift_modified_prop
            // comparing to original absent student shift
            // if it's different, it means that the shift was changed
            const clone = structuredClonePolyfilled(el);
            const original_absents_student =
              this.original_absent_students.filter(
                (abs_student) => abs_student.id === clone.id
              );
            if (original_absents_student) {
              clone.was_shift_modified =
                original_absents_student.length !== 1
                  ? false
                  : original_absents_student[0].shift !== clone.shift;
            }
            delete clone.first_name;
            delete clone.last_name;
            return clone;
          });

        const absent_students_without_absolute_duplicates =
          absent_students_with_was_shift_modified_prop.filter(
            (el, index) =>
              !(
                index ===
                this.original_absent_students.findIndex(
                  (abs_student) =>
                    abs_student.id === el.id &&
                    abs_student.shift === el.shift &&
                    abs_student.is_justified === el.is_justified
                )
              )
          );
        this.original_absent_students = structuredClonePolyfilled(
          this.absent_students
        );
        await this.$axios.$post("/api/absent-students", {
          list: [
            ...absent_students_without_absolute_duplicates,
            ...this.deleted_students,
          ],
          date: removeTimeFromDate(this.date),
        });
        this.show_notification = true;
      } catch (error) {
        this.show_notification = "error";
        this.$reportNetworkError(error);
      }
      setTimeout(() => {
        this.show_notification = !this.show_notification;
      }, 2000);
    },
  },
};
</script>

<style scoped>
.calendar :deep(.vc-title) {
  text-transform: capitalize;
}
</style>
