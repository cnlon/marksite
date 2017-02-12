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
  const fs = require('fs')
  const path = require('path')
  const marksite = require('./index')

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
}
