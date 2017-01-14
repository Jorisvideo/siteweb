
// ======================================================================
var express  = require('express');
var path = require('path'); 
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app      = express();

var passport = require('passport');
var flash    = require('connect-flash');

// configuration ===============================================================
// connect to our database
try {
    var AuthDetails = require("./config/auth.js");
} catch (e){
    console.log("Merci de créer un fichier auth.js dans le dossier config.\n"+e.stack);
    process.exit();
}
var port     = process.env.PORT || AuthDetails.port;
require('./config/passport')(passport);


app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

// required for passport
app.use(session({
	secret: 'adefinir',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// routes ======================================================================
require('./app/routes.js')(app, passport);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  var err = new Error('Page non trouvé');
  err.status = 404;
  next(err);
});
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// launch ======================================================================
app.listen(port);
console.log('Le port est ouvert sur le port: ' + port);
