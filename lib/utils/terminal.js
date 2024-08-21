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