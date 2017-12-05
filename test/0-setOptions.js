'use strict'

const chai = require('chai'),
  expect = chai.expect,
  chaiSubset = require('chai-subset'),
  _ = require('lodash')

chai.use(chaiSubset)

const Cls = require('../index'),
  lib = require('./_lib')

describe('setOptions', function () {
  it('should return the default options', function () {
    const cls = new Cls()
    expect(cls.options).to.include({
      idSrc: 'id',
      idDest: 'id'
    })
  })

  it('should return options with custom idSrc', function () {
    const cls = new Cls({ 
      idSrc: 'uid'
    })
    expect(cls.options).to.include({
      idSrc: 'uid',
      idDest: 'uid'
    })
  })

  it('should return options with custom idSrc and idDest', function () {
    const cls = new Cls({ 
      idSrc: '_id',
      idDest: 'myid'
    })
    expect(cls.options).to.include({
      idSrc: '_id',
      idDest: 'myid'
    })
  })

  it('should return data from options', function () {
    const cls = new Cls({ 
      data: lib.options.data
    })
    expect(cls.data).to.have.length(2).and.containSubset(lib.options.data)
  })

})


