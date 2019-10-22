import { VueConstructor } from 'vue';

export { default as AppContainer } from './AppContainer.vue';
export { default as onAfterEnter } from './composables/onAfterEnter';
export * from './Lifecycles';
import stack from './stack';

export default function install(Vue: VueConstructor) {
  Vue.prototype.$stack = stack;
}
