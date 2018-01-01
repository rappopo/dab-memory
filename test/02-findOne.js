'use strict'

const chai = require('chai'),
  expect = chai.expect

const Cls = require('../index'),
  lib = require('./_lib')

describe('findOne', function (done) {
  it('should return error if collection doesn\'t exist', function (done) {
    const cls = new Cls(lib.options)
    cls.createCollection(lib.schema)
      .then(result => {
        return cls.bulkCreate(lib.docs, { collection: 'test' })
      })
      .then(result => {
        return cls.findOne('id', { collection: 'none' })
      })
      .catch(err => {
        expect(err).to.be.a('error').and.have.property('message', 'Collection not found')
        done()
      })
  })

  it('should return empty value', function (done) {
    const cls = new Cls(lib.options)
    cls.createCollection(lib.schema)
      .then(result => {
        return cls.bulkCreate(lib.docs, { collection: 'test' })
      })
      .then(result => {
        return cls.findOne('wrong-id', { collection: 'test' })
      })
      .catch(err => {
        expect(err).to.be.a('error').and.have.property('message', 'Document not found')
        done()
      })
  })

  it('should return the correct value', function (done) {
    const cls = new Cls(lib.options)
    cls.createCollection(lib.schema)
      .then(result => {
        return cls.bulkCreate(lib.docs, { collection: 'test' })
      })
      .then(result => {
        return cls.findOne('jack-bauer', { collection: 'test' })
      })
      .then(result => {
        expect(result.success).to.be.true
        expect(result.data).to.have.property('_id', 'jack-bauer')
        expect(result.data).to.have.property('name', 'Jack Bauer')
        done()
      })
  })

  it('should also return the doc index', function (done) {
    const cls = new Cls(lib.options)
    cls.createCollection(lib.schema)
      .then(result => {
        return cls.bulkCreate(lib.docs, { collection: 'test' })
      })
      .then(result => {
        return cls.findOne('jack-bauer', { collection: 'test', withIndex: true })
      })
      .then(result => {
        expect(result.success).to.be.true
        expect(result.data).to.have.property('_id', 'jack-bauer')
        expect(result.data).to.have.property('name', 'Jack Bauer')
        expect(result.index).to.equal(0)
        done()
      })
  })

  it('should return enforced values according to its definitions', function (done) {
    const cls = new Cls(lib.options)
    cls.createCollection(lib.schemaFull)
      .then(result => {
        return cls.bulkCreate(lib.docs, { collection: 'full' })
      })
      .then(result => {
        return cls.findOne('jack-bauer', { collection: 'full' })
      })
      .then(result => {
        expect(result.success).to.be.true
        expect(result.data).to.have.property('_id', 'jack-bauer')
        expect(result.data).to.have.property('name', 'Jack Bauer')
        expect(result.data).to.have.property('age', null)
        done()
      })
  })

  it('should return enforced values with hidden columns', function (done) {
    const cls = new Cls(lib.options)
    cls.createCollection(lib.schemaHidden)
      .then(result => {
        return cls.bulkCreate(lib.docs, { collection: 'hidden' })
      })
      .then(result => {
        return cls.findOne('jack-bauer', { collection: 'hidden' })
      })
      .then(result => {
        expect(result.success).to.be.true
        expect(result.data).to.have.property('_id', 'jack-bauer')
        expect(result.data).to.not.have.property('name')
        expect(result.data).to.have.property('age', null)
        done()
      })
  })

  it('should return enforced values with masks', function (done) {
    const cls = new Cls(lib.options)
    cls.createCollection(lib.schemaMask)
      .then(result => {
        return cls.bulkCreate(lib.docsMask, { collection: 'mask' })
      })
      .then(result => {
        return cls.findOne('jack-bauer', { collection: 'mask' })
      })
      .then(result => {
        expect(result.success).to.be.true
        expect(result.data).to.have.property('id', 'jack-bauer')
        expect(result.data).to.have.property('fullname', 'Jack Bauer')
        expect(result.data).to.have.property('age', null)
        done()
      })
  })



})
