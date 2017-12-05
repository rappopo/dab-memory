'use strict'

const chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  chaiSubset = require('chai-subset'),
  expect = chai.expect

chai.use(chaiSubset)
chai.use(chaiAsPromised)

const Cls = require('../index'),
  lib = require('./_lib')

describe('find', function () {
  it('should return empty value', function () {
    const cls = new Cls(lib.options)
    return expect(cls.find({ query: { id: 'no-agent' }})).to.eventually.have.property('data').that.have.lengthOf(0)
  })

  it('should return all values', function () {
    const cls = new Cls(lib.options)
    return expect(cls.find()).to.eventually.have.property('data').that.have.lengthOf(2).and.containSubset(lib.options.data)
  })

  it('should return filtered values', function () {
    const cls = new Cls(lib.options)
    return expect(cls.find({ query: { id: 'jack-bauer' }})).to.eventually.have.property('data').that.have.lengthOf(1).and.containSubset([lib.options.data[0]])
  })

  it('should return 2nd page', function () {
    const cls = new Cls(lib.options)
    return expect(cls.find({ limit: 1, page: 2 })).to.eventually.have.property('data').that.containSubset([lib.options.data[1]])
  })

  it('should sort in descending order', function () {
    const cls = new Cls(lib.options)
    return expect(cls.find({ sort: [{ id: 'desc' }] })).to.eventually.have.property('data').that.containSubset([lib.options.data[1]])
  })

})
