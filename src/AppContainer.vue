<template>
  <transition :name="transitionName" @afterEnter="handleAfterEnter">
    <StackKeepAlive>
      <RouterView ref="screen" :key="route.path" class="screen" />
    </StackKeepAlive>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue'
import { createComponent, ref, SetupContext, computed } from "@vue/composition-api"
import { Route } from 'vue-router'

import StackKeepAlive from './components/StackKeepAlive'
import { OnAfterEnter } from './LifeCycles'
import useTransition from './composables/useTransition'
import useLifecycles from './composables/useLifecycles'

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