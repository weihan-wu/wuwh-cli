#!/usr/bin/env node
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