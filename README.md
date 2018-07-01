# @rappopo/dab-memory

A [Rappopo DAB](https://github.com/rappopo/dab) implementation for in-memory datastore, powered by [Lodash](https://lodash.com/) and [lodash-query](https://github.com/kenansulayman/lodash-query).

## Installation

Simply invoke this command in your project folder:

```
$ npm install --save @rappopo/dab-memory
```

And within your script:

```javascript
const DabMemory = require('@rappopo/dab-memory')
const dab = new DabMemory()
// prepare collections
dab.createCollection({ name: 'test' })
  .then(result => {
    return dab.bulkCreate(data, { collection: 'test' })
  })
...
// lets dab!
dab.findOne('my-doc', 'test').then(function(doc) { ... })
```

## Options

Currently, no options necessary.

## Features

Data is internally saved as collections as follows:

```javascript
dab.data.<collection-name> = [
  { _id: "key1", name: "name1", ... },
  { _id: "key2", name: "name2", ... }
]
```

To enforce structured data throughout DAB and use features provided by collections, you need to `createCollection ()` with your custom fields as [explained here](https://books.rappopo.com/dab/method/create-collection/)

* [x] [find](https://books.rappopo.com/dab/method/find/)
* [x] [findOne](https://books.rappopo.com/dab/method/find-one/)
* [x] [create](https://books.rappopo.com/dab/method/create/)
* [x] [update](https://books.rappopo.com/dab/method/update/)
* [x] [remove](https://books.rappopo.com/dab/method/remove/)
* [x] [bulkCreate](https://books.rappopo.com/dab/method/bulk-create/)
* [x] [bulkUpdate](https://books.rappopo.com/dab/method/bulk-update/)
* [x] [bulkRemove](https://books.rappopo.com/dab/method/bulk-remove/)
* [x] [copyFrom](https://books.rappopo.com/dab/method/copy-from/)
* [x] [copyTo](https://books.rappopo.com/dab/method/copy-to/)
* [x] [createCollection](https://books.rappopo.com/dab/method/create-collection/)
* [x] [renameCollection](https://books.rappopo.com/dab/method/rename-collection/)
* [x] [removeCollection](https://books.rappopo.com/dab/method/remove-collection/)

## Donation
* [![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/ardhilukianto)
* Bitcoin **16HVCkdaNMvw3YdBYGHbtt3K5bmpRmH74Y**

## License

[MIT](LICENSE.md)
