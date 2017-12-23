'use strict'

const _ = require('lodash')

module.exports = {
  _: _,
  options: {
    data: [
      { _id: 'jack-bauer', name: 'Jack Bauer' },
      { _id: 'james-bond', name: 'James Bond' }
    ]
  },
  bulkDocs: [
    { _id: 'jack-bauer', name: 'Jack Bauer' },
    { _id: 'johnny-english', name: 'Johnny English' },
    { name: 'Jane Boo' }
  ],
  dbName: 'test',
  timeout: 5000
}