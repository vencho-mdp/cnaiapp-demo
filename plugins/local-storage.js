import createPersistedState from "vuex-persistedstate";
import * as Cookies from "js-cookie";
import cookie from "cookie";

export default ({ store, req, isDev }) => {
  createPersistedState({
    key: "authentication-cookie", // choose any name for your cookie
    paths: ["authentication.refresh_token", "authentication.access_token"],
    storage: {
      // if on the browser, parse the cookies using js-cookie otherwise parse from the raw http request
      getItem: (key) =>
        process.client
          ? // Objeto vacío para que no intente parsear la cookie si está vacía
            JSON.parse(Cookies.get(key) || "{}")
          : cookie.parse(req.headers.cookie || "")[key],
      // js-cookie can handle setting both client-side and server-side cookies with one method
      // use isDev to determine if the cookies is accessible via https only (i.e. localhost likely won't be using https)
      setItem: (key, value) =>
        Cookies.set(key, value, {
          expires: 14,
          secure: !isDev,
        }),
      // also allow js-cookie to handle removing cookies
      removeItem: (key) => Cookies.remove(key),
    },
  })(store);
};
