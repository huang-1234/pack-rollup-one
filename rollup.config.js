import path from 'path'
// 将CommonJS模块转换为ES6
import commonjs from 'rollup-plugin-commonjs'
// 在node_模块中查找并绑定第三方依赖项
import resolve from '@rollup/plugin-node-resolve'
// 将json 文件转换为ES6 模块
import json from '@rollup/plugin-json'
// rollup babel插件
import { babel } from '@rollup/plugin-babel'
// 优化代码
import { terser } from 'rollup-plugin-terser'
// 删除工具
import rm from 'rimraf'
// 替换环境变量
import replace from '@rollup/plugin-replace'
// 开发服务器
import serve from 'rollup-plugin-serve'
// 热更新服务
import livereload from 'rollup-plugin-livereload'
// less 处理
import less from 'rollup-plugin-less'
// 路径别名
import alias from '@rollup/plugin-alias';


// 获取入口文件
const input = process.env.INPUT_FILE
// 开发环境or生产环境
const NODE_ENV = process.env.NODE_ENV
// 判断是是否为生产环境
const isPro = function () {
  return NODE_ENV === 'production'
}
// 当前执行命令的路径
const root = process.cwd()
// 获取每个包的package.json 文件
const pkg = require(path.resolve(root, 'package.json'))
// 后缀
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.less']
// 排除的打包
const external = ['vue']
// 开发环境只打包esm
const output = [{
  exports: 'auto',
  file: path.join(root, pkg.module),
  format: 'es',
}]

// 如果是生产环境
if (isPro()) {
  // 也排出自己写的包
  external.push(/@two-ui/)
  // 打其他包
  output.push({
    exports: 'auto',
    file: path.resolve(root, pkg.main),
    format: 'cjs'
  })
}

// 删除dist目录
rm(path.resolve(root, 'dist'), err => {
  if (err) throw err
})

export default {
  input,
  output,
  external,
  // 监听的文件
  watch: {
    exclude: 'node_modules/**'
  },
  // 不参与打包
  plugins: [
    resolve({
      preferBuiltins: false,
      mainFields: ['module', 'main'],
      extensions
    }),
    less({
      // 开发模式下才插入到页面中
      insert:  isPro() ? false: true,
      output: 'dist/style/main.css',
    }),
    babel({
      babelHelpers: 'bundled',
      extensions,
      exclude: [
        '*.config.js',
        'packages/**/node_modules/*.d.ts',
        'node_modules/*.d.ts',
        '**/dist/**/*',
        '**/demo/*'
      ]
    }),
    commonjs(),
    json(),
    // 生产模式则压缩代码
    isPro() && terser(),
    // 热更新
    !isPro() && livereload({
      watch: ['dist', 'demo'],
      verbose: false
    }),
    // 开发模式替换环境变量
    !isPro() && replace({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      "vue": "/vue.esm-browser.js"
    }),
    // 开发模式开启静态服务器
    !isPro() &&  serve({
      open: true,
      port: 8080,
      contentBase: [path.resolve(root, 'dist'), path.resolve(root, 'demo'), path.resolve(__dirname, 'node_modules/vue/dist')],
      openPage: 'demo/index.html'
    })
  ]
}
