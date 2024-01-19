const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require("@rollup/plugin-terser")

const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');

const getPlugin = () => [resolve({ preferBuiltins: true }), commonjs(), terser()]
const getOutput = moduleName => [
  {
    file: `dist/${moduleName}/index.cjs.js`,
    format: 'cjs',
  },
  {
    file: `dist/${moduleName}/index.esm.js`,
    format: 'esm',
  }
]

const mainConfig = {
  input: 'index.js',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
    }
  ],
  plugins: getPlugin()
}

const srcDir = path.resolve(__dirname, './scripts')
const separateModuleConfig = fs.readdirSync(srcDir).reduce((acc, file) => {
  if (fs.statSync(path.resolve(srcDir, file)).isDirectory()) {
    acc.push(file)
  }
  return acc
}, []).map(file => {
  return {
    input: path.resolve(srcDir, `./${file}/index.js`),
    output: getOutput(file),
    plugins: getPlugin(),
  }
})

module.exports = [
  mainConfig,
  ...separateModuleConfig
];
