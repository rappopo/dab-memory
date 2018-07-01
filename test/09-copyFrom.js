'use strict'

const chai = require('chai'),
  chaiSubset = require('chai-subset'),
  expect = chai.expect

chai.use(chaiSubset)

const Cls = require('../index'),
  lib = require('./_lib')

describe('copyFrom', function () {
  it('should return error if collection doesn\'t exist', function (done) {
    const cls = new Cls(lib.options),
      src = new Cls(lib.options)
    src.createCollection(lib.schema)
      .then(result => {
        return src.bulkCreate(lib.docs, { collection: 'test' })
      })
      .then(result => {
        return cls.createCollection({ name: 'test1' })
      })
      .then(result => {
        return cls.copyFrom(src, { collection: 'none' })
      })
      .catch(err => {
        expect(err).to.be.a('error').and.have.property('message', 'Collection not found')
        done()
      })
  })

  it('should return all values correctly', function (done) {
    const cls = new Cls(lib.options),
      src = new Cls(lib.options)
    src.createCollection(lib.schema)
      .then(result => {
        return src.bulkCreate(lib.docs, { collection: 'test' })
      })
      .then(result => {
        return cls.createCollection({ name: 'test1' })
      })
      .then(result => {
        return cls.copyFrom(src, { srcCollection: 'test', collection: 'test1', withDetail: true })
      })
      .then(result => {
        expect(result.success).to.be.true,
        expect(result.stat).to.have.property('ok', 3)
        expect(result.stat).to.have.property('fail', 0)
        expect(result.stat).to.have.property('total', 3)
        expect(cls.data).to.have.property('test1').that.containSubset(lib.docs)
        done()
      })
      .catch(err => {
        console.log(err)
      })
  })

  it('should import all values from a file', function (done) {
    const cls = new Cls(lib.options)
    cls.createCollection(lib.schema)
      .then(result => {
        return cls.copyFrom('test/_inOut.json', { collection: 'test', withDetail: true })
      })
      .then(result => {
        expect(result.success).to.be.true,
        expect(result.stat).to.have.property('ok', 5)
        expect(result.stat).to.have.property('fail', 0)
        expect(result.stat).to.have.property('total', 5)
        let keys = lib._.map(cls.data.test, '_id')
        expect(keys).to.eql(['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5'])
        done()
      })
  })

  it('should import all values from a file with masks', function (done) {
    const cls = new Cls(lib.options)
    cls.createCollection(lib.schemaMask)
      .then(result => {
        return cls.copyFrom('test/_inOutMask.json', { collection: 'mask', withDetail: true })
      })
      .then(result => {
        expect(result.success).to.be.true,
        expect(result.stat).to.have.property('ok', 5)
        expect(result.stat).to.have.property('fail', 0)
        expect(result.stat).to.have.property('total', 5)
        let keys = lib._.map(cls.data.mask, '_id')
        expect(keys).to.eql(['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5'])
        done()
      })
  })

})