export default function ({ store, redirect, route }) {
  // If the user is not authenticated
  if (!store.getters['authentication/isAuthenticated']) {
    return redirect('/iniciar-sesion')
  }
  if (
    route.path === '/dashboard/asistencia-alumnos' &&
    !(
      store.state.authentication?.user_data?.groups.includes('preceptor') ||
      store.state.authentication?.user_data?.groups.includes('management_team') ||
      store.state.authentication.user_data?.subjects.some(subject => store.state.EXTRA_CURRICULAR_SUBJECTS.includes(subject))
    )
  ) {
    return redirect('/dashboard')
  }
  if (
    route.path === '/dashboard/auditoria' &&
    !store.state.authentication?.user_data?.groups.includes('management_team')
  ) {
    return redirect('/dashboard')
  }
}
