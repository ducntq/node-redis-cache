var express = require('express');
var app = express();
var url = require('url');
var redis = require("redis");
var crypto = require('crypto');
app.use(express.bodyParser()); // init middle ware for post

var md5 = function(input) {
    return crypto.createHash('md5').update(input).digest("hex");
};

app.use(function(req, res){
    var absoluteUrl = req.protocol + "://" + req.host + req.url; // have no port
    var key = md5(absoluteUrl);
    if(req.method == 'GET') {
        var client = redis.createClient(6379, '127.0.0.1');
        client.get(key, function (err, reply) {
            console.log('GET Reply:');
            console.log(reply);
            if (reply) res.send(reply);
            else res.send(404);
        });
    }
    else if (req.method == 'POST' && req.body.content) {
        var client = redis.createClient(6379, '127.0.0.1');
        client.set(key, req.body.content, function(err, reply){
            console.log('POST Reply:');
            console.log(reply);
            res.send(reply);
        });
    }
    else {
        console.log('Unhandled method: ' + req.method);
        res.send(404);
    }
});

// Nghe ở cổng 3000
app.listen(3000);