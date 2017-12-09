'use strict'

const chai = require('chai'),
  chaiAsPromised = require("chai-as-promised"),
  chaiSubset = require('chai-subset'),  
  expect = chai.expect

chai.use(chaiSubset)
chai.use(chaiAsPromised)

const Cls = require('../index'),
  lib = require('./_lib'),
  inOut = require('./_inOut.json')

describe('copyTo', function () {
  it('should return all values correctly', function (done) {
    const cls = new Cls(lib.options),
      dest = new Cls(lib.options)
    cls.bulkCreate(inOut).asCallback((err, result) =>{
      cls.copyTo(dest, {
        query: {},
        limit: 1,
        withDetail: true
      }).asCallback((err, result) => {
        expect(result).to.have.property('detail').that.have.lengthOf(7)
        lib._.each(lib.options.data, doc => {
          expect(result).to.have.property('detail').that.containSubset([lib._(doc).pick('id').merge({ success: false, message: 'Exists' }).value()])
        })
        lib._.each(inOut, doc => {
          expect(result).to.have.property('detail').that.containSubset([lib._(doc).pick('id').merge({ success: true }).value()])
        })
        done()
      })
    })
  })

  it('should export all values to a file', function (done) {
    const cls = new Cls(lib.options),
      file = '/tmp/dab-copy-to.json'
    cls.bulkCreate(inOut).asCallback((err, result) => {
      cls.copyTo(file, {
        query: {},
        limit: 1,
        withDetail: true
      }).asCallback((err, result) => {
        const contents = require(file)
        expect(result).to.have.property('stat').that.have.property('total').that.equal(7)
        lib._.each(inOut, doc => {
          expect(contents).to.containSubset([doc])
        })
        done()
      })
    })
  })

})