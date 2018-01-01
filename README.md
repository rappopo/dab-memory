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
  .then(result => {
    ...    
    // lets dab!
    dab.findOne('my-doc', 'test').then(function(doc) { ... })
    ...
  })
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

To enforce structured data throughout DAB and use features provided by collections, you need to `createCollection ()` with your custom fields as [explained here](https://docs/rappopo.com/dab/method/create-collection/)

* [x] [find](https://docs.rappopo.com/dab/method/find/)
* [x] [findOne](https://docs.rappopo.com/dab/method/find-one/)
* [x] [create](https://docs.rappopo.com/dab/method/create/)
* [x] [update](https://docs.rappopo.com/dab/method/update/)
* [x] [remove](https://docs.rappopo.com/dab/method/remove/)
* [x] [bulkCreate](https://docs.rappopo.com/dab/method/bulk-create/)
* [x] [bulkUpdate](https://docs.rappopo.com/dab/method/bulk-update/)
* [x] [bulkRemove](https://docs.rappopo.com/dab/method/bulk-remove/)
* [x] [copyFrom](https://docs.rappopo.com/dab/method/copy-from/)
* [x] [copyTo](https://docs.rappopo.com/dab/method/copy-to/)
* [x] [createCollection](https://docs.rappopo.com/dab/method/create-collection/)
* [x] [renameCollection](https://docs.rappopo.com/dab/method/rename-collection/)
* [x] [removeCollection](https://docs.rappopo.com/dab/method/remove-collection/)

## Misc

* [ChangeLog](CHANGELOG.md)
* Donation: Bitcoin **16HVCkdaNMvw3YdBYGHbtt3K5bmpRmH74Y**

## License

(The MIT License)

Copyright © 2017 Ardhi Lukianto <ardhi@lukianto.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.