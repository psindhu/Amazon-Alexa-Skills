'use strict';

var config = require('./configuration');
var feedHelper = require('./feedHelper');
var logHelper = require('./logHelper');

var items = [];

var intentHandlers = {

    'loadNews' : function () {

        loadItems.call(this, () => {

            if (!this.attributes["isFeedEnd"]) {

                var pagedItems = [];
                var feedLength = items.length;
                var index;
                var currentIndex = this.attributes["index"];

                if (currentIndex === 0) {
                    // Mark flag to signify start of feed
                    this.attributes["isStarted"] = true;
                } else {
                    this.attributes["isStarted"] = null;
                }
                if (this.attributes["direction"] === 'backward') {
                    // Adjustment for change in direction
                    this.attributes["direction"] = 'forward';
                    currentIndex += config.number_feeds_per_prompt;
                }

                var currentPaginationEnd = currentIndex + config.number_feeds_per_prompt;
                for (index = currentIndex; index < currentPaginationEnd && index < feedLength; index++) {
                    pagedItems.push(items[index]);
                }
                if (index === feedLength) {
                    // Mark flag to signify end of feed
                    this.attributes["isFeedEnd"] = true;
                }

                this.attributes["index"] = currentPaginationEnd;

                this.emit('readPagedItem', pagedItems);
            } else {
                this.emit('alreadyEnded');
            }
        })
    },

    'readItems' : function () {

        if (!this.attributes["isFeedEnd"]) {

            var pagedItems = [];
            var feedLength = items.length;
            var index;
            var currentIndex = this.attributes["index"];

            if (currentIndex === 0) {
                // Mark flag to signify start of feed
                this.attributes["isStarted"] = true;
            } else {
                this.attributes["isStarted"] = null;
            }
            if (this.attributes["direction"] === 'backward') {
                // Adjustment for change in direction
                this.attributes["direction"] = 'forward';
                currentIndex += config.number_feeds_per_prompt;
            }

            var currentPaginationEnd = currentIndex + config.number_feeds_per_prompt;
            for (index = currentIndex; index < currentPaginationEnd && index < feedLength; index++) {
                pagedItems.push(items[index]);
            }
            if (index === feedLength) {
                // Mark flag to signify end of feed
                this.attributes["isFeedEnd"] = true;
            }

            this.attributes["index"] = currentPaginationEnd;

            this.emit('readPagedItem', pagedItems);
        } else {
            this.emit('alreadyEnded');
        }
        
    },

    'readPreviousItems' : function () {
        
        if (!this.attributes["isStarted"]) {
            var pagedItems = [];
            var index;
            var currentIndex = this.attributes["index"];
            if (this.attributes["direction"] === 'forward') {
                // Adjustment for change in direction
                currentIndex -= config.number_feeds_per_prompt;
                this.attributes["direction"] = 'backward';
            }
            var currentPaginationStart = currentIndex - config.number_feeds_per_prompt;
            if (this.attributes["isFeedEnd"]) {
                this.attributes["isFeedEnd"] = null;
            }
            currentIndex--;
            for (index = currentIndex; index >= currentPaginationStart && index >= 0; index--) {
                pagedItems.unshift(items[index]);
            }
            if (index === -1) {
                // Mark flag to signify start of feed
                this.attributes["isStarted"] = true;
                currentPaginationStart = 0;
            }
            this.attributes["index"] = currentPaginationStart;

            this.emit('readPagedItem', pagedItems);

        } else {

            this.attributes["index"] = 0;
            this.attributes["direction"] = 'forward';
            if (this.attributes["isFeedEnd"]) {
                this.attributes["isFeedEnd"] = null;
            }

            this.emit('justStarted');
        }
        
    },
    'startOver' : function () {
        
        // Reset index and direction
        this.attributes["index"] = 0;
        this.attributes["direction"] = 'forward';
        if (this.attributes["isFeedEnd"]) {
            this.attributes["isFeedEnd"] = null;
        }

        // Reset News Array
        items = [];

        // Call get feed function to read first page
        this.emit('loadNews');
    }
};

module.exports = intentHandlers;

function loadItems(callback) {

    feedHelper.getFeed((err, data) => {
        if (err) {
            logHelper.logAPIError(this.event.session, 'Feed Parser', err);
            this.emit('reportError');
        } else {
            logHelper.logAPISuccesses(this.event.session, 'Feed Parser');
            if (data) {
                items = data;
                this.attributes['feedLength'] = items.length;
                // Initialize index and direction
                this.attributes["index"] = 0;
                this.attributes["direction"] = 'forward';
                this.attributes["isStarted"] = true;
                callback();
            } else {
                this.emit('noNewItems');
            }
        }
    });
}