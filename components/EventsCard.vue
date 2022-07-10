<template>
  <v-card
    :data="formattedEvents"
    :change-records="true"
    title="Eventos"
    class="mb-8"
    @addItem="$emit('addItem', 'Eventos', 'LayoutsEventsForm')"
    @deleteItem="
      $emit('deleteItem', arguments[0].id, 'events')
    "
    @editItem="$emit('editItem', arguments[0], 'Eventos', 'LayoutsEventsForm')"
  />
</template>

<script>
import formatDate from '../utils/formatDate.js'

export default {
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    formattedEvents () {
      const formattedEvents = this.events.map(
        el => ({
          label: el.title,
          desc: formatDate(el.start_date) + ' - ' + formatDate(el.end_date),
          ...el
        })
      )
      return formattedEvents
    }
  }
}
</script>
