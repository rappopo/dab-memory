'use strict'

const chai = require('chai'),
  chaiAsPromised = require("chai-as-promised"),
  expect = chai.expect

chai.use(chaiAsPromised)

const Cls = require('../index'),
  lib = require('./_lib'),
  id = 'james-bond'

describe('remove', function () {
  it('should return error if doc doesn\'t exist', function () {
    const cls = new Cls(lib.options)
    return expect(cls.remove('no-agent')).to.eventually.be.rejectedWith('Not found')
  })

  it('should return the value before removed', function () {
    const cls = new Cls(lib.options)
    let key = lib.options.idDest || lib.options.idSrc || 'id',
      val = { 'source.name': 'James Bond' }
    val['source.' + key] = 'james-bond'
    return expect(cls.remove(id, { withSource: true })).to.eventually.nested.include(val)
  })
})