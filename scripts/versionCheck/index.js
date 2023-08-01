#!/usr/bin/env node

const childProcess = require('child_process');
const chalk = require('chalk');
const path = require('node:path');

/**
 * 检查当前
 * @param {string | Array} projectPath 当前项目根目录
 * @returns void
 */
module.exports = function (projectPath) {
  if (!projectPath) {
    console.log(chalk.red.bold('require project path!!!'))
    process.exit(1)
    return
  }

  if (Array.isArray(projectPath)) projectPath = path.resolve(...projectPath)

  // 获取当前版本号
  const packageJSON = require(path.resolve(projectPath, './package.json'));

  const currentVersion = packageJSON.version;
  const repository = packageJSON.repository.url;
  if (!repository) {
    console.log(chalk.red.bold('package.json require repository.url !!!'))
    process.exit(1)
    return
  }

  // 查看远程仓库上的最新版本号
  const latestVersion = childProcess.execSync(`npm show ${repository} version`).toString().trim();

  // 比较版本号
  if (currentVersion === latestVersion) {
    // 版本一致，不能执行push操作
    console.log(chalk.red.bold('\nThe local version is already not up to date. please update package version before push!\n'));
    process.exit(1)
  }
}
