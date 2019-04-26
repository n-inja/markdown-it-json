'use strict'

module.exports = function(validate, transform) {
  return function(md) {
    md.inline.ruler.after('emphasis', 'json', json(validate, transform))
  }
}

const EXCL = '!'.charCodeAt(0)
const LBRACK = '{'.charCodeAt(0)
const RBRACK = '}'.charCodeAt(0)
const BSLASH = '\\'.charCodeAt(0)
const LBRACE = '['.charCodeAt(0)
const RBRACE = ']'.charCodeAt(0)
const DQUOTE = '"'.charCodeAt(0)

function json(v, t) {
  return (state, silent) => {
    // !{
    if (state.src.charCodeAt(state.pos) !== EXCL) {
      return false
    }
    if (state.src.charCodeAt(state.pos + 1) !== LBRACK) {
      return false
    }

    // .. }
    const { obj, labelEnd } = getObj(state, state.pos + 2)

    if (labelEnd < 0) {
      return false
    }

    if (!v(obj)) {
      return false
    }
    state.pos = labelEnd + 1
    if (!silent) {
      t(state, obj)
    }
    return true
  }
}

function getObj(state, start) {
  let pos = start
  let labelEnd = -1
  let inText = false // normal,
  let inEscape = false
  const max = state.posMax
  const stack = [LBRACK]
  for (; pos < max; pos++) {
    const code = state.src.charCodeAt(pos)
    if (inText) {
      if (inEscape) {
        inEscape = false
      } else {
        if (code === BSLASH) {
          inEscape = true
        } else if (code === DQUOTE) {
          inText = false
        }
      }
    } else {
      switch (code) {
        case DQUOTE:
          inText = true
          break
        case LBRACK:
        case LBRACE:
          stack.push(code)
          break
        case RBRACK:
          if (stack.pop() !== LBRACK) {
            return { obj: {}, labelEnd: -1 }
          }
          break
        case RBRACE:
          if (stack.pop() !== LBRACE) {
            return { obj: {}, labelEnd: -1 }
          }
          break
      }
    }
    if (stack.length === 0) {
      labelEnd = pos
      break
    }
  }
  if (labelEnd < 0) {
    return { obj: {}, labelEnd: -1 }
  }
  try {
    const obj = JSON.parse(state.src.slice(start - 1, labelEnd + 1))
    return { obj: obj, labelEnd: labelEnd }
  } catch (e) {
    return { obj: {}, labelEnd: -1 }
  }
}
