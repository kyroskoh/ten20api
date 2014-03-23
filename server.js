/**
 * Module dependencies.
 */

var express = require('express')
var http = require('http')
var path = require('path')
var MongoClient = require('mongodb').MongoClient
var async = require('async')
var MongoStore = require('connect-mongo')(express);
var dbSingleton = require('./lib/db');

var server;
module.exports.startServer = function (port, dbUrl, configRoute, callback) {
    var app = express();
    server = require('http').createServer(app);

    async.waterfall([
        function (callback) {
            MongoClient.connect(dbUrl, callback);
        },
        function (db, callback) {

            dbSingleton.setDb(db);
            app.set('port', port);
            app.use(express.favicon());
            app.use(express.urlencoded());
            app.use(express.json());
            app.use(express.methodOverride());

            app.use(express.cookieParser('some secret'));
            app.use(express.session({
                secret: '1GSrN6oX8cvEzfeecNqm3xgfZZZBj6DQpY',
                store: new MongoStore({
                    db: db
                })
            }));

            if ('development' == app.get('env')) {
                app.use(express.errorHandler());
                app.use(express.logger('dev'));
            }

            configRoute(app, callback);
        },
        function(callback) {
            app.use(app.router);
            console.log('starting server on port ' + app.get('port'));
            server.listen(app.get('port'), callback);
        }
    ], function (err, result) {
        callback(err);
    });
};

module.exports.close = function (callback) {
    server.close(callback);
};

