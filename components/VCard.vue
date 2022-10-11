<template>
  <div class="bg-primary-blue rounded-md p-4 w-80 sm:w-96">
    <div class="flex mb-1 w-full justify-between">
      <v-subtitle class="!text-white">
        {{ data.length === 0 && !changeRecords ? noDataMsg : title }}
      </v-subtitle>
      <icon-button
        v-if="changeRecords === true && showAddButton"
        :data-test="title.split(' ').join('_').toLowerCase() + '_add_button'"
        class="bg-primary-darkblue shadow-md duration-500 hover:scale-105"
        @click.native="$emit('addItem')"
      >
        <img src="~/assets/images/plus.svg" alt="Eliminar" />
      </icon-button>
    </div>
    <slot name="filters" />
    <transition-group
      v-if="data.length !== 0"
      :data-test="title.split(' ').join('_').toLowerCase() + '_items'"
      tag="div"
      class="flex flex-col max-w-xl py-2 justify-evenly"
      name="list"
    >
      <div v-for="(item, index) in data" :key="item.id || JSON.stringify(item)">
        <div
          v-if="index + 1 <= limit"
          class="flex my-2 mt-2 w-full justify-between items-center"
        >
          <span class="flex flex-col justify-between">
            <h3
              class="my-1 text-sm !text-white"
              :data-test="
                title.split(' ').join('_').toLowerCase() + '_item_title'
              "
            >
              {{
                item.label.length > 25
                  ? item.label.substring(0, 25) + " ..."
                  : item.label
              }}
            </h3>
            <h3 class="font-semibold text-sm !text-white">
              {{ item.desc }}
            </h3>
          </span>
          <span v-if="changeRecords" class="flex">
            <icon-button
              v-if="showDeleteBtn"
              :data-test="
                title.split(' ').join('_').toLowerCase() + '_delete_btn'
              "
              class="bg-red-light ml-4 duration-500 md:ml-8 hover:scale-105"
              @click.native="$emit('deleteItem', item)"
            >
              <img src="~/assets/images/trash.svg" alt="Eliminar" />
            </icon-button>
            <icon-button
              :data-test="
                title.split(' ').join('_').toLowerCase() + '_edit_btn'
              "
              class="bg-primary-lightblue ml-4 duration-500 md:ml-8 hover:scale-105"
              @click.native="$emit('editItem', item)"
            >
              <img src="~/assets/images/pencil.svg" alt="Editar" />
            </icon-button>
          </span>
        </div>
      </div>
    </transition-group>
    <transition name="fade">
      <outlined-primary-button
        v-if="data.length > limit"
        class="bg-white-full !w-full my-3 text-black p-1 duration-500 hover:-translate-y-1"
        @click.native="limit += 3"
      />
    </transition>
  </div>
</template>

<script>
import changeRecordsProp from "../mixins/changeRecordsProp";
export default {
  mixins: [changeRecordsProp],
  props: {
    showDeleteBtn: {
      type: Boolean,
      default: true,
    },
    showAddButton: {
      type: Boolean,
      default: true,
    },
    data: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: "",
    },
    noDataMsg: {
      type: [String, Function],
      default() {
        // to access the "this" you need to use a function
        return `No hay ${this.title.toLowerCase()} próximos`;
      },
    },
  },
  data() {
    return {
      limit: 4,
    };
  },
};
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
</style>
