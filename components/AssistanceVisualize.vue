<template>
  <div class="h-full">
    <transition name="fade" mode="out-in">
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
              classes
                ? classes.map((c) => ({ label: c.class, value: c.id }))
                : []
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
          class="mt-8 !w-min whitespace-nowrap"
          :disabled="!(class_id && term)"
        >
          Exportar Datos
          {{ selectedStudent ? "de Estudiante" : class_id ? "de Clase" : "" }}
        </SmallButton>
        <transition name="fade">
          <div
            v-if="formatted_absence_dates"
            :key="`${selectedStudent}${term}`"
            class="w-full flex flex-col items-start mt-12 pr-2 pb-2"
          >
            <span class="font-bold text-xs mb-2">
              Ausencias: {{ formatted_absence_dates.length }}</span
            >

            <v-calendar
              :attributes="formatted_absence_dates"
              :is-expanded="isMobile"
              :max-date="new Date()"
              class="calendar"
              :min-date="dateOfFirstDayInCurrentMonth"
              locale="es"
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
    </transition>
  </div>
</template>
<script>
import getDates from "../utils/getDates.js";
import formatDate from "../utils/formatDate.js";
const SHIFT_COLOR = {
  Turno: "blue",
  Informática: "teal",
  Plástica: "red",
  Música: "red",
  Inglés: "black",
  Teatro: "red",
};
const CSS_TO_HEX = {
  blue: "3B82F6",
  teal: "10B981",
  red: "EF4444",
  black: "000000",
};
const daysSinceMarch01 = (date = new Date()) => {
  const march01 = new Date(date.getFullYear(), 2, 1);
  return Math.round((date - march01) / (1000 * 60 * 60 * 24));
};
const daysSinceAugust01 = (date = new Date()) => {
  const august01 = new Date(date.getFullYear(), 7, 1);
  return Math.round((date - august01) / (1000 * 60 * 60 * 24));
};
// if date > august 01, is second quarter
const isSecondQuarter = daysSinceAugust01() > 0;
const TERMS_MAPPER_TO_DATES = {
  last_week: new Date(new Date().setDate(new Date().getDate() - 7)),
  last_month: new Date(new Date().setDate(new Date().getDate() - 30)),
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
    isMobile: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dateOfFirstDayInCurrentMonth: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ),
      term: null,
      terms: [
        {
          label: "Semana",
          value: "last_week",
        },
        {
          label: "Mes",
          value: "last_month",
        },
        // {
        //   label: "Cuatrimestre",
        //   value: "last_quarter",
        // },
        // {
        //   label: "Año",
        //   value: "last_year",
        // },
      ],
      selectedStudent: "",
      class_id: null,
      formatted_absence_dates: null,
      loading: false,
    };
  },
  watch: {
    term() {
      this.formatAbsenceDates();
    },
    class_id() {
      this.formatAbsenceDates();
    },
    selectedStudent() {
      this.formatAbsenceDates();
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
      XLSX.utils.book_append_sheet(wb, ws, "Ausencias");
      XLSX.writeFile(wb, "Ausencias.xlsx");
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
      this.formatted_absence_dates = data.map((el) => {
        const res = {
          dates: new Date(el.date),
          highlight: true,
          color: SHIFT_COLOR[el.justification],
          popover: {
            label:
              el.is_justified === "false"
                ? "Ausencia no justificada"
                : el.is_justified,
            visibility: "focus",
          },
        };
        // if (el.is_justified === "false") delete res.popover;
        return res;
      });
    },
  },
  computed: {
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
