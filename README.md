# markdown-it-json [![Build Status](https://travis-ci.org/n-inja/markdown-it-json.svg?branch=master)](https://travis-ci.org/n-inja/markdown-it-json)
add json syntax to markdown-it

## Usage

```javascript
const md = require('markdown-it')
const mdj = require('markdown-it-json')

function varidate (obj) {
  if (obj['type'] === 'user' && obj.hasOwnProperty('id')) {
    return true
  }
  return false
}

function transform (state, obj) {
  let token = state.push('user_open', 'a', 1)
  token.attrs = [['href', `/user/${obj.id}`]]
  token = state.push('test', '', 0)
  token.content = `@${obj.id}`
  state.push('user_close', 'a', -1)
}

md.use(mdj(varidate, transform)).render('hello, !{"type": "user", "id": "test"}')
// '<p>hello, <a href="/user/test">@test</a></p>\n'
```

