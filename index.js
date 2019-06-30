/*============================================================================*\
  Rocket store  for Express Session

  (c) Copyrights Paragi, Simon Riget 2019

  Provide session storage functions for express session.

  License: MIT
\*============================================================================*/
const rsdb = require("rocket-store");
const session = require('express-session');
const util = require('util');

/*============================================================================*\
  Session store
\*============================================================================*/
const sessionStore = function (options) {

  session.Store.call(this, options);

  options = options || {};

  sessionStore._purgeInterval = options.purge_interval || 900; //In seconds
  sessionStore._collection = options.collection || 'session';

  if(  options.data_storage_area
    || options.data_format
    || options.lock_retry_interval ) {
    rsdb.options(options);
  }

  if( sessionStore._purgeInterval > 0 )
    this.purgeTimer = setInterval(
      sessionStore.prototype.all,
      sessionStore._purgeInterval * 1000
    );
}

sessionStore._collection = 'session';

util.inherits(sessionStore, session.Store);

module.exports = sessionStore;

/*============================================================================*\
  store.all(callback)
  get all sessions in the store as an array

  Optional

  This optional method is used to get all sessions in the store as an array. The callback should be called as callback(error, sessions).
\*============================================================================*/
sessionStore.prototype.all = (callback) => {
  rsdb.get(sessionStore._collection)
  .then((resolve) => {
    let result = [];
    if( Array.isArray(resolve.result) && Array.isArray(resolve.key) )
      for( let i in resolve.result )
        if(! expired( resolve.key[i], resolve.result[i] ) )
          result[result.length] = resolve.result[i];

    if( typeof callback === 'function' )
      callback(resolve.error, result);
  }, (error) => {
    if( typeof callback === 'function' ) callback(error);
  });
}

/*============================================================================*\
  store.destroy(sid, callback)
  Delete the session record

  Required

  This required method is used to destroy/delete a session from the store given a session ID (sid). The callback should be called as callback(error) once the session is destroyed.
\*============================================================================*/
sessionStore.prototype.destroy = (sessionID,callback) => {
  rsdb.delete(sessionStore._collection,sessionID)
    .then((resolve) => {
      if( typeof callback === 'function' ) callback(resolve.error);
    }, (error) => {
      if( typeof callback === 'function' ) callback(error);
    });
}

/*============================================================================*\
  store.clear(callback)
  Delete all sessions from the store

  Optional

  This optional method is used to delete all sessions from the store. The callback should be called as callback(error) once the store is cleared.
\*============================================================================*/
sessionStore.prototype.clear = (callback) => {
  rsdb.delete(sessionStore._collection)
  .then((resolve) => {
    if( typeof callback === 'function' ) callback(resolve.error);
  }, (error) => {
    if( typeof callback === 'function' ) callback(error);
  });
}

/*============================================================================*\
  store.get(sid, callback)
  get a session from the store given a session ID

  Required

  This required method is used to get a session from the store given a session ID (sid). The callback should be called as callback(error, session).

  The session argument should be a session if found, otherwise null or undefined if the session was not found (and there was no error). A special case is made when error.code === 'ENOENT' to act like callback(null, null).
\*============================================================================*/
sessionStore.prototype.get = (sessionID,callback) => {
  rsdb.get(sessionStore._collection, sessionID)
    .then((resolve) => {
      // destroy expired session
      if( Array.isArray(resolve.result) && Array.isArray(resolve.key) )
        if(expired(resolve.key[0],resolve.result[0]) )
          resolve.result[0] = null;

      if( typeof callback === 'function' )
        callback(resolve.error, resolve.result ? resolve.result[0] : null);

    }, (error) => {
      if( typeof callback === 'function' ) callback(error);
    });
}

/*============================================================================*\
  store.set(sid, session, callback)
  insert a session into the store given a session ID

  Required

  This required method is used to upsert a session into the store given a session ID (sid) and session (session) object. The callback should be called as callback(error) once the session has been set in the store.
\*============================================================================*/
sessionStore.prototype.set = function (sessionID, data, callback) {
  rsdb.post(sessionStore._collection, sessionID, data)
    .then( (resolve) => {
      if( typeof callback === 'function' )
        callback(resolve.error)
    }, (error) => {
      if( typeof callback === 'function' )
        if (error.code === 'ENOENT') // Special case described in https://www.npmjs.com/package/express-session
          callback(null, null);
        else
          callback(error);
    });
}

/*============================================================================*\
  store.length(callback)
  get the count of all sessions in the store

  Optional

  This optional method is used to get the count of all sessions in the store. The callback should be called as callback(error, len).
\*============================================================================*/
sessionStore.prototype.length = (callback) => {
  rsdb.get(sessionStore._collection,'*',rsdb._COUNT)
    .then((resolve) => {
      if( typeof callback === 'function' ) callback(resolve.error, resolve.count);
    }, (error) => {
      if( typeof callback === 'function' ) callback(error);
    });
}

/*============================================================================*\
  store.touch(sid, session, callback)
  touch a given a session with ID

  Recommended

  This recommended method is used to "touch" a given session given a session ID (sid) and session (session) object. The callback should be called as callback(error) once the session has been touched.

  This is primarily used when the store will automatically delete idle sessions and this method is used to signal to the store the given session is active, potentially resetting the idle timer.
\*============================================================================*/
sessionStore.prototype.touch = (sessionID, session, callback) => {
  sessionStore.prototype.get( sessionID, (error, currentSession) => {
    if( !error && currentSession && session && session.cookie ) {
      currentSession.cookie = session.cookie;
      sessionStore.prototype.set(sessionID, currentSession, callback);
    } else if( typeof callback === 'function' )
      callback(error);
  });
}

/*============================================================================*\
  Validate session exparation
\*============================================================================*/
expired = (sessionID, session) => {
  let result = true;
  if( session && session.cookie) {
    let expires = typeof session.cookie.expires === 'string'
      ? new Date(session.cookie.expires).getTime()
      : session.cookie.expires

    if( expires && expires > Date.now() )
      result = false;
  }

  if( result )
    rsdb.delete(sessionStore._collection,sessionID);

  return result;
}
