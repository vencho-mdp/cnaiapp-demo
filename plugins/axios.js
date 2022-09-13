export default function ({ store, app, app: { $axios }, redirect }) {
  $axios.onRequest((config) => {
    // check if the user is authenticated
    if (store.state.authentication.access_token) {
      // set the Authorization header using the access token
      config.headers.Authorization =
        "Bearer " + store.state.authentication.access_token;
    }
    return config;
  });

  $axios.onError(async (error) => {
    const statusCode = error.response ? error.response.status : -1;
    if (statusCode === 401 || statusCode === 422) {
      // get the refresh token from the state if it exists
      const refreshToken = store.state.authentication.refresh_token;
      if (refreshToken) {
        if (!store.state.authentication.tried) {
          // catch any error while refreshing the token
          await store.dispatch("authentication/logout");
          return Promise.resolve(redirect("/iniciar-sesion"));
        }
        try {
          // attempt to refresh access token using refresh token
          await store.dispatch("authentication/refresh");
          return $axios(error.config);
        } catch (e) {
          store.commit("authentication/SET_TRIED", true);
          // catch any error while refreshing the token
          await store.dispatch("authentication/logout");
          return Promise.resolve(redirect("/iniciar-sesion"));
        }
      }
    }
  });
}
