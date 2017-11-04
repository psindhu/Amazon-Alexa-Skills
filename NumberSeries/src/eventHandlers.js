'use strict';

var constants = require('./constants');
var config = require('./configuration');
var logHelper = require('./logHelper');
var dynamoDBHelper = require('./dynamoDBHelper');

var eventHandlers = {
    
    'NewSession' : function () {

        logHelper.logSessionStarted(this.event.session);
        this.handler.state = constants.states.START_MODE;
        
        if (this.event.request.type === 'LaunchRequest') {

            logHelper.logLaunchRequest(this.event.session, this.event.request);
            this.emit('welcome');

        } else if (this.event.request.type === 'IntentRequest') {

            logHelper.logReceiveIntent(this.event.session, this.event.request);

            var intentName = this.event.request.intent.name;
            this.emitWithState(intentName);

        } else {

            console.log('Unexpected request : ' + this.event.request.type);
        }
    },

    'EndSession' : function (message) {
        
        var gameSeriesType = this.attributes['currentSeries'];
        var highestScore = this.attributes['index'];
    
        logHelper.logSessionEnded(this.event.session);

        if(gameSeriesType !== null) {

            console.log("Game Series : ", gameSeriesType);
            console.log("Highest Score : ", highestScore);
            console.log("Game Levels : ", gameLevels);

            var savedLevel = 0;
            var gameLevelsParsed = {};

            if(this.attributes['gameLevels']) {

                var gameLevels = this.attributes['gameLevels'];
                console.log("Game Levels Not Empty: ", gameLevels);
                gameLevelsParsed = JSON.parse(gameLevels);
                savedLevel = gameLevelsParsed[gameSeriesType+'Level'] ? gameLevelsParsed[gameSeriesType+'Level'] : 0;
            }

            if(savedLevel < highestScore) {

                gameLevelsParsed[gameSeriesType+'Level'] = highestScore;
                
                // Save into DB
                const self = this; 
                dynamoDBHelper.create(this.event.context.System.user.userId, gameLevelsParsed, (error, data) => {
                     
                    Object.keys(self.attributes).forEach((attribute) => {
                        delete self.attributes[attribute];
                    });

                    var updatedMessage = '';

                    if(savedLevel > 0) {
                        updatedMessage += 'Congratulations, you have beaten your highest level. Your highest level is now ' + highestScore + " in " + gameSeriesType + " series. ";
                    }
                    updatedMessage += message;
                    
                    self.emit(':tell', updatedMessage);

                });

            }else {

                Object.keys(this.attributes).forEach((attribute) => {
                    delete this.attributes[attribute];
                });

                this.emit(':tell', message);    
            }
        }else {

            Object.keys(this.attributes).forEach((attribute) => {
                delete this.attributes[attribute];
            });

            this.emit(':tell', message);        
        }
    },

    'Unhandled': function() {
        
        this.handler.state = constants.states.START_MODE;

        var speechOutput = '';
        var repromptSpeech = '';

        speechOutput += constants.welcomeMessage;
        repromptSpeech += speechOutput;

        this.emit(':ask', speechOutput, repromptSpeech); 
    }
};

module.exports = eventHandlers;