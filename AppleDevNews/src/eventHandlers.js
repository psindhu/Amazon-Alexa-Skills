'use strict';

var async = require('async');

var constants = require('./constants');
var config = require('./configuration');
var feedHelper = require('./feedHelper');
var logHelper = require('./logHelper');

var eventHandlers = {
    'NewSession' : function () {
        logHelper.logSessionStarted(this.event.session);
        
        /*
         *  If request type is LaunchRequest : Give welcome message
         *  Else If request type is IntentRequest : Call the specific intent directly
         *  Else : do nothing.
         */
        if (this.event.request.type === 'LaunchRequest') {

            this.handler.state = constants.states.START_MODE;
            logHelper.logLaunchRequest(this.event.session, this.event.request);

            this.emit('welcome');
        } else if (this.event.request.type === 'IntentRequest') {

            this.handler.state = constants.states.FEED_MODE;
            logHelper.logReceiveIntent(this.event.session, this.event.request);
            
            var intentName = this.event.request.intent.name;
            this.emitWithState(intentName);
        } else {
            console.log('Unexpected request : ' + this.event.request.type);
        }
    },
    'EndSession' : function (message) {
        
        this.handler.state = '';

        Object.keys(this.attributes).forEach((attribute) => {
            delete this.attributes[attribute];
        });
        
        if (message != constants.terminate) {
            message = message || '';
            this.emit(':tell', message);
        }
    },

    'Unhandled': function() {
        
        this.handler.state = constants.states.START_MODE;

        var speechOutput = '';
        var repromptSpeech = '';

        speechOutput += config.welcome_message;
        repromptSpeech += speechOutput;

        this.emit(':ask', speechOutput, repromptSpeech); 
    }
};

module.exports = eventHandlers;