var mongoose = require('mongoose')
  , async = require('async')
  , geocoder = require('geocoder')
  , config = require('../config').config
  , Centers = require('../database').Centers
  ;

Centers.find({}, function(err, recs) {
    var me = this
      , notdone = new Array()
      ;
    if (err) {
        console.log ('error');
        return;
    }

    console.log ( recs.length );

    async.forEachSeries ( recs, function(rec, callback) {
        if ( rec.loc.lat && rec.loc.lat !== 0
          && rec.loc.lon && rec.loc.lon !== 0) {
            callback();
            return;
        }
        var address = getStringAddress(rec);
        geocoder.geocode( address, function(err, data) {
            if ( data.status !== 'OK' ) {
                notdone.push ( address );
                callback();
                return;
            }
            var loc = {
                lon: data.results[0].geometry.location.lng
              , lat: data.results[0].geometry.location.lat };
            rec.setValue ('loc', loc);
            rec.markModified ('loc');
            rec.save ( function (err) {
                if ( !err ) {
                    console.log( '[' + loc.lat +',' + loc.lon + '] --->  ' + address );
                } else {
                    console.log ( 'Error while saving' );
                }
                callback();
              });
        });
    }, function(err) {
        if ( err ) {
            console.log ( err );
        } else {
            console.log ( '\ncomplete' );
            console.log ( '\n\nNot decoded :-\n\n');
            console.log ( notdone );
        }
        process.exit();
    });
});

function getStringAddress(rec) {
    var address = ""
                + rec["TestCenterName"]
         + ", " + rec["Address"]
         + ", " + rec["State"]
         + ", " + rec["PinCode"];
    return address;
};
