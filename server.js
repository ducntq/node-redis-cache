var express = require('express');
var app = express();
var url = require('url');
var redis = require("redis");
app.use(express.bodyParser()); // init middle ware for post

/*
Get cache bằng cách tạo một http request method GET đến / với query string key
VD: GET http://localhost:3000/?key=testkey
 */

// get cache
app.get('/', function(req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    if (!query.key) res.send({error: 'missing required parameters'});
    else {
        var client = redis.createClient(6379, '127.0.0.1');
        client.get(query.key, function (err, reply) {
            res.send({content: reply});
        });
    }
});

/*
Set cache bằng cách tạo một http request method POST với post body gồm 2 param: key và content
VD: POST http://localhost:3000
    POST BODY key=testkey&content=abc12312312
 */
app.post('/', function(req, res) {
    if (!req.body.key || !req.body.content) res.send({error: 'missing required parameters'});
    else {
        var client = redis.createClient(6379, '127.0.0.1');
        client.set(req.body.key, req.body.content,  function (err, reply) {
            res.send({content: reply});
        });
    }
});

// Nghe ở cổng 3000
app.listen(3000);