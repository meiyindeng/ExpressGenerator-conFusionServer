var express = require('express');
const bodyParser = require('body-parser');
var Favorites = require('../models/favorite');
var Dishes = require('../models/dishes');
var authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {res.sendStatus(200);})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate({path:'dishes'})
    .then((favorite) => {
        if (favorite != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }
        else{
            err = new Error('Your favorites list is empty');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
.catch((err) => next(err));
}) 

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favorites');
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    //user should be already authenticated
        //outcome1: the list is empty, can directly add the dish
        //outcome2: there's item in the list, need to find out if the dish already in the list
    var dishArray = req.body;
    var validatedDishArray = [];
    dishArray.forEach( dishObj => {
        Dishes.findById(dishObj._id)
            .then(dish => {
                if(dish != null) {
                    validatedDishArray.push(dishObj._id);
                }
                else{
                    err = new Error('Dish ' + dishObj._id + ' not found');
                    err.status = 404;
                    return next(err);
                } 
            }, (err) => next(err))
        
    });
    Favorites.findOne({user: req.user._id}) 
    .then((favoriteList) => {
        if(favoriteList == null){ //the list is empty
            Favorites.create({user: req.user._id, dishes: validatedDishArray})
                .then((favorite)=>{
                    Favorites.findById(favorite._id)
                    .then(
                        (favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err)
                    );
     
                }, (err) => next(err));

        }
        else{ //favoriteList is not empty, need to update
            var concatArray = validatedDishArray.concat(favoriteList.dishes);
            let filteredArray = [...new Set(concatArray.map(JSON.stringify))].map(JSON.parse);
            favoriteList.dishes = filteredArray;
            favoriteList.save()
            .then(
                (updatedFavorite) => {
                    Favorites.findById(updatedFavorite._id)
                    .then(
                        (favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err)
                    );
                
                }, (err) => next(err)
            );
            
        }

    }, (err) => next(err))
    .catch((err) => next(err));
})    

.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOneAndDelete({user: req.user._id})
    .then(
        (favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }, (err) => next(err)
    )
    .catch(
        (err) => next(err)
    )
})

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {res.sendStatus(200);})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //res.statusCode = 403;
    //res.setHeader('Content-Type', 'text/plain');
    //res.end('GET operation not supported on favorites/'+ req.params.dishId);
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if(!favorites){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            //"exists" will set to true if the dishId is part of favorite, otherwise set to false
            //in this case favorites will be null
            return res.json({"exists": false, "favorites": favorites})
        }
        else{
            //req.params.dishId is not in user's favorites list
            if(favorites.dishes.indexOf(req.params.dishId) < 0){
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites})
            }
            else{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites})
            }
            
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favorites/'
        + req.params.dishId);
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //check if the dishId is valid
    Dishes.findById(req.params.dishId)
    .then( 
        (dish) => {
            if(dish == null){
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);   
            }
            else { //dishId is valid
                //check if user has a favorite folder
                Favorites.findOne({user: req.user._id}) 
                .then(
                    (favorite) => {
                        if(favorite != null && favorite.dishes.find(obj => (obj._id).equals(dish._id)==true) == null){ 
                            //the dish is not in user's favorite list
                            favorite.dishes.push(dish._id);
                            favorite.save()
                            .then(
                                Favorites.findOne({user: req.user._id})
                                .then(
                                    (favorite) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                    },
                                    (err) => next(err)
                                ),    
                                (err) => next(err)
                            )

                        }
                        if(favorite == null){ //the list is empty
                            var dishArray = []
                            dishArray.push({_id: dish._id}); 
                            Favorites.create({user: req.user._id, dishes: dishArray})        
                            .then(
                                (favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                },
                                (err) => next(err)    
                            )                  
                        }
                        
                        else{
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }

                    },
                    
                    (err) => next(err)
                )
   
            }
        },
        (err) => next(err)    
    )
    .catch(
        (err) => next(err)
    )

})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then(
        (favorite) => {
            if(favorite !== null){
                favorite.dishes = favorite.dishes.filter(obj => String(obj._id)!=req.params.dishId);
                favorite.save()
                .then(
                    (favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    },
                    (err) => next(err)    
                )
            }
        }, 
        (err) => next(err)   
    )
})
    

module.exports = favoriteRouter;



        