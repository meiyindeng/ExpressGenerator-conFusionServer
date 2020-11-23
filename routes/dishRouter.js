const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();
//the dishRouter will provide an interface to handle the dish related code here
dishRouter.use(bodyParser.json());

dishRouter.route('/') // mount this dishRouter at the /dishes endpoint in the index.js file later

.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    //the next function will look for continue request
    next();
})

.get((req, res, next) => {
    res.end('Will send all the dishes to you!');
})

.post((req, res, next) => {
    //the bodyParser will parse the body add it in the req, which can be retrieve from req.body
    res.end('Will add the dish: ' + req.body.name + 
        ' with details: ' + req.body.description);
})

.put((req, res, next) => {
    //the bodyParser will parse the body add it in the req, which can be retrieve from req.body
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})

.delete((req, res, next) => {
    res.end('Deleting all the dishes!');
})

dishRouter.route('/:dishId')
.get((req, res, next) => {
    //the dishId can be retrieved using req.params.dishId
    res.end('Will send details of the dish: '
        + req.params.dishId + ' to you!');
 })

 .post((req, res, next) => {
    //the bodyParser will parse the body add it in the req, which can be retrieve from req.body
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/' + req.params.dishId);
 })
  
 .put((req, res, next) => {
    res.write('Updating the dish: ' + req.params.dishId + '\n')
    res.end('Will update the dish: ' + req.body.name + ' with details: ' + req.body.description);
 })
  
 .delete((req, res, next) => {
    res.end('Deleting dish: ' + req.params.dishId);
 });
 

module.exports = dishRouter; 

