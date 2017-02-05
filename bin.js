const fs = require('fs')
const path = require('path')
const marksite = require('./src/marksite')

const configName = './mark.config.js'

fs.access(
  configName,
  fs.constants.F_OK,
  error => {
    let config = {}
    if (!error) {
      const currentPath = process.cwd()
      const configPath = path.join(currentPath, configName)
      try {
        config = require(configPath)
      } catch (error) {}
    }
    marksite(config)
    .then(markedFiles => {
      console.log('done!')
    })
    .catch(err => {
      throw err
    })
  }
)
