# express-session-rsdb
** Rocket-Store session storage for express **

[Rocket-Store](https://www.npmjs.com/package/rocket-store) is using the filesystem as a searchable database. It is a high performance solution to simple data storage and retrieval, that is taking advantage, of modern file systems, exceptionally advanced cashing mechanisms.

The storage provides **garbage collection** of expired sessions.

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
| `data_storage_area` | Directory root for rocket-store data files. Defaults to 'rsdb' in OS specific tempory directory.|
|`collection` | name og collection where sessions are stored. Defaults to 'session'|
|`purge_interval` | Time between automated garbage collection of expired sessions, in seconds. Garbage collection is disabled by setting this to 0. The default is every 900 seconds |

**Usage:**

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

## Garbage collection

Garbage collection is done at **purge_interval** if it's value is greater than 0 seconds.

Note that if session doesn't contain **cookie** with an **expires** element, will be deleted.
If a session doesn't use cookies, **purge_interval** must be set to 0, and other means of purging expired session, must be provided.


## Contributions
* I appreciate all kinds of contribution.
* Don't hesitate to submit an issue report on [github](https://github.com/paragi/express-session-rsdb/issues). But please provide a reproducible example.
* Code should look good and compact, and be covered by a test case or example.
* Please don't change the formatting style laid out, without a good reason. I know its not the most common standard, but its rather efficient one.


## Change log
* 0.1.4: Bug fix: Updatded dependencies to fix Asynchronous integrity bug
* 0.1.3: Bug fix: touch failing, but not returning an error.

* 0.1.2: documentation
