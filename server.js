var express = require('express');
var app = express();
var url = require('url');
var redis = require("redis");
var crypto = require('crypto');
var fs = require('fs');
app.use(express.bodyParser()); // init middle ware for post

var staticsPath = './statics';


// create md5 hash method
var md5 = function(input) {
    return crypto.createHash('md5').update(input).digest("hex");
};

// inject endsWith method to String object
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.endsWithOneOf = function (suffixArray) {
    for (var i = 0, total = suffixArray.length; i < total; i++) {
        if (this.endsWith(suffixArray[i])) return true;
    }
    return false;
};

app.use(function(req, res){
    var parts = url.parse(req.url);
    var absoluteUrl = req.protocol + "://" + req.host + req.url; // have no port
    var key = md5(absoluteUrl);
    var client = redis.createClient(6379, '127.0.0.1');

    var staticsSuffix = ['.js', '.css', '.jpg'];

    if (absoluteUrl.endsWithOneOf(parts.pathname)) {
        var file = staticsPath + parts.pathname;
        console.log('GET STATICS:');
        console.log(file);

        fs.exists(file, function(exists) {
            if (exists) {
                res.sendfile(file);
            }
            else res.send(404);
        });
    }
    else {
        if(req.method == 'GET') {
            client.get(key, function (err, reply) {
                console.log('GET Reply:');
                console.log(reply);
                if (reply) res.send(reply);
                else res.send(404);
            });
        }
        else if (req.method == 'POST' && req.body.content) {
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
    }
});

// Nghe ở cổng 3000
app.listen(3000);