var async = require('async')
  , geocoder = require('geocoder')
  , mongoose = require('mongoose')
  , config = require('./config').config
  ;

Centers = mongoose.model('centers', new mongoose.Schema({
    "Chest Clinic": String,
    "Test Center Name": String,
    "TYPE OF CENTER (GROUP)": String,
    "Descriptions": String,

    /*
    // "Address": {
    //    "address": String,
    //    "landmark": String,
    //    "city": String,
    //    "state": String,
    //    "country": String,
    //    "pincode": String
    //},
    */
    "Address": String,
    "State": String,
    "PIN CODE": String,
    "Phone Number": String,
    "Email": String,
    "Fax": String,
    "URL": String,

    "Tags": String,
    "loc": {
        "lat": Number,
        "lon": Number
    }
}));

mongoose.connect(config.mongoDb);
