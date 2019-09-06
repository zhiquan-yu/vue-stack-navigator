# Vue Stack Navigator

`vue-stack-navigator` is a stack navigator for Vue apps

![Demo for vue-stack-navigator](./demo.gif)

## Navigation

- [Concept](#Concept)
- [Feature](#Feature)
- [Installation](#Installation)
- [Usage](#Usage)
- [Lifecycle](#Lifecycle)
- [Example](#Example)

## Concept

In the browser navigator model, when navigate from FooScreen to BarScreen, BarScreen created, FooScreen destroyed, when back to FooScreen, FooScreen created again, BarScreen destroyed, but in the App navigator model, FooScreen keep alived. VueStackNavigator bring this ability to you.

## Feature
1. Stack navigator like App
2. Smooth transition animation 
3. Work with vue-router

## Installation

**npm**

```bash
npm install vue-stack-navigator
```

## Usage

```js
import Vue from 'vue'
import VueRouter from 'vue-router'
import VueCompositionApi from '@vue/composition-api'
import VueStackNavigator, { AppContainer } from 'vue-stack-navigator'

Vue.use(VueCompositionApi)
Vue.use(VueStackNavigator)

const FooScreen = {
  template: '<div class="screen foo"><router-link to="bar">foo</router-link></div>',
}

const BarScreen = {
  template: '<div class="screen bar"><router-link to="foo">bar</router-link></div>',
}

const routes = [
  { path: '/', redirect: '/foo' },
  { path: '/foo', component: FooScreen },
  { path: '/bar', component: BarScreen }
]

const router = new VueRouter({
  routes
})

const app = new Vue({
  ...AppContainer,
  router
}).$mount('#app')
```

## Lifecycle

```js
const FooScreen = {
  created() {
    this.dataPromise = fetch('xxx')
  },

  /**
   * FooScreen entered
   * 
   * If the FooScreen is very large, and you set the `data` before `afterEnter`, the Vue render process will break your transition animation,
   * so fetch data in `created` and set data in `afterEnter` should be the best practice
   */
  async afterEnter() {
    this.data = await this.dataPromise
  },
}
```

## Example

1. Clone this repo
2. Run `npm run build`
3. Open `./example/index.html` in your browser
