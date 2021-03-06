import { Ref, ref, watch } from '@vue/composition-api';
import { Route } from 'vue-router';

const START = '/';

export default function useTransition(route: Ref<Route>) {
  const transitionName = ref('');

  let touchstart: TouchEvent | null = null;
  let touchmove: TouchEvent | null = null;

  let fromTime = 0;
  let toTime = 0;

  document.body.addEventListener('touchstart', e => {
    touchstart = e;
  });

  document.body.addEventListener('touchmove', e => {
    touchmove = e;
  });

  watch(
    route,
    (_, from: Route) => {
      // When use lazy loading routes, vue-router triggered 2 watch change,
      // one is from undefined to '/'
      // one is from '/' to your path
      // we should not trigger transition
      if (from === undefined || from.fullPath === START) {
        return;
      }

      fromTime = toTime;
      toTime = window.history.state ? Number.parseInt(window.history.state.key, 0) || 0 : 0;

      if (!toTime && !fromTime) {
        return;
      }

      if (toTime < fromTime) {
        if (
          touchstart &&
          touchmove &&
          touchstart.touches[0].clientX < 50 &&
          touchmove.touches[0].clientX < 0
        ) {
          transitionName.value = 'slide-right-gesture';
        } else {
          transitionName.value = 'slide-right';
        }
      }

      if (toTime > fromTime) {
        if (
          touchstart &&
          touchmove &&
          document.body.clientWidth - touchstart.touches[0].clientX < 50 &&
          touchmove.touches[0].clientX - touchstart.touches[0].clientX < -10
        ) {
          transitionName.value = 'slide-left-gesture';
        } else {
          transitionName.value = 'slide-left';
        }
      }
    },
    {
      flush: 'pre',
    }
  );

  return {
    transitionName,
  };
}
