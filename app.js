var createError = require('http-errors');
var express = require('express');
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');




var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const uploadRouter = require('./routes/uploadRouter');
const favoriteRouter = require('./routes/favoriteRouter');

const mongoose = require('mongoose');
const Dishes = require('./models/dishes');

const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then( 
  (db) => 
  {
    console.log('Connected correctly to server');
  }, 
  (err) => 
  { 
    console.log(err)
  }
);

var app = express();


app.all('*', (req, res, next) => {
    if(req.secure) {
      return next();
    }
    else {
      res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
    }
})
//signed cookie
//app.use(cookieParser('12345-67890-09876-54321'));
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

app.use(passport.initialize());
app.use(passport.session());

//User can get to the homepage and users endpoint without have to authenticated, other endpoints need to get authenticated
app.use('/index', indexRouter);
app.use('/users', usersRouter);
  //only use authentication in certain route
  /*function auth (req, res, next) {
    console.log(req.session);
    //If the cookie with object user is not exists,
    if(!req.user){

        var err = new Error('You are not authenticated!');
        err.status = 403;
        return next(err);
    }  
    else {
      //the passport already done with authenticating, and can move on
      next();
    }
  }

  app.use(auth);*/
  // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, './public')));

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favoriteRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  //res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
