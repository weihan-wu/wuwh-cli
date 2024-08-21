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