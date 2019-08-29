import { VNode } from 'vue'
import { createComponent, SetupContext } from "@vue/composition-api"

import stack from '../stack'

interface VNodeCache {
  [key: string]: VNode | null
}

interface VNodeWithAsyncFactory extends VNode {
  asyncFactory?: Function
}

function isDef(v: any) {
  return v !== undefined && v !== null
}

function isAsyncPlaceholder(node: VNodeWithAsyncFactory) {
  return node.isComment && node.asyncFactory
}

function getFirstComponentChild(children?: VNode[]) {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const c = children[i]
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
  return
}

function pruneCacheEntry(cache: VNodeCache, key: string) {
  const cached = cache[key]
  if (cached && cached.componentInstance) {
    cached.componentInstance.$destroy()
  }
  cache[key] = null
}

export default createComponent({
  name: 'stack-keep-alive',

  // @ts-ignore
  abstract: true,

  setup() {
    const cache: VNodeCache = Object.create(null)

    return (_: any, ctx: SetupContext) => {
      const { slots, root } = ctx
      const { $route } = root

      // @ts-ignore
      const slot = slots.default && slots.default()
      const vnode = getFirstComponentChild(slot)

      if (vnode && vnode.componentOptions) {
        const key: string = window.history.state ? window.history.state.key : '00000.000'
        const cached = cache[key]

        if (cached) {
          vnode.componentInstance = cached.componentInstance

          const index = stack.findIndex(item => item.key === key)
          if (index >= 0) {
            for (let i = index + 1; i < stack.length; i++) {
              pruneCacheEntry(cache, stack[i].key)
            }

            stack.splice(index + 1)
          }
        } else {
          cache[key] = vnode
          stack.push({
            key,
            route: $route,
          })
        }

        if (vnode.data) {
          vnode.data.keepAlive = true
        }
      }

      return vnode || (slot && slot[0])
    }
  },
})
