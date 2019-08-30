<template>
  <transition :name="transitionName" @afterEnter="handleAfterEnter">
    <StackKeepAlive>
      <RouterView :key="$route.path" ref="screen" class="router-view" />
    </StackKeepAlive>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue'
import { createComponent, ref, watch, SetupContext } from "@vue/composition-api";
import { Route } from "vue-router";
import StackKeepAlive from './components/StackKeepAlive'

export interface VueWithAfterEnterHook extends Vue {
  afterEnter: () => void
}

export default createComponent({
  name: 'AppContainer',

  setup(_: any, context: SetupContext) {
    const { root } = context

    const screen = ref<VueWithAfterEnterHook>(null)
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

    watch(() => root.$route, (to: Route, from: Route) => {
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
    })

    return {
      screen,
      transitionName,

      handleAfterEnter() {
        if (screen.value && screen.value.afterEnter) {
          // TODO: why setTimeout
          setTimeout(screen.value.afterEnter)
        }
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

.slide-left-leave,
.slide-left-leave-active {
  position: fixed;
  top: 0;
  transform: translateX(-50%);
  transition: transform var(--duration) ease-out .1s;
}

.slide-left-enter {
  position: fixed;
  top: 0;
  transform: translateX(100%);
}

.slide-left-enter-active {
  transition: transform var(--duration) ease-out;
}

.slide-left-gesture-leave,
.slide-left-gesture-leave-active {
  display: none;
}

.slide-right-enter {
  position: fixed;
  top: 0;
  transform: translateX(-50%);
}

.slide-right-enter-active {
  transition: transform var(--duration) ease-out;
}

.slide-right-leave,
.slide-right-leave-active {
  position: fixed;
  top: 0;
  z-index: 1;
  transform: translateX(100%);
  transition: transform var(--duration) ease-out .1s;
}

.slide-right-gesture-leave,
.slice-right-gesture-leave-active {
  display: none;
}
</style>