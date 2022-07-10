<template>
  <main
    v-if="
      $store.state.authentication.user_data.groups.includes('management_team')
    "
    class="py-16 pr-16 pl-8"
  >
    <div>
      <v-subtitle class="mb-8"> Últimos Casos Sospechosos </v-subtitle>
      <div class="flex flex-col">
        <div
          v-for="el of formattedData"
          :key="el.preceptor"
          class="w-72 rounded-md shadow p-4 text-center my-8 flex flex-col gap-2"
        >
          <span
            class="border-primary-darkblue border-b flex min-w-full py-2 justify-between"
          >
            <span class="text-sm font-bold"> {{ el.preceptor }} </span>
          </span>
          <span
            v-for="{ label, prop, transformation = (v) => v } of properties"
            :key="label"
            class="flex justify-between items-center mt-2 text-xs"
          >
            <span class="font-bold"> {{ label }}: </span>
            <span>
              {{ transformation(el[prop]) }}
            </span>
          </span>
          <span class="flex justify-between items-center mt-2 text-xs">
            <span class="font-bold"> Última vez: </span>
            <span class="inline-flex">
              <span class="mr-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                    class="stroke-primary-blue"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M16 2V6"
                    class="stroke-primary-blue"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8 2V6"
                    class="stroke-primary-blue"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M3 10H21"
                    class="stroke-primary-blue"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              {{
                new Date(el.dates[0]).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "numeric",
                })
              }}
            </span>
          </span>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  data() {
    return {
      properties: [
        {
          label: "Motivo",
          prop: "reason",
        },
        {
          label: "Número de Reportes",
          prop: "nro_of_reports",
        },
        {
          label: "Clases",
          prop: "classes_names",
          transformation(value) {
            return value && value.join(", ");
          },
        },
      ],
    };
  },
  async asyncData({ $axios, $reportNetworkError }) {
    try {
      const data = await $axios.$get("/api/students-absence-suspicious-cases");
      return { data };
    } catch (error) {
      $reportNetworkError(error);
      return { error };
    }
  },
  computed: {
    formattedData() {
      const are_reporting =
        this.data.suspicious_preceptors_because_are_reporting_a_lot.map(
          (el) => ({
            preceptor: el.preceptor,
            nro_of_reports: el.nro_of_reports,
            dates: el.dates,
            reason: "Envío de Correciones",
            classes_names: el.classes_names,
          })
        );
      const are_being_reported =
        this.data.suspicious_preceptors_because_are_being_reported_a_lot.map(
          (el) => ({
            preceptor: el.preceptor,
            nro_of_reports: el.nro_of_reports,
            dates: el.dates,
            reason: "Recibo de Correciones",
            classes_names: el.classes_names,
          })
        );
      return are_reporting.concat(are_being_reported);
    },
  },
};
</script>

<style></style>
