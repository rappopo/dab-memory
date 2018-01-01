'use strict'

const _ = require('lodash')

module.exports = {
  _: _,
  options: {},
  schema: {
    name: 'test'
  },
  schemaFull: {
    name: 'full',
    fields: [
      { id: '_id', type: 'string' },
      { id: 'name', type: 'string' },
      { id: 'age', type: 'integer' }
    ]
  },
  schemaHidden: {
    name: 'hidden',
    fields: [
      { id: '_id', type: 'string' },
      { id: 'name', type: 'string', hidden: true },
      { id: 'age', type: 'integer' }
    ]
  },
  schemaMask: {
    name: 'mask',
    fields: [
      { id: '_id', type: 'string', mask: 'id' },
      { id: 'name', type: 'string', mask: 'fullname' },
      { id: 'age', type: 'integer' }
    ]
  },
  docs: [
    { _id: 'jack-bauer', name: 'Jack Bauer' },
    { _id: 'johnny-english', name: 'Johnny English' },
    { name: 'Jane Boo', age: 20 }
  ],
  docsMask: [
    { id: 'jack-bauer', fullname: 'Jack Bauer' },
    { id: 'johnny-english', fullname: 'Johnny English' },
    { fullname: 'Jane Boo', age: 20 }
  ],
  timeout: 5000
}