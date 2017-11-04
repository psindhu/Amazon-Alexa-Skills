'use strict';

var FeedParser = require('feedparser');
var entities = require('html-entities').AllHtmlEntities;
var request = require('request');
var striptags = require('striptags');

var config = require('./configuration');
var constants = require('./constants');
var logHelper = require('./logHelper');

var feedParser = function () {
    return {
        getFeed : function (callback) {

            var items = [];
            var feedparser = new FeedParser(null);
            var url = "https://developer.apple.com/news/rss/news.rss";
            var options = {
              url: url,
              headers: { "user-agent" : "Amazon Alexa Apple Dev News Client" }
            };
            var req = request(options);
            req.on('response', function (res) {
                var stream = this;
                if (res.statusCode === 200) {
                    stream.pipe(feedparser);
                } else {
                    return stream.emit('error', new Error('Bad status code'));
                }
            });

            req.on('error', function (err) {
                return callback(err, null);
            });

            // Received stream. parse through the stream and create JSON Objects for each item
            feedparser.on('readable', function() {
                var stream = this;
                var item;
                while (item = stream.read()) {

                    var feedItem = {};
                    // Process feedItem item and push it to items data if it exists
                    if (item['title']) {
                        feedItem['title'] = item['title'];
                        feedItem['title'] = entities.decode(striptags(feedItem['title']));
                        feedItem['title'] = feedItem['title'].trim();
                        feedItem['title'] = feedItem['title'].replace(/[&]/g,'and').replace(/[<>]/g,'');

                        feedItem['date'] = new Date(item['date']).toUTCString();

                        if (item['description']) {
                            feedItem['description'] = item['description'];
                            feedItem['description'] = entities.decode(striptags(feedItem['description']));
                            feedItem['description'] = feedItem['description'].trim();
                            feedItem['description'] = feedItem['description'].replace(/[&]/g,'and').replace(/[<>]/g,'');
                        }

                        if (item['summary']) {
                            feedItem['summary'] = item['summary'];
                        }

                        if (item['link']) {
                            feedItem['link'] = item['link'];
                        }

                        items.push(feedItem);
                    }
                }
            });
            
            // All items parsed. Store items in S3 and return items
            feedparser.on('end', function () {
                var count = 0;
                items.sort(function (a, b) {
                    return new Date(b.date) - new Date(a.date);
                });
                items.forEach(function (feedItem) {
                    feedItem['count'] = count++;
                });
                callback(null, items);
            });

            feedparser.on('error', function(err) {
                callback(err, null);
            });
        }
    };
}();

module.exports = feedParser;