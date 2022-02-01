var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session')


var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');
var authRouter = require('./routes/auth');
var authenticate = require('./lib/authenticate');

const REPO = require('./lib/repo');
var settings = require('./secrets');



let db = new REPO();
db.init();

var app = express();


// passport config
app.use(session({
  secret: settings.seed,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


//app.use(cors());
var allowedOrigins = ['https://piggybank.expovin.it',
                      'http://localhost:3000',
                      'http://localhost:3001',
                      'http://localhost:8000'];


// Add headers
app.use(function (req, res, next) {

  if(allowedOrigins.indexOf(req.headers.origin) !== -1){

    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'content-type,x-access-token');
    
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
  }
  else 
    console.log("Ogigin "+req.headers.origin+" NOT Allowed")




  // Pass to next layer of middleware
  next();
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', (req, res, next) => { req.dbConn = db; next()}, apiRouter);
app.use('/auth', (req, res, next) => { req.dbConn = db; next()}, authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
