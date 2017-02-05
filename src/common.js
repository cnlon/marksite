const fs = require('fs')
const defaultConfig = require('../mark.config.default')

const MARKDOWN_SUFFIX_RE = /\.md$/i
function suffixMd2Html (name) {
  return name.replace(MARKDOWN_SUFFIX_RE, '.html')
}

const FILE_NAME_RE = /[^\\]$/
function getFileNameFromFilePath (path) {
  return path.match(FILE_NAME_RE)[1]
}

const fsAsync = new Proxy({}, {
  get: function (target, key, receiver) {
    if (key === 'constants') {
      return fs.constants
    }
    return function (...args) {
      return new Promise((resolve, reject) => {
        fs[key](...args, (error, value) => {
          if (error) {
            reject(error)
          } else {
            resolve(value)
          }
        })
      })
    }
  }
})

function merge (...args) {
  if (args.length === 0) {
    return defaultConfig
  }
  const config = Object.assign(
    {},
    defaultConfig,
    ...args
  )
  config.linked = Object.assign(
    {},
    defaultConfig.linked,
    ...args.map(c => c.linked)
  )
  return config
}

function sortObjectByKey (object) {
  const keys = Object.keys(object).sort()
  return keys.reduce((result, key) => {
    result[key] = object[key]
    return result
  }, {})
}

module.exports = {
  suffixMd2Html,
  getFileNameFromFilePath,
  fsAsync,
  merge,
  sortObjectByKey,
}
