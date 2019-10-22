import { provide } from '@vue/composition-api';
import { OnAfterEnter } from '../Lifecycles';

export default function useLifecycles() {
  const callbacks: Function[] = [];

  function onAfterEnter(callback: Function) {
    callbacks.push(callback);
  }

  function afterEnter() {
    // FIXME: afterEnter called before screen entered
    setTimeout(() => {
      while (callbacks.length) {
        const callback = callbacks.shift();

        if (!callback) {
          return;
        }

        callback();
      }
    }, 100);
  }

  provide(OnAfterEnter, onAfterEnter);

  return {
    afterEnter,
  };
}
