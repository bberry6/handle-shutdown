(function(){

var Bluebird = require('bluebird');

var shutdown = require('../shutdown.js');

shutdown.register(function(){
   console.log('do some sync shutdown stuff');
});

shutdown.register(function(){
   return new Bluebird(function(resolve, reject){
      setTimeout(function(){
         console.log('ding! times up...');
         resolve();
      }, 3000);

   });
});

// hit ctrl+c


})();
