'use strict';

var Alexa = require('alexa-sdk');
var config = require('./configuration');
var constants = require('./constants');

var stateHandlers = {
    startModeIntentHandlers : Alexa.CreateStateHandler(constants.states.START_MODE, {
        'GetDeveloperNews': function() {
            this.emit('loadNews');
        },
        'AMAZON.HelpIntent' : function () {
            this.emit('helpStartMode');
        },
        'AMAZON.StopIntent' : function () {
            this.emit('EndSession', 'Good bye .');
        },
        'AMAZON.CancelIntent' : function () {
            this.emit('EndSession', 'Good bye .');
        },
        'SessionEndedRequest' : function () {
            this.emit('EndSession', constants.terminate);
        },
        'Unhandled' : function () {
            this.emit('unhandledStartMode');
        }
    }),
    feedModeIntentHandlers: Alexa.CreateStateHandler(constants.states.FEED_MODE, {
        'GetDeveloperNews': function() {
            this.emit('loadNews');
        },
        'NewsInfo' : function() {
            this.emit('readItemSpeechHelper');
        },
        'AMAZON.NextIntent' : function () {
            this.emit('readItems');
        },
        'AMAZON.PreviousIntent' : function () {
            this.emit('readPreviousItems');
        },
        'AMAZON.StartOverIntent' : function () {
            this.emit('startOver');
        },
        'AMAZON.HelpIntent' : function () {
            this.emit('helpFeedMode');
        },
        'AMAZON.StopIntent' : function () {
            this.emit('EndSession', 'Good bye .');
        },
        'AMAZON.CancelIntent' : function () {
            this.emit('EndSession', 'Good bye .');
        },
        'SessionEndedRequest' : function () {
            this.emit('EndSession', constants.terminate);
        },
        'Unhandled' : function () {
            // Calling speechHandler
            this.emit('unhandledFeedMode');
        }
    })
};

module.exports = stateHandlers;