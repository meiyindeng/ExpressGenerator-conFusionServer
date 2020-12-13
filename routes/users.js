var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//User has 3 ends point: signup, login, and logout

router.post('/signup', function(req, res, next){
  //check to make sure the username does not exist, 
  //you don't want to create duplicate user
  User.findOne({username: req.body.username})
    .then((user) => {
      if(user != null){
        var err = new Error('User ' + req.body.username + ' already exists!')
        err.status = 403;
        next(err);
      }
      else{
        return User.create({
          username: req.body.username,
          password: req.body.password})
      }
    })
    .then((user) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({status: 'Registration Successful!', user: user})
    }, (err) => next(err))
    .catch((err) => next(err));
});

router.post('/login', (req, res, next) => {
  if(!req.session.user){
    //client needs to provide authHeader, respond "Basic" Authentication
  var authHeader = req.headers.authorization;
    if (!authHeader) {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      next(err);
      return;
    }
    //read information from client: Basic username:password
    //return an array, first split at ' ', split index1 contains username:password again.
  var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  var username = auth[0];
  var password = auth[1];

  //search the database to see if this particular user exists
    User.findOne({username: username})
      .then((user) => {
        if(user === null){
          var err = new Error('User ' + username + ' does not exists!');
          res.setHeader('WWW-Authenticate', 'Basic');      
          err.status = 401;
          next(err);
        }
        else if (user.password !== password){
          var err = new Error('Your password is incorrect!');
          res.setHeader('WWW-Authenticate', 'Basic');      
          err.status = 401;
          next(err);
        }
        else if (user.username === username && user.password === password){
          //setting 'user' with name 'authenticated' as the respond cookie
          req.session.user = 'authenticated';
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('You are authenticated');
        }
      })
      .catch((err) => next(err));    


  }
  else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
});

//if the user request to log out

router.get('/logout', (req, res) => {
  //check if the session exists
  if(req.session) {
    //destroy the session and remove information from the server side
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error ('You are not logged in!');
    err.status = 403;
    next(err);
  }
});
module.exports = router;
