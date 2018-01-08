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
    attributes: {
      _id: 'string',
      name: 'string',
      age: 'integer'
    }
  },
  schemaHidden: {
    name: 'hidden',
    attributes: {
      _id: 'string',
      name: { type: 'string', hidden: true },
      age: 'integer'
    }
  },
  schemaMask: {
    name: 'mask',
    attributes: {
      _id: { type: 'string', mask: 'id' },
      name: { type: 'string', mask: 'fullname' },
      age: { type: 'integer' }
    }
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