(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports, require('@vue/composition-api'))
    : typeof define === 'function' && define.amd
    ? define(['exports', '@vue/composition-api'], factory)
    : ((global = global || self),
      factory((global.VueStackNavigator = {}), global.vueCompositionApi));
})(this, function(exports, compositionApi) {
  'use strict';

  var stack = [];

  function isDef(v) {
    return v !== undefined && v !== null;
  }
  function isAsyncPlaceholder(node) {
    return node.isComment && node.asyncFactory;
  }
  function getFirstComponentChild(children) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
          return c;
        }
      }
    }
    return;
  }
  function pruneCacheEntry(cache, key) {
    var cached = cache[key];
    if (cached && cached.componentInstance) {
      cached.componentInstance.$destroy();
    }
    cache[key] = null;
  }
  var StackKeepAlive = compositionApi.createComponent({
    name: 'stack-keep-alive',
    // @ts-ignore
    abstract: true,
    setup: function() {
      var cache = Object.create(null);
      return function(_, ctx) {
        var slots = ctx.slots,
          root = ctx.root;
        var $route = root.$route;
        // @ts-ignore
        var slot = slots.default && slots.default();
        var vnode = getFirstComponentChild(slot);
        if (vnode && vnode.componentOptions) {
          var key_1 = window.history.state ? window.history.state.key : '00000.000';
          var cached = cache[key_1];
          if (cached) {
            vnode.componentInstance = cached.componentInstance;
            var index = stack.findIndex(function(item) {
              return item.key === key_1;
            });
            if (index >= 0) {
              for (var i = index + 1; i < stack.length; i++) {
                pruneCacheEntry(cache, stack[i].key);
              }
              stack.splice(index + 1);
            }
          } else {
            cache[key_1] = vnode;
            stack.push({
              key: key_1,
              route: $route,
            });
          }
          if (vnode.data) {
            vnode.data.keepAlive = true;
          }
        }
        return vnode || (slot && slot[0]);
      };
    },
  });

  var script = compositionApi.createComponent({
    name: 'AppContainer',
    setup: function(_, context) {
      var root = context.root;
      var screen = compositionApi.ref(null);
      var transitionName = compositionApi.ref('');
      var touchstart = null;
      var touchmove = null;
      var fromTime = 0;
      var toTime = 0;
      document.body.addEventListener('touchstart', function(e) {
        touchstart = e;
      });
      document.body.addEventListener('touchmove', function(e) {
        touchmove = e;
      });
      compositionApi.watch(
        function() {
          return root.$route;
        },
        function(to, from) {
          fromTime = toTime;
          toTime = window.history.state ? Number.parseInt(window.history.state.key, 0) || 0 : 0;
          if (!toTime && !fromTime) {
            return;
          }
          if (toTime < fromTime) {
            if (
              touchstart &&
              touchmove &&
              touchstart.touches[0].clientX < 50 &&
              touchmove.touches[0].clientX < 0
            ) {
              transitionName.value = 'slide-right-gesture';
            } else {
              transitionName.value = 'slide-right';
            }
          } else {
            if (
              touchstart &&
              touchmove &&
              document.body.clientWidth - touchstart.touches[0].clientX < 50 &&
              touchmove.touches[0].clientX - touchstart.touches[0].clientX < -10
            ) {
              transitionName.value = 'slide-left-gesture';
            } else {
              transitionName.value = 'slide-left';
            }
          }
        }
      );
      return {
        screen: screen,
        transitionName: transitionName,
        handleAfterEnter: function() {
          if (screen.value && screen.value.afterEnter) {
            // TODO: why setTimeout
            setTimeout(screen.value.afterEnter);
          }
        },
      };
    },
    components: {
      StackKeepAlive: StackKeepAlive,
    },
  });

  function normalizeComponent(
    template,
    style,
    script,
    scopeId,
    isFunctionalTemplate,
    moduleIdentifier,
    /* server only */
    shadowMode,
    createInjector,
    createInjectorSSR,
    createInjectorShadow
  ) {
    if (typeof shadowMode !== 'boolean') {
      createInjectorSSR = createInjector;
      createInjector = shadowMode;
      shadowMode = false;
    } // Vue.extend constructor export interop.

    var options = typeof script === 'function' ? script.options : script; // render functions

    if (template && template.render) {
      options.render = template.render;
      options.staticRenderFns = template.staticRenderFns;
      options._compiled = true; // functional template

      if (isFunctionalTemplate) {
        options.functional = true;
      }
    } // scopedId

    if (scopeId) {
      options._scopeId = scopeId;
    }

    var hook;

    if (moduleIdentifier) {
      // server build
      hook = function hook(context) {
        // 2.3 injection
        context =
          context || // cached call
          (this.$vnode && this.$vnode.ssrContext) || // stateful
          (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
        // 2.2 with runInNewContext: true

        if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
          context = __VUE_SSR_CONTEXT__;
        } // inject component styles

        if (style) {
          style.call(this, createInjectorSSR(context));
        } // register component module identifier for async chunk inference

        if (context && context._registeredComponents) {
          context._registeredComponents.add(moduleIdentifier);
        }
      }; // used by ssr in case component is cached and beforeCreate
      // never gets called

      options._ssrRegister = hook;
    } else if (style) {
      hook = shadowMode
        ? function() {
            style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
          }
        : function(context) {
            style.call(this, createInjector(context));
          };
    }

    if (hook) {
      if (options.functional) {
        // register for functional component in vue file
        var originalRender = options.render;

        options.render = function renderWithStyleInjection(h, context) {
          hook.call(context);
          return originalRender(h, context);
        };
      } else {
        // inject component registration as beforeCreate hook
        var existing = options.beforeCreate;
        options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
      }
    }

    return script;
  }

  var normalizeComponent_1 = normalizeComponent;

  var isOldIE =
    typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
  function createInjector(context) {
    return function(id, style) {
      return addStyle(id, style);
    };
  }
  var HEAD;
  var styles = {};

  function addStyle(id, css) {
    var group = isOldIE ? css.media || 'default' : id;
    var style =
      styles[group] ||
      (styles[group] = {
        ids: new Set(),
        styles: [],
      });

    if (!style.ids.has(id)) {
      style.ids.add(id);
      var code = css.source;

      if (css.map) {
        // https://developer.chrome.com/devtools/docs/javascript-debugging
        // this makes source maps inside style tags work properly in Chrome
        code += '\n/*# sourceURL=' + css.map.sources[0] + ' */'; // http://stackoverflow.com/a/26603875

        code +=
          '\n/*# sourceMappingURL=data:application/json;base64,' +
          btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
          ' */';
      }

      if (!style.element) {
        style.element = document.createElement('style');
        style.element.type = 'text/css';
        if (css.media) style.element.setAttribute('media', css.media);

        if (HEAD === undefined) {
          HEAD = document.head || document.getElementsByTagName('head')[0];
        }

        HEAD.appendChild(style.element);
      }

      if ('styleSheet' in style.element) {
        style.styles.push(code);
        style.element.styleSheet.cssText = style.styles.filter(Boolean).join('\n');
      } else {
        var index = style.ids.size - 1;
        var textNode = document.createTextNode(code);
        var nodes = style.element.childNodes;
        if (nodes[index]) style.element.removeChild(nodes[index]);
        if (nodes.length) style.element.insertBefore(textNode, nodes[index]);
        else style.element.appendChild(textNode);
      }
    }
  }

  var browser = createInjector;

  /* script */
  const __vue_script__ = script;

  /* template */
  var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      'transition',
      {
        attrs: { name: _vm.transitionName },
        on: { afterEnter: _vm.handleAfterEnter },
      },
      [
        _c(
          'StackKeepAlive',
          [
            _c('RouterView', {
              key: _vm.$route.path,
              ref: 'screen',
              staticClass: 'router-view',
            }),
          ],
          1
        ),
      ],
      1
    );
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = function(inject) {
    if (!inject) return;
    inject('data-v-5cc14ed8_0', {
      source:
        '\n.router-view[data-v-5cc14ed8] {\n  --duration: .3s;\n\n  will-change: transform;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n}\n.slide-left-leave[data-v-5cc14ed8],\n.slide-left-leave-active[data-v-5cc14ed8] {\n  position: fixed;\n  top: 0;\n  transform: translateX(-50%);\n  transition: transform var(--duration) ease-out .1s;\n}\n.slide-left-enter[data-v-5cc14ed8] {\n  position: fixed;\n  top: 0;\n  transform: translateX(100%);\n}\n.slide-left-enter-active[data-v-5cc14ed8] {\n  transition: transform var(--duration) ease-out;\n}\n.slide-left-gesture-leave[data-v-5cc14ed8],\n.slide-left-gesture-leave-active[data-v-5cc14ed8] {\n  display: none;\n}\n.slide-right-enter[data-v-5cc14ed8] {\n  position: fixed;\n  top: 0;\n  transform: translateX(-50%);\n}\n.slide-right-enter-active[data-v-5cc14ed8] {\n  transition: transform var(--duration) ease-out;\n}\n.slide-right-leave[data-v-5cc14ed8],\n.slide-right-leave-active[data-v-5cc14ed8] {\n  position: fixed;\n  top: 0;\n  z-index: 1;\n  transform: translateX(100%);\n  transition: transform var(--duration) ease-out .1s;\n}\n.slide-right-gesture-leave[data-v-5cc14ed8],\n.slice-right-gesture-leave-active[data-v-5cc14ed8] {\n  display: none;\n}\n',
      map: {
        version: 3,
        sources: ['/Users/yuzhiquan/Projects/vue/vue-stack-navigator/src/AppContainer.vue'],
        names: [],
        mappings:
          ';AAoFA;EACA,eAAA;;EAEA,sBAAA;EACA,mCAAA;EACA,2BAAA;AACA;AAEA;;EAEA,eAAA;EACA,MAAA;EACA,2BAAA;EACA,kDAAA;AACA;AAEA;EACA,eAAA;EACA,MAAA;EACA,2BAAA;AACA;AAEA;EACA,8CAAA;AACA;AAEA;;EAEA,aAAA;AACA;AAEA;EACA,eAAA;EACA,MAAA;EACA,2BAAA;AACA;AAEA;EACA,8CAAA;AACA;AAEA;;EAEA,eAAA;EACA,MAAA;EACA,UAAA;EACA,2BAAA;EACA,kDAAA;AACA;AAEA;;EAEA,aAAA;AACA',
        file: 'AppContainer.vue',
        sourcesContent: [
          "<template>\n  <transition :name=\"transitionName\" @afterEnter=\"handleAfterEnter\">\n    <StackKeepAlive>\n      <RouterView :key=\"$route.path\" ref=\"screen\" class=\"router-view\" />\n    </StackKeepAlive>\n  </transition>\n</template>\n\n<script lang=\"ts\">\nimport Vue from 'vue'\nimport { createComponent, ref, watch, SetupContext } from \"@vue/composition-api\";\nimport { Route } from \"vue-router\";\nimport StackKeepAlive from './components/StackKeepAlive'\n\nexport interface VueWithAfterEnterHook extends Vue {\n  afterEnter: () => void\n}\n\nexport default createComponent({\n  name: 'AppContainer',\n\n  setup(_: any, context: SetupContext) {\n    const { root } = context\n\n    const screen = ref<VueWithAfterEnterHook>(null)\n    const transitionName = ref('')\n    \n    let touchstart: TouchEvent | null = null\n    let touchmove: TouchEvent | null = null\n\n    let fromTime = 0\n    let toTime = 0\n\n    document.body.addEventListener('touchstart', e => {\n      touchstart = e\n    })\n\n    document.body.addEventListener('touchmove', e => {\n      touchmove = e\n    })\n\n    watch(() => root.$route, (to: Route, from: Route) => {\n      fromTime = toTime\n      toTime = window.history.state ? (Number.parseInt(window.history.state.key, 0) || 0) : 0\n\n      if (!toTime && !fromTime) {\n        return\n      }\n\n      if (toTime < fromTime) {\n        if (touchstart && touchmove && touchstart.touches[0].clientX < 50 && touchmove.touches[0].clientX < 0) {\n          transitionName.value = 'slide-right-gesture'\n        } else {\n          transitionName.value = 'slide-right'\n        }\n      } else {\n        if (touchstart && touchmove && document.body.clientWidth - touchstart.touches[0].clientX < 50 && touchmove.touches[0].clientX - touchstart.touches[0].clientX < -10) {\n          transitionName.value = 'slide-left-gesture'\n        } else {\n          transitionName.value = 'slide-left'\n        }\n      }\n    })\n\n    return {\n      screen,\n      transitionName,\n\n      handleAfterEnter() {\n        if (screen.value && screen.value.afterEnter) {\n          // TODO: why setTimeout\n          setTimeout(screen.value.afterEnter)\n        }\n      },\n    }\n  },\n\n  components: {\n    StackKeepAlive,\n  },\n})\n</script>\n\n<style scoped>\n.router-view {\n  --duration: .3s;\n\n  will-change: transform;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n}\n\n.slide-left-leave,\n.slide-left-leave-active {\n  position: fixed;\n  top: 0;\n  transform: translateX(-50%);\n  transition: transform var(--duration) ease-out .1s;\n}\n\n.slide-left-enter {\n  position: fixed;\n  top: 0;\n  transform: translateX(100%);\n}\n\n.slide-left-enter-active {\n  transition: transform var(--duration) ease-out;\n}\n\n.slide-left-gesture-leave,\n.slide-left-gesture-leave-active {\n  display: none;\n}\n\n.slide-right-enter {\n  position: fixed;\n  top: 0;\n  transform: translateX(-50%);\n}\n\n.slide-right-enter-active {\n  transition: transform var(--duration) ease-out;\n}\n\n.slide-right-leave,\n.slide-right-leave-active {\n  position: fixed;\n  top: 0;\n  z-index: 1;\n  transform: translateX(100%);\n  transition: transform var(--duration) ease-out .1s;\n}\n\n.slide-right-gesture-leave,\n.slice-right-gesture-leave-active {\n  display: none;\n}\n</style>",
        ],
      },
      media: undefined,
    });
  };
  /* scoped */
  const __vue_scope_id__ = 'data-v-5cc14ed8';
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */

  var AppContainer = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    browser,
    undefined
  );

  function install(Vue) {
    Vue.prototype.$stack = stack;
  }

  exports.AppContainer = AppContainer;
  exports.default = install;

  Object.defineProperty(exports, '__esModule', { value: true });
});
