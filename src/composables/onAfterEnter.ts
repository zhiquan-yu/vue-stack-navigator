import { inject } from '@vue/composition-api';
import { OnAfterEnter } from '../Lifecycles';

function onAfterEnter(callback: Function) {
  const onAfterEnter = inject(OnAfterEnter, () => {});

  onAfterEnter(callback);
}

export default onAfterEnter;
