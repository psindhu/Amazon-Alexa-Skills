'use strict';

var Alexa = require('alexa-sdk');
var config = require('./configuration');
var constants = require('./constants');

var stateHandlers = {
    startModeIntentHandlers : Alexa.CreateStateHandler(constants.states.START_MODE, {
        'StartGameIntent': function() {
            this.emit('startGame');
        },
        'AMAZON.StartOverIntent' : function () {
            this.emit('restartGame');
        },
        'AMAZON.HelpIntent' : function () {
            this.emit('helpStartMode');
        },
        'AMAZON.StopIntent' : function () {
            this.emit('EndSession', constants.thankyouMessage);
        },
        'AMAZON.CancelIntent' : function () {
            this.emit('EndSession', constants.thankyouMessage);
        },
        'SessionEndedRequest' : function () {
            this.emit('EndSession', constants.thankyouMessage);
        },
        'Unhandled' : function () {
            this.emit('unhandledStartMode');
        }
    }),
    gameModeIntentHandlers: Alexa.CreateStateHandler(constants.states.GAME_MODE, {
        'InputChoiceIntent' : function() {
            this.emit('inputChoice');
        },
        'AMAZON.StartOverIntent' : function () {
            this.emit('restartGame');
        },
        'AMAZON.HelpIntent' : function () {
            this.emit('helpGameMode');
        },
        'AMAZON.StopIntent' : function () {
            this.emit('EndSession', constants.thankyouMessage, true, null);
        },
        'AMAZON.CancelIntent' : function () {
            this.emit('EndSession', constants.thankyouMessage, true, null);
        },
        'SessionEndedRequest' : function () {
            this.emit('EndSession', constants.thankyouMessage, true, null);
        },
        'Unhandled' : function () {
            this.emit('unhandledGameMode');
        }
    })
};

module.exports = stateHandlers;