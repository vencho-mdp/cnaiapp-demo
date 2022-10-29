<template>
  <main
    v-if="renderPage"
    :class="{ 'p-4': !is_mobile }"
    class="flex flex-col min-h-full pl-4 pt-8 justify-center md:justify-start sm:px-24 overflow-x-hidden"
  >
    <Tabs
      :options="[
        {
          label: 'Tomar asistencia',
          // set visualize to true
          click: false,
        },
        {
          label: 'Ver asistencia',
          // set visualize to false
          click: true,
        },
      ]"
      @tabClick="tabClick"
    />
    <template v-if="!visualize">
      <div class="flex flex-wrap mb-auto mt-12 w-full items-start">
        <div
          class="flex flex-col min-h-full w-full md:w-2/3 justify-start items-start pr-2"
        >
          <v-label class="mb-4 !text-sm"> Fecha </v-label>
          <client-only>
            <v-date-picker
              :is-expanded="is_mobile"
              v-model="date"
              :max-date="new Date()"
              class="calendar"
              :popover="{ visibility: null }"
              locale="es"
              is-required
              :disabled-dates="{ weekdays: [1, 7] }"
            />
          </client-only>
          <div class="flex flex-col mt-8 items-start w-full md:w-auto">
            <v-label class="mb-2 !text-sm"> Clase </v-label>
            <v-dropdown
              v-model="class_id"
              data-test="class_dropdown"
              class="bg-white-full !w-full md:max-w-xs"
              :options="
                classes
                  ? classes.map((c) => ({
                      label: c.class,
                      value: c.id,
                    }))
                  : []
              "
              :groups="[
                {
                  label: 'Ciclo Básico',
                  filter(opt) {
                    return (
                      opt.includes('3ro') ||
                      opt.includes('2do') ||
                      opt.includes('1ro')
                    );
                  },
                },
                {
                  label: 'Ciclo Superior',
                  filter(opt) {
                    return (
                      opt.includes('4to') ||
                      opt.includes('5to') ||
                      opt.includes('6to')
                    );
                  },
                },
              ]"
            />
          </div>
        </div>
        <div
          class="flex flex-col min-w-full mt-8 gap-12 justify-between items-start w-full md:w-auto"
        >
          <div
            class="flex flex-col min-w-full gap-2 justify-between items-start pr-2"
          >
            <v-label class="mb-2 !text-sm"> Alumnos ausentes </v-label>
            <vue-autosuggest
              :input-props="{
                id: 'autosuggest-input',
              }"
              :suggestions="suggestions"
              v-click-outside="turnHasAutocompleteBeenTouchFalse"
              id="autosuggest"
              class="mb-8 w-full md:max-w-xs"
              v-model="absentStudentQuery"
              @focus="hasAutocompleteBeenTouch = true"
              @selected="(item) => item && addAbsentStudent(item.item)"
              :sectionConfigs="{
                default: {
                  limit: this.class_id ? Infinity : 12,
                },
              }"
              :should-render-suggestions="() => this.hasAutocompleteBeenTouch"
              :get-suggestion-value="(item) => item.label"
            >
              <template v-slot="{ suggestion }">
                <span
                  class="cursor-pointer"
                  :class="[
                    absent_students.some(
                      (el) =>
                        el.shift ===
                          (((date.getHours() < 12 ? true : false) &&
                            isClassAdvanced) ||
                          (!(date.getHours() < 12 ? true : false) &&
                            !isClassAdvanced)
                            ? 'Turno'
                            : nearest_item_in_extra_curricular_shift ||
                              'Turno') && el.id === suggestion.item.value
                    )
                      ? 'text-primary-darkblue font-bold'
                      : 'text-black',
                  ]"
                  >{{ suggestion.item.label }}</span
                >
                <!-- <transition name="fade">
                  <span
                    v-if="
                      absent_students.some(
                        (el) =>
                          el.shift ===
                            (((date.getHours() < 12 ? true : false) &&
                              isClassAdvanced) ||
                            (!(date.getHours() < 12 ? true : false) &&
                              !isClassAdvanced)
                              ? 'Turno'
                              : nearest_item_in_extra_curricular_shift ||
                                'Turno') && el.id === suggestion.item.value
                      )
                    "
                    :disabled="true"
                    class="m-2 text-white shadow font-semibold p-1 rounded bg-primary-darkblue"
                    >Agregado
                  </span>
                </transition> -->
              </template>
            </vue-autosuggest>
            <transition name="fade">
              <transition-group
                v-if="!loading"
                mode="out-in"
                tag="div"
                name="list"
                class="flex md:!w-auto flex-wrap pr-2 w-full items-start"
                :class="{ 'gap-12': !is_mobile }"
              >
                <div
                  class="border border-gray-200 text-tiny p-4 z-0 rounded-md mb-8"
                  :key="'late-students'"
                  v-if="late_students.length > 0"
                >
                  <span class="font-bold text-sm">
                    Alumnos que llegaron tarde:</span
                  >
                  <ul>
                    <transition-group name="list">
                      <li
                        v-for="student in late_students"
                        :ref="`${student.student_name}-${student.shift}`"
                        :id="`${student.student_name}-${student.shift}`"
                        :key="student.student_name + student.shift"
                        class="text-sm my-2 p-1.5 rounded text-black flex"
                        :class="{
                          '!text-white bg-primary-darkblue':
                            selectedStudentsThatArriveLateToRemove.some(
                              (el) =>
                                el.student_name === student.student_name &&
                                el.shift === student.shift
                            ),
                        }"
                      >
                        {{ student.student_name }} ({{ student.shift }})
                        <transition
                          :name="`slide-${
                            itemsToShowTrashButton[
                              `${student.student_name}-${student.shift}`
                            ]
                              ? 'left'
                              : 'right'
                          }`"
                          mode="out-in"
                        >
                          <icon-button
                            v-if="
                              !is_mobile ||
                              itemsToShowTrashButton[
                                `${student.student_name}-${student.shift}`
                              ]
                            "
                            data-test="absent_student_delete_button"
                            class="bg-red-light hover-effect md:ml-4"
                            :class="[
                              is_mobile
                                ? 'ml-2 my-8 !rounded-md h-full w-2/3'
                                : 'max-h-10',
                            ]"
                            @click.native="
                              removeLateStudent(student.id, student.shift)
                            "
                          >
                            <img
                              src="~/assets/images/trash.svg"
                              alt="Eliminar"
                            />
                          </icon-button>
                          <p v-else></p>
                        </transition>
                      </li>
                    </transition-group>
                  </ul>
                </div>
                <div
                  v-for="(el, idx) of absent_students_without_duplicates"
                  :key="`${el.id}-${idx}`"
                  data-test="absent_student"
                  :class="{ 'mb-12': idx + 1 !== absent_students.length }"
                  style="width: -moz-available; width: -webkit-fill-available"
                  class="flex-shrink-0 bg-white-full rounded-md flex flex-col max-w-sm border border-gray-200 text-sm p-4 z-0 justify-around items-start"
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
                    :ref="`abs_student-${idx}-${i}`"
                    :id="`abs_student-${idx}-${i}`"
                  >
                    <div
                      class="flex items-center justify-between h-20"
                      v-if="
                        $store.state.authentication.user_data.subjects
                          ? $store.state.authentication.user_data.subjects.includes(
                              shift_data.shift
                            )
                          : true
                      "
                    >
                      <VDropdown
                        v-if="
                          extra_curricular_classes_slots[el.class_id] &&
                          [
                            ...new Set(
                              extra_curricular_classes_slots[el.class_id]
                                .map((el) => el.subject)
                                // teacher
                                .concat(
                                  $store.state.authentication.user_data.groups.includes(
                                    'teacher'
                                  )
                                    ? null
                                    : 'Turno'
                                )
                                .filter(
                                  (shift_el) =>
                                    shift_el === shift_data.shift ||
                                    (shift_el &&
                                      !absent_students.some(
                                        (s) =>
                                          s.shift === shift_el && s.id === el.id
                                      ))
                                )
                                .concat(shift_data.shift)
                            ),
                          ].length > 1
                        "
                        :options="[
                          ...new Set(
                            extra_curricular_classes_slots[el.class_id]
                              .map((el) => el.subject)
                              // teacher
                              .concat(
                                $store.state.authentication.user_data.groups.includes(
                                  'teacher'
                                )
                                  ? null
                                  : 'Turno'
                              )
                              .filter(
                                (shift_el) =>
                                  shift_el === shift_data.shift ||
                                  (shift_el &&
                                    !absent_students.some(
                                      (s) =>
                                        s.shift === shift_el && s.id === el.id
                                    ))
                              )
                              .concat(shift_data.shift)
                          ),
                        ]"
                        :value="shift_data.shift"
                        @change.native="
                          changeShift(
                            el.shifts[i].real_index,
                            $event.target.value
                          )
                        "
                        class="text-xs !w-32"
                      >
                        {{ shift_data.shift }}</VDropdown
                      >
                      <label v-else class="text-xs pl-2.5 w-32">
                        {{ shift_data.shift }}
                      </label>
                      <ClientOnly>
                        <template v-if="!is_mobile">
                          <div
                            v-if="
                              !itemsToShowTrashButton[`abs_student-${idx}-${i}`]
                            "
                            class="w-32 ml-auto p-2"
                          >
                            <label
                              class="text-xs text-right font-bold"
                              :class="[
                                !shift_data.is_justified
                                  ? 'text-yellow-600'
                                  : 'text-green-600 ml-6',
                              ]"
                            >
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
                                class="rounded-full mr-2 ml-auto h-6 transition-color ease-out w-12 duration-150 toggle-label block justification-toggler"
                              ></label>
                            </div>
                          </div>
                          <icon-button
                            v-if="
                              !is_mobile ||
                              itemsToShowTrashButton[`abs_student-${idx}-${i}`]
                            "
                            data-test="absent_student_delete_button"
                            class="bg-red-light hover-effect md:ml-4"
                            :class="[
                              is_mobile
                                ? 'ml-24 my-8 !rounded-md h-full w-full'
                                : 'max-h-10',
                            ]"
                            @click.native="
                              remove_student_from_list(el.id, el.shift)
                            "
                          >
                            <img
                              src="~/assets/images/trash.svg"
                              alt="Eliminar"
                            />
                          </icon-button>
                        </template>
                        <transition
                          :name="`slide-${
                            itemsToShowTrashButton[`abs_student-${idx}-${i}`]
                              ? 'left'
                              : 'right'
                          }`"
                          mode="out-in"
                          v-else
                        >
                          <div
                            v-if="
                              !itemsToShowTrashButton[`abs_student-${idx}-${i}`]
                            "
                            class="w-32 ml-auto p-2"
                          >
                            <label
                              class="text-xs text-right font-bold"
                              :class="[
                                !shift_data.is_justified
                                  ? 'text-yellow-600'
                                  : 'text-green-600 ml-6',
                              ]"
                            >
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
                                class="rounded-full mr-2 ml-auto h-6 transition-color ease-out w-12 duration-150 toggle-label block justification-toggler"
                              ></label>
                            </div>
                          </div>
                          <icon-button
                            v-if="
                              !is_mobile ||
                              itemsToShowTrashButton[`abs_student-${idx}-${i}`]
                            "
                            data-test="absent_student_delete_button"
                            class="bg-red-light hover-effect md:ml-4"
                            :class="[
                              is_mobile
                                ? 'ml-24 my-8 !rounded-md h-full w-full'
                                : 'max-h-10',
                            ]"
                            @click.native="
                              remove_student_from_list(el.id, el.shift)
                            "
                          >
                            <img
                              src="~/assets/images/trash.svg"
                              alt="Eliminar"
                            />
                          </icon-button>
                        </transition>
                      </ClientOnly>
                    </div>
                  </div>
                </div>
              </transition-group>
            </transition>
            <PillButton
              v-if="
                absent_students.length === 0 &&
                class_id &&
                hasAutocompleteBeenTouch
              "
              @click.native="save_data_without_absent_students"
              class="!w-full !py-2"
            >
              Sin ausentes
            </PillButton>
            <div
              class="md:!m-0 w-screen md:!w-auto md:!static sticky bottom-0 -mx-4 mt-4 md:!bg-white-full md:!border-0"
            >
              <add-button
                data-test="add_absent_student"
                :disabled="!have_absent_students_changed"
                @click.native="save_data()"
                class="w-full sm:w-32 !rounded-none md:!rounded-md h-14 md:h-auto"
                :class="[absent_students?.length === 0 ? 'mt-32' : 'mt-2']"
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
            show_notification !== 'error'
              ? '¡Guardado!'
              : 'Ha ocurrido un error'
          "
        />
      </transition>
      <transition name="fade">
        <client-only>
          <lazy-v-sidebar
            v-if="show_sidebar"
            :apply-text-margin="!is_mobile"
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
              <div class="h-full flex justify-between items-center flex-col">
                <div
                  v-if="show_sidebar === 'reason_of_deletion'"
                  class="flex w-full h-full mt-4 items-center justify-between"
                >
                  <outlined-primary-button
                    class="mr-6 !h-12 !w-full"
                    @click.native="addAbsentStudentThatWasDeleted(true)"
                  >
                    Llegó tarde
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
                <div
                  :class="{ 'p-4': is_mobile }"
                  class="min-w-full my-4 self-center"
                >
                  <small-button
                    class="min-w-full !py-3"
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
              </div>
            </template>
          </lazy-v-sidebar>
        </client-only>
      </transition>
    </template>
    <AssistanceVisualize
      v-else
      :is-mobile="is_mobile"
      :classes="classes"
      :students="students"
    />
  </main>
</template>

<script>
import removeTimeFromDate from "@/utils/removeTimeFromDate.js";
import getNearestPastWorkday from "@/utils/getNearestPastWorkday.js";
import filterMap from "@/utils/filterMap.js";
import "@/assets/css/toggle.css";
import { VueAutosuggest } from "vue-autosuggest";
import { addHorizontalSwipeHandler } from "@/utils/addHorizontalSwipeHandler.js";
import { transformSlots } from "../../utils/transformSlots";
const pickRandomFromArray = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

const structuredClonePolyfilled =
  typeof structuredClone === "function"
    ? structuredClone
    : (obj) => JSON.parse(JSON.stringify(obj));

export default {
  components: {
    VueAutosuggest,
  },
  middleware: "authentication",
  async asyncData({ $axios, store, $reportNetworkError, redirect }) {
    const groups = store.state.authentication.user_data.groups;
    if (
      !groups.some(
        (el) =>
          el === "teacher" || el === "preceptor" || el === "management_team"
      )
    ) {
      redirect("/panel");
    }
    const get_students = $axios.$get("/api/students", {
      params: {
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
    const get_late_students = $axios.$get("api/late-students", {
      params: {
        date: removeTimeFromDate(getNearestPastWorkday()),
        classes_ids: JSON.stringify(
          store.state.authentication.user_data.classes_ids
        ),
      },
    });

    try {
      // eslint-disable-next-line prefer-const
      let [students, classes, slots, late_students] = await Promise.all([
        get_students,
        get_classes,
        get_slots,
        get_late_students,
      ]);

      let class_id =
        // management team
        classes?.length >= 25
          ? ""
          : // preceptor
            classes?.find(
              (c) =>
                c?.id === store.state.authentication.user_data.classes_ids[0]
            )?.id;
      let absent_students = await $axios.$get("/api/absent-students", {
        params: {
          date: removeTimeFromDate(getNearestPastWorkday()),
          classes_ids: JSON.stringify(
            class_id
              ? [class_id]
              : store.state.authentication.user_data.classes_ids
          ),
        },
      });
      absent_students = absent_students.map((el) => ({
        ...el,
        // replace null with false, or true with true
        is_justified:
          el.is_justified === "true" || el.is_justified === "false"
            ? JSON.parse(el.is_justified)
            : el.is_justified,
      }));
      const not_modified_slots = structuredClonePolyfilled(slots);
      Object.keys(structuredClonePolyfilled(slots)).forEach((key) => {
        slots[key] = transformSlots(
          slots[key],
          store.state.EXTRA_CURRICULAR_SUBJECTS
        );
      });
      const isTeacher =
        store.state.authentication.user_data.groups.includes("teacher");
      const getTeacherSlots = isTeacher
        ? () =>
            $axios.$get(
              `api/teachers/${store.state.authentication.user_data.id}`
            )
        : () => Promise.resolve([]);
      return {
        students: students.map(({ student_name, ...el }) => ({
          ...el,
          student_name: student_name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""),
        })),
        original_absent_students: structuredClonePolyfilled(absent_students),
        absent_students,
        classes: isTeacher
          ? classes.filter((el) =>
              store.state.authentication.user_data.classes_ids.includes(el.id)
            )
          : classes,
        class_id,
        slots: not_modified_slots,
        extra_curricular_classes_slots: slots,
        teacher_slots: await getTeacherSlots(),
        late_students,
        // TODO: Check users permissions (if teacher) and set true
        visualize: false,
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
      hasAutocompleteBeenTouch: false,
      absentStudentQuery: "",
      removeSwipeHandlers: [],
      itemsToShowTrashButton: {},
      selectedStudentsThatArriveLateToRemove: [],
      alreadyAddedListeners: [],
    };
  },
  computed: {
    suggestions() {
      const result = filterMap(
        this.valid_students,
        (el) =>
          el.student_name
            .replace(/[\u0300-\u036f]/g, "")
            ?.toLowerCase()
            .includes(this.absentStudentQuery?.toLowerCase()),
        ({ student_name, id, class_id }) => ({
          label: student_name,
          value: id,
          class_id,
        })
      );
      return [{ data: result }];
    },
    isClassAdvanced() {
      return this.class_id
        ? ["4to", "5to", "6to"].includes(
            this.classes
              ?.find((el) => el.id === this.class_id)
              .class.split(" ")[0]
          )
        : false;
    },
    nearest_item_in_extra_curricular_shift() {
      const date = new Date();
      const nearest_item_in_extra_curricular_shift =
        this.extra_curricular_classes_slots[
          this.class_id_without_rendering_in_dom || this.class_id
        ]?.reduce?.(
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
      return this.$store.state.authentication.user_data.groups.includes(
        "preceptor"
      ) ||
        this.$store.state.authentication.user_data.groups.includes(
          "management_team"
        )
        ? nearest_item_in_extra_curricular_shift?.subject
        : pickRandomFromArray(
            this.$store.state.authentication.user_data.subjects
          );
    },
    renderPage() {
      const EXTRA_CURRICULAR_SUBJECTS =
        this.$store.state.EXTRA_CURRICULAR_SUBJECTS;
      return (
        this.$store.state.authentication.user_data?.groups.includes(
          "preceptor"
        ) ||
        this.$store.state.authentication.user_data?.groups.includes(
          "management_team"
        ) ||
        (this.$store.state.authentication.user_data?.groups.includes(
          "teacher"
        ) &&
          this.$store.state.authentication.user_data?.subjects?.some?.((s) =>
            EXTRA_CURRICULAR_SUBJECTS.includes(s)
          ))
      );
    },
    valid_students() {
      const isMorning = new Date().getHours() < 12 ? true : false;
      const idealShiftPrediction =
        (isMorning && this.isClassAdvanced) ||
        (!isMorning && !this.isClassAdvanced)
          ? "Turno"
          : this.nearest_item_in_extra_curricular_shift || "Turno";
      const absent_students = this.absent_students;
      return this.students.filter((el) => {
        const hasSubjects = this.$store.state.authentication.user_data.subjects;
        const extra_curricular_subjects_quantity = hasSubjects
          ? this.extra_curricular_classes_slots[el.class_id].filter((el) =>
              this.$store.state.authentication.user_data.subjects.includes(
                el.subject
              )
            ).length
          : this.extra_curricular_classes_slots[el.class_id].length;
        const student_appearances_in_absence_list = absent_students.filter(
          (el2) => el2.id === el.id
        );
        const amount_of_times_student_appears =
          student_appearances_in_absence_list.length;
        return (
          (this.absent_students?.find((el2) => el2.id === el.id)?.shift ===
            idealShiftPrediction ||
            (!hasSubjects
              ? amount_of_times_student_appears <=
                extra_curricular_subjects_quantity
              : amount_of_times_student_appears <=
                extra_curricular_subjects_quantity)) &&
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
    visualize() {
      this.setupListeners();
    },
    async date(new_val, old_val) {
      await this.update_absent_students_and_class(new_val);
      const day_index_in_arr = new_val.getDay() - 1;
      const current_day_index =
        day_index_in_arr > 4 || day_index_in_arr < 0 ? 4 : day_index_in_arr;
      Object.keys(this.extra_curricular_classes_slots).forEach((k) => {
        this.extra_curricular_classes_slots[k] = filterMap(
          this.slots[k][current_day_index].assignments,
          (el) =>
            this.$store.state.EXTRA_CURRICULAR_SUBJECTS.includes(el.subject),
          (el) => ({
            subject: el.subject,
            start_time: el.start_time.slice(0, -3),
          })
        );
      });
    },
    async class_id() {
      await this.update_absent_students_and_class(this.date, true);
      this.alreadyAddedListeners = [];
      this.setupListeners();
    },
    absent_students() {
      this.alreadyAddedListeners = [];
      this.setupListeners();
    },
    late_students() {
      this.alreadyAddedListeners = [];
      this.setupListeners();
    },
  },
  beforeDestroy() {
    this.removeSwipeHandlers.forEach((el) => el());
  },
  mounted() {
    this.is_mobile = window.innerWidth < 768;
    if (!process.server) {
      this.setupListeners();
    }
  },
  methods: {
    tabClick(params) {
      this.visualize = params.click;
    },
    async save_data_without_absent_students() {
      const formatted_date = removeTimeFromDate(this.date);
      await this.$axios.$post("/api/checked-classes", {
        date: formatted_date,
        classes_ids: [this.class_id],
      });
      this.show_notification = true;
      setTimeout(() => {
        this.show_notification = !this.show_notification;
      }, 2000);
    },
    setupListeners() {
      this.$nextTick(() => {
        Object.values(this.$refs)
          .flat()
          .forEach((el, i) => {
            if (this.alreadyAddedListeners.includes(el.id)) return;
            this.removeSwipeHandlers.push(
              addHorizontalSwipeHandler(
                el,
                ({ toLeft, toRight }) => {
                  if (toLeft) {
                    this.$set(this.itemsToShowTrashButton, el.id, true);
                  } else if (toRight) {
                    this.$set(this.itemsToShowTrashButton, el.id, false);
                  }
                },
                {
                  maxSwipeTime: 300,
                  minHorizontalSwipeDistance: 60,
                  maxVerticalSwipeDistance: 80,
                }
              )
            );
            this.alreadyAddedListeners.push(el.id);
          });
      });
    },
    async removeLateStudent(id, shift) {
      this.late_students = this.late_students.filter((el) => el.id !== id);
      const { student_name } = this.students.find((el) => el.id === id);
      const [first_name, last_name] = student_name.split(", ");
      this.absent_students.push({
        id,
        shift,
        first_name,
        last_name,
        accidentally_deleted: true,
      });
      await this.save_data();
    },
    turnHasAutocompleteBeenTouchFalse() {
      this.hasAutocompleteBeenTouch = false;
    },
    changeShift(index, val) {
      this.absent_students[index].previous_shift =
        this.absent_students[index].shift;
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
      const reason = wasLate ? "Llegó tarde" : "Error al pasar el listado";
      const student_index = this.absent_students.findIndex(
        (el) => el.id === this.current_abs_student
      );
      this.deleted_students.unshift({
        id: this.current_abs_student,
        deleted_because: reason,
        shift: this.absent_students[student_index].shift,
      });
      this.itemsToShowTrashButton = Object.fromEntries(
        Object.keys(this.itemsToShowTrashButton).map((el) => [el, false])
      );
      if (reason === "Llegó tarde") {
        this.late_students.unshift({
          student_name: this.students.find(
            (el) => el.id === this.current_abs_student
          ).student_name,
          shift: this.absent_students[student_index].shift,
          id: this.current_abs_student,
        });
      }
      this.absent_students.splice(student_index, 1);
      this.show_sidebar = false;
      this.new_justification = null;
      this.absence_reason = null;
      this.save_data(true);
    },
    async addAbsentStudent(data) {
      if (!data) {
        return;
      }
      const isMorning = new Date().getHours() < 12 ? true : false;
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
      const dataToPush = {
        id: data.value,
        shift:
          !idealShiftPrediction ||
          repeated_students.some((el) => el.shift === idealShiftPrediction)
            ? [
                ...this.extra_curricular_classes_slots[data.class_id].map(
                  (el) => el.subject
                ),
                "Turno",
              ].find(
                (el) =>
                  // first that has not been selected
                  !this.absent_students.find(
                    (el2) => el2.shift === el && el2.id === data.value
                  )
              )
            : idealShiftPrediction,
        first_name,
        last_name,
        class_id: data.class_id,
        is_justified: false,
      };

      // if data to push has no duplicates
      // push it
      if (
        dataToPush.shift &&
        !this.absent_students.some(
          (el) => el.id === dataToPush.id && el.shift === dataToPush.shift
        )
      ) {
        this.absent_students.push(dataToPush);
        this.itemsToShowTrashButton = Object.fromEntries(
          Object.keys(this.itemsToShowTrashButton).map((el) => [el, false])
        );
      }
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
      this.late_students = await this.$axios.$get("/api/late-students", {
        params: {
          date: formatted_date,
          classes_ids: this.class_id
            ? JSON.stringify([this.class_id])
            : JSON.stringify(this.classes.map((el) => el.id)),
        },
      });
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
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    async save_data(dont_update_checked_classes = false) {
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
        await Promise.all([
          this.$axios.$post("/api/absent-students", {
            list: [
              ...absent_students_without_absolute_duplicates,
              ...this.deleted_students,
            ],
            date: removeTimeFromDate(this.date),
          }),

          dont_update_checked_classes
            ? () => {}
            : this.$axios.$post("/api/checked-classes", {
                // get classes ids of every absent student
                classes_ids: this.absent_students.map((el) => el.class_id),
                date: removeTimeFromDate(this.date),
              }),
        ]);
        this.show_notification = true;
      } catch (error) {
        this.show_notification = "error";
        this.$reportNetworkError(error);
      }
      this.hasAutocompleteBeenTouch = false;
      setTimeout(() => {
        this.show_notification = !this.show_notification;
      }, 2000);
    },
  },
};
</script>

<style scoped>
body {
  max-width: 100vw;
}
.calendar :deep(.vc-title) {
  text-transform: capitalize;
}

#autosuggest :deep(#autosuggest-input) {
  @apply relative !p-1.5 !min-w-full !min-h-full focus-visible:!outline-none border-primary-lightblue border-2 rounded-xl transition duration-500 focus:border-primary-blue;
}
#autosuggest :deep(.suggestions) {
  @apply !border-none shadow rounded-md min-w-full mt-2 bg-white-full;
}
#autosuggest :deep(.autosuggest-autosuggest__results) {
  @apply border-none absolute z-30 w-full md:w-auto;
}
#autosuggest :deep(.hover) {
  @apply !bg-gray-light;
}
#autosuggest :deep(.autosuggest__results-item) {
  @apply !my-2 !p-3 text-black w-full bg-gray-light rounded md:w-auto;
}
</style>
