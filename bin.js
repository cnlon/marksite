#!/usr/bin/env node
const pkg = require('./package.json')
const program = require('./commander')
const defaultConfig = require('./mark.config.default')

const configPath = './mark.config.js'
program.version(pkg.version)
  .usage('[options]')
  .option('-c, --config <path>', `配置文件路径，默认："${configPath}"`, configPath)
  .option('-s, --src <path>', `输入文件名或文件夹，默认："${defaultConfig.src}"`)
  .option('-d, --dst <path>', `输出文件名或文件夹，默认："${defaultConfig.dst}"`)
  .option('-t, --theme <path>', `主题文件夹，默认："${defaultConfig.theme}"`)
  .option('-p, --public-path <path>', `输出相对路径，默认："${defaultConfig.publicPath}"`)
  .parse(process.argv)

const fs = require('fs')
const path = require('path')
const marksite = require('./src/marksite')
const {merge} = require('./src/common')

const configName = program.config
fs.access(
  configName,
  fs.constants.F_OK,
  error => {
    let fileConfig = {}
    if (!error) {
      const currentPath = process.cwd()
      const configPath = path.join(currentPath, configName)
      try {
        fileConfig = require(configPath)
      } catch (error) {}
    }

    const argvConfig = [
      'src',
      'dst',
      'theme',
      'publicPath'
    ].reduce((result, key) => {
      if (program[key] !== undefined) {
        result[key] = program[key]
      }
      return result
    }, {})

    const config = merge(fileConfig, argvConfig)
    marksite(config)
    .then(markedFiles => {
      console.log('done!')
    })
    .catch(err => {
      throw err
    })
  }
)
