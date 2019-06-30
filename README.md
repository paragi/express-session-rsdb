# express-session-rsdb
Rocket-Store session storage for express

[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![downloads per month](http://img.shields.io/npm/dm/express-session-rsdb.svg)](https://www.npmjs.org/package/express-session-rsdb)
[![Issues](http://img.shields.io/github/issues/paragi/express-session-rsdb.svg)]( https://github.com/Paragi/express-session-rsdb/issues )
[![GitHub pull-requests](https://img.shields.io/github/issues-pr/paragi/express-session-rsdb.svg)](https://GitHub.com/paragi/express-session-rsdb/pull/)
[![Dependencies](http://img.shields.io/david/paragi/express-session-rsdb.svg?style=flat)](https://david-dm.org/paragi/express-session-rsdb)

A very fast and lightweight file storage solution.

The storage provides garbage collection of expired sessions.

## Installation
```sh
	  $ npm install express-session-rsdb
```

## Usage
```js
const express = require('express');
const session = require('express-session');
const sessionStore = require('express-session-rsdb');

const app = express()

app.use(session({
  store: new sessionStore(),
  secret: "The secret to life is meaningless unless you discover it yourself",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 1800 },
}))

...

app.listen(3000);
```

## Options
| option | Description |
| --- | --- |
| `data_storage_area` | Directory root for Rocket-Store data files. Defaults to 'rsdb' in OS specific tempory directory.|
|`collection` | name og collection where sessions are stored. Defaults to 'session'|
|`purge_interval` | Time between automated garbage collection of expired sessions, in seconds. Garbage collection is disabled by setting this to 0. |

```js
app.use(session({
  store: new sessionStore({
      data_storage_area: "./rsdb",
      collection, "session"
      purge_interval: 700,
    }),
  ...
}))  
```
## Change log
* 0.1.2: documentation
