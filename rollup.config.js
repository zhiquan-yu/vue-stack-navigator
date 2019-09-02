import commonjs from 'rollup-plugin-commonjs';
import vue from 'rollup-plugin-vue';
import typescript from 'rollup-plugin-typescript';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.ts',
  output: {
    globals: {
      '@vue/composition-api': 'vueCompositionApi',
    },
    exports: 'named',
    name: 'VueStackNavigator',
  },
  external: ['vue', 'vue-router', '@vue/composition-api'],
  plugins: [
    commonjs(),
    vue(),
    typescript(),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.js', '.ts', '.vue'],
    }),
  ],
};
