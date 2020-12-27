var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
//const { authenticate } = require('passport');
var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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

router.post('/signup', function(req, res, next)
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
   


router.post('/login', passport.authenticate('local'), (req, res) => 
  {
    //to create a token with the req.user._id
    var token = authenticate.getToken({_id: req.user._id, role: req.user.admin});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    //client will extract the success property to see if it's true
    res.json({success: true, token: token, status: 'You are successfully login!'});
  }
  
);

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
