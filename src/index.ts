import { VueConstructor } from 'vue';

export { default as AppContainer } from './AppContainer.vue';
export * from './LifeCycles';
import stack from './stack';

export default function install(Vue: VueConstructor) {
  Vue.prototype.$stack = stack;
}
