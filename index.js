'use strict'

const uuid = require('uuid/v4'),
  Dab = require('@rappopo/dab')

class DabMemory extends Dab {
  constructor (options) {
    super(options)
    require('lodash-query')(this._)
  }

  setOptions (options = {}) {
    super.setOptions(this._.merge(this.options, {
      idSrc: options.idSrc || 'id',
      idDest: options.idDest || options.idSrc || 'id'
    }))
    this.data = this._.cloneDeep(options.data) || []
  }

  find (params) {
    [params] = this.sanitize(params)
    let limit = params.limit || this.options.limit,
      query = params.query || {},
      skip = ((params.page || 1) - 1) * limit,
      sort = params.sort
    return new Promise((resolve, reject) => {
      let result = this._.query(this.data, query),
        keys = this._.keys(sort),
        dirs = this._.values(sort)
      if (!(this._.isEmpty(keys) || this._.isEmpty(dirs)))
        result = this._.orderBy(result, keys, dirs)
      result = this._(result).drop(skip).take(limit).value()
      let data = {
        success: true,
        data: this.convertDoc(result),
        total: result.length
      }
      resolve(data)
    })
  }

  _findOne (id) {
    let kv = {}
    kv[this.options.idSrc] = id
    let idx = this._.findIndex(this.data, kv),
      result = {
        success: idx > -1
      }
    if (idx > -1) {
      result.index = idx,
      result.data = this.data[idx]
    } else {
      result.err = new Error('Not found')
    }
    return result
  }

  findOne (id, params) {
    [params] = this.sanitize(params)
    return new Promise((resolve, reject) => {
      let result = this._findOne(id)
      if (!result.success) 
        return reject(result.err)
      result.data = this.convertDoc(result.data)
      if (!params.withIndex) 
        delete result.index
      resolve(result)
    })
  }

  create (body, params) {
    [params, body] = this.sanitize(params, body)
    return new Promise((resolve, reject) => {
      const id = body[this.options.idSrc] || uuid()
      if (!body[this.options.idSrc])
        body[this.options.idSrc] = id
      let result = this._findOne(id)
      if (result.success)
        return reject(new Error('Exists'))
      this.data.push(body)
      let data = {
        success: true,
        data: this.convertDoc(body)
      }
      if (params.withIndex) data.index = this.data.length - 1
      resolve(data)
    })
  }

  update (id, body, params) {
    [params, body] = this.sanitize(params, body)
    body = this._.omit(body, [this.options.idSrc])
    return new Promise((resolve, reject) => {
      let result = this._findOne(id)
      if (!result.success)
        return reject(result.err)
      let kv = {}
      kv[this.options.idSrc] = id
      let newBody = params.fullReplace ? this._.merge(body, kv) : this._.merge(result.data, body)
      this.data[result.index] = newBody
      let data = {
        success: true,
        data: this.convertDoc(newBody)
      }
      if (params.withIndex) data.index = result.index
      if (params.withSource) data.source = this.convertDoc(result.data)
      resolve(data)
    })
  }

  remove (id, params) {
    [params] = this.sanitize(params)
    return new Promise((resolve, reject) => {
      let result = this._findOne(id)
      if (!result.success)
        return reject(result.err)
      let pulled = this._.pullAt(this.data, [result.index]),
        data = params.withSource ? { success: true, source: this.convertDoc(pulled[0]) } : { success: true }
      if (params.withIndex)
        data.index = result.index
      resolve(data)
    })
  }

  bulkCreate (body, params) {
    [params] = this.sanitize(params)
    return new Promise((resolve, reject) => {
      if (!this._.isArray(body))
        return reject(new Error('Require array'))
      let good = [], result = []
      this._.each(body, (b,i) => {
        let org = this._.cloneDeep(b)
        [b] = this.delFakeGetReal(b)
        if (!this._.has(b, this.options.idSrc))
          b[this.options.idSrc] = uuid()
        let kv = {}, res = {}
        kv[this.options.idSrc] = b[this.options.idSrc]
        res[this.options.idDest] = b[this.options.idSrc]
        if (this._.findIndex(this.data, kv) === -1) {
          good.push(b)
          res.success = true
        } else {
          res.success = false
          res.reason = 'Exists'
        }
        result.push(res)
      })

      this.data.push.apply(this.data, good)
      resolve({
        success: true,
        stat: {
          ok: good.length,
          fail: body.length - good.length,
          total: body.length
        },
        data: result
      })
    })
  }

  _getGood (body, inverted = false) {
    let good = [], status = []
    this._.each(body, (b,i) => {
      [b] = this.delFakeGetReal(b)
      let kv = {}, stat = {}
      if (!this._.has(b, this.options.idSrc))
        b[this.options.idSrc] = uuid()
      kv[this.options.idSrc] = b[this.options.idSrc]
      stat[this.options.idDest] = b[this.options.idSrc]
      const idx = this._.findIndex(this.data, kv),
        op = (inverted && idx === -1) || (!inverted && idx > -1)
      if (op)
        good.push({ idx: idx, data: b })
      stat.success = op
      if (!stat.success)
        stat.reason = inverted ? 'Exists' : 'Not found'
      status.push(stat)
    })
    return [good, status]    
  }

  bulkCreate (body, params) {
    [params] = this.sanitize(params)
    return new Promise((resolve, reject) => {
      if (!this._.isArray(body))
        return reject(new Error('Require array'))
      const [good, status] = this._getGood(body, true),
        stuff = this._.map(good, g => g.data)

      this.data.push.apply(this.data, stuff)

      resolve({
        success: true,
        stat: {
          ok: good.length,
          fail: body.length - good.length,
          total: body.length
        },
        data: status
      })
    })
  }

  bulkUpdate (body, params) {
    [params] = this.sanitize(params)
    return new Promise((resolve, reject) => {
      if (!this._.isArray(body))
        return reject(new Error('Require array'))
      const [good, status] = this._getGood(body)

      this._.each(good, g => {
        this.data[g.idx] = g.data
      })

      resolve({
        success: true,
        stat: {
          ok: good.length,
          fail: body.length - good.length,
          total: body.length
        },
        data: status
      })
    })
  }

  bulkRemove (body, params) {
    [params] = this.sanitize(params)
    return new Promise((resolve, reject) => {
      if (!this._.isArray(body))
        return reject(new Error('Require array'))
      const [good, status] = this._getGood(body)
      const ids = this._.map(good, g => {
        return g.data[this.options.idSrc]
      })

      this._.remove(this.data, d => {
        return ids.indexOf(d[this.options.idSrc]) > -1
      })

      resolve({
        success: true,
        stat: {
          ok: good.length,
          fail: body.length - good.length,
          total: body.length
        },
        data: status
      })
    })
  }

}

module.exports = DabMemory