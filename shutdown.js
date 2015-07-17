'use strict';

var Bluebird = require('bluebird');

module.exports = {
   register: register,
   unregister: unregister,
   cleanup: cleanup
};

var cleanupHandlers = {};
var handlerId = 0;
var cleanupCalled = false;

// TODO: add optional signal handling

//catch any exceptions, doing this will call beforeExit
process.on('uncaughtException', function(err){
   console.error("CleanupService => uncaughtException ", err);
   console.error(err.stack);
});

//this happens whenever node is about to exit, but will allow asynchronous calls
process.on('beforeExit', function(){
   console.log('CleanupService => beforeExit');

   if (!cleanupCalled) {
      cleanup(function(){});
   }
});


//calls all of the registered cleanup functions
function cleanup(cb){
   cleanupCalled = true;
   Object.keys(cleanupHandlers).reduce(function(chain, id){
      return chain.then(function(){
         var result = cleanupHandlers[id].callback(cleanupHandlers[id].parameter);
         return (result instanceof Bluebird) ? result : Bluebird.resolve();
      });
   }, Bluebird.resolve())
   .then(function(){
      console.log('CleanupService::cleanup => complete');
   })
   .then(cb)
   .catch(function(err){
      console.error('CleanupService::cleanup => error', err);
      cb();
   });
}

//add the callback function and paramter to the master object, then increment id
function register(callback, parameter){
   // TODO is it possible to roll over the handlerId?
   cleanupHandlers[handlerId] = {callback: callback, parameter: parameter};
   return handlerId++;
}

//find the id in the master object and delete it
function unregister(findId){
   Object.keys(cleanupHandlers).some(function(id){
      if (findId === parseInt(id,10)) {
         delete cleanupHandlers[id];
         return true;
      }
      return false;
   });
}
