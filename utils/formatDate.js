const formatDate = (date, options = {}) => {
  return new Date(date)
    .toLocaleDateString('es-AR', {
      month: options.month || 'short',
      day: 'numeric'
    })
    .replaceAll('.', '')
}

export default formatDate
