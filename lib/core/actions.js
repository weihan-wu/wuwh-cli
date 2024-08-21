const path = require('path')
// 从仓库配置文件引入仓库地址
const { vueRepo } = require('../config/repo-config')
// 使用promisify()使函数回调支持promise
const { promisify } = require('util')
// 克隆git仓库的第三方库
const download = promisify(require('download-git-repo'))
// 封装好的命令行调用方法
const { commandSpawn } = require('../utils/terminal')
// 打开浏览器的第三方库 npm install open
const { open } = require('open')

// 编译ejs模版文件
const { compile, writeToFile, createDirSync } = require('../utils/utils')

const createProjectAction = async (project, others) => {
  // 1.clone项目
  await download(vueRepo, project, { clone: true })
  // 2.执行npm install 
  //为了适配windows，需在指令后加上.cmd
  const command = process.platform == 'win32' ? 'npm.cmd' : 'npm'
  await commandSpawn(command, ['install'], { cwd: `./${project}` })
  // 3.运行npm run serve
  commandSpawn(command, ['run', 'serve'], { cwd: `./${project}` })
  // 4.打开浏览器 
  open('http://localhost:8080/')
}

const createComponentAction = async (name, dest = 'src/components') => {
  // 1.有对应的ejs模块
  // 2.编译ejs模板result
  const result = await compile("component.ejs", { name, lowerName: name.toLowerCase() })
  // 3.将result写入到对应的文件夹的.vue文件中
  const targetPath = path.resolve(dest, `${name}.vue`)
  writeToFile(targetPath, result)
}

const createPageAndRouteAction = async (name, dest) => {
  if (!dest) dest = `src/pages/${name}`
  // 添加页面组件与路由
  const data = { name, lowerName: name.toLowerCase() }
  const pageResult = await compile("component.ejs", data)
  const routeResult = await compile("router.ejs", data)

  if (createDirSync(dest)) {
    const targetPagePath = path.resolve(dest, `${name}.vue`)
    writeToFile(targetPagePath, pageResult)

    const routePath = path.resolve(dest, 'router.js')
    writeToFile(routePath, routeResult)
  }
}

const createStoreAction = async (name, dest) => {
  if (!dest) dest = `src/store/modules/${name}`
  const storeResult = await compile('store.ejs', {})
  if (createDirSync(dest)) {
    const targetPagePath = path.resolve(dest, `${name}.js`)
    writeToFile(targetPagePath, storeResult)
  }
}

module.exports = { createProjectAction, createComponentAction, createPageAndRouteAction, createStoreAction }