<template>
  <v-card
    :data="renamednews"
    :change-records="changeRecords"
    title="Noticias"
    class="mb-8"
    @addItem="$emit('addItem', 'Noticias', 'LayoutsNewsForm')"
    @deleteItem="$emit('deleteItem', arguments[0].id, 'news')"
    @editItem="$emit('editItem', arguments[0], 'Noticias', 'LayoutsNewsForm')"
  />
</template>

<script>
import formatDate from '../utils/formatDate'
import changeRecordsProp from '../mixins/changeRecordsProp'

export default {
  mixins: [changeRecordsProp],
  props: {
    news: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    renamednews () {
      const formattednews = this.news.map(el => ({
        label: el.title,
        desc: formatDate(el.created_at),
        ...el
      }))
      return formattednews
    }
  }
}
</script>
