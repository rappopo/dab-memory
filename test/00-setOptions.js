'use strict'

const chai = require('chai'),
  expect = chai.expect,
  chaiSubset = require('chai-subset'),
  _ = require('lodash')

chai.use(chaiSubset)

const Cls = require('../index'),
  lib = require('./_lib')

describe('setOptions', function () {
  it('should return data from options', function () {
    const cls = new Cls({ 
      data: lib.options.data
    })
    expect(cls.data).to.have.length(2).and.containSubset(lib.options.data)
  })

})


