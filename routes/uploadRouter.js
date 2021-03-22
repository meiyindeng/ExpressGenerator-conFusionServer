const express = require ('express');
const bodyParser = require ('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

/*configuration for multer:
    destination, it will send file to the 'public/images' folder
    filename, supply the name of the uploaded file with its originalname
*/
const storage = multer.diskStorage(
    {
        destination: (req, file, cb) => {
            cb(null, 'public/images');
        },

        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }

    }
);

/* Set up a filter to only accept file of certain type:
    if the image is not jpg, jpeg ... return an error message with false, 
    else return null for error and true.
*/    
const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match("\.jpg$|\.jpeg$|\.gif|\.png$")){
    //if(!file.originalname.match(/\.(jpg | jpeg | png | gif)$/)){
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

//use the multer function to define upload to the defined storage, and fileFilter as imageFileFilter
const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();
uploadRouter.use(bodyParser.json());

//upload is not supported on GET, PUT, and DELETE
uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');

})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
    
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
    
})

//the upload.single restriction only allow to upload a single file
//and the form field is name 'imageFile'
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);   //the returned file will content the path to the file
    //the client can further configure this path to other place that may use this image file

})



module.exports = uploadRouter;