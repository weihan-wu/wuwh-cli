const program = require('commander')

const helpOptions = () => {
  program.option('-d, --dest <dest>', 'a destination folder,example: -d /src/components')
  program.option('-f, --framework [framework]', 'your framework', 'wuwh-cli')

  program.on('--help', function () {
    console.log('');
    console.log('Help listener');
  })
  program.on('option:dest', function () {
    console.log('option:dest 被触发');
  });
  program.on('command:create', function () {
    console.log('command:create 被触发');
  });
}

module.exports = {
  helpOptions
}