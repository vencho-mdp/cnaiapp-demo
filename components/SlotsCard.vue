<template>
  <v-card
    :data="formattedSlots"
    :change-records="false"
    :title="formattedSlots ? 'Horarios de Hoy' : 'No hay clases hoy'"
    class="mb-8"
  />
</template>

<script>
const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const removeLastThreeCharacters = str => str.slice(0, -3)

export default {
  props: {
    slots: {
      type: Array,
      required: true
    }
  },
  computed: {
    formattedSlots () {
      const day =
        process.env.NODE_ENV === 'development'
          ? 'Martes'
          : new Date().getDay() > 5
            ? null
            : days[new Date().getDay() - 1]
      if (!day) { return false }

      const formattedSlots = this.slots
        .find(el => el.weekday === day)
        .assignments.map(({ start_time, end_time, subject }) => ({
          label: subject,
          desc: `${removeLastThreeCharacters(
            start_time
          )} - ${removeLastThreeCharacters(end_time)}`
        }))
      return formattedSlots
    }
  }
}
</script>
