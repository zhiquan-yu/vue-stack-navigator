<template>
  <transition :name="transitionName" @afterEnter="handleAfterEnter">
    <StackKeepAlive>
      <RouterView ref="screen" :key="route.path" class="screen" />
    </StackKeepAlive>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue'
import { createComponent, ref, watch, SetupContext, Ref, computed, provide } from "@vue/composition-api"
import { Route } from 'vue-router'

import StackKeepAlive from './components/StackKeepAlive'
import { OnAfterEnter } from './LifeCycles'

function useTransition(route: Ref<Route>) {
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

  watch(route, () => {
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
    }
    
    if (toTime > fromTime) {
      if (touchstart && touchmove && document.body.clientWidth - touchstart.touches[0].clientX < 50 && touchmove.touches[0].clientX - touchstart.touches[0].clientX < -10) {
        transitionName.value = 'slide-left-gesture'
      } else {
        transitionName.value = 'slide-left'
      }
    }
  }, {
    flush: 'pre',
  })

  return {
    transitionName,
  }
}

function useLifecycles() {
  const callbacks = []

  function onAfterEnter(callback: Function) {
    callbacks.push(callback)
  }

  function afterEnter() {
    // FIXME: afterEnter called before screen entered
    setTimeout(() => {
      while (callbacks.length) {
        callbacks.shift()()
      }
    }, 100)
  }

  provide(OnAfterEnter, onAfterEnter)

  return {
    afterEnter,
  }
}

export default createComponent({
  name: 'AppContainer',

  setup(_: any, context: SetupContext) {
    const { root } = context

    const route = computed(() => root.$route)
    const screen = ref<Vue>(null)
    const { transitionName } = useTransition(route)
    const { afterEnter } = useLifecycles()

    return {
      screen,
      route,
      transitionName,

      handleAfterEnter: afterEnter,
    }
  },

  components: {
    StackKeepAlive,
  },
})
</script>

<style scoped>
.screen {
  --duration: .3s;
  
  position: absolute;
  top: 0;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.slide-left-leave-active {
  transform: translateX(-25%);
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
  transform: translateX(-25%);
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