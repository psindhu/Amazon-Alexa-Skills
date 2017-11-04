"use strict";

var logHelper = function () {
    return{
        logSessionStarted: function(session) {
            var sessionStartedJsonEvent =
            {
                "eventType" : "SessionStarted",
                "event" : {
                    "userId" : session.user.userId,
                    "sessionId" : session.sessionId,
                    "datestring" : (new Date()).toISOString()
                }
            };
            logJsonEvent(sessionStartedJsonEvent);
        },
        logSessionEnded: function(session) {
            var sessionEndedJsonEvent =
            {
                "eventType" : "SessionEnded",
                "event" : {
                    "userId" : session.user.userId,
                    "sessionId" : session.sessionId,
                    "datestring" : (new Date()).toISOString()
                }
            };
            logJsonEvent(sessionEndedJsonEvent);
        },
        logLaunchRequest: function (session, launchRequest) {
            var launchRequestJsonEvent =
            {
                "eventType" : "LaunchRequest",
                "event" : {
                    "datestring" : (new Date()).toISOString(),
                    "userId" : session.user.userId,
                    "requestId" : launchRequest.requestId,
                    "sessionId" : session.sessionId
                }
            };
            logJsonEvent(launchRequestJsonEvent);
        },
        logReceiveIntent: function(session, intentRequest) {
            var receiveIntentJsonEvent =
            {
                "eventType" : "ReceiveIntent",
                "event": {
                    "intentName": intentRequest.intent.name,
                    "datestring": (new Date()).toISOString(),
                    "userId": session.user.userId,
                    "requestId": intentRequest.requestId,
                    "intent": intentRequest.intent,
                    "sessionId": session.sessionId
                }
            };
            logJsonEvent(receiveIntentJsonEvent);
        }
    };
}();

module.exports = logHelper;

function logJsonEvent(jsonEvent) {
    console.log("%j", jsonEvent);
}