var async = require('async')
  , geocoder = require('geocoder')
  , mongoose = require('mongoose')
  , config = require('./config').config
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

exports.Centers = Centers;

mongoose.connect(config.mongoDb);
