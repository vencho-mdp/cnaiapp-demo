<template>
  <main
    v-if="renderPage"
    class="flex flex-col min-h-full pl-6 pt-8 justify-center sm:px-24"
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
                ? classes.map((c) => ({
                    label: c.class,
                    value: c.id,
                  }))
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
              valid_students.map(({ student_name, id, class_id }) => ({
                label: student_name,
                value: id,
                class_id,
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
              class="flex md:!w-auto flex-wrap flex-grow pr-2 w-full mb-8"
            >
              <div
                v-for="(el, idx) of absent_students_without_duplicates"
                :key="`${el.id}-${idx}`"
                data-test="absent_student"
                :class="{ 'mb-12': idx + 1 !== absent_students.length }"
                style="width: -moz-available; width: -webkit-fill-available"
                class="flex-shrink-0 bg-white-full rounded-md flex flex-col max-w-md border border-gray-200 text-sm p-4 z-0 justify-around items-start"
              >
                <div
                  class="border-primary-darkblue w-full border-b flex pb-4 justify-between"
                >
                  <span class="font-bold mt-auto">
                    {{ el.last_name }}, {{ el.first_name }}
                  </span>
                </div>
                <div
                  class="w-full h-24 my-4"
                  v-for="(shift_data, i) in el.shifts"
                  :key="`${shift_data.shift}-${el.id}`"
                >
                <div 
                                  class="flex items-center justify-between"
                v-if="$store.state.authentication.user_data.subjects ? $store.state.authentication.user_data.subjects.includes(shift_data.shift) : true">
<VDropdown
                    v-if="
                      extra_curricular_classes_slots[el.class_id] &&
                      extra_curricular_classes_slots[el.class_id]
                        .map((el) => el.subject)
                        // teacher
                        .concat($store.state.authentication.user_data.groups.includes('teacher') ? null : 'Turno')
                        .filter(
                          (shift_el) =>
                          shift_el &&
                            shift_el !== shift_data.shift &&
                            !absent_students.some(
                              (s) => s.shift === shift_el && s.id === el.id
                            )
                        ).length > 0
                    "
                    :options="
                      extra_curricular_classes_slots[el.class_id]
                        .map((el) => el.subject)
                        // teacher
                        .concat($store.state.authentication.user_data.groups.includes('teacher') ? null : 'Turno')
                        .filter(
                          (shift_el) =>
                          shift_el &&
                            shift_el !== shift_data.shift &&
                            !absent_students.some(
                              (s) => s.shift === shift_el && s.id === el.id
                            )
                        )
                    "
                    :value="shift_data.shift"
                    @change.native="
                      changeShift(el.shifts[i].real_index, $event.target.value)
                    "
                    class="text-xs w-32"
                  >
                    {{ shift_data.shift }}</VDropdown
                  >
                  <label v-else class="text-xs pl-2.5 w-32">
                    {{ shift_data.shift }}
                  </label>
                  <div class="w-32 ml-auto">
                    <label class="text-xs">
                      {{
                        !shift_data.is_justified
                          ? "No Justificado"
                          : "Justificado"
                      }}</label
                    >
                    <div class="mt-4 toggle colour">
                      <input
                        :id="`check-${shift_data.shift}-${el.id}-is-justified`"
                        class="toggle-checkbox hidden"
                        type="checkbox"
                        v-model="shift_data.is_justified"
                        @click="
                          openJustificationModal(
                            el.id,
                            !!shift_data.is_justified,
                            shift_data.shift
                          )
                        "
                      />
                      <label
                        :for="`check-${shift_data.shift}-${el.id}-is-justified`"
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
                </div>
              </div>
            </transition-group>
          </transition>
          <div
            class="-ml-8 md:!m-0 w-screen md:!w-auto md:!static sticky bottom-0 border-t-2 border-blue-500 bg-gray-100 md:!bg-white-full md:!border-0 px-8 py-4 mt-2"
          >
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
import getNearestPastWorkday from "@/utils/getNearestPastWorkday.js";
import filterMap from "@/utils/filterMap.js";
import "@/assets/css/toggle.css";
import { setTimeout } from "timers";

const structuredClonePolyfilled =
  typeof structuredClone === "function"
    ? structuredClone
    : (obj) => JSON.parse(JSON.stringify(obj));

const transformSlots = (slots, extra_curricular_shifts) => {
  const day_index_in_arr = new Date().getDay() - 1;
  const current_day_index =
    day_index_in_arr > 4 || day_index_in_arr < 0 ? 4 : day_index_in_arr;
  return (
    filterMap(
      slots[current_day_index].assignments,
      (el) => extra_curricular_shifts.includes(el.subject),
      (el) => ({
        subject: el.subject,
        start_time: el.start_time.slice(0, -3),
      })
    ) || []
  );
};

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
        date: removeTimeFromDate(getNearestPastWorkday()),
        classes_ids: JSON.stringify(
          store.state.authentication.user_data.classes_ids
        ),
      },
    });
    const get_classes = $axios.$get("/api/classes");
    const get_slots = $axios.$get("/api/slots", {
      params: {
        classesIds: JSON.stringify(
          store.state.authentication.user_data.classes_ids
        ),
      },
    });
    try {
      // eslint-disable-next-line prefer-const
      let [students, absent_students, classes, slots] = await Promise.all([
        get_students,
        get_absent_students,
        get_classes,
        get_slots,
      ]);
      absent_students = absent_students.map((el) => ({
        ...el,
        // replace null with false, or true with true
        is_justified:
          el.is_justified === "true" || el.is_justified === "false"
            ? JSON.parse(el.is_justified)
            : el.is_justified,
      }));
      const class_id =
        // management team
        classes.length >= 25
          ? ""
          : // preceptor
            classes.find(
              (c) =>
                c?.id === store.state.authentication.user_data.classes_ids[0]
            )?.id;
            const not_modified_slots =structuredClonePolyfilled(slots)
      Object.keys(structuredClonePolyfilled(slots)).forEach((key) => {
        slots[key] = transformSlots(slots[key], store.state.EXTRA_CURRICULAR_SUBJECTS);
      });
      const isTeacher = store.state.authentication.user_data.groups.includes(
        "teacher"
      );
        const getTeacherSlots = isTeacher ? () => $axios.$get(
            `api/teachers/${store.state.authentication.user_data.id}`
          ) : () => Promise.resolve([]);
      return {
        students: students.map(({ student_name, ...el }) => ({
          ...el,
          student_name: student_name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""),
        })),
        original_absent_students: structuredClonePolyfilled(absent_students),
        absent_students,
        classes: isTeacher ? classes.filter(el => store.state.authentication.user_data.classes_ids.includes(el.id)) : classes,
        class_id,
        slots: not_modified_slots,
        extra_curricular_classes_slots: slots,
        teacher_slots: await getTeacherSlots()
      };
    } catch (error) {
      $reportNetworkError(error);
    }
  },
  data() {
    return {
      date: getNearestPastWorkday(),
      loading: false,
      show_notification: false,
      is_mobile: true,
      show_sidebar: false,
      current_abs_student: null,
      deleted_students: [],
      absence_reason: null,
      possible_absence_reasons: [
        "Certificado Médico",
        "Evento Curricular",
        "Emergencia Familiar",
        "Paro de Transporte",
        "Representación Deportiva",
        "Otra",
      ],
      new_justification: null,
      current_shift_of_abs_student_to_delete: null,
      // curricular shift is always taken by the preceptor,
      // though in extra-curricular activities each teacher takes it
      shifts: [
        "Turno",
        "Informática",
        "Plástica",
        "Música",
        "Inglés",
        "Teatro",
      ],
      class_id_without_rendering_in_dom: null,
    };
  },
  computed: {
    isClassAdvanced() {
      return this.class_id
        ? ["4to", "5to", "6to"].includes(
            this.classes
              .find((el) => el.id === this.class_id)
              .class.split(" ")[0]
          )
        : false;
    },
    nearest_item_in_extra_curricular_shift() {
      const date = new Date();
      const nearest_item_in_extra_curricular_shift =
        this.extra_curricular_classes_slots[
          this.class_id_without_rendering_in_dom || this.class_id
        ].reduce(
          (acc, el) => {
            const [hours, minutes] = el.start_time.split(":");
            const subject_time = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              hours,
              minutes
            );
            const diff = Math.abs(date.getTime() - subject_time.getTime());
            if (diff < acc.diff) return { diff, item: el };
            return acc;
          },
          { diff: Infinity, item: null }
        ).item;
      this.class_id_without_rendering_in_dom = null;
      return nearest_item_in_extra_curricular_shift.subject;
    },
    renderPage() {
      const EXTRA_CURRICULAR_SUBJECTS = this.$store.state.EXTRA_CURRICULAR_SUBJECTS;
      return (
        this.$store.state.authentication.user_data?.groups.includes(
          "preceptor"
        ) ||
        this.$store.state.authentication.user_data?.groups.includes(
          "management_team"
        ) ||
        (this.$store.state.authentication.user_data?.groups.includes("teacher")
    && this.$store.state.authentication.user_data?.subjects?.some?.(s => EXTRA_CURRICULAR_SUBJECTS.includes(s))
    )
      );
    },
    valid_students() {
      return this.students.filter((el) => {
        const hasSubjects = this.$store.state.authentication.user_data.subjects
        const EXTRA_CURRICULAR_SUBJECTS_quantity =
          this.extra_curricular_classes_slots[el.class_id].filter(
            (el) => hasSubjects ? this.$store.state.authentication.user_data.subjects.includes(el.subject) : true
          ).length
        const amount_of_times_student_appears = this.absent_students.filter(
          (el2) => el2.id === el.id
        ).length
        return (
         !hasSubjects ? (amount_of_times_student_appears <=
            EXTRA_CURRICULAR_SUBJECTS_quantity) : (amount_of_times_student_appears <
            EXTRA_CURRICULAR_SUBJECTS_quantity)  &&
          (this.class_id ? this.class_id === el.class_id : true)
        );
      });
    },
    have_absent_students_changed() {
      const original_absent_students = this.original_absent_students;
      const absent_students = this.absent_students;
      return (
        (original_absent_students
          ? JSON.stringify([...original_absent_students].sort()) !==
            JSON.stringify([...absent_students].sort())
          : null) && !this.show_sidebar
      );
    },
    students_that_appear_twice() {
      const hash = {};
      this.absent_students.forEach((el) => {
        hash[el.id] = hash[el.id] ? hash[el.id] + 1 : 1;
      });
      return Object.keys(hash).filter((el) => hash[el] > 1);
    },
    absent_students_without_duplicates() {
      return this.absent_students.reduce((acc, el, idx) => {
        //  merge students with same id
        // and make shift prop an array of the shifts and wether they are justified or not
        const index = acc.findIndex((el2) => el2.id === el.id);
        if (index === -1) {
          const { shift, ...props } = el;
          acc.push({
            ...props,
            shifts: [
              {
                shift: el.shift,
                is_justified: el.is_justified,
                real_index: idx,
              },
            ],
          });
        } else {
          acc[index].shifts.push({
            shift: el.shift,
            is_justified: el.is_justified,
            real_index: idx,
          });
        }
        return acc;
      }, []);
    },
  },
  watch: {
    async date(new_val) {
      await this.update_absent_students_and_class(new_val);
        const day_index_in_arr = new_val.getDay() - 1;
  const current_day_index =
    day_index_in_arr > 4 || day_index_in_arr < 0 ? 4 : day_index_in_arr;
  Object.keys(this.extra_curricular_classes_slots).forEach((k) => {
    this.extra_curricular_classes_slots[k] = filterMap(
      this.slots[k][current_day_index].assignments,
      (el) => this.$store.state.EXTRA_CURRICULAR_SUBJECTS.includes(el.subject),
      (el) => ({
        subject: el.subject,
        start_time: el.start_time.slice(0, -3),
      })
    ) 
    })
    },
    async class_id() {
      await this.update_absent_students_and_class(this.date, true);
    },
  },
  mounted() {
    this.is_mobile = window.innerWidth < 768;
  },
  methods: {
    changeShift(index, val) {
      this.absent_students[index].shift = val;
      this.absent_students[index].was_shift_modified = true;
    },
    closeSidebar() {
      this.show_sidebar = false;
      // case of justification
      const current_absent_student = this.absent_students.find(
        (el) =>
          el.id === this.current_abs_student &&
          el.shift === this.current_shift_of_abs_student_to_delete
      );
      if (current_absent_student) {
        document
          .querySelector(
            `input#check-${current_absent_student.shift}-${current_absent_student.id}-is-justified`
          )
          .click();
        current_absent_student.is_justified = false;
        this.current_abs_student = null;
      }
      this.new_justification = null;
      this.absence_reason = null;
      this.current_shift_of_abs_student_to_delete = null;
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
    async addAbsentStudent(data) {
      if (!data) {
        return;
      }
      const isMorning = this.date.getHours() < 12 ? true : false;
      window.scrollTo({
        top: 300,
        behavior: "smooth",
      });
      const repeated_students = this.absent_students.filter(
        (el) => el.id === data.value
      );
      const [last_name, first_name] = data.label.split(", ");
      if (!this.class_id) {
        this.class_id_without_rendering_in_dom = data.class_id;
      }
      const idealShiftPrediction =
        (isMorning && this.isClassAdvanced) ||
        (!isMorning && !this.isClassAdvanced)
          ? "Turno"
          : this.nearest_item_in_extra_curricular_shift;
      this.absent_students.unshift({
        id: data.value,
        shift: repeated_students.some((el) => el.shift === idealShiftPrediction)
          ? this.extra_curricular_classes_slots[data.class_id].find(
              (el) => !repeated_students.map((el) => el.shift).includes(el)
            ).subject
          : idealShiftPrediction,
        first_name,
        last_name,
        class_id: data.class_id,
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
    async update_absent_students_and_class(date, class_changed = false) {
      const formatted_date = removeTimeFromDate(date);
      let absent_students_in_formatted_date = await this.$axios.$get(
        "/api/absent-students",
        {
          params: {
            date: formatted_date,
            classes_ids: this.class_id
              ? JSON.stringify([this.class_id])
              : JSON.stringify(this.classes.map((el) => el.id)),
          },
        }
      );
      absent_students_in_formatted_date = absent_students_in_formatted_date.map(
        (el) => ({
          ...el,
          // replace null with false, or true with true
          is_justified:
            el.is_justified === "true" || el.is_justified === "false"
              ? JSON.parse(el.is_justified)
              : el.is_justified,
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
        const absent_students_without_absolute_duplicates =
          this.absent_students.filter(
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
