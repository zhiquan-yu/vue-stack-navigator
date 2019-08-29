# Vue Stack Navigator

`vue-stack-navigaotr` is a stack navigator for Vue apps

## Navigation

- [Installation](#Installation)
- [Usage](#Usage)

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

const Foo = { template: '<div>foo</div>' }
const Bar = { template: '<div>bar</div>' }

const routes = [
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar }
]

const router = new VueRouter({
  routes // short for `routes: routes`
})

const app = new Vue({
  ...AppContainer,
  router
}).$mount('#app')
```