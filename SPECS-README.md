# 个人已整理/已使用的技术选择的规范说明


## 2022年02月17日16:29:58
web新项目应配置:
- eslint                     # 对js/ts/jsx/tsx语法检查
- prettier                   # 对项目代码风格的统一格式化
- commitizen                 # 提供指令选项的工具,配合 husky+commintlint一起使用
- husky                      # 做拦截git操作的事件拦截
- commintlint                # 将 `git commit -m 'xx'` 指令替换成 `git cz`
- lint-staged                # 代码提交前处理代码风格统一格式化和eslint检查
