'use strict';

var Alexa = require('alexa-sdk');
var config = require('./configuration');
var eventHandlers = require('./eventHandlers');
var stateHandlers = require('./stateHandlers');
var intentHandlers = require('./intentHandlers');
var speechHandlers = require('./speechHandlers');

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.appId = config.appId;

    // Fix for hardcoded context from simulator
	if(event.context && event.context.System.application.applicationId == 'applicationId'){
		event.context.System.application.applicationId = event.session.application.applicationId;
	}
    alexa.registerHandlers(eventHandlers, stateHandlers.startModeIntentHandlers, stateHandlers.feedModeIntentHandlers,
    	intentHandlers, speechHandlers);
    alexa.execute();
};