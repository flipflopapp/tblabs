var mongoose = require('mongoose')
  , async = require('async')
  , geocoder = require('geocoder')
  , config = require('./config').config
  ;

Centers = mongoose.model('centers', new mongoose.Schema({
    "Chest Clinic": String,
    "Test Center Name": String,
    "Address": String,
    "PIN CODE": String,
    "TYPE OF CENTER (GROUP)": String,
    "State": String,
    "Phone Number": String,
    "Email": String,
    "Fax": String,
    "URL": String,
    "Descriptions": String,
    "Tags": String,
    "loc": {
        "lat": Number,
        "lng": Number
    }
}));

mongoose.connect(config.mongoDb);

Centers.find({}, function(err, recs) {
    var me = this;
    if (err) {
        console.log ('error');
        return;
    }

    console.log ( recs.length );

    async.forEachSeries ( recs, function(rec, callback) {
        if ( rec.loc.lat && rec.loc.lng ) {
            callback();
            return;
        }
        var address = getStringAddress(rec);
        geocoder.geocode( address, function(err, data) {
            if ( data.status !== 'OK' ) {
                console.log ( address );
                console.log ( data );
                callback();
                return;
            }
            var loc = data.results[0].geometry.location;
            rec.loc.lat = loc.lat;
            rec.loc.lng = loc.long;
            rec.save();
            callback();
        });
    }, function(err) {
        if ( err ) {
            console.log ( err );
        } else {
            console.log ( 'no err' );
        }
    });
});

function getStringAddress(rec) {
    var address = ""
                + rec["Test Center Name"]
         + ", " + rec["Address"]
         + ", " + rec["State"]
         + ", " + rec["PIN CODE"];
    return address;
};
