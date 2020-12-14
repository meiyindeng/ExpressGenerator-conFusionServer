//this file will store the Authentication Strategy

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require ('./models/user');

//passport-local-mongoose provide the authenticate method to compare password
exports.local = passport.use(new LocalStrategy(User.authenticate()));

//passport will maintain persistent login sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

