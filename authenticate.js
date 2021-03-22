//this file will store the Authentication Strategy

const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require ('./models/user');
var Dishes = require('./models/dishes');
var JwtStrategy = require('passport-jwt').Strategy;



var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FacebookTokenStrategy = require('passport-facebook-token');


var config = require('./config');

//passport-local-mongoose provide the authenticate method to compare password
exports.local = passport.use(new LocalStrategy(User.authenticate()));

//passport will maintain persistent login sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


exports.getToken = function(user) {
    //set expire to 3600 seconds
    return jwt.sign(user, config.secretKey, {expiresIn: 3600})
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

//Passport invokes the verify callback with those credentials as arguments,
//Set up configuration strategy, the done function takes 2 argv (err, user),



exports.verifyAdmin =  (req, res, next) => {

        if(req.user.admin){
            next();
        }                      
            
        else{
            var err = new Error ('You are not authorized to perform this operation!');
            err.status = 403

            next(err);
        }
}




 
  //call back function
  //configure JwtStrategy (options, verify) -- required 2 parameters
  //option is an object of secreOrkey, jwtFromRequest (a function return JWT as a string or null)
  //verify is a function with 2 parameters (verify jwt_payload, done) 
        //jwt_payload contains the decoded JWT payload
        //done a error first callback accepting arguments done(error, user, info)



exports.jwtPassport = passport.use('jwt', 
    new JwtStrategy(opts, 
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => 
            {
                if (err) {
                    return done(err, false);
                }
                else if (user){
                    return done(null, user);
                }
                else {
                    return done(null, false);
                }
            }
        );
    }
))


exports.verifyUser = passport.authenticate('jwt', {session: false});


  

exports.verifyAuthor = (req, res, next) => {
    var userId;
    
    if(req.user != null){
        userId = req.user._id;
    }
    else{
        var err = new Error('User not found');
        err.status = 404;
        next (err);
    }
    var commentID = req.params.commentId;
    var author;
    Dishes.findById(req.params.dishId)
        .then((dish) => {
            if(dish != null && dish.comments.id(commentID) != null){
                author = dish.comments.id(commentID).author;
                var authorId = author._id;
                if (authorId.equals(userId)){
                    next();
                }
                else{
                    var err = new Error('You are not the author of this comment!');
                    err.status = 403;
                    next(err);
                }
            }
            else{
                var err = new Error('Dish or Comment not found');
                err.status = 404;
                next(err);
            }
                
            
        }, (err) => next(err));
    
}

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
    },
        (accessToken, refreshToken, profile, done) => {
            User.findOne({facebookId: profile.id}, (err, user) => 
                {
                    if(err) {
                        return done(err, false);
                    }
                    if(!err && user !== null){
                        return done(null, user);
                    }
                    else{
                        user = new User({
                            username: profile.displayName
                            });
                        user.facebookId = profile.id;
                        user.firstname = profile.name.givenName;
                        user.lastname = profile.name.familyName;
                        user.save((err, user) => {
                            if (err)
                                return done(err, false);
                            else    
                                return done(null, user);
                        })    
                    }
                }
            )   
        }
));

