const express = require('express');
const session = require('express-session');
const sessionStore = require('./index.js');

const app = express()

app.use(session({
  store: new sessionStore({
    data_storage_area: "./rsdb",
    purge_interval: 7,
  }),
  secret: "The secret to life is meaningless unless you discover it yourself",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 6000 },
}))

app.get('/', function(req, res, next) {
  console.log("Serving page to ",req.sessionID,);

  if (req.session.views) {
    req.session.views++
    res.setHeader('Content-Type', 'text/html')
    res.write('<p>views: ' + req.session.views + '</p>')
    res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
    res.end()
  } else {
    req.session.views = 1
    res.end('welcome to the session demo. refresh!')
  }
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000.')
});

process.env.RUNKIT_ENDPOINT_URL;
