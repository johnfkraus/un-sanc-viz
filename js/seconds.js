// frm http://stackoverflow.com/questions/15969082/node-js-async-series-is-that-how-it-is-supposed-to-work

var async = require('async');

function callbackhandler(err, results) {
    console.log('It came back with this ' + results);
}   

function takes5Seconds(callback) {
    console.log('Starting 5 second task');
    setTimeout( function() { 
        console.log('Just finshed 5 seconds');
        callback(null, 'five');
    }, 5000);
}   

function takes2Seconds(callback) {
    console.log('Starting 2 second task');
    setTimeout( function() { 
        console.log('Just finshed 2 seconds');
        callback(null, 'two');
    }, 2000); 
}   

async.series([takes2Seconds(callbackhandler), 
              takes5Seconds(callbackhandler)], function(err, results){
    console.log('Result of the whole run is ' + results);
}) 