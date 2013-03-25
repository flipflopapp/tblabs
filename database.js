var mongoose = require('mongoose')
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
    "Lat": Number,
    "Long": Number
}));

mongoose.connect(config.mongoDb);

/*
  , async = require('async')
  , geocoder = require('geocoder')

Centers.find({}, function(err, recs) {
    var me = this;
    if (!err) {
        async.forEachSeries( recs, function(rec, callback) {
            geocoder.geocode( getStringAddress(rec), function(err, data) {
                console.log ( data.results[0].address_components );
                console.log ( data.results[0].geometry );
                console.log ( data.results[0].types );
                callback();
            });
        });
    }
});

function getStringAddress(rec) {
    var address = rec["Chest Clinic"] 
         + ", " + rec["Test Center Name"]
         + ", " + rec["Address"]
         + ", " + rec["State"]
         + ", " + rec["PIN CODE"];
    return address;
};

*/
