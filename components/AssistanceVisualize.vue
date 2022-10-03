<template>
  <div class="h-full">
    <div class="flex flex-col mt-12 items-start w-2/3 md:w-auto">
      <span class="flex md:justify-start md:gap-4 justify-between w-full mb-2">
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
    <transition name="fade">
      <div
        v-if="formatted_absence_dates"
        :key="`${selectedStudent}${term}`"
        class="w-full flex flex-col items-start mt-20"
      >
        <span class="font-bold text-xs mb-2">
          Ausencias: {{ formatted_absence_dates.length }}</span
        >
        <v-calendar
          :attributes="formatted_absence_dates"
          :is-expanded="isMobile"
          :max-date="new Date()"
          class="calendar"
          locale="es"
        />
        <!-- <span class="flex justify-between my-4 items-center px-12 w-full">
          <PillButton> ⬅️ </PillButton>
          <PillButton> ➡️ </PillButton>
        </span> -->
      </div>
    </transition>
  </div>
</template>
<script>
const JUSTIFICATION_COLOR = {
  Turno: "blue",
  Informática: "teal",
  Plástica: "red",
  Música: "red",
  Inglés: "black",
  Teatro: "red",
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
  current_day: new Date(),
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
      term: "last_day",
      terms: [
        {
          label: "Hoy",
          value: "current_day",
        },
        {
          label: "Semana",
          value: "last_week",
        },
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
          color: JUSTIFICATION_COLOR[el.justification],
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
</style>
