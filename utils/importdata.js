var mongoose = require('mongoose')
  , async = require('async')
  , geocoder = require('geocoder')
  , config = require('../config').config
  ;

var CentersSchema = new mongoose.Schema({
    ChestClinic: String,
    TestCenterName: String,
    CenterType: String,
    Descriptions: String,
    Address: String,
    City: String,
    State: String,
    Country: String,
    PinCode: String,
    Phone: String,
    Email: String,
    Fax: String,
    URL: String,
    Tags: String,
    loc: { 
      type: {
        lon: Number,
        lat: Number
      },
      index: '2d'
    }
});

Centers = mongoose.model('centers', CentersSchema); 

mongoose.connect(config.mongoDb);

Centers.find({}, function(err, recs) {
    var me = this;
    if (err) {
        console.log ('error');
        return;
    }

    console.log ( recs.length );

    async.forEachSeries ( recs, function(rec, callback) {
        if ( rec.loc.lat && rec.loc.lat !== 0
          && rec.loc.lng && rec.loc.lng !== 0) {
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
                + rec["TestCenterName"]
         + ", " + rec["Address"]
         + ", " + rec["State"]
         + ", " + rec["PinCode"];
    return address;
};
