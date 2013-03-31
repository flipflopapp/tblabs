var express = require('express')
  , jade = require('jade')
  , path = require('path')
  , app = express()
  , Centers = require('./database.js').Centers
  ;
  
app.configure('development', function() {
    app.set(express.errorHandler({ dumbExceptions: true }));
    app.set('view options', {
        pretty: true
    });
});

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.use(express.favicon());
    app.use(express.static(path.join(__dirname, './')));
    app.use(express.bodyParser());
    app.use(express.logger());
});

app.get('/', function(req,res) {
    res.render( 'index.jade');
});

app.post('/api/search', function(req, res) {
    var me = this;
    var radius = req.param('radius') * 1000
      , latlng = req.param('latlng')
      , local = req.param('local')
      , city = req.param('city')
      , state = req.param('state')
      , country = req.param('country')
      , pincode = req.param('pincode')
      ;

    console.log ( "radius : " + radius );
    console.log ( "latlng : " + latlng );
    console.log ( "local : " + local );
    console.log ( "city : " + city );
    console.log ( "state : " + state );
    console.log ( "country: " + country);
    console.log ( "pincode: " + pincode);

    Centers.find( {"loc":
                    { $near:
                        { type: "Point",
                          coordinates: latlng },
                        $maxDistance: radius
                    }
                   }, function(err, list) {
                       if (err) {
                           console.log ( err );
                           res.status(400).json ( err );
                       } else {
                           console.log ('found ' + list.length);
                           res.status(200).json ( list );
                       }
                   } );
});

app.get('/admin', function(req,res) {
});

app.post('/admin', function(req,res) {
});

//app.listen(3000); 
app.listen(); 
console.log('Sever is running on port 3000');
