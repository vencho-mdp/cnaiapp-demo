<template>
  <slots-accordion
    v-if="formattedSlots"
    :edit="false"
    :assignments="formattedSlots"
    :default-index="currentIndex || default_index"
    class="accordion"
    :first-prop-to-show="firstPropToShow"
    @update_index="update_index"
  />
  <warning-sign v-else> Ha Ocurrido un error </warning-sign>
</template>

<script>
const day_index = new Date().getDay() - 1;
export default {
  props: {
    slots: {
      type: Array,
      default: () => [],
    },
    firstPropToShow: {
      type: String,
      default: "subject",
    },
    currentIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      default_index: day_index > 4 || day_index < 0 ? 4 : day_index,
    };
  },
  computed: {
    formattedSlots() {
      if (!this.slots) {
        return;
      }
      const formattedSlots = this.slots.reduce((acc, cur) => {
        for (const assignment of cur.assignments) {
          const { teachers_names, start_time, end_time, ...rest } = assignment;
          acc.push({
            teachers: teachers_names?.map?.((el) => ({ label: el })),
            weekday: cur.weekday,
            start_time: start_time.slice(0, -3),
            end_time: end_time.slice(0, -3),
            ...rest,
          });
        }
        acc.push();
        return acc;
      }, []);
      return formattedSlots;
    },
  },
  methods: {
    update_index(index) {
      this.$emit("update:currentIndex", index);
    },
  },
};
</script>

<style scoped>
.accordion :deep(.c-accordion__item) {
  @apply rounded-l shadow-md text-sm !bg-transparent !my-6;
}
.accordion :deep(.c-accordion__title) {
  @apply border-primary-lightblue rounded-t-lg !bg-primary-blue !border-b-2 !shadow-none;
}
.accordion :deep(.weekday) {
  @apply !text-sm !text-white;
}
.accordion :deep(.c-accordion__toggle) {
  @apply invert filter;
}
.accordion :deep(.c-accordion__content) {
  @apply !rounded-b-full;
}
</style>
