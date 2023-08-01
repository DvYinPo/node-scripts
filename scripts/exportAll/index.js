#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url')
const chalk = require('chalk')

function isTypeScriptProject(projectDir) {
  if (!projectDir) {
    console.log(chalk.red.bold('require project dir!!!'))
    return false
  }

  // 获取 package.json 文件
  const packageJsonPath = path.resolve(projectDir, 'package.json');
  const packageJsonExists = fs.existsSync(packageJsonPath);
  let hasTypeScriptInPackageJson = false;

  if (packageJsonExists) {
    const packageJson = require(packageJsonPath);
    // 检查 package.json 中是否有 typescript 依赖
    hasTypeScriptInPackageJson = packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript;
  }

  // 检查是否有 tsconfig.json 文件
  const hasTsConfig = fs.existsSync(path.join(projectDir, 'tsconfig.json'));

  return hasTypeScriptInPackageJson || hasTsConfig;
}

/**
 * 基于resolve(projectPath, srcPath)的路径，自动将该文件夹下的所有文件导出，合并到项目根目录下的index.js或index.ts中
 * 例如：在根目录下 projectPath=__dirname srcPath='./src'
 * 则会将./src中的所有index.js或index.ts的遍历一遍，获取所有导出并生成./index.js或./index.ts
 *
 * @param {string | Array} projectPath 当前项目路径一般以project.json的所在目录为准
 * @param {string} srcPath 基于projectPath的相对路径
 * @param {'esm' | 'cjs'} mode 模块化规范
 * @returns void
 */
module.exports = function (projectPath, srcPath, mode = "esm") {
  if (!['esm', 'cjs'].includes(mode)) {
    console.log(chalk.red.bold('mode must be esm or cjs!!!'))
    return
  }

  if (Array.isArray(projectPath)) projectPath = path.resolve(...projectPath)

  srcPath = srcPath.trim().replace(/\/$/, '').trim()

  const isTS = isTypeScriptProject(projectPath)
  const indexFileName = isTS ? 'index.ts' : 'index.js'

  const srcDir = path.resolve(projectPath, srcPath)

  if (!fs.existsSync(srcDir)) {
    console.log(chalk.red.bold(`no such file or directory!!!\n=> ${srcDir}`));
    return
  }

  const files = fs.readdirSync(srcDir)
  const exportContent = files.reduce((content, file) => {
    const fileDir = path.resolve(srcDir, file)
    if (fs.statSync(fileDir).isDirectory()) {
      const indexTS = fs.existsSync(path.resolve(fileDir, 'index.ts'));
      const indexJS = fs.existsSync(path.resolve(fileDir, 'index.js'));

      let indexFilePath = ''
      if (indexTS) {
        indexFilePath = path.resolve(fileDir, 'index.ts')
      } else if (indexJS) {
        indexFilePath = path.resolve(fileDir, 'index.js')
      } else {
        return content
      }

      if (mode === 'esm') {
        content += `export * from '${srcPath}/${file}';\n`

        // 读取文件内容
        const fileContent = fs.readFileSync(indexFilePath, 'utf-8');
        const hasDefaultExport = fileContent.includes('export default')

        if (hasDefaultExport) {
          content += `export { default as ${file} } from '${srcPath}/${file}';\n`
        }
      } else {
        content += `module.exports.${file} = require('${srcPath}/${file}');\n`
      }
    }

    return content
  }, '')

  fs.writeFileSync(path.resolve(projectPath, indexFileName), exportContent, 'utf-8');
}
