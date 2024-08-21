# wuwh-cli

## 脚手架初始化

1. 使创建脚手架文件夹后，在根目录下使用`npm init -y`初始化项目。

2. 创建bin目录用于存放脚手架指令文件，使用Shebang（也称Hashbang）语法指明执行这个脚本文件的解释器（这里指的是node的环境变量）。

   ```js
   #!/usr/bin/env node
   console.log('Hello world');
   ```

3. 在package.json的`bin`中配置命令行指令，指向想要执行的命令行文件。

   ```json
   {
     "name": "wuwh-cli",
     "version": "1.0.0",
     "description": "",
     "main": "index.js",
     "scripts": {
       "test": "echo \"Error: no test specified\" && exit 1"
     },
     "bin": {
       "wuwh":"bin/index.js"
     },
     "keywords": [],
     "author": "",
     "license": "ISC"
   }
   ```

4. 使用`npm link`为配置的命令行指令添加环境变量（为Shebang指定的那个路径）。

5. 此时在系统终端执行刚刚配置的指令就会执行对应的脚本文件。

   ```bash
   ➜  ~ wuwh
   Hello world
   ```



## 目录结构

```bash
.
├── bin # 存放指令的文件夹
│   └── index.js
├── lib # 存放脚手架源码的文件夹
│   ├── core # 存放源码核心模块的文件夹
│   │   ├── actions.js # 存放指令触发的回调函数的文件夹
│   │   ├── create.js # 存放create指令的文件夹
│   │   └── help.js # 存放options的文件夹
│   └── utils # 存放工具函数的文件夹
├── node_modules
│   └── commander
│       └── ……
├── package-lock.json
└── package.json
```



## 涉及模块

| 方法名    | 所属node模块  | 作用                                 |
| --------- | ------------- | ------------------------------------ |
| promisify | util          | 使用promisify()使函数回调支持promise |
| spawn     | child_process | 开启一个子进程来执行自定义命令行指令 |
|           |               |                                      |



## 涉及类库

| 库名              | 作用                                         | 下载命令                |
| ----------------- | -------------------------------------------- | ----------------------- |
| Commander.js      | nod命令行解决方案，脚手架基于此库开发。      | npm install commander   |
| download-git-repo | 在执行create命令时，从代码仓库拉取代码的库。 | npm i download-git-repo |
| open              | 在框架运行后，用于打开浏览器的库。           | npm install open        |
| Inquirer.js       | 在创建阶段选择要注入的库，如vuerouter。      | npm install inquirer    |



## Commander.js

node.js命令行界面的完整解决方案，基于这个库进行脚手架的开发。

```bash
npm install commander
```

### 参数解析

使用`parse()`可以对命令行输入的参数进行解析，并响应相对应的结果。

其自带了一个`Options`可以查看当前脚手架中所有配置的指令。

```js
#!/usr/bin/env node
const program = require('commander')

program.parse(process.argv)
```

结果：

```bash
➜  ~ wuwh --help
Usage: wuwh [options]

Options:
  -h, --help  display help for command
```



### 版本查询

使用`version()`可以指定输入`--version`或`-V`参数时响应的结果，用于指定脚手架版本号。

```js
#!/usr/bin/env node
const program = require('commander')

program.version(require('../package.json').version)
// 也可以设置成-v
program.version(require('../package.json').version,'-v, --version','output the version number(custom instructions)')

program.parse(process.argv)
```

结果：

```bash
➜  ~ wuwh --help
Usage: wuwh [options]

Options:
  -V, --version  output the version number
  -v, --version  output the version number(custom instructions)
  -h, --help     display help for command
➜  ~ wuwh -v
1.0.0
➜  ~ wuwh --version
1.0.0
```



### 新增选项

使用`option()`可以添加操作选项，并且在操作选项后添加必填或可选参数，所跟随的参数可以使用`opts()`取得。

注意：参数需先使用`parse()`进行解析才能取得。

```js
#!/usr/bin/env node
const program = require('commander')
……
// 可以在命令后添加必填<param> 或 可选 [param] 参数
program.option('-d, --dest <dest>', 'a destination folder,example: -d /src/components')
program.option('-f, --framework [framework]','your framework','wuwh-cli')

program.parse(process.argv)

const options = program.opts()
console.log(options);
```

结果：

```bash
➜  ~ wuwh -h                  
Usage: wuwh [options]

Options:
  -V, --version      output the version number
  -v, --version      output the version number(custom instructions)
  -d, --dest <dest>  a destination folder,example: -d /src/components
  -f, --framework [framework]  your framework (default: "wuwh-cli")
  -h, --help         display help for command
  
➜  ~ wuwh -d /src/components -f wuwh-cli
{ framework: 'wuwh-cli', dest: '/src/components' }
```



### 创建指令

可以使用`command()`来创建一个指令，使用`description()`为指令添加描述，使用`action()`定义指令触发后的回调函数。

```js
// /lib/core/create.js
const program = require('commander')
const { createProjectAction } = require('./actions')

const createCommands = () => {
  program
    .command('create <project> [others...]') // 创建指令，定义必选与可选参数
    .description('clone a repository into a folder') // 为指令添加描述
    .action(createProjectAction) // 指令触发的回调函数，可以传入指令定义的参数
}

module.exports = {
  createCommands
}
```

```js
// /lib/core/actions.js
// 可以获取到指令传入的参数
const createProjectAction = (project, others) => {
  console.log(project, others);
}

module.exports = { createProjectAction }
```

结果：

```bash
➜  wuwh-cli wuwh -h
Usage: wuwh [options] [command]

Options:
……

Commands:
  create <project> [others...]  clone a repository into a folder
  help [command]                display help for command

Help listener
➜  wuwh-cli wuwh create wuwh-demo v1 v2
wuwh-demo [ 'v1', 'v2' ]
command:create 被触发
{ framework: 'wuwh-cli' }
```



### 指令监听

可以使用`on()`为指令绑定监听事件。

参数为：

1. 指令API：指令名
2. 指令被触发的回调函数

```js
#!/usr/bin/env node
const program = require('commander')
……
program.option('-d, --dest <dest>', 'a destination folder,example: -d /src/components')
program.option('-f, --framework [framework]','your framework','wuwh-cli')

// 为help指令添加监听事件
program.on('--help',function() {
  console.log('');
  console.log('Help listener');
})
// 为option()绑定的dest选项添加监听事件
program.on('option:dest', function () {
  console.log('dest');
});
// 为command()绑定的create指令添加监听事件
program.on('command:create', function () {
    console.log('command:create 被触发');
});

program.parse(process.argv)

const options = program.opts()
console.log(options);
```

结果：

```bash
➜  wuwh-cli wuwh -h     
Usage: wuwh [options]

Options:
  -V, --version                output the version number
  -v, --version                output the version number(custom instructions)
  -d, --dest <dest>            a destination folder,example: -d /src/components
  -f, --framework [framework]  your framework (default: "wuwh-cli")
  -h, --help                   display help for command

Help listener
➜  wuwh-cli wuwh -d /src
dest
{ framework: 'wuwh-cli', dest: '/src' }
```



### 入口文件

我们可以将`option`与`command`进行封装，再将封装好的函数引用到入口文件去使用，保持入口的统一。

```js
#!/usr/bin/env node
// /bin/index.js
const program = require('commander')
const { helpOptions } = require('../lib/core/help')
const { createCommands } = require('../lib/core/create')

//查看版本号
program.version(require('../package.json').version)
program.version(require('../package.json').version, '-v, --version', 'output the version number(custom instructions)')

// 帮助和可选指令
helpOptions()
// 创建其他指令
createCommands()

program.parse(process.argv)

// 获取参数
const options = program.opts()
console.log(options);
```



## 脚手架命令

### create

`create` 用于初始化一个项目。

必选参数：项目名

可选参数：任意参数

借助第三方库`download-git-repo`实现从github拉取代码。

```bash
npm i download-git-repo
```

调用方式：

```js
const download = require('download-git-repo')
// 1、地址类型：仓库地址 2、克隆到目标目录 3、是否克隆 4、处理结果的回调
download('direct:https://github.com/coderwhy/hy-vue-temp.git', 'test/tmp',{ clone:true }, function (err) {
  console.log(err ? 'Error' : 'Success')
})
```

指令回调源码：

```js
// lib/core/create.js
const program = require('commander')
const { createProjectAction } = require('./actions')

const createCommands = () => {
  program
    .command('create <project> [others...]')
    .description('clone a repository into a folder')
    .action(createProjectAction)
}

module.exports = {
  createCommands
}
```

```js
// lib/core/actions.js
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

module.exports = { createProjectAction }
```

 注意：为了不使进程被阻塞，第四步打开浏览器的方法可以放在第三步npm run serve之前调用，即先打开浏览器，在运行了框架后再以webpack的热更新去更新页面，或者在调用npm run serve方法时不使用`await`进行同步调用效果也一样。



涉及的工具函数以及配置文件：

```js
// lib/utils/terminal.js
// 执行终端命令相关代码
const { spawn } = require('child_process')

const commandSpawn = (...args) => {
  return new Promise((resolve, reject) => {
    // spawn(command,args,options)
    // 开启一个子进程用来执行命令，使用可变参数进行简化
    const childProcess = spawn(...args)
    // 将子进程的输出与错误信息输出到主进程的流内
    childProcess.stdout.pipe(process.stdout)
    childProcess.stderr.pipe(process.stderr)
    childProcess.on('close', () => {
      resolve()
    })
  })
}

module.exports = {
  commandSpawn
}
```

```js
// lib/config/repo-config.js
const vueRepo = 'direct:https://github.com/coderwhy/hy-vue-temp.git'

module.exports = {
  vueRepo
}
```



### addcpn

`addcpn`用于在目标文件夹创建一个vue的组件模板。

必选参数：组件名

可选参数：目录名

指令源码：

```js
// /lib/core/create.js
const program = require('commander')
const { createProjectAction } = require('./actions')

const createCommands = () => {
  ……

  program.command('addcpn <component-name> [dest-name]')
  .description('add a vue component,example addcpn HelloWorld -d src/components')
  .action(createComponentAction)
}

module.exports = {
  createCommands
}
```

```js
// /lib/core/actions.js
……

const createComponentAction = async (name, dest = 'src/components') => {
  // 1.有对应的ejs模块
  // 2.编译ejs模板result
  const result = await compile("component.ejs", { name, lowerName: name.toLowerCase() })
  // 3.将result写入到对应的文件夹的.vue文件中
  const targetPath = path.resolve(dest, `${name}.vue`)
  writeToFile(targetPath, result)
}

module.exports = { createProjectAction,createComponentAction }
```



### addpage

`addpage`创建一个页面组件以及对应的路由对象。

必选参数：组件名

可选参数：目录名

指令源码：

```js
// /lib/core/create.js
const program = require('commander')
const { ……, createPageAndRouteAction } = require('./actions')

const createCommands = () => {
  ……

  program.command('addpage <page-name> [dest-name]')
    .description('add a vue page,example addpage HelloWorld src/pages/HelloWorld')
    .action(createPageAndRouteAction)

  ……
}

module.exports = {
  createCommands
}
```

```js
// /lib/core/actions.js
……

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

```



### addstore

`addstore`创建一个store模版。

必选参数：模块名

可选参数：目录名

可选参数：

```js
// /lib/core/create.js
const program = require('commander')
const { ……, createStoreAction } = require('./actions')

const createCommands = () => {
  ……

  program.command('addstore <store-name> [dest-name]')
    .description('add a vue store,example addstore HelloWorld src/store/modules/HelloWorld')
    .action(createStoreAction)

  ……
}

module.exports = {
  createCommands
}
```

```js
// /lib/core/actions.js
……

const createStoreAction = async (name, dest) => {
  if (!dest) dest = `src/store/modules/${name}`
  const storeResult = await compile('store.ejs', {})
  if (createDirSync(dest)) {
    const targetPagePath = path.resolve(dest, `${name}.js`)
    writeToFile(targetPagePath, storeResult)
  }
}
```



## ejs

可以通过`ejs`将一个`.ejs`模板文件编译为想要的文件。

```bash
npm i ejs
```

编译模版工具方法：

```js
const path = require('path')
const fs = require('fs')

const ejs = require('ejs')

const compile = (template, data) => {
  const templatePosition = `../template/vue/${template}`
  const templatePath = path.resolve(__dirname, templatePosition)

  return new Promise((resolve, reject) => {
    ejs.renderFile(templatePath, { data }, {}, (err, result) => {
      if (err) {
        console.log(err);
        reject(err)
        return
      }
      resolve(result)
    })
  })
}

const createDirSync = (filePath) => {
  if (fs.existsSync(filePath)) {
    return true
  } else {
    if (createDirSync(path.dirname(filePath))) {
      fs.mkdirSync(filePath)
      return true
    }
  }
}

const writeToFile = (path, content) => {
  return fs.promises.writeFile(path, content)
}

module.exports = {
  compile, writeToFile, createDirSync
}
```



### vue

#### component

```ejs
// /lib/template/vue/component.ejs
<template>
  <div class="<%= data.lowerName  %>"></div>
</template>

<script>
  export default {
    name: "<%= data.name  %>",
    components: {},
    props: {},
    mixins: [],
    data() {
      return {};
    },
    created() { },
    methods: {},
  };
</script>

<style scoped>
</style>
```



#### router

```ejs
// /lib/template/vue/router.ejs
const <%= data.name %> = () => import('./<%= data.name %>.vue ')
export default {
  path:'/<%= data.lowerName %> ',
  name:'<%= data.name %> ',
  component:<%= data.name %>,
  children:[]
}
```



#### store

```ejs
export default {
  namespaced: true,
  state: {

  },
  mutations: {

  },
  actions: {

  },
  getters: {
    
  }
}
```