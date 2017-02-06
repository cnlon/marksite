const mark = require('../core/')
const {
  suffixMd2Html,
  getFileNameFromFilePath,
  fsAsync,
  merge,
  sortObjectByKey,
} = require('./common')

class MarkedFile {
  constructor ({
    src,
    dst,
    path,
    markedPair = {}
  }) {
    this.src = src
    this.dst = dst
    this.path = path
    this.markedPair = markedPair
  }

  get linked () {
    return this.markedPair.linked
  }

  get content () {
    return this.markedPair.content
  }

  get output () {
    return this.markedPair.output
  }
}

async function markFile ({src, dst, name}, {linked, publicPath}) {
  const content = await fsAsync.readFile(src, 'utf8')
  let markedPair
  try {
    markedPair = mark(content)
  } catch (error) {
    console.error('Error when marking file: ', src)
    throw error
  }
  const rawLinked = Object.assign(linked, markedPair.linked)
  markedPair.linked = sortObjectByKey(rawLinked)
  const markedFile = new MarkedFile({
    src,
    dst,
    path: publicPath + name,
    markedPair
  })
  return markedFile
}

async function saveMarkedFile (markedFile, config) {
  const {dst} = markedFile
  const {theme} = config
  const template = await fsAsync.readFile(`${theme}/item.html`)
  try {
    const fun = new Function(
      '{src, dst, path, markedPair, linked, content, output}',
      'config',
      'return `' + template + '`'
    )
    const html = fun(markedFile, config)
    await fsAsync.writeFile(dst, html)
  } catch (error) {
    console.error('Error when save marked file: ', markedFile)
    throw error
  }
}

async function saveMarkedIndex (markedFiles, config) {
  const {dst, theme} = config
  const template = await fsAsync.readFile(`${theme}/index.html`)
  try {
    const fun = new Function(
      'files',
      'config',
      'return `' + template + '`'
    )
    const html = fun(markedFiles, config)
    await fsAsync.writeFile(`${dst}/index.html`, html)
  } catch (error) {
    console.error('Error when save marked index: ', markedFiles)
    throw error
  }
}

async function marksite (rawConfig) {
  const config = merge(rawConfig)
  const {src, dst, filter} = config

  const stats = await fsAsync.stat(src)
  if (stats.isDirectory()) {
    const fileNames = await fsAsync.readdir(src)

    const params = fileNames.filter(filter).map(fileName => {
      const name = suffixMd2Html(fileName)
      return {
        src: `${src}/${fileName}`,
        dst: `${dst}/${name}`,
        name
      }
    })
    const markedFilePromises = params.map(param => markFile(param, config))
    const markedFiles = await Promise.all(markedFilePromises)

    const savePromises = markedFiles.map(file => saveMarkedFile(file, config))
    await Promise.all(savePromises)

    await saveMarkedIndex(markedFiles, config)

    return markedFiles
  } else {
    const name = getFileNameFromFilePath(dst)
    const markedFile = await markFile({src, dst, name}, config)
    await saveMarkedFile(markedFile, config)
    return markedFile
  }
}

module.exports = marksite
