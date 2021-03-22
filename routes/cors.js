const express = require('express');
const cors = require('cors');
const app = express();

//whitelist limit the url that Client can access
const whitelist = ['http://localhost:3000', 'https://localhost:3443'];

var corsOptionsDelegate = (req, callback) => {
    var corsOptions;

    //indexOf returns the index of he first element can be found
    //if the origin is an element of the array, it will return a value > 0 otherwise, it will return -1
    if(whitelist.indexOf(req.header('Origin')) !== -1){
        //set corsOrigin to true if it's in the whitelist
        corsOptions = {
            origin: true
        };
    }
    else{
        corsOptions = {
            origin: false
        };
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);