<template>
  <div class="min-h-screen md:flex" data-dev-hint="container">
    <aside
      id="sidebar"
      class="bg-primary-darkblue flex w-full px-8 gap-16 items-center overflow-y-auto justify-around md:flex-col md:px-0 py-3 md:pt-10 md:pb-96 md:w-16 md:!justify-start"
    >
      <span v-for="link in filtered_links" :key="link.name">
        <nuxt-link :to="`/panel/${link.route}`">
          <img
            class="hover-effect"
            :src="getImgUrl(link.img)"
            :alt="link.route"
          />
        </nuxt-link>
      </span>
      <a class="cursor-pointer hover-effect" @click="handleLogout()">
        <img :src="getImgUrl('log-out')" alt="Cerrar sesión" />
      </a>
    </aside>

    <main id="content" class="flex-1 max-h-full">
      <slot />
    </main>
  </div>
</template>

<script>
export default {
  name: "SideNavbar",
  data() {
    return {
      links: [
        {
          img: "home",
          route: "",
          should_render: true,
        },
        {
          img: "take-attendance",
          route: "asistencia-alumnos",
          should_render:
            (this.$store.state.authentication.user_data?.groups.includes(
              "preceptor"
            ) &&
              this.$store.state.authentication.user_data.classes_ids.length >
                0) ||
            this.$store.state.authentication.user_data?.groups.includes(
              "management_team"
            ) ||
            this.$store.state.authentication.user_data?.subjects?.some(
              (subject) =>
                this.$store.state.EXTRA_CURRICULAR_SUBJECTS.includes(subject)
            ),
        },
        // {
        //   img: "users",
        //   route: "usuarios",
        //   should_render:
        //     this.$store.state.authentication.user_data.groups.includes(
        //       "management_team"
        //     ),
        // },
        {
          img: "auditory",
          route: "auditoria",
          should_render:
            this.$store.state.authentication.user_data.groups.includes(
              "management_team"
            ),
        },
      ],
    };
  },
  computed: {
    filtered_links() {
      return this.links.filter((link) => link.should_render);
    },
  },
  methods: {
    getImgUrl(name) {
      const images = require.context("../assets/images", false, /\.svg$/);
      return images("./" + name + ".svg");
    },
    handleLogout() {
      this.$router.replace({
        path: "/iniciar-sesion",
      });
      setTimeout(() => {
        this.$store.dispatch("authentication/logout");
      }, 100);
    },
  },
};
</script>

<style scoped></style>
