export default {
  head () {
    const route = this.$route.name === 'index' ? 'inicio' : this.$route.name?.split?.('-').join(' ')
    const capitalize_each_word = string =>
      string
        ? string.toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        : ''
    const title = `${capitalize_each_word(route)} | Colegio Nacional Doctor Arturo Illia`
    return {
      title
    }
  }
}
