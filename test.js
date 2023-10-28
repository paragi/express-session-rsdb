/*============================================================================*\
  Test Session store
\*============================================================================*/
const rs = require('rocket-store');
const sessionStore = require('./index.js');

function assert(condition, message) {
  if(!condition){
    console.log(`Assertion failed: ${message}`);
    console.trace();
    console.groupEnd();
    process.exit(-1);
  }
} 

objectHas = function(big, small){ 
  if( typeof small === 'undefined' ) return true;
  if( ( small === null ) != ( big === null ) ) return false;
  if( typeof small !== typeof big ) return false;
  if( typeof small === 'object' ) {
    for (var p in small)
      if(!objectHas(big[p], small[p])) return false;
  } else if (small !== big) return false;
  return true;
}

const asyncAdapter = (fn, ...args) => {
	return new Promise((resolve, reject) => {
		try {
			fn(...args, (...args) => {
        resolve(args);
      });
		} catch (e) {
			reject(new Error(e));
		}
	});
};

async function tst(describtion,func,parameters,expected_result){
  var result;

  tst.tests++;
  assert(typeof describtion === 'string'
    ,"Parameter 1 describtion must be a string");
  assert(typeof func === 'function',"Parameter 2 func must be a function");
  assert(typeof parameters === 'object'
    ,"Parameter 3 parameters must be an array object");

  try{
    if(func && func.constructor && func.constructor.name === 'AsyncFunction'){
      result = [ await func(...parameters) ];
    }else{
      result = await asyncAdapter(func,...parameters);
    }
  } catch(err) {
    result = err.message;
  }


  failed = !objectHas(result, expected_result);

  if(failed){
    tst.failed++
    console.group("\x1b[31mFailed\x1b[0m: " + describtion);
    console.log("patameters: ", parameters);
    console.log("Ecpected:",expected_result);
    console.log("got:", result);
    console.trace();
  }else{
    console.group("\x1b[32mOK\x1b[0m: " + describtion);
  }
  console.groupEnd();

  return result
}

tst.tests  = 0;
tst.failed = 0;

tst.sum = function(){
  console.table({
    Tests: tst.tests,
    Failed: tst.failed,
  });
}

testcases = async () => {
  console.log(`${"=".repeat(80)}\n`
    + `${" ".repeat(37)}Testing\n`
    + `${"=".repeat(80)}`
  );

  // Initialise RSDB store
  const store = new sessionStore({ data_storage_area: "./rsdb" })
  clearInterval(store.purgeTimer);

  const uniqueID = () => Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);

  // Post and sequence
  let record = {
    id          : "22756",
    name        : "Adam Smith",
    title       : "developer",
    email       : "adam@smith.com",
    phone       : "+95 555 12345",
    zip         : "DK4321",
    country     : "Distan",
    address     : "Elm tree road 555",
    cookie      : {
      originalMaxAge  :6000,
      expires         :new Date(Date.now() + 10000),
      secure          :false,
      httpOnly        :true,
      path            :"/"
    },
  };

  let sessionID = [ uniqueID(), uniqueID(), uniqueID(), uniqueID(), uniqueID()];

  await tst(
    "Clear session store",
    store.clear,
    [],
    [ undefined ],
  );

  await tst(
    "Set a session",
    store.set,
    [sessionID[0],record],
    [ undefined ],
  );

  await tst(
    "Set a session",
    store.set,
    [sessionID[1],record],
    [ undefined ],
  );

  await tst(
    "Length: number of sessions",
    store.length,
    [],
    [ undefined, 2 ]
  );

  await tst(
    "Get all sessions",
    store.all,
    [],
    [ undefined,
     [{ id: '22756',
      name: 'Adam Smith',
      title: 'developer',
      email: 'adam@smith.com',
      phone: '+95 555 12345',
      zip: 'DK4321',
      country: 'Distan',
      address: 'Elm tree road 555' },
    { id: '22756',
      name: 'Adam Smith',
      title: 'developer',
      email: 'adam@smith.com',
      phone: '+95 555 12345',
      zip: 'DK4321',
      country: 'Distan',
      address: 'Elm tree road 555' } ]],
  );

  await tst(
    "Get one session",
    store.get,
    [sessionID[0]],
    [ undefined,
     { id: '22756',
      name: 'Adam Smith',
      title: 'developer',
      email: 'adam@smith.com',
      phone: '+95 555 12345',
      zip: 'DK4321',
      country: 'Distan',
      address: 'Elm tree road 555' }
    ],
  );

  await tst(
    "Get nonexistant session",
    store.get,
    ["nonexistant session ID"],
    [ undefined, null],
  );


  let save = record.cookie.expires;
  record.cookie.expires = new Date(Date.now() + 10000);

  await tst(
    "Touch a session phase 1",
    store.touch,
    [sessionID[0],record],

  );

  let touchedRecord = await tst(
    "Get the touched session",
    store.get,
    [sessionID[0]],
    [ undefined,
     { id: '22756',
      name: 'Adam Smith',
      title: 'developer',
      email: 'adam@smith.com',
      phone: '+95 555 12345',
      zip: 'DK4321',
      country: 'Distan',
      address: 'Elm tree road 555' }
    ],
  );

  const cmpDate = async (date1, date2) =>
    new Date(date1).getTime() < new Date(date2).getTime();


  await tst(
    "Touch a session phase 2",
    cmpDate,
    [save, touchedRecord[1].cookie.expires],
    [ true ]
  );

  await tst(
    "Touch nonexistant phase 1",
    store.touch,
    ["nonexistant session ID",record],

  );

  record.cookie.expires = new Date(Date.now() - sessionStore._purgeInterval* 1000);

  await tst(
    "Expire session with touch phase 1",
    store.touch,
    [sessionID[0],record],

  );

  await tst(
    "Get expired session",
    store.get,
    [sessionID[0]],
    [ undefined, null ],
  );

  // Garbage collection is done asynchronically. Do something that takes as long as the deletion.
  await rs.get("session");

  await tst(
    "Verify expired session is deleted",
    store.length,
    [],
    [ undefined, 1 ]
  );

  await tst(
    "Destroy session",
    store.destroy,
    [sessionID[1]],
    [ undefined ],
  );

  await tst(
    "Verify destroied session is deleted",
    store.length,
    [],
    [ undefined, 0 ]
  );

  // Test asynchronical processing
  record = {
    name   : "Bob Adams",
    cookie : {
      expires : new Date( Date.now() + 5000 )
    },
  }

  let i;
  // Create some sessions
  for( i = 0; i < sessionID.length - 1; i++ ){
    record.id = i;
    store.set(sessionID[i],record);
  }

  // Wait for the last insert
  record.id = i
  await tst(
    "Set some test sessions without cookies",
    store.set,
    [sessionID[i],record],
    [ undefined ],
  );

  await tst(
    "Verify multible asynchronical inserts",
    store.all,
    [],
    [ undefined,
      [ { name: 'Bob Adams', id: 0 },
        { name: 'Bob Adams', id: 1 },
        { name: 'Bob Adams', id: 2 },
        { name: 'Bob Adams', id: 3 },
        { name: 'Bob Adams', id: 4 },
      ]
    ]
  );

  // Clean
  rs.delete();

  await tst.sum();
};

testcases();
