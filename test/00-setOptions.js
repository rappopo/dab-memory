'use strict'

const chai = require('chai')
const expect = chai.expect

const Cls = require('../index')
const lib = require('./_lib')

describe('setOptions', function () {
  it('should return default options', function () {
    const cls = new Cls(lib.options)
    expect(cls.options).to.have.property('limit', 25)
  })
})
