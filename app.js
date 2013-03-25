var express = require('express')
  , jade = require('jade')
  , path = require('path')
  , app = express()
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
    var radius = req.param('radius')
      , search = req.param('search')
      ;

    res.render( 'indexjq.jade', {
        radius: radius,
        search: search,
        results: results
        } );
});

// http://localhost:3000/?radius=5&search=NH+24%2C+Gazipur%2C+New+Delhi&mycity=New+Delhi&mycountry=India&mypin=110091
app.post('/', function(req, res) {
    var radius = req.param('radius')
      , search = req.param('search')
      , mycity = req.param('mycity')
      , mycountry = req.param('mycountry')
      , mypin = req.param('mypin')
      ;

    res.render( 'indexjq.jade', {
        radius: radius,
        search: search,
        mycity: mycity,
        mycountry: mycountry,
        mypin: mypin,
        results: results
        } );
});

app.post('/', function(req, res) {
});

app.get('/admin', function(req,res) {
});

app.post('/admin', function(req,res) {
});

app.listen(3000); 
console.log('Sever is running on port 3000');
