<template>
  <main
    v-if="
      $store.state.authentication.user_data &&
      ($store.state.authentication.user_data.groups.includes('preceptor') ||
        $store.state.authentication.user_data.groups.includes(
          'management_team'
        ) ||
        $store.state.authentication.user_data.groups.includes(
          'community_manager'
        ))
    "
    :class="[
      $store.state.authentication.user_data &&
      !$store.state.authentication.user_data.groups.includes(
        'community_manager'
      )
        ? 'justify-between'
        : 'justify-start',
    ]"
    class="flex flex-col h-full w-full pb-12 sm:px-12"
  >
    <settings-dropdown
      v-if="
        $store.state.authentication.user_data &&
        !$store.state.authentication.user_data.groups.includes('student')
      "
      class="my-6"
      @optionSelected="openSidebar"
    />
    <div
      v-if="
        $store.state.authentication.user_data &&
        !$store.state.authentication.user_data.groups.includes(
          'community_manager'
        )
      "
      :class="{
        'h-full':
          !$store.state.authentication.user_data.groups.includes(
            'management_team'
          ),
      }"
      class="flex flex-wrap w-full justify-around items-start"
    >
      <lazy-absent-teachers-card
        :absent-teachers="absent_teachers"
        @addItem="openSidebar"
        @deleteItem="deleteItem"
        @editItem="editItem"
      />
      <lazy-slots-of-all-classes-card
        :classes="classes"
        class="mb-8"
        @addItem="openSidebar"
        @deleteItem="deleteItem"
        @editItem="editItem"
      />
    </div>
    <div
      v-if="
        $store.state.authentication.user_data &&
        ($store.state.authentication.user_data.groups.includes(
          'management_team'
        ) ||
          $store.state.authentication.user_data.groups.includes(
            'community_manager'
          ))
      "
      class="flex flex-wrap w-full justify-around items-start"
    >
      <lazy-news-card
        :news="news"
        @addItem="openSidebar"
        @deleteItem="deleteItem"
        @editItem="editItem"
      />
      <lazy-events-card
        class="mb-8"
        :events="events"
        @addItem="openSidebar"
        @deleteItem="deleteItem"
        @editItem="editItem"
      />
    </div>
    <transition name="fade">
      <lazy-v-sidebar
        v-if="sidebarComponent || unsavedChanges"
        :title="sidebarTitle"
        @closeSidebar="closeSidebar('cross_btn')"
      >
        <template #content>
          <component
            :is="sidebarComponent"
            :form-data="componentProps"
            v-on="componentEvents"
            ref="componentLayout"
            @closeSidebar="closeSidebar"
            :unsavedChanges.sync="unsavedChanges"
            v-show="showLayout"
          />
          <DeleteItemConfirmation
            v-if="!showLayout"
            cancelButtonText="Descartar"
            addButtonText="Guardar"
            v-on="{
              handleCancelButtonClick: () => {
                unsavedChanges = false;
                closeSidebar('cross_btn');
              },
              click: saveDataFromComponentLayout,
            }"
          />
        </template>
      </lazy-v-sidebar>
    </transition>
  </main>
  <main
    v-else-if="
      $store.state.authentication.user_data &&
      $store.state.authentication.user_data.groups.includes('teacher')
    "
    class="flex flex-col flex-wrap h-full w-full items-end sm:px-12"
  >
    <settings-dropdown
      v-if="!$store.state.authentication.user_data.groups.includes('student')"
      class="mt-12 -mb-4"
      @optionSelected="openSidebar"
    />
    <div class="flex mb-auto w-96 self-start justify-between items-center">
      <div
        v-if="teacher_slots.length > 0"
        class="border-primary-lightblue ml-4 rounded-lg flex flex-col min-w-full border-2 shadow-md my-8 p-4 items-start justify-between"
      >
        <v-title class="mb-1"> Horarios </v-title>
        <lazy-slots-of-class-accordion
          class="flex flex-col w-full pr-8 gap-1 justify-between"
          :slots="teacher_slots"
          first-prop-to-show="course_name"
        />
      </div>
      <lazy-warning-sign v-else>
        Tus horarios no estan cargados todavía
      </lazy-warning-sign>
    </div>
    <transition name="fade">
      <lazy-v-sidebar
        v-if="sidebarComponent"
        :title="sidebarTitle"
        @closeSidebar="closeSidebar('cross_btn')"
      >
        <template #content>
          <component
            :is="sidebarComponent"
            :form-data="componentProps"
            v-on="componentEvents"
            @closeSidebar="closeSidebar"
          />
        </template>
      </lazy-v-sidebar>
    </transition>
  </main>
  <main
    v-else-if="$store.state.authentication.user_data"
    class="flex h-96 w-full items-center justify-center"
  >
    <VCard
      :change-records="false"
      title="Calificaciones"
      :data="
        (student_grades || []).map((el) => ({
          label: el.title + ' - ' + el.grade,
          desc:
            el.subjects.join(', ') +
            ' - ' +
            el.dates
              .map((el) =>
                new Date(el).toLocaleDateString('es-AR', {
                  month: 'short',
                  day: 'numeric',
                })
              )
              .join(', '),
        }))
      "
    />
  </main>
</template>

<script>
export default {
  async asyncData({ $axios, store, redirect, $reportNetworkError }) {
    const get_news = async () =>
      store.state.authentication.user_data.groups.includes("management_team") ||
      store.state.authentication.user_data.groups.includes("community_manager")
        ? await $axios.$get("/api/news")
        : {};

    const get_absent_teachers = async () =>
      store.state.authentication.user_data.groups.includes("preceptor") ||
      store.state.authentication.user_data.groups.includes("management_team")
        ? await $axios.$get("/api/absent-teachers")
        : {};

    const get_classes = async () =>
      store.state.authentication.user_data.groups.includes("management_team") ||
      store.state.authentication.user_data.groups.includes("preceptor")
        ? await $axios.$get("/api/classes")
        : {};

    const get_events = async () =>
      store.state.authentication.user_data.groups.includes("management_team") ||
      store.state.authentication.user_data.groups.includes("community_manager")
        ? await $axios.$get("/api/events")
        : {};

    const get_teacher_slots = async () =>
      store.state.authentication.user_data.groups.includes("teacher")
        ? await $axios.$get(
            `api/teachers/${store.state.authentication.user_data.id}`
          )
        : {};

    const get_students_grades = async () =>
      store.state.authentication.user_data.groups.includes("student")
        ? await $axios.$get(
            `api/students/${store.state.authentication.user_data.id}/grades`
          )
        : {};

    try {
      const result = await Promise.allSettled([
        get_news(),
        get_absent_teachers(),
        get_classes(),
        get_teacher_slots(),
        get_events(),
        get_students_grades(),
      ]);
      const [
        news = [],
        absent_teachers = [],
        classes = [],
        teacher_slots = [],
        events = [],
        student_grades = [],
      ] = result.map((res) => res.value);
      return {
        teacher_slots,
        news,
        absent_teachers,
        classes,
        events,
        student_grades,
      };
    } catch (error) {
      $reportNetworkError(error);
    }
  },
  data() {
    return {
      sidebarTitle: "",
      sidebarComponent: undefined,
      componentProps: undefined,
      componentEvents: {},
      teachers_slots: [],
      unsavedChanges: false,
      showLayout: true,
      cancelCounter: 0,
    };
  },
  methods: {
    async saveDataFromComponentLayout() {
      await this.$refs.componentLayout.add();
      this.unsavedChanges = false;
      this.closeSidebar();
    },
    deleteItem(id, route) {
      const closeSidebar = () => this.closeSidebar("cross_btn");
      const that = this;
      this.componentEvents = {
        click: async () => {
          try {
            await that.$axios.delete(`/api/${route}`, {
              // Si ID es un objeto (slots) el campo no se llama id
              data: typeof id === "string" ? { id } : id,
            });
            that.$nuxt.refresh();
            that.closeSidebar("delete");
          } catch (error) {
            this.$reportNetworkError(error);
          }
        },
        handleCancelButtonClick: closeSidebar,
      };
      this.sidebarTitle = "¿Seguro que lo deseás eliminar?";
      this.sidebarComponent = "DeleteItemConfirmation";
    },
    editItem(payload, title, component) {
      this.componentProps = payload;
      this.sidebarTitle = title;
      this.sidebarComponent = component;
    },
    closeSidebar(source) {
      if (this.unsavedChanges && this.cancelCounter === 0) {
        this.sidebarTitle = "Hay cambios sin guardar";
        this.showLayout = false;
        this.cancelCounter++;
        return;
      }
      // source = null => comes from add method
      if (this.cancelCounter > 0 || !source) {
        this.unsavedChanges = false;
        this.showLayout = true;
        this.cancelCounter = 0;
        this.sidebarComponent = null;
        this.componentProps = null;
      }
      if (source === "cross_btn" || source === "cancel") {
        this.cancelCounter = 0;
        this.sidebarComponent = null;
        this.componentProps = null;
        return;
      }
      this.$store.commit("change_toast_state", "success");
      this.$store.commit(
        "change_toast_content",
        source === "delete" ? "Eliminado" : "Guardado"
      );
      setTimeout(() => {
        this.$store.commit("change_toast_state", false);
      }, 2000);
      this.$nuxt.refresh();
    },
    openSidebar(title, component, props) {
      this.unsavedChanges = false;
      this.sidebarTitle = title;
      this.sidebarComponent = component;
      if (props) {
        this.componentProps = props;
      }
    },
    onError() {
      this.$store.commit("change_toast_state", "error");
      this.$store.commit("change_toast_content", "Ha ocurrido un error");
      setTimeout(() => {
        this.$store.commit("change_toast_state", false);
      }, 2000);
    },
  },
};
</script>
