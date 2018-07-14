var express       = require('express');
var router        = express.Router();
var helper        = require('./helper');

var xml2js        = require('xml2js');
var parser        = new xml2js.Parser();
var sourceFolder  = '/Users/ivantsyganok/Documents/NodeJS/EDI/public/xmlfiles/2/';

/* GET home page. */
router.get('/', function(req, res, next) {

    readFiles(sourceFolder)
        .then( allContents => {

            var results = [];

            allContents.forEach(function (item) {
                parser.parseString(item[1], function (err, result) {
                    var jdeData = buyerData(result['ORDER']['HEAD'][0]['BUYER']);
                    results.push(Object.assign(result, {"CUSTOMER": jdeData[1]}));
                })
            })

            res.render('index', { result:  results });

        }, error => console.log(error));

});

/* GET order details page. */

router.get('/details/:id', function(req, res, next) {

    readFiles(sourceFolder)
        .then( allContents => {

            var results = [];

            allContents.forEach(function (item) {
                parser.parseString(item[1], function (err, result) {
                    results.push(result);
                })
            })

            results.forEach(function (order) {
                if (order['ORDER'].NUMBER == req.params.id ) {

                    res.render('details', { orderId:  req.params.id, result: order['ORDER']['HEAD'][0]['POSITION'] });
                }
            })

        }, error => console.log(error));

});

module.exports = router;
