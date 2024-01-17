# node script

## installation

```shell
npm i -D @yinpo/node-scripts
```

脚本目录：

- [version check](#version-check)
- [export all](#export-all)

## version check

检查指定目录下package.json中的version字段是否有更新

防止在`npm publish`进行自动发布时，被npm拦截。

1. 参数

```ts
function versionCheck(projectPathArr: string[]): void
```

`projectPathArr` 表示项目根路径

2. 引用

在项目指定文件下引入该脚本，例如：

```js
// /script/versionCheck.js
#!/usr/bin/env node

require('@yinpo/node-scripts').versionCheck([__dirname, '..'])
```
因为脚本路径为 `/script/versionCheck.js`, 所以传入路劲数组 `[__dirname, '..']` 表示的是根路径 `/`

最终脚本寻找的是`/package.json`中的`version`字段

3. 使用

当定义好了脚本的路径之后，可以在一些自动化工具中使用。

例如在`husky`的`pre-push`脚本中检查version字段，防止version字段没有更新有推到remote上。

这样能够让github action很安全的执行 `npm publish` 指令。

```shell
#!/bin/sh
while read local_ref local_sha remote_ref remote_sha
do
    branch_name="${remote_ref##refs/heads/}"

    # 如果分支名称为 'main' ，则执行特定逻辑
    if [[ "$branch_name" == "main" ]]; then

        node "scripts/versionCheck.js"
        checkResult=$?

        # 在此处添加你想要运行的其他命令
        if [ $checkResult -eq 1 ]; then
          echo "脚本中止！"
          exit 1
        fi
    fi

done
```

version check如果识别到remote与local的version字段相同，则会终止脚本并返回状态码1


## export all

自动引用指定路径下的所有`index.js` 或 `index.ts` 文件中导出的内容，整合到根路径下 `/index.ts` 或 `/index.js`

1. 参数

```ts
function exportAll(projectPathArr: string[], targetDir: string,  mode?: 'esm' | 'cjs' = "esm"): void
```

`projectPathArr` 表示项目根路径

`targetDir` 在项目根路径的基础下，指定的目标文件夹，会从该路径下扫描所有的导出

`mode` 表示采用哪种模块化规范输出

2. 引用

在项目指定文件下引入该脚本，例如：

```js
// /script/exportAll.js
#!/usr/bin/env node

require('@yinpo/node-scripts').exportAll([__dirname, '..'], 'src')
```

因为脚本路径为 `/script/exportAll.js`, 所以传入路劲数组 `[__dirname, '..']` 表示的是根路径 `/`

最终脚本扫描的目标路径是`/src`下的所有文件夹中index.js或index.ts

`/src` 下的所有文件夹会被取 `index.js` 和 `index.ts` 的所有导出。只有第一层下才有效，多层文件夹嵌套不会扫描。

`/src` 下的所有第一层文件会被扫描，然后输出所有导出。

3. 使用

可以在package.json中定义脚本，然后在自动化处理流程中执行改脚本，例如：

```json
{
  "scripts": {
    "build": "node ./scripts/exportAll.js && rollup -c"
  }
}
```

然后在一些自动化工具中直接执行 `npm run build` 即可。
