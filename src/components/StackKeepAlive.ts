import { VNode } from 'vue';
import { createComponent, SetupContext } from '@vue/composition-api';

import stack from '../stack';

interface VNodeCache {
  [key: string]: VNode | null;
}

interface VNodeWithAsyncFactory extends VNode {
  asyncFactory?: Function;
}

function isDef(v: any) {
  return v !== undefined && v !== null;
}

function isAsyncPlaceholder(node: VNodeWithAsyncFactory) {
  return node.isComment && node.asyncFactory;
}

function getFirstComponentChild(children?: VNode[]) {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c;
      }
    }
  }
  return;
}

function pruneCacheEntry(cache: VNodeCache, key: string) {
  const cached = cache[key];
  if (cached && cached.componentInstance) {
    cached.componentInstance.$destroy();
  }
  cache[key] = null;
}

// @ts-ignore
export default createComponent({
  name: 'stack-keep-alive',

  abstract: true,

  setup(_, ctx) {
    const { slots, root } = ctx;

    const cache: VNodeCache = Object.create(null);
    let lastKey = '';

    return () => {
      const slot = slots.default && slots.default();
      const vnode = getFirstComponentChild(slot);

      if (vnode && vnode.componentOptions) {
        const key: string = window.history.state ? window.history.state.key : '000.000';
        const isReplace = key === lastKey;
        lastKey = key;

        if (isReplace) {
          pruneCacheEntry(cache, key);
          cache[key] = vnode;
          stack.splice(-1, 1, { key, route: root.$route });
        } else {
          const cached = cache[key];

          if (cached) {
            vnode.componentInstance = cached.componentInstance;

            const index = stack.findIndex(item => item.key === key);
            if (index >= 0) {
              for (let i = index + 1; i < stack.length; i++) {
                pruneCacheEntry(cache, stack[i].key);
              }

              stack.splice(index + 1);
            }
          } else {
            cache[key] = vnode;
            stack.push({
              key,
              route: root.$route,
            });
          }
        }

        if (vnode.data) {
          vnode.data.keepAlive = true;
        }
      }

      return vnode || (slot && slot[0]);
    };
  },
});
