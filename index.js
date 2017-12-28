'use strict'

const uuid = require('uuid/v4'),
  Dab = require('@rappopo/dab')

class DabMemory extends Dab {
  constructor (options) {
    super(options)
    require('lodash-query')(this._)
  }

  setOptions (options) {
    options = options || {}
    super.setOptions(this._.merge(this.options, { ns: options.ns }))
    this.data = {
      default: []
    }

    this.data[this.options.ns] = this._.cloneDeep(options.data) || []
  }

  sanitize (params, body) {
    [params, body] = super.sanitize(params, body)
    params.ns = params.ns || this.options.ns
    if (!this.data[params.ns])
      this.data[params.ns] = []
    return [params, body]
  }

  find (params) {
    [params] = this.sanitize(params)
    let limit = params.limit || this.options.limit,
      query = params.query || {},
      skip = ((params.page || 1) - 1) * limit,
      sort = params.sort
    return new Promise((resolve, reject) => {
      let result = this._.query(this.data[params.ns], query),
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

  _findOne (id, ns) {
    let idx = this._.findIndex(this.data[ns], { _id: id }),
      result = {
        success: idx > -1
      }
    if (idx > -1) {
      result.index = idx,
      result.data = this.data[ns][idx]
    } else {
      result.err = new Error('Not found')
    }
    return result
  }

  findOne (id, params) {
    [params] = this.sanitize(params)
    return new Promise((resolve, reject) => {
      let result = this._findOne(id, params.ns)
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
      const id = body._id || uuid()
      if (!body._id)
        body._id = id
      let result = this._findOne(id, params.ns)
      if (result.success)
        return reject(new Error('Exists'))
      this.data[params.ns].push(body)
      let data = {
        success: true,
        data: this.convertDoc(body)
      }
      if (params.withIndex) data.index = this.data[params.ns].length - 1
      resolve(data)
    })
  }

  update (id, body, params) {
    [params, body] = this.sanitize(params, body)
    body = this._.omit(body, ['_id'])
    return new Promise((resolve, reject) => {
      let result = this._findOne(id, params.ns)
      if (!result.success)
        return reject(result.err)
      let newBody = params.fullReplace ? this._.merge(body, { _id: id }) : this._.merge(result.data, body)
      this.data[params.ns][result.index] = newBody
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
      let result = this._findOne(id, params.ns)
      if (!result.success)
        return reject(result.err)
      let pulled = this._.pullAt(this.data[params.ns], [result.index]),
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
        if (!this._.has(b, '_id'))
          b._id = uuid()
        let res = { _id: b._id }
        if (this._.findIndex(this.data[params.ns], { _id: b._id }) === -1) {
          good.push(b)
          res.success = true
        } else {
          res.success = false
          res.message = 'Exists'
        }
        result.push(res)
      })

      this.data[params.ns].push.apply(this.data[params.ns], good)
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

  _getGood (body, inverted = false, ns) {
    let good = [], status = []
    this._.each(body, (b,i) => {
      if (!this._.has(b, '_id'))
        b._id = uuid()
      let stat = { _id: b._id }
      const idx = this._.findIndex(this.data[ns], { _id: b._id }),
        op = (inverted && idx === -1) || (!inverted && idx > -1)
      if (op)
        good.push({ idx: idx, data: b })
      stat.success = op
      if (!stat.success)
        stat.message = inverted ? 'Exists' : 'Not found'
      status.push(stat)
    })
    return [good, status]    
  }

  bulkCreate (body, params) {
    [params] = this.sanitize(params)
    return new Promise((resolve, reject) => {
      if (!this._.isArray(body))
        return reject(new Error('Require array'))
      const [good, status] = this._getGood(body, true, params.ns),
        stuff = this._.map(good, g => g.data)

      this.data[params.ns].push.apply(this.data[params.ns], stuff)
      let result = {
        success: true,
        stat: {
          ok: good.length,
          fail: body.length - good.length,
          total: body.length
        }
      }
      if (params.withDetail)
        result.detail = status
      resolve(result)
    })
  }

  bulkUpdate (body, params) {
    [params] = this.sanitize(params)
    return new Promise((resolve, reject) => {
      if (!this._.isArray(body))
        return reject(new Error('Require array'))
      const [good, status] = this._getGood(body, false, params.ns)

      this._.each(good, g => {
        this.data[params.ns][g.idx] = g.data
      })
      let result = {
        success: true,
        stat: {
          ok: good.length,
          fail: body.length - good.length,
          total: body.length
        }
      }
      if (params.withDetail)
        result.detail = status
      resolve(result)
    })
  }

  bulkRemove (body, params) {
    [params] = this.sanitize(params)
    return new Promise((resolve, reject) => {
      if (!this._.isArray(body))
        return reject(new Error('Require array'))
      this._.each(body, (b, i) => {
        body[i] = { _id: b }
      })

      const [good, status] = this._getGood(body, false, params.ns)
      const ids = this._.map(good, g => {
        return g.data._id
      })

      this._.remove(this.data[params.ns], d => {
        return ids.indexOf(d._id) > -1
      })
      let result = {
        success: true,
        stat: {
          ok: good.length,
          fail: body.length - good.length,
          total: body.length
        }
      }
      if (params.withDetail)
        result.detail = status
      resolve(result)
    })
  }

}

module.exports = DabMemory