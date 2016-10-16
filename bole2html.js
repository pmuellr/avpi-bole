'use strict'

exports.convert = convert

// convert a bole log line to HTML
function convert (line) {
  const record = parse(line)
  if (!record) return `<span class="line-text">${escapeHtml(line)}</span>`

  // console.error('record:', record)
  const tmpl = {
    t: getLocalDateISO(record.time).slice(11, 19),
    h: record.hostname,
    p: right(record.pid, 7),
    l: left(record.level.toUpperCase(), 5),
    n: record.name,
    m: record.message
  }

  if (tmpl.m == null) {
    if (record.err != null) {
      tmpl.m = `error: ${record.err.name || 'unknown'}`
    } else {
      tmpl.m = ''
    }
  }

  const level = record.level.toUpperCase()

  delete record.time
  delete record.hostname
  delete record.pid
  delete record.level
  delete record.name
  delete record.message

  const userObjectsFull = JSON.stringify(record, null, 4)
  tmpl.o = userObjectsFull == '{}' ? '' : `\n${indent(userObjectsFull, 4)}`

  const stack = getStack(record.err)
  if (stack != null) {
    tmpl.o = `${tmpl.o}\n${indent(stack, 4)}`
  }

  tmpl.t = escapeHtml(tmpl.t)
  tmpl.h = escapeHtml(tmpl.h)
  tmpl.p = escapeHtml(tmpl.p)
  tmpl.l = escapeHtml(tmpl.l)
  tmpl.n = escapeHtml(tmpl.n)
  tmpl.m = escapeHtml(tmpl.m)
  tmpl.o = escapeHtml(tmpl.o)

  return [
    '<span class="line-bole">',
      `<span class="span-level-${tmpl.l}">`,
        `<span class="span-time">${tmpl.t}</span>`,
        ' ',
        `<span class="span-level">${tmpl.l}</span>`,
        ' ',
        `<span class="span-pid">${tmpl.p}</span>`,
        ' ',
        `<span class="span-name">${tmpl.n}</span>`,
        ' - ',
        `<span class="span-message">${tmpl.m}</span>`,
        (tmpl.o === '') ? '' : `<br><span class="span-objects">${tmpl.o}</span>'}`,
      '</span>',
    '</span>',
  ].join('')
}

function getLocalDateISO(dateString) {
  let tzOffset = new Date().getTimezoneOffset() * 60 * 1000
  let date = new Date(dateString)
  date = new Date(date.getTime() - tzOffset)
  return date.toISOString()
}

function getStack (err) {
  if (err == null) return null
  if (err.stack == null) return null

  // console.error(`getStack(${err}): ${err.stack}`)
  return `${err.stack}`
}

function applyTemplate (template, tmpl) {
  const t = templateArgs.t
  const h = templateArgs.h
  const p = templateArgs.p
  const l = templateArgs.l
  const n = templateArgs.n
  const m = templateArgs.m
  const o = templateArgs.o

  try {
    return eval("`" + template + "`")
  } catch (err) {
    console.error('error evaluating template:', err)
    return template
  }
}

function indent(str, spaces) {
  return str.split('\n').map(line => `    ${line}`).join('\n')

}

function left(str, len) {
  str = `${str}`
  while (str.length < len) str = `${str} `
  return str
}

function right(str, len) {
  str = `${str}`
  while (str.length < len) str = ` ${str}`
  return str
}

function parse(line) {
  let record

  try {
    record = JSON.parse(line)
  } catch (e) {
    return null
  }

  if (!record.time) return null
  if (!record.hostname) return null
  if (!record.pid) return null
  if (!record.level) return null
  if (!record.name) return null

  return record
}

function levelColor(level, string) {
  if (level === 'ERROR') return `${Colors.re}${string}${Colors.no}`
  if (level === 'WARN') return `${Colors.ye}${string}${Colors.no}`
  if (level === 'INFO') return `${Colors.no}${string}${Colors.no}`
  if (level === 'DEBUG') return `${Colors.bl}${string}${Colors.no}`
}

const Colors = {
  'no': '\x1B[0m',
  'bl': '\x1B[30m',
  're': '\x1B[31m',
  'gr': '\x1B[32m',
  'ye': '\x1B[33m',
  'bl': '\x1B[34m',
  'ma': '\x1B[35m',
  'cy': '\x1B[36m',
  'wh': '\x1B[37m',
}

const HtmlEntityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
}

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return HtmlEntityMap[s]
  })
}

/*
{
  "time": "2016-02-04T13:46:41.312Z",
  "hostname": "hostname",
  "pid": 21156,
  "level": "debug",
  "name": "bole logger name",
  "message": "the message string",
  "userObject": {
    "userProp1": "blah",
    "userProp2": "zorg"
  }
}
{
  "time": "2016-10-13T12:09:20.867Z",
  "hostname": "pmuellr-MacBook-Pro.local",
  "pid": 30102,
  "level": "error",
  "name": "nsolid-storage:nsolid-storage.js",
  "err": {
    "name": "TypeError",
    "message": "Context.nope is not a function",
    "stack": "TypeError: Context.nope is not a function\n    at main (/Users/pmuellr/Projects/ns/nsolid-storage/nsolid-storage.js:37:11)\n    at Object.<anonymous> (/Users/pmuellr/Projects/ns/nsolid-storage/nsolid-storage.js:302:3)\n    at Module._compile (module.js:598:32)\n    at Object.Module._extensions..js (module.js:608:10)\n    at Module.load (module.js:515:32)\n    at tryModuleLoad (module.js:474:12)\n    at Function.Module._load (module.js:466:3)\n    at Module.runMain (module.js:634:10)\n    at run (bootstrap_node.js:428:7)\n    at startup (bootstrap_node.js:181:9)"
  }
}
*/
