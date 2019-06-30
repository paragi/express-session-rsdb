const fs = require('fs-extra');

( async () => {
  let i;
  let obj = {}
  let promises = [];

  for( i = 0; i<4; i++ ){
    obj.id = i;
    promises.push( fs.outputJson('./' + i, obj) );
  }

  await Promise.all(promises);

  for( i = 0; i<4; i++ )
    console.log( await fs.readJson('./' + i));

})();
