var express = require('express');

var router = express.Router();
/* GET home page. */
router.get('/', function(req, res) {
    
    res.render('index', { title: 'Express' });
});
/*router.get('/index.html', function(req, res){
    res.sendFile('index.html');
});*/
module.exports = router;