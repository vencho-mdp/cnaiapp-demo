export const state = () => ({
  show_bug_reporting_sidebar: false,
  show_toast: false,
  see_img_bigger: false,
  toast_content: "¡Guardado!",
});

export const mutations = {
  toggle_bug_reporting_sidebar(state) {
    state.show_bug_reporting_sidebar = !state.show_bug_reporting_sidebar;
  },
  change_toast_content(state, content) {
    state.toast_content = content;
  },
  change_toast_state(state, payload) {
    state.show_toast = payload;
  },
  change_see_img_bigger_state(state, url) {
    state.see_img_bigger = url;
  },
};

export const getters = {};

export const actions = {
  async nuxtServerInit({ dispatch, commit, state }) {
    const { access_token = null, refresh_token = null } = state.authentication;
    if (access_token) {
      try {
        commit("authentication/SET_PAYLOAD", {
          token: access_token,
          refresh_token,
        });
      } catch (e) {
        await dispatch("authentication/logout");
      }
    }
  },
};
