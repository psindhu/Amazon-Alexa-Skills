'use strict';
var Alexa = require('alexa-sdk');
var https = require('https');

var APP_ID = "";

var SKILL_NAME = "Flower Shades";
var HELP_MESSAGE = "You can say tell me a red flower, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Goodbye!";

var allowedColors = [
    "white",
    "yellow",
    "orange",
    "red",
    "violet",
    "purple",
    "blue",
    "green",
    "black"
];

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.appId = APP_ID;

    // Fix for hardcoded context from simulator
    if(event.context && event.context.System.application.applicationId == 'applicationId'){
        event.context.System.application.applicationId = event.session.application.applicationId;
    }
    
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function getRandomFlower(eventCallback) {

    var options = {
        hostname: "s3.amazonaws.com",
        path: "/flowershades/assets/data.json",
        method: 'GET'
    };
    
    https.get(options, function (res) {
        if (res.statusCode === 200) {
            var body = '';
            res.on("data", function(chunk) {
                body += chunk;
            });
            res.on('end', function () {
                var objData = JSON.parse(body);
                eventCallback(null, objData);                    
            });
        } else {
            eventCallback(new Error('Bad status code'), null);
        }
    }).on('error', function (err) {
        eventCallback(err, null);
    });
}

var handlers = {
    'LaunchRequest': function () {

        var speechOutput = 'Hello, Welcome to Flower Shades. You can find facts about flowers with a specific color. For example, you can say tell me about a white flower.';
        var repromptSpeech = HELP_MESSAGE;

        this.emit(':ask', speechOutput, repromptSpeech);
    },
    'GetFlowerWithColorIntent': function () {

        var requestIntent = this.event.request.intent;

        getRandomFlower((error, data) => {

            if (error) {
                
                console.log("Flower Skill Error - ", JSON.stringify(error));
                
                // Validate Slot value
                var answerSlotFilled = requestIntent && requestIntent.slots && requestIntent.slots.Color && requestIntent.slots.Color.value;
                var speechOutput = "";

                if(answerSlotFilled) {

                    var selectedColor = requestIntent.slots.Color.value;
                    console.log("Flower Skill Selected Color : ", selectedColor);
                    speechOutput = 'Sorry I\'m unable to give you facts on flower with color ' + selectedColor + ". Please try again. Thank you!";

                }else {

                    speechOutput = 'Sorry I\'m unable to give you facts about flowers. Please try again. Thank you!';
                }

                this.emit(':tell', speechOutput);
                
            } else {

                console.log("Flower Skill Data - ", JSON.stringify(data));
                
                // Validate Slot value
                var answerSlotFilled = requestIntent && requestIntent.slots && requestIntent.slots.Color && requestIntent.slots.Color.value;

                if(answerSlotFilled) {

                    var selectedColor = requestIntent.slots.Color.value;
                    console.log("Flower Skill Selected Color : ", selectedColor);

                    var availableIndex = allowedColors.indexOf(selectedColor);
                    console.log("Flower Skill Allowed Colors : ", JSON.stringify(allowedColors));

                    if(availableIndex != -1) {

                        var selectedColorFacts = data[selectedColor];
                        console.log("Flower Skill Selected Color Facts : ", selectedColorFacts);

                        var factIndex = Math.floor(Math.random() * selectedColorFacts.length);
                        var randomFactItem = selectedColorFacts[factIndex];

                        var speechOutput = randomFactItem.shortDescription;
                        var cardTitle = randomFactItem.name + " (" +  randomFactItem.scientificName + ")";
                        var cardContent = randomFactItem.shortDescription;

                        var imageObj = {
                            smallImageUrl: randomFactItem.smallImageUrl,
                            largeImageUrl: randomFactItem.largeImageUrl
                        };
                        
                        this.emit(':tellWithCard', speechOutput, cardTitle, cardContent, imageObj);

                    }else {

                        var selectedColor = requestIntent.slots.Color.value;
                        console.log("Flower Skill Selected Color : ", selectedColor);
                    
                        // Not available, Retry
                        var speechOutput = 'Sorry I could not find any flower with color ' + selectedColor + ". " + HELP_MESSAGE;
                        var reprompt = HELP_REPROMPT;
                        this.emit(':ask', speechOutput, reprompt);
                    }

                }else {

                    // Not available, Retry
                    var speechOutput = 'Sorry I could not find any flowers. ' + HELP_MESSAGE;
                    var reprompt = HELP_REPROMPT;
                    this.emit(':ask', speechOutput, reprompt);

                }
            }
        }); 
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'Unhandled': function () {

        var speechOutput = 'Sorry I could not find any flowers. ' + HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);

    }
};