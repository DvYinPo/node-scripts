#!/usr/bin/env node

const childProcess = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

/**
 * 比较两个版本号的大小
 * @param {string} v1 - 第一个版本号
 * @param {string} v2 - 第二个版本号
 * @returns {number} - 返回1表示v1大于v2，-1表示v1小于v2，0表示两个版本号相等
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = i < parts1.length ? parts1[i] : 0;
    const num2 = i < parts2.length ? parts2[i] : 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

/**
 * 检查当前
 * @param {string | Array} projectPath 当前项目根目录
 * @param {string} target 希望对比的npm包名或github地址
 * @returns boolean
 */
module.exports = function (projectPath, target) {
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
  const pcakName = packageJSON.name;
  if (!pcakName) {
    console.log('package.json require name field !!!')
    process.exit(1)
    return false
  }

  const targetPack = target ? target : pcakName;

  // 查看远程仓库上的最新版本号
  const latestVersion = childProcess.execSync(`npm show ${targetPack} version`).toString().trim();

  // 比较版本号
  if (compareVersions(currentVersion, latestVersion) !== 1) {
    // 版本一致，不能执行push操作
    console.log('\nThe local version is not up to date. please update package version before push!\n');
    process.exit(1)
    return false
  }

  console.log('\nThe local version is already up to date.\n');
  return true
}
