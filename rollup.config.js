import * as path from 'path';
import commonjs from 'rollup-plugin-commonjs'
import vue from 'rollup-plugin-vue';
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';

const builds = {
  'cjs-dev': {
    outFile: 'vue-stack-navigator.js',
    format: 'cjs',
  },
  'umd-dev': {
    outFile: 'vue-stack-navigator.umd.js',
    format: 'umd',
  },
  es: {
    outFile: 'vue-stack-navigator.module.js',
    format: 'es',
  },
};

function getAllBuilds() {
  return Object.keys(builds).map(key => genConfig(builds[key]));
}

function genConfig({ outFile, format }) {
  return {
    input: './src/index.ts',
    output: {
      file: path.join('./dist', outFile),
      format: format,
      globals: {
        vue: 'Vue',
      },
      exports: 'named',
      name: format === 'umd' ? 'vueStackNavigator' : undefined,
    },
    external: ['vue', 'vue-router', '@vue/composition-api'],
    plugins: [
      commonjs(),
      vue(),
      typescript({
        typescript: require('typescript'),
        objectHashIgnoreUnknownHack: true,
        clean: true,
      }),
      resolve(),
    ].filter(Boolean),
  };
}

let buildConfig;

if (process.env.TARGET) {
  buildConfig = genConfig(builds[process.env.TARGET]);
} else {
  buildConfig = getAllBuilds();
}

export default buildConfig;
