#!/usr/bin/env node

const HARMONY_FLAG = '--harmony'
const HARMONY_ASYNC_AWAIT_FLAG = '--harmony-async-await'

const execArgv = process.execArgv
const supportAsync = execArgv.some(v => {
  return v === HARMONY_FLAG || v === HARMONY_ASYNC_AWAIT_FLAG
})
if (!supportAsync) {
  const {exec} = require('child_process')
  const node = process.argv0
  const otherArgv = process.argv.slice(1)
  const sh = [node, HARMONY_ASYNC_AWAIT_FLAG, ...otherArgv].join(' ')
  exec(sh, (error, stdout, stderr) => {
    if (error) {
      console.error(error)
      return
    }
    console.log(stdout)
    console.log(stderr)
  })
} else {
  const pkg = require('./package.json')
  const program = require('./commander')
  program.version(pkg.version)
    .usage('[options]')
    .option('-c, --config <path>', '配置文件路径，默认："./mark.config.js"', './mark.config.js')
    .option('-s, --src <path>', '输入文件名或文件夹，默认："./markdown"', './markdown')
    .option('-d, --dst <path>', '输出文件名或文件夹，默认："./html"', './html')
    .option('-t, --theme <path>', '主题文件夹，默认："./theme"', './theme')
    .option('-p, --public-path <path>', '输出相对路径，默认：""(空字符串)', '')
    .parse(process.argv)

  const fs = require('fs')
  const path = require('path')
  const marksite = require('./src/marksite')
  const {merge} = require('./src/common')

  const {src, dst, theme, publicPath} = program
  const argvConfig = {src, dst, theme, publicPath}

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
}
