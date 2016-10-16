'use strict'

const fs = require('fs')
const path = require('path')

const bole2html = require('./bole2html')

const htmlTemplate = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8')

exports.toHTML     = toHTML
exports.extensions = ['bole']

// convert an input file to HTML and write it out
function toHTML(iVinyl, oVinyl, cb) {
  const content = fs.readFileSync(iVinyl.path, 'utf8')

  const oldLines = content.split('\n')
  const newLines = oldLines.map((line) => bole2html.convert(line))

  const output = htmlTemplate
    .replace('%file%', iVinyl.path)
    .replace('%body%', newLines.join('\n'))

  fs.writeFileSync(oVinyl.path, output)

  cb()
}
