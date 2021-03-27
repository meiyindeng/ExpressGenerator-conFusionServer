var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
//const { authenticate } = require('passport');
var authenticate = require('../authenticate');
const cors = require('./cors');

var router = express.Router();
router.use(bodyParser.json());
router.options('*', cors.corsWithOptions, (req, res) => {res.sendStatus(200); });
/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find({})
    .then(
      (Users) =>
      {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(Users);
      },
      (err) => {
          next(err)
      }   
    )
    .catch(
      (err) => next(err)
    )
  }
)  



//User has 3 ends point: signup, login, and logout

router.post('/signup', cors.corsWithOptions, function(req, res, next)
  {
  //check to make sure the username does not exist, 
  //you don't want to create duplicate user
  //The register method register a new user instance, it takes 3 parameters: user, password, and callback function
  //register(user, password, cb) 
    User.register(new User({username: req.body.username}), req.body.password, 
      (err, user) => {
        if(err){
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
        }
        else{
          if (req.body.firstname){
            user.firstname = req.body.firstname;
          }
          if (req.body.lastname){
            user.lastname = req.body.lastname;
          }
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err});
              return;
            }
            
            passport.authenticate('local')
            (req, res, () => 
              {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                //client will extract the success property to see if it's true
                res.json({success: true, status: 'Registration Successful!'});
              }
            )
          })
          
        }
      }
    )
  }      
);
   


router.post('/login', cors.corsWithOptions, (req, res, next) => 
  {
    // the info will respond back to the user the error message if there's an err during login, 
    //or if success return the user's information
    passport.authenticate('local', (err, user, info) => {
      if(err){
        return next(err);
      }
      if(!user){
        //user does not exist
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        //respond back to Client the reason/info of such login failure
        res.json({success: false, status: 'Login Unsuccessful!', err: info});

      }
      //if successful, there's no error and the user is not null
      req.logIn(user, (err) => {
        if(err){
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});
        }
     
        //to create a token with the req.user._id
        var token = authenticate.getToken({_id: req.user._id, role: req.user.admin});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        //client will extract the success property to see if it's true
        res.json({success: true, status: 'You are successfully login!', token: token});

      });

    }) (req, res, next); 
    
    
  }
  
);
//check if the JWTToken is still valid or expired
router.get('/checkJWTToken', cors.corsWithOptions, (req, res) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if(err){
      return next(err);
    }
    if(!user){
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT invalid!', success: false, err: info})
    }
    else{
      res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        //client will extract the success property to see if it's true
        res.json({status: 'JWT valid', success: true,  user: user});
    }
  }) (req, res);
})

//if the user request to log out

router.get('/logout', cors.corsWithOptions, (req, res) => {
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

router.get('/facebook/token', passport.authenticate('facebook-token'), 
  (req, res) => {
    if(req.user){//the user has already authenticated and added to the req obj
      //need to create a token 
      var token = authenticate.getToken({_id: req.user._id, role: req.user.admin});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, token: token, status: 'You are successfully login!'});
    }

  }
)

module.exports = router;
