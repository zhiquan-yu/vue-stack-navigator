<template>
  <transition :name="transitionName" @afterEnter="handleAfterEnter">
    <StackKeepAlive>
      <RouterView ref="screen" class="router-view" />
    </StackKeepAlive>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue'
import { createComponent, ref, watch, SetupContext } from "@vue/composition-api";
import StackKeepAlive from './components/StackKeepAlive'

enum NavigationLifecycle {
  AfterEnter = 'afterEnter',
}

export default createComponent({
  name: 'AppContainer',

  setup(_: any, context: SetupContext) {
    const { root } = context

    const screen = ref<Vue>(null)
    const transitionName = ref('')
    
    let touchstart: TouchEvent | null = null
    let touchmove: TouchEvent | null = null

    let fromTime = 0
    let toTime = 0

    document.body.addEventListener('touchstart', e => {
      touchstart = e
    })

    document.body.addEventListener('touchmove', e => {
      touchmove = e
    })

    watch(() => root.$route, () => {
      fromTime = toTime
      toTime = window.history.state ? (Number.parseInt(window.history.state.key, 0) || 0) : 0

      if (!toTime && !fromTime) {
        return
      }

      if (toTime < fromTime) {
        if (touchstart && touchmove && touchstart.touches[0].clientX < 50 && touchmove.touches[0].clientX < 0) {
          transitionName.value = 'slide-right-gesture'
        } else {
          transitionName.value = 'slide-right'
        }
      } else {
        if (touchstart && touchmove && document.body.clientWidth - touchstart.touches[0].clientX < 50 && touchmove.touches[0].clientX - touchstart.touches[0].clientX < -10) {
          transitionName.value = 'slide-left-gesture'
        } else {
          transitionName.value = 'slide-left'
        }
      }
    }, {
      flush: 'pre',
    })

    function callHook(component: Vue, hookName: NavigationLifecycle) {
      const hook = component.$options[hookName]

      if (hook) {
        hook.call(component)
      }

      component.$children.forEach(child => callHook(child, hookName))
    }

    return {
      screen,
      transitionName,

      handleAfterEnter() {
        // FIXME: afterEnter called before to screen entered
        setTimeout(() => {
          callHook(screen.value, NavigationLifecycle.AfterEnter)
        }, 100)
      },
    }
  },

  components: {
    StackKeepAlive,
  },
})
</script>

<style scoped>
.router-view {
  --duration: .3s;

  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.slide-left-leave-active,
.slide-left-enter-active,
.slide-right-enter-active,
.slide-right-leave-active {
  position: fixed;
  top: 0;
}

.slide-left-leave-active {
  transform: translateX(-50%);
  transition: transform var(--duration) ease-out .1s;
}

.slide-left-enter-active {
  transition: transform var(--duration) ease-out;
}

.slide-left-enter {
  transform: translateX(100%);
}

.slide-right-enter-active {
  transition: transform var(--duration) ease-out;
}

.slide-right-enter {
  transform: translateX(-50%);
}

.slide-right-leave-active {
  z-index: 1;
  transform: translateX(100%);
  transition: transform var(--duration) ease-out .1s;
}

.slide-left-gesture-leave-active,
.slice-right-gesture-leave-active {
  display: none;
}
</style>