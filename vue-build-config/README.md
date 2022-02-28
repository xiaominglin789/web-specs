# vue项目打包
[vite打包参考大项目](https://github.com/vbenjs/vue-vben-admin/vite-config.ts)
- vite: 2.7.13



## vite主要打包配置
- mode: 模式,默认`development`.可以通过script: --mode development | production | xxx 传入
	- mode 往往配合 env配合使用,用于区分不同环境下的env配置读取
		- `--mode development` => env.development
		- `--mode production` => env.production
		- `--mode test` => env.test

	- 想在`vite.config.ts`中获取 `mode` ?
		- 改成下面的形式: export defualt ({ mode }: { mode: String }) => { return defineConfig({...}) }

- base: 开发或生产环境服务的公共基础路径。
	- base,有2个值: "./" | ""
	- base: "./", 请配置成相对路径

- resolve.alias: 路径别名
	- 基本例子设置:
		- `"@": fileURLToPath(new URL("./src", import.meta.url))`

		- `test: fileURLToPath(new URL("./src/components/test", import.meta.url))`
			- 注意: 如果是typescript环境,需要在`tsconfig.app.json`中添加alias配置的项，否则使用时vscode会提示文件找不到:
			- 如下配置: `paths:{ "test/*": ["./src/components/test/*"] }`

	- 关于assets目录下资源的读取使用:
		- 建议,使用官方的用法: `<img src="@/assets/logo.svg"/>`
		- 或者这样配置:
			- resolve.alias: `"@icon": fileURLToPath(new URL("./src/assets/icon", import.meta.url))`
			- ts提示(tsconfig.app.json paths): `"@icon/*": ["./src/assets/icon/*"]`
			- 使用时: `<img src="@icon/logo.svg" alt="log" width="100" height="100" />`

		- 注意不配置tsconfig,在使用时不会有提示文件的。但依然可以识别到对应的图片文件

- build: 打包配置
	- target: 'es2015', 可配置打包的js版本
  - cssTarget: 'chrome80', 可配置打包css兼容版本
	- sourcemap: mode === "production" ? false : true, 通过mode控制
	- minify: "terser", 需要设置成terserOptions.compress的配置才生效。"esbuild"默认选项,它不会让comperss配置生效。
	- terserOptions.compress: 代码压缩
		- `drop_console: true, 开启删除代码中的`console.log`
		- `drop_debugger: true, 开启删除代码中debbuger
	- chunkSizeWarningLimit: 500, chunk 大小警告的限制（以 kbs 为单位）, 默认500k。
	- rollupOptions.output: 控制打包输出目录
		- chunkFileNames: 'js/[name]-[hash].js', 普通js-chunk包
		- entryFileNames: 'js/[name]-[hash].js', 入口js
		- assetFileNames: '[ext]/[name]-[hash].[ext]', 资源文件放在对应的目录下

- css.preprocessorOptions: css预处理配置
  - postcss: {}, // 浏览器css兼容 和 移动端的自适应
  - sass: {}, 
  - less: {}, 

- 第三方库cnd引入:
	- 很多第三方库现在都提供了vue3的按需引入,但像element-plus、ant-design:打包出来的项目在首屏渲染耗时很长,因为它花很多时间去编译'scss'、'less'
	- cnd引入的好处,第三方库通过网络请求拉取,项目打包提交更小了。
```markdown
- cnd
	- vue
	- vue-router
	- pinia
	- element-plus
	- vant
	- axios
	- echart

- 自动按需加载
	- loadsh
```

- exp: element-plus
自动按需或cnd引入，如何修改element-plus的默认size和zIndex,在全局入口处配置
	=> `<el-config-provider :size="size" :zIndex="zIndex"></el-config-provider>`
```bash
# cnd-unpkg
<head>
  <!-- 导入样式 -->
  <link rel="stylesheet" href="//unpkg.com/element-plus/dist/index.css" />
  <!-- 导入 Vue 3 -->
  <script src="//unpkg.com/vue@next"></script>
  <!-- 导入组件库 -->
  <script src="//unpkg.com/element-plus"></script>
</head>

# cnd-jsdelivr
<head>
  <!-- 导入样式 -->
  <link
    rel="stylesheet"
    href="//cdn.jsdelivr.net/npm/element-plus/dist/index.css"
  />
  <!-- 导入 Vue 3 -->
  <script src="//cdn.jsdelivr.net/npm/vue@next"></script>
  <!-- 导入组件库 -->
  <script src="//cdn.jsdelivr.net/npm/element-plus"></script>
</head>


# vite.config.ts 配置过滤移除
[vite-plugin-cdn-import](https://github.com/mmf-fe/vite-plugin-cdn-import/blob/HEAD/README.zh-CN.md)
pnpm install vite-plugin-cdn-import -D

import importToCND from "vite-plugin-cdn-import"
defineConfig({
	...
	plugins: [
		importToCND({

		})
	]
)}

```

- server: 设置本地服务，设置proxy
```bash
server: {
  proxy: {
    "/api": {
      target: "http://localhost:1080",
      changeOrigin: true,
      // ws: true, // socket
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
    "/wapi": {
      target: "http://localhost:1099",
      changeOrigin: true,
      // ws: true, // socket
      rewrite: (path) => path.replace(/^\/wapi/, "/cms"),
    },
  },
},
```
