#!/usr/bin/env node

const childProcess = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

/**
 * 检查当前
 * @param {string | Array} projectPath 当前项目根目录
 * @returns boolean
 */
module.exports = function (projectPath) {
  if (!projectPath) {
    console.log('require project path!!!')
    process.exit(1)
    return false
  }

  if (Array.isArray(projectPath)) projectPath = path.resolve(...projectPath)

  // 获取当前版本号
  let packageJSON = {};
  try {
    const packageData = fs.readFileSync(path.resolve(projectPath, './package.json'), 'utf-8');
    packageJSON = JSON.parse(packageData);
  } catch (e) {
    console.log('package.json parse error!!!')
    process.exit(1)
    return false
  }

  const currentVersion = packageJSON.version;
  const repository = packageJSON.repository.url;
  if (!repository) {
    console.log('package.json require repository.url !!!')
    process.exit(1)
    return false
  }

  // 查看远程仓库上的最新版本号
  const latestVersion = childProcess.execSync(`npm show ${repository} version`).toString().trim();

  // 比较版本号
  if (currentVersion === latestVersion) {
    // 版本一致，不能执行push操作
    console.log('\nThe local version is not up to date. please update package version before push!\n');
    process.exit(1)
    return false
  }

  console.log('\nThe local version is already up to date.\n');
  return true
}
