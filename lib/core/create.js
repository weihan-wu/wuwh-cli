const program = require('commander')
const { createProjectAction, createComponentAction, createPageAndRouteAction, createStoreAction } = require('./actions')

const createCommands = () => {
  program
    .command('create <project> [others...]')
    .description('clone a repository into a folder')
    .action(createProjectAction)

  program.command('addcpn <component-name> [dest-name]')
    .description('add a vue component,example addcpn HelloWorld src/components')
    .action(createComponentAction)

  program.command('addpage <page-name> [dest-name]')
    .description('add a vue page,example addpage HelloWorld src/pages/HelloWorld')
    .action(createPageAndRouteAction)

  program.command('addstore <store-name> [dest-name]')
    .description('add a vue store,example addstore HelloWorld src/store/modules/HelloWorld')
    .action(createStoreAction)
}

module.exports = {
  createCommands
}