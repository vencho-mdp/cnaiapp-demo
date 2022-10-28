<template>
  <main class="p-12">
    <span class="flex items-center justify-between w-40 mb-8">
      <v-subtitle> Usuarios </v-subtitle>
      <icon-button
        class="bg-primary-blue shadow-md duration-500 hover:scale-105"
        @click.native="addUser()"
      >
        <img src="~/assets/images/plus.svg" class="h-4 w-4" alt="Eliminar" />
      </icon-button>
    </span>
    <h3 class="text-sm font-bold mr-auto mt-6 w-5/6 mb-2 text-black">
      Filtros
    </h3>
    <span
      class="flex flex-wrap md:flex-nowrap max-w-lg items-end justify-start md:justify-around mb-8 mt-1 px-4 py-2 border rounded-md w-5/6 mr-auto border-gray-light"
    >
      <form-input
        label="Nombre"
        :value="filters.name"
        @input="(e) => (filters.name = e.target.value)"
      />
      <form-input
        label="Materia"
        v-if="filters.group === 'Profesor'"
        class="my-4 md:mx-6 md:my-0"
        :value="filters.subject"
        @input="(e) => (filters.subject = e.target.value)"
      ></form-input>
      <div class="flex flex-col">
        <v-label class="mb-2">Rol</v-label>
        <v-dropdown
          v-model="filters.group"
          :options="possible_groups"
        ></v-dropdown>
      </div>
    </span>
    <v-table
      @editUser="editUser"
      @deleteUser="deleteUser"
      :items="filtered_users"
      :headers="tableHeaders"
      :actions="tableActions"
      v-if="filtered_users.length > 0"
    />
    <warning-sign v-else>
      No se encontraron usuarios con los filtros seleccionados
    </warning-sign>
    <span class="flex justify-between w-1/12" v-if="filtered_users.length > 0">
      <!-- <outlined-primary-button class="mr-4" @click.native="moveOffset(true)">
        ⬅️
      </outlined-primary-button>
      <outlined-primary-button
        class="mr-4 !shadow-none px-2"
        @click.native="n < offset ? moveOffset(true) : moveOffset(false)"
        v-for="n in amountOfPaginationPagesAsArray"
        :key="n"
        :class="{ 'bg-primary-blue': n === offset }"
      >
        {{ n }}
      </outlined-primary-button>

      <outlined-primary-button @click.native="moveOffset(false, true)">
        ➡️
      </outlined-primary-button> -->
    </span>
    <transition name="fade">
      <lazy-v-sidebar
        v-if="isDeletingUser || isEditingOrAddingUser"
        :title="sidebarTitle"
        :subtitle="sidebarSubtitle"
        @closeSidebar="closeSidebar"
      >
        <template #content>
          <LayoutsUsersForm
            :delete-user="!!isDeletingUser"
            :is-editing-or-adding-user="isEditingOrAddingUser"
            @closeSidebar="closeSidebar"
            @handleClickForDeletion="deleteUser({ id: isDeletingUser }, false)"
            :subjects="subjects"
            :classes="classes"
          />
        </template>
      </lazy-v-sidebar>
    </transition>
    <transition name="fade">
      <feedback-card
        v-if="show_notification"
        class="top-auto mr-2 mb-12 right-0 bottom-0 w-72 z-50 fixed !shadow-lg"
        :is-success="show_notification === 'success'"
        :title="
          show_notification === 'success'
            ? '¡Guardado!'
            : 'Ha ocurrido un error'
        "
      />
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
      isDeletingUser: false,
      sidebarTitle: null,
      sidebarSubtitle: null,
      isEditingOrAddingUser: false,
      limit: 15,
      offset: 0,
      show_notification: false,
      filters: {
        name: "",
        group: "Profesor",
        subject: "",
      },
    };
  },
  async asyncData({ $axios, $reportNetworkError }) {
    try {
      let [users, subjects, classes] = await Promise.all([
        $axios.$get("/api/users"),
        $axios.$get("/api/subjects"),
        $axios.$get("/api/classes"),
      ]);
      subjects = subjects.map((subject) => ({
        name: subject.name,
        id: subject.id,
      }));
      return {
        users,
        subjects,
        classes,
      };
    } catch (error) {
      $reportNetworkError(error);
      return { error };
    }
  },
  methods: {
    moveOffset(decrease, increase) {
      if (decrease) {
        if (this.offset - 10 < 0) this.offset = 0;
        else this.offset -= 10;
      } else if (increase) {
        if (this.offset + 10 > this.users.length - 1)
          this.offset = this.users.length - 1;
        else this.offset += 10;
      }
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    closeSidebar(mode) {
      this.isDeletingUser = false;
      this.isEditingOrAddingUser = false;
      this.sidebarTitle = null;
      this.sidebarSubtitle = null;
      if (mode === "success") {
        this.show_notification = "success";
        this.$nuxt.refresh();
        setTimeout(() => {
          this.show_notification = false;
        }, 2000);
      } else if (mode === "error") {
        this.show_notification = "error";
        setTimeout(() => {
          this.show_notification = false;
        }, 2000);
      }
    },
    async deleteUser(user, isConfirmation = true) {
      if (!isConfirmation) {
        try {
          await this.$axios.delete(`/api/users`, {
            data: { user_id: user.id },
          });
          this.users = this.users.filter((u) => u.id !== user.id);
          this.show_notification = "success";
          setTimeout(() => {
            this.show_notification = false;
          }, 5000);
        } catch (error) {
          this.$reportNetworkError(error);
          this.show_notification = "error";
          return;
        }
        this.closeSidebar();
        return;
      }
      this.sidebarTitle = "¿Estás seguro de eliminar este usuario?";
      this.sidebarSubtitle =
        "Los datos relacionados con este usuario (por ejemplo: horarios) serán eliminados";
      this.isDeletingUser = user.id;
    },
    editUser(el) {
      this.sidebarTitle = "Usuario";
      const removeSpaces = (str) => str.replace(/\s/g, "");
      console.log(
        this.classes.map((el) => ({ ...el, class: removeSpaces(el.class) })),
        el.classes.map((el) => removeSpaces(el))
      );
      const classesWithIdAndClass = el.classes.map((c) => ({
        class: c,
        id: this.classes.find(
          (cl) => removeSpaces(cl.class) === removeSpaces(c.normalize("NFC"))
        ).id,
      }));
      console.log(classesWithIdAndClass);
      const groupsAsEntries = Object.entries(groups_translations);
      this.isEditingOrAddingUser = {
        first_name: el.first_name,
        last_name: el.last_name,
        groups: el.groups.map((el) => ({
          value: groupsAsEntries.find((entry) => entry[1] === el)[0],
          label: el,
        })),
        subjects: el.subjects.filter(Boolean).map((el) => {
          const subject_information = this.subjects.find(
            (subject) => subject.name === el
          );
          return {
            id: subject_information.id,
            name: subject_information.name,
          };
        }),
        classes: classesWithIdAndClass,
        email: el.email,
      };
    },
    addUser() {
      this.sidebarTitle = "Usuario";
      this.isEditingOrAddingUser = "add";
    },
  },
  computed: {
    amountOfPaginationPagesAsArray() {
      return (
        Array.from(
          { length: Math.ceil(this.users.length / this.limit) },
          (_, i) => i + 1
        )
          // max 10
          .slice(0, 10)
      );
    },
    tableHeaders() {
      const all = [
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
      let res = all;
      if (
        this.filters.group === "Estudiante" ||
        this.filters.group === "Preceptor"
      ) {
        res = res.filter((header) => header.label !== "Materias");
      }
      if (this.filters.group === "Estudiante") {
        res = res.filter((header) => header.label !== "Rol/es");
      }
      if (this.filters.group === "Directivo") {
        res = res.filter(
          (header) =>
            !(header.label === "Clases" || header.label === "Materias")
        );
      }
      return res;
    },
    possible_groups() {
      return [
        ...new Set(
          this.users?.flatMap((u) =>
            u.groups.map((el) => groups_translations[el])
          )
        ),
      ];
    },
    users_with_correct_groups() {
      return this.users.map(({ classes, groups, ...rest }) => ({
        groups: groups.map((el) => {
          return groups_translations[el];
        }),
        classes: classes.map((el) => el.replaceAll(" ", "\u00A0")),
        ...rest,
      }));
    },
    filtered_users() {
      const filters = this.filters;
      return this.users_with_correct_groups
        .filter(({ first_name, last_name, groups, subjects }) => {
          const conditions_with_valid_filters =
            (filters.name.length === 0 ||
              first_name
                ?.toLowerCase()
                ?.includes(filters.name?.toLowerCase()) ||
              last_name
                ?.toLowerCase()
                ?.includes(filters.name?.toLowerCase())) &&
            (filters.group.length === 0 ||
              groups.some((el) =>
                el
                  ?.toLowerCase()
                  ?.replace(/[\u0300-\u036f]/g, "")
                  ?.includes(filters.group.toLowerCase())
              )) &&
            (filters.subject.length === 0 ||
              subjects.some((el) =>
                el
                  ?.toLowerCase()
                  ?.replace(/[\u0300-\u036f]/g, "")
                  ?.includes(filters.subject.toLowerCase())
              ));
          return conditions_with_valid_filters;
        })
        .slice(this.offset, this.offset + this.limit);
    },
  },
};
</script>
