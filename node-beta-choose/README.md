# node版本选择
[查看node版本](https://nodejs.org/zh-cn/)
- node: 8.0.0    支持async Hooks,N-API(一个用于构建本机插件的API)
- node: 10.0.0   新增http2模块，将npm从v5.7更新到了v6，并且增强了对ESMModules的支持
- node: 11.0.0   增加了多线程Worker Threads。
- node: 12.0.0   HTTP 解析速度提升
- node: 14.0.0   新增可选链操作符: object?.name, 引用为 null 或 undefined 时不会报错，会发生短路返回 undefined
- node: 16.0.0   v8引擎升级至9.0版本
- node: 17.0.0   基于 Promise 的其它核心模块 API、错误堆栈尾部增加 Node.js 版本信息、OpenSSL 3.0 支持、v8 JavaScript 引擎更新至 9.5。




## 2022年02月17日16:43:13
- 建议: node版本至少升级到 8.0版本,可以使用 12.0/14.0 的版本,用于日常开发的环境依赖

exp: 安装 node: 16.14.0 LTS
```bash
# 安装版本
nvm install 16.14.0

# 设置成默认node版本
nvm alias default v16.14.0

# 查看nvm安装过的 node 版本列表
nvm ls
```
