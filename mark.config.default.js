module.exports = {
  src: './markdown',
  dst: './html',
  filter (fileName) {
    return !/^\./.test(fileName) && /\.md$/i.test(fileName) && !/README.md/i.test(fileName)
  },
  theme: './theme',
  publicPath: '',
  linked: {
    '@context': 'http://schema.org',
    '@type': 'BlogPosting',
    inLanguage: 'zh',
    encoding: 'utf-8',
    fileFormat: 'text/html',
    license: 'http://opensource.org/licenses/MIT',
  }
}
