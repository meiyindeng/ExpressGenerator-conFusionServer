var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    //remove the username and password since it will automatically added in
    //by the passport-local-mongoose plug-in
    admin: {
        type: Boolean,
        default: false
    },
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    facebookId: String,

});

//to add the username and hash storage of password
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);