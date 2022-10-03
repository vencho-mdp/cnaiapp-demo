export const AUTH_MUTATIONS = {
  SET_PAYLOAD: "SET_PAYLOAD",
  LOGOUT: "LOGOUT",
};

export const state = () => ({
  access_token: null,
  refresh_token: null,
  user_data: undefined,
  tried: false,
});

export const mutations = {
  SET_PAYLOAD(state, payload) {
    state.access_token = payload.token;
    if (payload.token) {
      const { iat, exp, ...user_data } = JSON.parse(
        Buffer.from(payload.token.split(".")[1], "base64")
      );
      state.user_data = user_data;
      if (payload.refresh_token) {
        state.refresh_token = payload.refresh_token;
      }
    }
  },

  LOGOUT(state) {
    state.access_token = null;
    state.refresh_token = null;
    state.user_data = null;
  },
  SET_TRIED(state, payload) {
    state.tried = payload;
  },
};

export const actions = {
  async login({ commit, dispatch }, { email_address, password }) {
    const data = await this.$axios.$post("/api/login", {
      email: email_address,
      password,
    });
    commit("SET_PAYLOAD", data);
  },

  //   async register({ commit }, { email_address, password }) {
  //     // make an API call to register the user
  //     const {
  //       data: {
  //         data: { user, payload }
  //       }
  //     } = await this.$axios.post('/api/authentication/register', {
  //       email_address,
  //       password
  //     });

  //     // commit the user and tokens to the state
  //     commit(AUTH_MUTATIONS.SET_USER, user);
  //     commit(AUTH_MUTATIONS.SET_PAYLOAD, payload);
  //   },

  // given the current refresh token, refresh the user's access token to prevent expiry

  async refresh({ commit, state }) {
    try {
      const payload = await this.$axios.$post("/api/token", {
        refreshToken: state.refresh_token,
      });
      commit("SET_PAYLOAD", payload);
    } catch (error) {
      // invalid refresh token
      commit("LOGOUT");
    }
  },

  // logout the user
  logout({ commit, state }) {
    commit("LOGOUT");
  },
};

export const getters = {
  // determine if the user is authenticated based on the presence of the access token
  isAuthenticated: (state) => {
    return state.access_token && state.access_token !== "";
  },
};
