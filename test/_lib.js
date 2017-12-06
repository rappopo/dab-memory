'use strict'

const _ = require('lodash')

module.exports = {
  _: _,
  options: {
    idSrc: 'id',
    data: [
      { id: 'jack-bauer', name: 'Jack Bauer' },
      { id: 'james-bond', name: 'James Bond' }
    ]
  },
  bulkDocs: [
    { id: 'jack-bauer', name: 'Jack Bauer' },
    { id: 'johnny-english', name: 'Johnny English' },
    { name: 'Jane Boo' }
  ],
  dbName: 'test',
  timeout: 5000
}