'use strict'

const chai = require('chai'),
  expect = chai.expect

const Cls = require('../index'),
  lib = require('./_lib')

describe('setOptions', function () {
  it('should return default options', function() {
    const cls = new Cls(lib.options)
    expect(cls.options).to.have.property('limit', 25)
  })

})


