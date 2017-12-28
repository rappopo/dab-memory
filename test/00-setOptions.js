'use strict'

const chai = require('chai'),
  expect = chai.expect,
  chaiSubset = require('chai-subset'),
  _ = require('lodash')

chai.use(chaiSubset)

const Cls = require('../index'),
  lib = require('./_lib')

describe('setOptions', function () {
  it('should return default options', function() {
    const cls = new Cls(lib.options)
    expect(cls.options).to.have.property('limit', 25)
    expect(cls.options).to.have.property('ns', lib.options.ns)
  })

  it('should return data from options', function () {
    const cls = new Cls(lib.options)
    expect(cls.data[lib.options.ns]).to.be.a('array').that.have.length(2).and.containSubset(lib.options.data)
  })

})


