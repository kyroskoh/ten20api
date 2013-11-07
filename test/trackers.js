
require('./helper/authentication')('trackers', 3004);
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient

var db;

describe('test tracker indexes', function () {


    before(function (done) {
        MongoClient.connect('mongodb://localhost/testtrackers', function(err, adb) {
            db = adb;
            done(err);
        });
    });

    after(function (done) {
        if (db) {
            db.close();
        }
        done();
    });

    it('should have user index on trackers collection', function (done) {
        db.collection('trackers').indexes(function(err, indexes) {
            assert.equal(indexes[1].key['user'], 1);
            done();
        });
    });
});