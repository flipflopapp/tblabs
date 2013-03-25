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
    res.render( 'indexjq.jade', {} );
});

app.post('/', function(req,res) {

});

app.get('/admin', function(req,res) {
});

app.post('/admin', function(req,res) {
});

app.listen(3000); 
console.log('Sever is running on port 3000');
