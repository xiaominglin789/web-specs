# web项目编程规范方案


## vscode的分享配置和分享插件
vscode编辑器的配置生效优先级是: `项目.vscode/settings.json  >  用户/setting.json  >  工作区/settings.json` 
- 通过 -> 分享配置 -> 统一别人的vscode配置
```bash
# .vscode/settings.json

{
  // 文件保存时自动格式化
  "editor.formatOnSave": true,
  // 编辑器的字体大小
  "editor.fontSize": 18,
  // 配置vue文件默认使用 esbenp.prettier-vscode 格式化
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  // 在快速修复菜单中显示open lint rule documentation网页。
  "eslint.codeAction.showDocumentation": {
    "enable": true
  },
  // eslint
  "eslint.enable": true,
  "eslint.options": {
    //指定vscode的eslint所处理的文件的后缀
    "extensions": [".js", ".ts", ".tsx"]
  },
  "eslint.validate": ["javascript", "typescript", "typescriptreact"],
  // 文件导航
  "breadcrumbs.enabled": true,
  // 有时候markdown文件会被prettier格式化,需要配置进过滤文件
  "prettier.ignorePath": ".prettierignore"
}
```

- 通过 -> 分享插件 -> 推荐别人使用某些vscode插件
```bash
{
  "recommendations": [
    "johnsoncodehk.volar",                            // vue  volar 代替  vuter
    "johnsoncodehk.vscode-typescript-vue-plugin",     // vue  ts提示的增强
    "mhutchie.git-graph",                             // 查看历史版本点线图
    "microsoft.eslint",                               // JavaScript和JSX检查工具, 这个系统插件暂时不知道在哪个人的名下。
    "esbenp.prettier-vscode"                          // prettier 代码格式化
  ]
}

```


## 项目内可参考的 eslint  设置
```javascript
// 这个是 create-vue 脚手架生成的eslint配置, 使用起来感觉有问题： .cjs  是commendjs 的文件规范
// .eslintrc.cjs

/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
    "prettier"
  ],
  env: {
    "vue/setup-compiler-macros": true
  },
  rules: {
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "@typescript-eslint/no-unused-vars":
      process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-unused-vars": "off",
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "prettier/prettier": "warn",
    "no-async-promise-executor": "off"
  },
  globals: {
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
    withDefaults: "readonly"
  }
};
```


## 项目内的 prettier 配置参考
```prettierrc
# .prettierrc

{
  "endOfLine": "auto",
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "none",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}

```
- prettier的过滤文件，对 某些文件/目录 不进行 格式化: `.prettierignore`
```.prettierignore
# md文档不格式化
**/*.md

# 忽略node_modules和项目打包目录的文件
node_modules/
dist/
```