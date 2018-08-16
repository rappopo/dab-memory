'use strict'

const Dab = require('@rappopo/dab').Dab

class DabMemory extends Dab {
  constructor (options) {
    super(options)
    require('lodash-query')(this._)
    this.data = {}
  }

  createCollection (coll) {
    return new Promise((resolve, reject) => {
      super.createCollection(coll)
        .then(result => {
          this.data[coll.name] = []
          resolve(result)
        })
        .catch(reject)
    })
  }

  renameCollection (oldName, newName) {
    return new Promise((resolve, reject) => {
      super.renameCollection(oldName, newName)
        .then(result => {
          this.data[newName] = this.data[oldName]
          delete this.data[oldName]
          resolve(result)
        })
        .catch(reject)
    })
  }

  removeCollection (name) {
    return new Promise((resolve, reject) => {
      super.removeCollection(name)
        .then(result => {
          delete this.data[name]
          resolve(result)
        })
        .catch(reject)
    })
  }

  find (params) {
    [params] = this.sanitize(params)
    let limit = params.limit || this.options.limit
    let query = params.query || {}
    let skip = ((params.page || 1) - 1) * limit
    return new Promise((resolve, reject) => {
      if (!this._.has(this.data, params.collection)) throw new Error('Collection not found')
      let result = this._.query(this.data[params.collection], query)
      let keys = []
      let dirs = []
      let total = result.length
      if (params.sort) {
        this._.forOwn(params.sort, (v, k) => {
          keys.push(k)
          dirs.push(v === -1 ? 'desc' : 'asc')
        })
        if (!(this._.isEmpty(keys) || this._.isEmpty(dirs))) result = this._.orderBy(result, keys, dirs)
      }

      result = this._(result).drop(skip).take(limit).value()
      let data = {
        success: true,
        data: this.convert(result, { collection: params.collection }),
        total: total
      }
      resolve(data)
    })
  }

  _findOne (id, collection) {
    if (!this._.has(this.data, collection)) {
      return {
        success: false,
        err: new Error('Collection not found')
      }
    }
    const key = this.collection[collection].srcAttribId
    let q = {}
    q[key] = id
    let idx = this._.findIndex(this.data[collection], q)
    let result = {
      success: idx > -1
    }
    if (idx > -1) {
      result.index = idx
      result.data = this.data[collection][idx]
    } else {
      result.err = new Error('Document not found')
    }
    return result
  }

  findOne (id, params) {
    [params] = this.sanitize(params)
    return new Promise((resolve, reject) => {
      let result = this._findOne(id, params.collection)
      if (!result.success) throw result.err
      result.data = this.convert(result.data, { collection: params.collection })
      if (!params.withIndex) delete result.index
      resolve(result)
    })
  }

  create (body, params) {
    [params, body] = this.sanitize(params, body)
    return new Promise((resolve, reject) => {
      if (!this._.has(this.data, params.collection)) throw new Error('Collection not found')
      const key = this.collection[params.collection].srcAttribId
      const id = body[key] || this.nanoid()
      if (!body[key]) body[key] = id
      let result = this._findOne(id, params.collection)
      if (result.success) throw new Error('Document already exists')
      this.data[params.collection].push(body)
      let data = {
        success: true,
        data: this.convert(body, { collection: params.collection })
      }
      if (params.withIndex) data.index = this.data[params.collection].length - 1
      resolve(data)
    })
  }

  update (id, body, params) {
    [params, body] = this.sanitize(params, body)
    body = this._.omit(body, ['_id'])
    return new Promise((resolve, reject) => {
      if (!this._.has(this.data, params.collection)) throw new Error('Collection not found')
      let result = this._findOne(id, params.collection)
      if (!result.success) throw result.err
      const key = this.collection[params.collection].srcAttribId
      let newBody = {}
      if (params.fullReplace) {
        this._.each(params.fullReplaceExclude || [], f => {
          newBody[f] = result.data[f]
        })
        newBody = this._.merge(body, newBody)
        newBody[key] = id
      } else {
        newBody = this._.merge(result.data, body)
      }
      this.data[params.collection][result.index] = newBody
      let data = {
        success: true,
        data: this.convert(newBody, { collection: params.collection })
      }
      if (params.withIndex) data.index = result.index
      if (params.withSource) data.source = this.convert(result.data, { collection: params.collection })
      resolve(data)
    })
  }

  remove (id, params) {
    [params] = this.sanitize(params)
    return new Promise((resolve, reject) => {
      if (!this._.has(this.data, params.collection)) throw new Error('Collection not found')
      let result = this._findOne(id, params.collection)
      if (!result.success) throw result.err
      let pulled = this._.pullAt(this.data[params.collection], [result.index])
      let data = params.withSource
        ? { success: true, source: this.convert(pulled[0], { collection: params.collection }) }
        : { success: true }
      if (params.withIndex) data.index = result.index
      resolve(data)
    })
  }

  _getGood (body, inverted = false, collection) {
    let good = []
    let status = []
    const key = this.collection[collection].srcAttribId
    this._.each(body, (b, i) => {
      if (!this._.has(b, key)) b[key] = this.nanoid()
      let stat = {}
      stat[key] = b[key]
      const idx = this._.findIndex(this.data[collection], stat)
      const op = (inverted && idx === -1) || (!inverted && idx > -1)
      if (op) good.push({ idx: idx, data: b })
      stat.success = op
      if (!stat.success) stat.message = inverted ? 'Document already exists' : 'Document not found'
      status.push(stat)
    })
    return [good, status]
  }

  bulkCreate (body, params) {
    [params, body] = this.sanitize(params, body)
    return new Promise((resolve, reject) => {
      if (!this._.has(this.data, params.collection)) throw new Error('Collection not found')
      if (!this._.isArray(body)) throw new Error('Requires an array')
      const [good, status] = this._getGood(body, true, params.collection)
      const stuff = this._.map(good, g => g.data)

      this.data[params.collection].push.apply(this.data[params.collection], stuff)
      let result = {
        success: true,
        stat: {
          ok: good.length,
          fail: body.length - good.length,
          total: body.length
        }
      }
      if (params.withDetail) result.detail = status
      resolve(result)
    })
  }

  bulkUpdate (body, params) {
    [params, body] = this.sanitize(params, body)
    return new Promise((resolve, reject) => {
      if (!this._.has(this.data, params.collection)) throw new Error('Collection not found')
      if (!this._.isArray(body)) throw new Error('Requires an array')
      const [good, status] = this._getGood(body, false, params.collection)

      this._.each(good, g => {
        this.data[params.collection][g.idx] = g.data
      })
      let result = {
        success: true,
        stat: {
          ok: good.length,
          fail: body.length - good.length,
          total: body.length
        }
      }
      if (params.withDetail) result.detail = status
      resolve(result)
    })
  }

  bulkRemove (body, params) {
    [params, body] = this.sanitize(params, body)
    return new Promise((resolve, reject) => {
      if (!this._.has(this.data, params.collection)) throw new Error('Collection not found')
      if (!this._.isArray(body)) throw new Error('Requires an array')
      const key = this.collection[params.collection].srcAttribId
      this._.each(body, (b, i) => {
        let d = {}
        d[key] = b
        body[i] = d
      })

      const [good, status] = this._getGood(body, false, params.collection)
      const ids = this._.map(good, g => {
        return g.data._id
      })

      this._.remove(this.data[params.collection], d => {
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
      if (params.withDetail) result.detail = status
      resolve(result)
    })
  }
}

module.exports = DabMemory
