'use strict';

var config = require('./configuration');
var AWS = require('aws-sdk');

var EntryService = function () {
    return {

        create : function(userId, gameLevels, callBack) {

            var dynamoDB = new AWS.DynamoDB({apiVersion: '2012-08-10'});

            var gameLevels = JSON.stringify(gameLevels);

            var params = {
                "TableName" : config.dynamoDBTableName,
                "Item": {
                    "userId": {
                        "S": userId
                    },
                    "gameLevels": {
                        "S": gameLevels
                    }
                }
            };

            console.log('params: ', JSON.stringify(params));

            dynamoDB.putItem(params , function(err, data) {

                console.log('error: ', JSON.stringify(err));
                console.log('success: ', JSON.stringify(data));

                callBack(err, data);
            });
        },

        read : function(userId, callBack) {

            var dynamoDB = new AWS.DynamoDB({apiVersion: '2012-08-10'});
            var params = {
                "TableName" : config.dynamoDBTableName,
                "Key": {
                    "userId": {
                        "S": userId
                    }
                },
                "ProjectionExpression": "userId, gameLevels"
            };

            dynamoDB.getItem(params , function(err, data) {

                console.log('error', JSON.stringify(err));
                console.log('success: ', JSON.stringify(data));

                callBack(err, data);
            });
        }
    };
}();


module.exports = EntryService;