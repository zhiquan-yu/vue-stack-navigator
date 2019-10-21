import { InjectionKey } from '@vue/composition-api';

export const OnAfterEnter: InjectionKey<(callback: Function) => void> = Symbol();
