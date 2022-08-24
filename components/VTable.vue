<template>
  <div class="overflow-x-auto relative border border-gray-light rounded-md">
    <table class="w-full text-left">
      <thead class="text-black">
        <tr>
          <th
            scope="col"
            class="p-2 text-xs font-bold"
            v-for="header in headers"
            :key="header.label"
          >
            {{ header.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          class="bg-white border-b hover:bg-gray-50"
          v-for="item in items"
          :key="item.id"
        >
          <!-- <th
            scope="row"
            class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap"
          >
            {{ item.first_name }} {{ item.last_name }}
          </th> -->
          <td
            class="p-2 text-xs text-black"
            v-for="header in headers"
            :key="header.label"
          >
            {{
              header.props
                .flatMap((el) => item[el])
                .filter((el) => !!el)
                .join(",\n")
            }}
          </td>
          <td class="p-1" v-for="action in actions" :key="action.label">
            <icon-button
              class="w-8 h-8 hover-effect m-2"
              @click.native="$emit(action.handlerName, item)"
            >
              <img
                :src="require(`~/assets/images/${action.icon}.svg`)"
                :alt="action.label"
              />
            </icon-button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
const props = defineProps({
  headers: Array,
  items: Array,
  actions: Array,
});
</script>
