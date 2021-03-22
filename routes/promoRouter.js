const express = require ('express');
const bodyParser = require ('body-parser');
const cors = require('./cors');

const mongoose = require('mongoose');
const Promotions = require('../models/promotions');
const { updateOne } = require('../models/promotions');
const authenticate = require('../authenticate');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());

promoRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})

/*.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})*/

.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Promotions.find({})
    .then(
        (promotions) => 
        {
            res.StatusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotions);  //send it as a json response
        },
        (err) => next(err)
    )
    .catch(
        (err) => next(err)
    );    
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.create(req.body)
    .then(
        (promotion) =>
        {
            console.log('Promotion Created ', promotion);
            res.StatusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);  //send it as a json response
        },
        (err) => next (err)
    )
    .catch(
        (err) => next(err)
    ); 
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.remove({})
    .then(
        (resp) =>
        {
            res.StatusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);  //send it as a json response
        },
        (err) => next (err)
    )
    .catch(
        (err) => next(err)
    ); 
})

promoRouter.route('/:promotionId')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})

.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Promotions.findById(req.params.promotionId)
    .then(
        (promotion) =>
        {
            res.StatusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);  //send it as a json response
        },
        (err) => next (err)
    )
    .catch(
        (err) => next(err)
    );     
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotion/' + req.params.promotionId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promotionId,
        {
            $set: req.body
        },
        {
            new: true
        }
    )
    .then(
        (promotion) => {
            res.StatusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);  //send it as a json response
        },
        (err) => next(err)
    )
    .catch(
        (err) => next(err)
    );
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promotionId)
    .then(
        (resp) =>
        {
            res.StatusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);  //send it as a json response
        },
        (err) => next (err)
    )
    .catch(
        (err) => next(err)
    ); 

});

module.exports = promoRouter;