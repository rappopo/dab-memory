'use strict'

const chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect

chai.use(chaiAsPromised)

const Cls = require('../index'),
  lib = require('./_lib'),
  body = {
    id: 'jason-bourne',
    name: 'Jason Bourne'
  }

describe('create', function () {
  it('should return error if doc exists', function () {
    const cls = new Cls(lib.options)
    return expect(cls.create(lib.options.data[0])).to.be.rejectedWith('Exists')
  })

  it('should return the correct value', function () {
    const cls = new Cls(lib.options)
    return expect(cls.create(body)).to.eventually.have.property('data').that.include(body)
  })
})