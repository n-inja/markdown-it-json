'use strict'

const MarkdownIt = require('markdown-it')
const md = new MarkdownIt()
const assert = require('assert')
const mdj = require('../')

function varidate (obj) {
  if (obj['type'] === 'user' && obj.hasOwnProperty('id')) {
    return true
  }
  return false
}

function transform (state, obj) {
  let token = state.push('user_open', 'a', 1)
  token.attrs = [['href', `/user/${obj.id}`]]
  token = state.push('text', '', 0)
  token.content = `@${obj.id}`
  state.push('user_close', 'a', -1)
}

md.use(mdj(varidate, transform))

describe('simple', function() {
  it('usage', function() {
    const s = 'hello, !{"type": "user", "id": "test"}'
    assert.equal('<p>hello, <a href="/user/test">@test</a></p>\n', md.render(s))
  })
  it('varidate', function() {
    const s = 'hello, !{"type": "group", "id": "test_group"}'
    assert.equal('<p>hello, !{&quot;type&quot;: &quot;group&quot;, &quot;id&quot;: &quot;test_group&quot;}</p>\n', md.render(s))
  })
})