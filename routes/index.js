var express       = require('express');
var router        = express.Router();

var xml2js        = require('xml2js');
var parser        = new xml2js.Parser();
var path          = require('path');
var request       = require('request');

var helper        = require('./helper');

var sourceFolder  = '/Users/ivantsyganok/Documents/NodeJS/EDI/public/xmlfiles/2/';
var archiveFolder = '/Users/ivantsyganok/Documents/NodeJS/EDI/public/xmlfiles/archive/';

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

router.get(['/details/:id', '/details/:id/:archive', '/details/:id/:archive/:fileType'], function(req, res, next) {

  var folderToRead = (req.params.archive == 'archive') ? archiveFolder : sourceFolder;

  var fileExtension = (req.params.fileType == 'json') ? '.' + req.params.fileType : '.xml';

  readFolder(folderToRead, fileExtension)
      .then( allContents => {

        var results = [];

        allContents.forEach(function (item) {

          if (fileExtension == '.xml') {
            parser.parseString(item[1], function (err, result) {
              results.push(result);
            })
          } else {
            results.push(JSON.parse(item[1]))
          }

        })

        results.forEach(function (order) {
          if (fileExtension == '.json') {
              console.log('vkjfsdnvckjdsfnvcksd');
              console.log(order.deliveryInstructions.substring(14,24));
              if (order.deliveryInstructions.substring(14,24) == req.params.id) {
                  res.render('createOrder', {
                      orderId: req.params.id,
                      statusCode: 200,
                      statusMessage: '',
                      result: order
                  });
              }

          } else {
              if (order['ORDER'].NUMBER == req.params.id ) {
                res.render('details', { orderId:  req.params.id, result: order['ORDER']['HEAD'][0]['POSITION'] });
              }
          }
        })

      }, error => console.log(error));
});

router.get('/createOrder/:id', function(req, res, next) {

    readFiles(sourceFolder)
        .then( allContents => {

            var results = [];

            allContents.forEach(function (item) {
                parser.parseString(item[1], function (err, result) {
                    results.push(Object.assign(result, {"FILENAME": item[0]}));
                })
            })

            results.forEach(function (order) {
                if (order['ORDER'].NUMBER == req.params.id ) {

                    var orderDate = jdeDate(order['ORDER'].DATE);
                    var deliveryPlaseGln = order['ORDER']['HEAD'][0]['DELIVERYPLACE'][0];
                    var buyerGln = order['ORDER']['HEAD'][0]['BUYER'][0];
                    var login = buyerData(buyerGln)[2];
                    var pass = buyerData(buyerGln)[3];
                    var shipTo = shipToData(deliveryPlaseGln)[1];
                    var fileName = order['FILENAME'];
                    console.log(fileName);

                    var orderLines = [];

                    order['ORDER']['HEAD'][0]['POSITION'].forEach(function (orderLine) {
                        var jsonOrderLine = {
                            "productId": parseInt(orderLine.PRODUCTIDSUPPLIER[0]),
                            "quantity": parseInt(orderLine.ORDEREDQUANTITY[0]),
                            "price": parseFloat(orderLine.PRICEWITHVAT[0]),
                            "customerProductId": parseInt(orderLine.PRODUCTIDBUYER[0])
                        };
                        orderLines.push(jsonOrderLine);
                    });

                    var json = {
                        "deliveryAddress": parseInt(shipTo),
                        "requestedDeliveryDate": parseInt(orderDate),
                        "orderIfAllAvailable": false,
                        "deliveryInstructions": "Номер заказа: " + order['ORDER'].NUMBER + ", " +
                        "точка доставки:" + deliveryPlaseGln,
                        "customerPO": order['ORDER'].NUMBER[0],
                        "orderLines": orderLines
                    };

                    console.log(json);

                    var options = {
                        url: 'https://kiev.elkogroup.com/api/Sales/CreateOrder?username=' + login + '&password=' + pass,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        json: json
                    };

                    request(options, function(err, result, body) {
                        if (result && (result.statusCode === 200 || result.statusCode === 201)) {
                            console.log(result.body);
                            moveFile('../EDI/public/xmlfiles/2/' + fileName, '../EDI/public/xmlfiles/archive/',
                                'SP_' + result.body.orderId
                                + '_' + buyerData(buyerGln)[1]
                                + '_' + result.body.dateCreate +'.xml');

                            var content = JSON.stringify(result.body);
                            var jsonFileName = '../EDI/public/xmlfiles/archive/'
                                + 'SP_' + result.body.orderId
                                + '_' + buyerData(buyerGln)[1]
                                + '_' + result.body.dateCreate +'.json'

                            fs.writeFile(jsonFileName, content, 'utf8', function (err) {
                                if (err) {
                                    return console.log(err);
                                }

                                console.log("The file was saved!");
                            });

                        } else {
                            console.log(result.statusCode + ' - ' + result.statusMessage);
                            console.log(body);
                        }

                        res.render('createOrder', {
                            orderId:  req.params.id,
                            statusCode: result.statusCode,
                            statusMessage: result.statusMessage,
                            result: result.body
                        });
                    });

                }
            })

        }, error => console.log(error));
});

router.get('/archive', function(req, res, next) {

    readFiles(archiveFolder)
        .then( allContents => {

            var results = [];

            allContents.forEach(function (item) {
                if (path.extname(item[0]) == '.xml') {
                    parser.parseString(item[1], function (err, result) {
                        results.push(result);
                    })
                }
            })

            res.render('archive', { result:  results });

        }, error => console.log(error));

});

module.exports = router;
