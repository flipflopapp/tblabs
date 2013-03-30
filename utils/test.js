var mongoose = require('mongoose')
  , async = require('async')
  , config = require('../config').config
  , Centers = require('../database').Centers
  ;

Centers.find({}, function(err, recs) {
    var me = this
      ;
    console.log ( recs.length );
    async.forEachSeries ( recs, function(rec, callback) {
        var loc = { lon: 0, lat: 0 };
//        rec.setValue ( 'loc', loc);
//        rec.save ( 
        Centers.update( {_id: rec._id}, {loc: loc},
          function (err, count) {
            if ( !err ) {
               console.log( count );
            } else {
               console.log ( 'Error while saving' );
            }
            callback();
        });
    }, function(err) {
        console.log ( '\ncomplete' );
        process.exit();
    });
})
