var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
    res.send('This is orders routes handler');
});

router.post('/create', function(req, res) {
    console.log('Create order' + res.params.id);
});

router.get('/view/:id', function(req, res) {
    res.send('View order' + req.params.id);
});

router.post('/delete/:id', function(req, res) {
    console.log('Delete order' + req.params.id);
});


module.exports = router;
