<template>
  <v-card
    :data="renamedAbsentTeachers"
    :change-records="changeRecords"
    v-bind="$attrs"
    title="Profesores Ausentes"
    class="mb-8"
    @addItem="
      $emit('addItem', 'Profesores Ausentes', 'LayoutsAbsentTeachersForm')
    "
    @deleteItem="
      $emit('deleteItem', arguments[0].id, 'absent-teachers', 'ABSENT_TEACHERS')
    "
    @editItem="
      $emit(
        'editItem',
        arguments[0],
        'Profesores Ausentes',
        'LayoutsAbsentTeachersForm'
      )
    "
  />
</template>

<script setup>
import formatDate from "../utils/formatDate";
import { computed } from "vue";

const props = defineProps({
  absentTeachers: {
    type: Array,
    default: () => [],
  },
  changeRecords: {
    type: [Boolean, String],
    default: true,
  },
});

const renamedAbsentTeachers = computed(() => {
  return props.absentTeachers.map(
    ({ start_date, end_date, teacher_name, ...rest }) => ({
      label: teacher_name,
      desc: `${formatDate(start_date)} - ${formatDate(end_date)}`,
      start_date,
      end_date,
      ...rest,
    })
  );
});
</script>
