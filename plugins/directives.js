import Vue from "vue";

Vue.directive("click-outside", {
  bind(el, binding, vNode) {
    el.__vueClickOutside__ = (event) => {
      if (!el.contains(event.target)) {
        // call method provided in v-click-outside value
        vNode.context[binding.expression](event);
        event.stopPropagation();
      }
    };
    document.body.addEventListener("click", el.__vueClickOutside__);
  },
  unbind(el) {
    // Remove Event Listeners
    document.body.removeEventListener("click", el.__vueClickOutside__);
    el.__vueClickOutside__ = null;
  },
});
