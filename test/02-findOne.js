'use strict'

const chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect,
  _ = require('lodash')

chai.use(chaiAsPromised)


const Cls = require('../index'),
  lib = require('./_lib')

describe('findOne', function () {
  it('should return empty value', function () {
    const cls = new Cls(lib.options)
    return expect(cls.findOne('no-agent')).to.eventually.rejectedWith('Not found')
  })

  it('should return the correct value', function () {
    const cls = new Cls(lib.options)
    return expect(cls.findOne('james-bond')).to.eventually.have.property('data').that.include(lib.options.data[1])
  })

  it('should also return the doc index', function () {
    const cls = new Cls(lib.options)
    return expect(cls.findOne('james-bond', { withIndex: true })).to.eventually.have.property('index').that.equal(1)
  })

  it('should return doc with custom id key', function () {
    const cls = new Cls(_.merge(_.cloneDeep(lib.options), { idDest: 'uid' }))
    return expect(cls.findOne('james-bond')).to.eventually.have.property('data').that.include({ uid: 'james-bond' })
  })
})
