<template>
  <div class="overflow-x-auto relative border border-gray-light rounded-md">
    <table class="w-full text-left">
      <thead class="text-black">
        <tr>
          <th
            scope="col"
            class="p-2 text-xs font-bold"
            :class="header.classes"
            v-for="header in sortedHeaders"
            :key="header.label"
          >
            <span :class="header.spanClasses" class="flex items-center">
              {{ header.label }}
              <slot name="nextToHeader" :header="header" />
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          class="bg-white border-b hover:bg-gray-50"
          v-for="item in items"
          :class="item.classes"
          :key="item.id"
          v-on="item.listeners"
        >
          <!-- <th
            scope="row"
            class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap"
          >
            {{ item.first_name }} {{ item.last_name }}
          </th> -->
          <td
            class="p-2 text-xs text-black"
            :class="header.classes"
            v-for="(header, idx) in sortedHeaders"
            :key="header.label"
          >
            <span
              v-if="header.mode !== 'edit' || idx === 0"
              :class="item[`classes_${header.id}`]"
            >
              {{
                header.props
                  .flatMap((el) => item[el])
                  .filter((el) => !!el)
                  .join(",\n") || header.fallback
              }}
            </span>
            <slot v-else name="edit" :header="header" :item="item" />
            <v-text-input v-else v-on="item.listeners" class="!w-full" />
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
import { computed } from "vue";
const props = defineProps({
  headers: Array,
  items: Array,
  actions: Array,
});
const sortedHeaders = computed(() => {
  return props.headers.sort((a, b) => a.order - b.order);
});
</script>
