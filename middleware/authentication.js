export default function ({ store, redirect, route }) {
  if (route.path.startsWith("/dashboard")) {
    if (!store.getters["authentication/isAuthenticated"]) {
      return redirect("/iniciar-sesion");
    }
    const page = route.path.split("/")[2];
    return redirect(`/panel/${page || ""}`);
  }
  // If the user is not authenticated
  if (!store.getters["authentication/isAuthenticated"]) {
    return redirect("/iniciar-sesion");
  }
  if (
    route.path === "/panel/asistencia-alumnos" &&
    !(
      store.state.authentication?.user_data?.groups.includes("preceptor") ||
      store.state.authentication?.user_data?.groups.includes(
        "management_team"
      ) ||
      store.state.authentication.user_data?.subjects.some((subject) =>
        store.state.EXTRA_CURRICULAR_SUBJECTS.includes(subject)
      )
    )
  ) {
    return redirect("/panel");
  }
  if (
    route.path === "/panel/auditoria" &&
    !store.state.authentication?.user_data?.groups.includes("management_team")
  ) {
    return redirect("/panel");
  }
}
