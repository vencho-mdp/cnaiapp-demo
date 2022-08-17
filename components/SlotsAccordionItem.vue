<template>
  <span class="flex max-w-full justify-between">
    <span class="flex flex-col flex-shrink">
      <h5 class="font-bold text-xs" :class="black_or_gray">
        {{ assignment[firstPropToShow] }}
      </h5>
      <h5 class="text-xs" :class="black_or_gray">
        {{
          assignment.teachers && assignment.teachers.map((el) => el && el.label).join(" - ")
        }}
      </h5>
      <h6 class="text-xs" :class="black_or_gray">
        {{ assignment.start_time }} - {{ assignment.end_time }}
      </h6>
    </span>
    <span v-if="edit" class="flex mx-1 justify-evenly items-center">
      <icon-button
        class="bg-red-light border-red border border-opacity-25 h-9 w-9 duration-500 md:mr-2 hover:scale-105"
        type="button"
        @click.native="$emit('delete-assignment', assignment)"
      >
        <img src="~/assets/images/trash.svg" alt="Eliminar">
      </icon-button>
      <icon-button
        class="bg-primary-lightblue border-primary-blue border border-opacity-25 h-9 ml-4 w-9 duration-500 hover:scale-105"
        type="button"
        @click.native="$emit('edit-assignment', assignment)"
      >
        <img src="~/assets/images/pencil.svg" alt="Editar">
      </icon-button>
    </span>
    <span
      v-else-if="show_absence_warning"
      class="flex justify-end items-center"
      data-test="teacher-absence-warning"
    >
      <img src="~/assets/images/warning-sign.svg" alt="¡Alerta!">
      <h5 class="border-b border-red-dark shadow-sm text-red text-xs ml-2">
        El profesor faltará
        <span class="font-bold text-red">
          {{
            !are_dates_equal
              ? `desde el ${formatDate(assignment.absence_start_date)} al ${formatDate(assignment.absence_end_date)}`
              : ` el ${formatDate(assignment.absence_end_date)}`
          }}
        </span>
      </h5>
    </span>
  </span>
</template>

<script>
import formatDate from '../utils/formatDate'

export default {
  props: {
    assignment: {
      type: Object,
      default: () => ({})
    },
    edit: {
      type: Boolean,
      default: true
    },

    firstPropToShow: {
      type: String,
      default: 'subject'
    }
  },
  computed: {
    black_or_gray () {
      return this.show_absence_warning
        ? 'text-gray'
        : 'text-black'
    },
    show_absence_warning () {
      if (
        !(
          this.assignment.absence_start_date && this.assignment.absence_end_date
        )
      ) { return false }
      return true
    },
    are_dates_equal () {
      return new Date(this.assignment.absence_start_date).getTime() === new Date(this.assignment.absence_end_date).getTime()
    }
  },
  methods: {
    formatDate (date) {
      return formatDate(date, {
        month: 'numeric'
      })
    }
  }
}
</script>
