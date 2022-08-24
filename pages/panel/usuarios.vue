<template>
  <main class="p-10">
    <span class="flex items-center justify-between w-40 mb-8">
      <v-subtitle> Usuarios </v-subtitle>
      <icon-button
        class="bg-primary-blue shadow-md duration-500 hover:scale-105"
        @click.native="alert"
      >
        <img src="~/assets/images/plus.svg" class="h-4 w-4" alt="Eliminar" />
      </icon-button>
    </span>
    <Filters />
    <v-table
      @editUser="editUser"
      @deleteUser="deleteUser"
      :items="
        users && users.filter((u, i) => i >= offset && i <= offset + limit)
      "
      :headers="tableHeaders"
      :actions="tableActions"
    />
    <transition name="fade">
      <lazy-v-sidebar
        v-if="isDeletingUser || isEditingUser"
        :title="sidebarTitle"
        @closeSidebar="closeSidebar"
      >
        <template #content>
          <LayoutsUsersForm
            :delete-user="isDeletingUser"
            @closeSidebar="closeSidebar"
            @handleClick="deleteUser(arguments[0], false)"
          />
        </template>
      </lazy-v-sidebar>
    </transition>
  </main>
</template>
<script>
// then should use useFetch and useAsyncData to get the data
// in nuxt 3
const groups_translations = {
  community_manager: "Community Manager",
  management_team: "Directivo",
  preceptor: "Preceptor",
  teacher: "Profesor",
  student: "Estudiante",
};
export default {
  data() {
    return {
      tableActions: [
        {
          label: "Editar",
          icon: "pencil",
          handlerName: "editUser",
        },
        {
          label: "Eliminar",
          icon: "trash",
          handlerName: "deleteUser",
        },
      ],
      showSidebar: false,
      isDeletingUser: false,
      sidebarTitle: null,
      sidebarSubtitle: null,
      isEditingUser: false,
      limit: 10,
      offset: 0,
    };
  },
  async asyncData({ $axios, $reportNetworkError }) {
    try {
      const users = await $axios.$get("/api/users");
      const tableHeaders = [
        {
          label: "Nombre",
          props: ["first_name", "last_name"],
        },
        {
          label: "Email",
          props: ["email"],
        },
        {
          label: "Rol/es",
          props: ["groups"],
        },
        {
          label: "Materias",
          props: ["subjects"],
        },
        {
          label: "Clases",
          props: ["classes"],
        },
      ];
      return {
        users: users.map(({ groups, ...rest }) => ({
          groups: groups.map((el) => {
            return groups_translations[el];
          }),
          ...rest,
        })),
        tableHeaders,
      };
    } catch (error) {
      $reportNetworkError(error);
      return { error };
    }
  },
  methods: {
    closeSidebar() {
      this.showSidebar = false;
      this.isDeletingUser = false;
      this.sidebarTitle = null;
      this.sidebarSubtitle = null;
    },
    async deleteUser({ id }, isConfirmation = true) {
      if (!isConfirmation) {
        await this.$axios.$delete(`/api/users`, { user_id: id });
        this.users = this.users.filter((u) => u.id !== id);
        return;
      }
      this.sidebarTitle = "¿Estás seguro de eliminar este usuario?";
      this.sidebarSubtitle =
        "Los datos relacionados (por ej: clases) con este usuario serán eliminados";
      this.showSidebar = true;
      this.isDeletingUser = id;
    },
    editUser({ id }) {
      this.sidebarTitle = "Editar usuario";
      this.sidebarSubtitle = "Editar los datos del usuario";
      this.showSidebar = true;
      this.isEditingUser = id;
    },
  },
};
</script>
