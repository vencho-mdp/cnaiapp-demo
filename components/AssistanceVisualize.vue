<template>
  <div class="h-full">
    <div v-if="!loading">
      <div class="flex flex-col mt-4 items-start w-2/3 md:w-auto">
        <span
          class="flex md:justify-start md:gap-4 justify-between w-full mb-2"
        >
          <v-label class="!text-sm"> Plazo </v-label>
          <!-- <PillButton>Elegir Fecha Exacta </PillButton> -->
        </span>
        <v-dropdown
          v-model="term"
          data-test="class_dropdown"
          class="bg-white-full !w-full md:max-w-xs"
          :options="terms"
        />
      </div>
      <div class="flex flex-col mt-12 items-start w-2/3 md:w-auto">
        <v-label class="mb-2 !text-sm"> Clase </v-label>
        <v-dropdown
          v-model="class_id"
          data-test="class_dropdown"
          class="bg-white-full !w-full md:max-w-xs"
          :options="
            classes ? classes.map((c) => ({ label: c.class, value: c.id })) : []
          "
        />
      </div>
      <div class="flex flex-col mt-12 items-start w-2/3 md:w-auto">
        <v-label class="mb-2 !text-sm"> Alumnos </v-label>
        <v-dropdown
          v-model="selectedStudent"
          data-test="class_dropdown"
          class="bg-white-full !w-full md:max-w-xs"
          :options="valid_students"
        />
      </div>
      <SmallButton
        @click.native="exportFile"
        class="mt-6 flex items-center justify-center !w-min"
        :disabled="!class_id || !term"
      >
        <img
          src="~/assets/images/export.svg"
          class="h-8 w-6 !max-w-max"
          alt="Exportar"
        />
      </SmallButton>
      <transition name="fade" mode="out-in">
        <div
          v-if="formatted_absence_dates"
          :key="`${selectedStudent}${term}`"
          class="w-full flex flex-col items-start mt-12 pr-2 pb-2"
        >
          <span class="font-bold text-xs mb-2">
            Ausencias: {{ formatted_absence_dates.length }}</span
          >
          <transition name="fade" mode="out-in">
            <v-calendar
              :attributes="formatted_absence_dates"
              ref="calendar-ref"
              :is-expanded="true"
              :max-date="new Date()"
              class="calendar mb-8"
              v-show="
                selectedStudent &&
                (term === 'last_week' || term === 'last_month' || selectedMonth)
              "
              :min-date="dateOfFirstDayInMonth"
              locale="es"
            >
              <!-- <template #day-popover="{ day, dayTitle, attributes }">
                <div class="text-xs text-gray-300 font-bold text-center">
                  {{ dayTitle }}
                </div>
              </template> -->
            </v-calendar>
          </transition>

          <VTable
            class="min-w-full"
            v-if="term === 'last_year' || term === 'last_quarter'"
            :items="
              months.map((m) => ({
                month: m,
                // 0 as number is falsy
                absences:
                  (absencesPerMonth &&
                    absencesPerMonth[m] &&
                    absencesPerMonth[m].length) ||
                  '0',
                listeners: {
                  click(e) {
                    selectedMonth = e.target.innerText;
                  },
                },
                classes: [
                  `!bg-[${heatMap[m] || heatMapColorScheme[0]}]`,
                  '!bg-opacity-40',
                  'cursor-pointer',
                ],
              }))
            "
            :headers="[
              {
                label: 'Mes',
                props: ['month'],
                classes: 'font-bold',
              },
              { label: 'Ausencias', props: ['absences'] },
            ]"
          />
          <!-- <span class="flex justify-between my-4 items-center px-12 w-full">
          <PillButton> ⬅️ </PillButton>
          <PillButton> ➡️ </PillButton>
        </span> -->
        </div>
      </transition>
    </div>
    <div v-else class="flex justify-center items-center h-64 p-4">
      <div class="spinner"></div>
    </div>
  </div>
</template>
<script>
import getDates from "../utils/getDates.js";
import formatDate from "../utils/formatDate.js";
import { heatMapColorScheme as rawHeatMapColorScheme } from "../utils/heatMapColorScheme";
const SHIFT_COLOR = {
  Turno: "blue",
  Informática: "teal",
  Plástica: "red",
  Música: "red",
  Inglés: "black",
  Teatro: "red",
};
// const CSS_TO_HEX = {
//   blue: "3B82F6",
//   teal: "10B981",
//   red: "EF4444",
//   black: "000000",
// };
const daysSinceMarch01 = (date = new Date()) => {
  const march01 = new Date(date.getFullYear(), 2, 1);
  return Math.round((date - march01) / (1000 * 60 * 60 * 24));
};
const daysSinceAugust01 = (date = new Date()) => {
  const august01 = new Date(date.getFullYear(), 7, 1);
  return Math.round((date - august01) / (1000 * 60 * 60 * 24));
};
const MONTHS = [
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
// if date > august 01, is second quarter
const isSecondQuarter = daysSinceAugust01() > 0;
const TERMS_MAPPER_TO_DATES = {
  // first day of the current week
  // last_week: new Date(
  //   new Date().setDate(new Date().getDate() - new Date().getDay())
  // ),
  // get last month, not last thirty days
  // return first day of current month
  last_month: new Date(new Date().setDate(1)),
  // last_quarter: if current date is greater than 01 aug, then it's the distance between that date and 01 aug
  // if not, it's the distance between that date and march 01
  last_quarter: isSecondQuarter
    ? new Date(new Date().setDate(new Date().getDate() - daysSinceAugust01()))
    : new Date(new Date().setDate(new Date().getDate() - daysSinceMarch01())),
  last_year: new Date(
    new Date().setDate(new Date().getDate() - daysSinceMarch01())
  ),
};
export default {
  props: {
    classes: {
      type: Array,
      default: () => [],
    },
    students: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      SHIFT_COLOR,
      heatMapColorScheme: rawHeatMapColorScheme.reverse(),
      dateOfFirstDayInCurrentMonth: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ),
      term: null,
      terms: [
        // {
        //   label: "Semana",
        //   value: "last_week",
        // },
        {
          label: "Mes",
          value: "last_month",
        },
        {
          label: "Cuatrimestre",
          value: "last_quarter",
        },
        {
          label: "Año",
          value: "last_year",
        },
      ],
      selectedStudent: "",
      class_id: null,
      formatted_absence_dates: null,
      loading: false,
      selectedMonth: null,
    };
  },
  watch: {
    term() {
      this.formatAbsenceDates();
    },
    class_id() {
      this.formatted_absence_dates = null;
      this.selectedStudent = "";
    },
    selectedStudent() {
      this.formatAbsenceDates();
    },
    selectedMonth(new_val) {
      if (
        !new_val ||
        this.dateOfFirstDayInMonth.getTime() > new Date().getTime()
      )
        return;
      const calendar = this.$refs["calendar-ref"];
      calendar.move({
        // jan is 1, feb is 2, etc
        month: MONTHS.indexOf(this.selectedMonth) + 2,
        year: new Date().getFullYear(),
      });
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    },
  },
  methods: {
    async exportFile() {
      if (!this.class_id) return;
      this.loading = true;
      let [XLSX, data = []] = await Promise.all([
        import("xlsx-js-style"),
        this.$axios.$get("/api/student-absence-dates", {
          params: {
            student_id: "all",
            class_id: this.class_id,
            since_date: TERMS_MAPPER_TO_DATES[this.term],
          },
        }),
      ]);
      XLSX = XLSX.default;
      let datesThatAreIncludedInTerm = getDates(
        TERMS_MAPPER_TO_DATES[this.term],
        new Date()
      );
      //  remove sundays and saturdays
      datesThatAreIncludedInTerm = datesThatAreIncludedInTerm.filter(
        (d) => d.getDay() !== 0 && d.getDay() !== 6
      );
      const studentWithoutDefaultValue = this.selectedStudent
        ? [this.valid_students.find((s) => s.value === this.selectedStudent)]
        : this.valid_students.slice(0, -1);
      const studentsAbsenceData = studentWithoutDefaultValue.map(
        ({ label, value }) => {
          const entries = datesThatAreIncludedInTerm.map((date) => {
            const formattedDate = formatDate(date);
            const absenceInfo = data.filter(
              (absence) =>
                absence.student_id === value &&
                formatDate(absence.date) === formattedDate
            );
            return absenceInfo[0]
              ? [
                  formattedDate,
                  {
                    v: absenceInfo
                      .map((absence) =>
                        absence.reason_of_deletion === "Llegó tarde"
                          ? `T (${absence.shift} - ${absence.is_justified})`
                          : `A (${absence.shift}${
                              absence.is_justified === "false"
                                ? ""
                                : " - " + absence.is_justified
                            })`
                      )
                      .join("\n"),
                    s: {
                      font: {
                        bold: true,
                        color: {
                          //red
                          rgb: "FF0000",
                        },
                      },
                    },
                  },
                ]
              : [
                  formattedDate,
                  {
                    v: "P",
                    s: {
                      font: {
                        color: { rgb: "098f14" },
                      },
                    },
                  },
                ];
          });
          return {
            Nombre: label,
            ...Object.fromEntries(entries),
          };
        }
      );
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(studentsAbsenceData);
      for (const i in ws) {
        if (typeof ws[i] != "object") continue;
        let cell = XLSX.utils.decode_cell(i);
        if (cell.r === 0) {
          // first column
          ws[i].s = {
            font: { bold: true },
          };
        }
      }
      const class_name = this.classes.find((c) => c.id === this.class_id).class;
      let worksheet_name =
        "Ausencias " +
        (this.selectedStudent
          ? this.students
              .find((el) => el.id === this.selectedStudent)
              .student_name.split(",")[0]
          : class_name) +
        " " +
        new Date().toLocaleDateString("es-AR", {
          month: "short",
          day: "numeric",
        });
      if (worksheet_name.length > 31) {
        worksheet_name = worksheet_name.slice(0, 31);
      }
      XLSX.utils.book_append_sheet(wb, ws, "Listado");
      XLSX.writeFile(wb, worksheet_name + ".xlsx");
      this.loading = false;
    },
    async formatAbsenceDates() {
      if (!this.class_id || !this.selectedStudent || !this.term) return null;
      const data = await this.$axios.$get("/api/student-absence-dates", {
        params: {
          student_id: this.selectedStudent,
          since_date: TERMS_MAPPER_TO_DATES[this.term],
        },
      });
      this.formatted_absence_dates = data?.map((el) => {
        const res = {
          dates: new Date(el.date),
          highlight: {
            color: SHIFT_COLOR[el.shift],
            fillMode: "light",
          },
          popover: {
            label:
              el.is_justified === "false"
                ? "Ausencia no justificada" + " - " + el.shift
                : el.is_justified,
          },
          visibility: "focus",
        };
        // if (el.is_justified === "false") delete res.popover;
        return res;
      });
    },
  },
  computed: {
    heatMap() {
      const totalAmountOfAbsences = this.formatted_absence_dates?.length;
      const percentages = Object.entries(this.absencesPerMonth || {}).map(
        (el) => {
          const [month, absences] = el;
          return {
            month,
            percentage: (absences.length / totalAmountOfAbsences) * 100,
          };
        }
      );
      const result = {};
      percentages.forEach((el) => {
        const { month, percentage } = el;
        const colorIndex = Math.floor(
          (percentage / 100) * (this.heatMapColorScheme.length - 1)
        );
        result[month] = this.heatMapColorScheme[colorIndex];
      });
      return result;
    },
    dateOfFirstDayInMonth() {
      return this.term === "last_month" || this.term === "last_week"
        ? this.dateOfFirstDayInCurrentMonth
        : TERMS_MAPPER_TO_DATES[this.term];
    },
    absencesPerMonth() {
      if (!this.class_id || !this.selectedStudent || !this.term) return null;
      // object of each month and array of the absences
      // { 'Enero': [absence1, absence2], 'Febrero': [absence3, absence4] }
      return this.formatted_absence_dates.reduce((acc, el) => {
        const month = MONTHS[el.dates.getMonth() - 1];
        if (!acc[month]) acc[month] = [];
        acc[month].push(el);
        return acc;
      }, {});
    },
    months() {
      const months_copy = MONTHS.slice(0).slice(0, new Date().getMonth());
      if (this.term === "last_year") {
        //  remove months that are yet to come
        return months_copy;
      }
      if (this.term === "last_quarter") {
        return months_copy.splice(6);
      }
    },
    valid_students() {
      return this.students
        .filter((s) => s.class_id === this.class_id)
        .map((el) => ({
          label: el.student_name,
          value: el.id,
        }))
        .concat("");
    },
  },
};
</script>
<style scoped>
.calendar :deep(.vc-day-popover-header) {
  @apply hidden;
}
.calendar :deep(.vc-day-popover-row-content) {
  @apply !text-white;
}
.calendar :deep(.vc-title) {
  text-transform: capitalize;
}
.spinner {
  display: block;
  margin: auto;
  height: 2em;
  width: 2em;
  border: 6px solid rgba(0, 174, 239, 0.2);
  border-top-color: rgba(0, 174, 239, 0.8);
  border-radius: 50%;
  animation: rotation 0.6s infinite linear;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(359deg);
  }
}
</style>
