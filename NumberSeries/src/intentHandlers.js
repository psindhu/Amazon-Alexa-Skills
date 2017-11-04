'use strict';

var config = require('./configuration');
var constants = require('./constants');
var dynamoDBHelper = require('./dynamoDBHelper');

var intentHandlers = {

    'welcome' : function() {
        
        var speechOutput = '';
        var repromptSpeech = '';
        var cardTitle = constants.gameCardName;
        var cardContent = '';

        speechOutput += constants.welcomeMessage + constants.breakTime['100'] ;
        speechOutput += 'This is an number series game which you play to beat your own score. You have different types of number series to choose from. Available types are Fibonacci, Square and Cube. Say "Start Fibonacci" to play the game with Fibonacci series or say "Help" for assistance. ';
        speechOutput += 'What would you like to do? ';
        repromptSpeech += 'Say "Help" to know about how to play this game. ';    
        cardContent += constants.welcomeMessageCard + 'You have different types of number series like - Fibonacci, Square and Cube. ' + 'Say "Start Fibonacci" to play Fibonacci game or say "Help" to know about how to play this game. ';

        this.emit(':askWithCard', speechOutput, repromptSpeech, cardTitle, cardContent);
    },

    'restartGame': function() {

        this.handler.state = constants.states.START_MODE;

        Object.keys(this.attributes).forEach((attribute) => {
            delete this.attributes[attribute];
        });

        this.emit('welcome');
    },

    'startGame': function() {

        var requestIntent = this.event.request.intent;
        var startGameTxt = requestIntent.slots.Start.value;
        
        var speechOutput = '';
        var repromptSpeech = '';
        var cardTitle = '';
        var cardContent = '';
        var isCard = false;

        if(startGameTxt === null) {

            // Show help
            speechOutput += 'Sorry, I could not understand. Please say "Start Fibonacci" or "Play Fibonacci" to begin a new game. ';
            repromptSpeech += 'Please say "Start Fibonacci" or "Play Fibonacci" to begin a new game. ';

            this.emit(':ask', speechOutput, repromptSpeech);

        }else {


            var seriesTypeTxt = requestIntent.slots.Series.value;

            if(seriesTypeTxt === null) {

                // Show help
                speechOutput += 'Sorry, I could not understand. Please say "Start Fibonacci" or "Play Fibonacci" to begin a new game with Fibonacci Series. ';
                repromptSpeech += 'Please say "Start Fibonacci" or "Play Fibonacci" to begin a new game with Fibonacci Series. ';
                this.emit(':ask', speechOutput, repromptSpeech);

                return;
            }

            seriesTypeTxt = seriesTypeTxt.toLowerCase();
            console.log("Series : ", seriesTypeTxt);

            var availableIndex = constants.numberSeries.indexOf(seriesTypeTxt);
            if(availableIndex == -1) {  

                // Show help
                speechOutput += 'Please retry with a different number series. For example, you can say Start Square or Start Cube. ';
                speechOutput += 'Or you can say Help for assistance. What would you like to do? ';
                repromptSpeech += speechOutput;
                this.emit(':ask', speechOutput, repromptSpeech);

                return;
            }

            this.attributes['seriesText'] = '';

            const self = this;
            dynamoDBHelper.read(this.event.context.System.user.userId, (error, data) => {
                    
                if(error) {

                    console.log('Item Read Error');

                }else {

                    if(Object.keys(data).length === 0 && data.constructor === Object) {

                        console.log('Item empty');

                    }else {
                        
                        console.log('Item found : ', JSON.stringify(data));

                        var itemData = data;

                        if(itemData.Item.gameLevels) {

                            self.attributes['gameLevels'] = itemData.Item.gameLevels.S
                            console.log('Game Levels Saved : ', self.attributes['gameLevels'] );

                            var gameLevelsParsed = JSON.parse(self.attributes['gameLevels']);

                            var seriesData = seriesTypeTxt+'Level';
                            console.log('Series Key : ', seriesData);
                            if(gameLevelsParsed[seriesData]) 
                                self.attributes[seriesData] = gameLevelsParsed[seriesData];

                            console.log('Series Key Saved : ', self.attributes[seriesData]);
                        }
                    }
                }

                self.attributes['currentSeries'] = seriesTypeTxt;

                // Random Check to see if Alexa wins TOSS
                var randomAlexaWinToss = Math.floor(Math.random() * 2);
                
                if(randomAlexaWinToss === 1) {

                    self.attributes['errorCount']  = 0;
                    self.handler.state = constants.states.GAME_MODE;

                    if(seriesTypeTxt === 'fibonacci') {

                        self.attributes['currentNo'] = 0;
                        self.attributes['index'] = 1;

                        if(self.attributes['fibonacciLevel'])  {
                            speechOutput += 'Your highest level in Fibonacci Series is ' + self.attributes['fibonacciLevel'] + ". "; 
                            speechOutput += constants.breakTime['1000'];

                            cardTitle = 'Highest Level';
                            cardContent = 'Your highest level in Fibonacci Series is ' + self.attributes['fibonacciLevel'] + ". \n\n";

                            isCard = true;
                        }

                        speechOutput += 'Alexa has started the game. You can proceed with next number in Fibonacci series once Alexa has answered. Or say "Help" for assistance. ' ;
                        speechOutput += constants.breakTime['1000'];
                        speechOutput += this.attributes['currentNo'];
                        repromptSpeech += speechOutput;

                        this.attributes['seriesText'] += this.attributes['currentNo'];
                        cardContent += 'Fibonacci Series: ' + this.attributes['seriesText'];

                    }else if(seriesTypeTxt === 'square') {

                        self.attributes['currentNo'] = 1;
                        self.attributes['index'] = 1;

                        if(self.attributes['squareLevel'])  {

                            speechOutput += 'Your highest level in Square Series is ' + self.attributes['squareLevel'] + ". "; 
                            speechOutput += constants.breakTime['1000'];

                            cardTitle = 'Highest Level';
                            cardContent = 'Your highest level in Square Series is ' + self.attributes['squareLevel'] + ". \n\n";

                            isCard = true;
                        }

                        speechOutput += 'Alexa has started the game. You can proceed with next number in Square series once Alexa has answered. Or say "Help" for assistance. ' ;
                        speechOutput += constants.breakTime['1000'];
                        speechOutput += this.attributes['currentNo'];
                        repromptSpeech += speechOutput;

                        this.attributes['seriesText'] += this.attributes['currentNo'];
                        cardContent += 'Square Series: ' + this.attributes['seriesText'];

                    }else if(seriesTypeTxt === 'cube') {

                        self.attributes['currentNo'] = 1;
                        self.attributes['index'] = 1;

                        if(self.attributes['cubeLevel'])  {
                            
                            speechOutput += 'Your highest level in Cube Series is ' + self.attributes['cubeLevel'] + ". "; 
                            speechOutput += constants.breakTime['1000'];

                            cardTitle = 'Highest Level';
                            cardContent = 'Your highest level in Cube Series is ' + self.attributes['cubeLevel'] + ". \n\n";

                            isCard = true;
                        }

                        speechOutput += 'Alexa has started the game. You can proceed with next number in Cube series once Alexa has answered. Or say "Help" for assistance. ' ;
                        speechOutput += constants.breakTime['1000'];
                        speechOutput += this.attributes['currentNo'];
                        repromptSpeech += speechOutput;

                        this.attributes['seriesText'] += this.attributes['currentNo'];
                        cardContent += 'Cube Series: ' + this.attributes['seriesText'];

                    }

                }else {

                    self.attributes['errorCount']  = 0;
                    self.handler.state = constants.states.GAME_MODE;
                    self.attributes['index'] = 0;

                    if(seriesTypeTxt === 'fibonacci') {
                    
                        if(self.attributes['fibonacciLevel'])  {
                            speechOutput += 'Your highest level in Fibonacci Series is ' + self.attributes['fibonacciLevel'] + ". "; 
                            speechOutput += constants.breakTime['1000'];

                            cardTitle = 'Highest Level';
                            cardContent = 'Your highest level in Fibonacci Series is ' + self.attributes['fibonacciLevel'] + ". ";

                            isCard = true;
                        }

                        speechOutput += 'You can start the game with the first number in Fibonacci series. Please say the number. Or say "Help" for assistance. ';
                        repromptSpeech += speechOutput;

                    }else if(seriesTypeTxt === 'square') {

                        if(self.attributes['squareLevel'])  {
                            speechOutput += 'Your highest level in Square Series is ' + self.attributes['squareLevel'] + ". "; 
                            speechOutput += constants.breakTime['1000'];

                            cardTitle = 'Highest Level';
                            cardContent = 'Your highest level in Square Series is ' + self.attributes['squareLevel'] + ". ";

                            isCard = true;
                        }

                        speechOutput += 'You can start the game with the first number in Square series. Please say the number. Or say "Help" for assistance. ';
                        repromptSpeech += speechOutput;

                    }else if(seriesTypeTxt === 'cube') {

                        if(self.attributes['cubeLevel'])  {
                            speechOutput += 'Your highest level in Cube Series is ' + self.attributes['cubeLevel'] + ". "; 
                            speechOutput += constants.breakTime['1000'];

                            cardTitle = 'Highest Level';
                            cardContent = 'Your highest level in Cube Series is ' + self.attributes['cubeLevel'] + ". ";

                            isCard = true;
                        }

                        speechOutput += 'You can start the game with the first number in Cube series. Please say the number. Or say "Help" for assistance. ';
                        repromptSpeech += speechOutput;
                    }
                }

                if(isCard) {

                    self.emit(':askWithCard', speechOutput, repromptSpeech, cardTitle, cardContent);

                }else {

                    self.emit(':ask', speechOutput, repromptSpeech);    
                }
            });
        }
    },

    'inputChoice': function() {

        var requestIntent = this.event.request.intent;
        var numberInput = requestIntent.slots.Input.value;

        var speechOutput = '';
        var repromptSpeech = '';
        
        var cardTitle = '';
        var cardContent = '';
        var isCard = false;

        if(numberInput == null) {

            // Show help
            speechOutput += 'Please retry with a different number in series. ';
            speechOutput += 'Or you can say Help for assistance. What would you like to do? ';
            repromptSpeech = speechOutput;
            this.emit(':ask', speechOutput, repromptSpeech);

            return;
        }

        numberInput = parseInt(requestIntent.slots.Input.value);
        console.log("Number in series : ", numberInput);

        var isEndGame = false;

        if(this.attributes['currentSeries'] === 'fibonacci') {

            cardTitle = 'Fibonacci Series';

            if(this.attributes['index'] === 0) {

                // Started by user
                if(numberInput === 0) {

                    // First number is correct 
                    this.attributes['currentNo'] = numberInput;
                    this.attributes['nextNo'] = 1;
                    this.attributes['index'] += 2;

                    this.attributes['errorCount'] = 0;

                    speechOutput += constants.breakTime['1000'];
                    speechOutput += this.attributes['nextNo'];
                    repromptSpeech = speechOutput;

                    this.attributes['seriesText'] += this.attributes['currentNo'] + ', ' +  this.attributes['nextNo'];
                    isCard = true;
                    cardContent += 'Fibonacci Series: ' + this.attributes['seriesText'];

                }else {

                    // Error in first number
                    this.attributes['errorCount']++;

                    if(this.attributes['errorCount'] === 3) {

                        isEndGame = true;
                        speechOutput += "Sorry, looks like you have lost your chance here. Please try again later. ";
                         
                    }else {

                        speechOutput += "First number in fibonacci series is not correct. Try Again or say 'Stop' to end game. ";
                        repromptSpeech = speechOutput;    
                    }
                }


            }else if(this.attributes['index'] === 1) {

                // Started by Alexa
                // Second Number
                if(numberInput === 1) {

                    // Second number is correct 
                    this.attributes['prevNo'] = 0;
                    this.attributes['currentNo'] = numberInput;
                    this.attributes['nextNo'] = parseInt(this.attributes['prevNo']) + parseInt(this.attributes['currentNo']);
                    this.attributes['index'] += 2;

                    this.attributes['errorCount'] = 0;

                    speechOutput += constants.breakTime['1000'];
                    speechOutput += this.attributes['nextNo'];
                    repromptSpeech = speechOutput;

                    this.attributes['seriesText'] += ', ' + this.attributes['currentNo'] + ', ' + this.attributes['nextNo'];
                    isCard = true;
                    cardContent += 'Fibonacci Series: ' + this.attributes['seriesText'];

                }else {

                    // Error in second number
                    this.attributes['errorCount']++;

                    if(this.attributes['errorCount'] === 3) {

                        isEndGame = true;
                        speechOutput += "Sorry, looks like you have lost your chance here. Please try again later. ";
                         
                    }else {

                        speechOutput += "Second number following " + this.attributes['currentNo'] +" in fibonacci series is not correct. Try Again or say 'Stop' to end game. Or say 'Help' for assistance. ";
                        repromptSpeech = speechOutput;
                    }   
                }

            }else {

                // 
                var expectedNo = parseInt(this.attributes['currentNo']) + parseInt(this.attributes['nextNo']);

                if(numberInput === expectedNo) {


                    this.attributes['prevNo'] = this.attributes['nextNo'];
                    this.attributes['currentNo'] = numberInput;
                    this.attributes['nextNo'] = parseInt(this.attributes['prevNo']) + parseInt(this.attributes['currentNo']);
                    this.attributes['index'] += 2;

                    this.attributes['errorCount'] = 0;

                    speechOutput += constants.breakTime['1000'];
                    speechOutput += this.attributes['nextNo'];
                    repromptSpeech = speechOutput;

                    this.attributes['seriesText'] += ', ' + this.attributes['currentNo'] + ', ' + this.attributes['nextNo'];
                    isCard = true;
                    cardContent += 'Fibonacci Series: ' + this.attributes['seriesText'];

                }else {

                    // Error in next number
                    this.attributes['errorCount']++;

                    if(this.attributes['errorCount'] === 3) {

                        isEndGame = true;
                        speechOutput += "Sorry, looks like you have lost your chance here. Please try again later. ";
                         
                    }else {

                        speechOutput += "Next number following " + this.attributes['nextNo'] +" in fibonacci series is not correct. Try Again or say 'Stop' to end game. Or say 'Help' for assistance. ";
                        repromptSpeech = speechOutput;
                    }
                }
            }
            
        }else if(this.attributes['currentSeries'] === 'square') {

            cardTitle = 'Square Series';

            if(this.attributes['index'] === 0) {

                // Started by user
                if(numberInput === 1) {

                    // First number is correct 
                    this.attributes['currentNo'] = numberInput;
                    this.attributes['nextNo'] = Math.pow((numberInput + 1), 2);
                    this.attributes['index'] += 2;

                    this.attributes['errorCount'] = 0;

                    speechOutput += constants.breakTime['1000'];
                    speechOutput += this.attributes['nextNo'];
                    repromptSpeech = speechOutput;

                    this.attributes['seriesText'] += this.attributes['currentNo'] + ', ' +  this.attributes['nextNo'];
                    isCard = true;
                    cardContent += 'Square Series: ' + this.attributes['seriesText'];

                }else {

                    // Error in first number
                    this.attributes['errorCount']++;

                    if(this.attributes['errorCount'] === 3) {

                        isEndGame = true;
                        speechOutput += "Sorry, looks like you have lost your chance here. Please try again later. ";
                         
                    }else {

                        speechOutput += "First number in square series is not correct. Try Again or say 'Stop' to end game. ";
                        repromptSpeech = speechOutput;    
                    }
                }


            }else if(this.attributes['index'] === 1) {

                // Started by Alexa
                // Second Number
                if(numberInput === 4) {

                    // Second number is correct 
                    this.attributes['prevNo'] = 0;
                    this.attributes['currentNo'] = numberInput;
                    this.attributes['nextNo'] =  Math.pow((Math.sqrt(parseInt(this.attributes['currentNo'])) + 1), 2);
                    this.attributes['index'] += 2;

                    this.attributes['errorCount'] = 0;

                    speechOutput += constants.breakTime['1000'];
                    speechOutput += this.attributes['nextNo'];
                    repromptSpeech = speechOutput;

                    this.attributes['seriesText'] += ', ' + this.attributes['currentNo'] + ', ' + this.attributes['nextNo'];
                    isCard = true;
                    cardContent += 'Square Series: ' + this.attributes['seriesText'];

                }else {

                    // Error in second number
                    this.attributes['errorCount']++;

                    if(this.attributes['errorCount'] === 3) {

                        isEndGame = true;
                        speechOutput += "Sorry, looks like you have lost your chance here. Please try again later. ";
                         
                    }else {

                        speechOutput += "Second number following " + this.attributes['currentNo'] +" in square series is not correct. Try Again or say 'Stop' to end game. Or say 'Help' for assistance. ";
                        repromptSpeech = speechOutput;
                    }   
                }

            }else {

                // 
                var expectedNo = Math.pow((Math.sqrt(parseInt(this.attributes['nextNo'])) + 1), 2);

                if(numberInput === expectedNo) {


                    this.attributes['prevNo'] = this.attributes['nextNo'];
                    this.attributes['currentNo'] = numberInput;
                    this.attributes['nextNo'] = Math.pow((Math.sqrt(parseInt(this.attributes['currentNo'])) + 1), 2);
                    this.attributes['index'] += 2;

                    this.attributes['errorCount'] = 0;

                    speechOutput += constants.breakTime['1000'];
                    speechOutput += this.attributes['nextNo'];
                    repromptSpeech = speechOutput;

                    this.attributes['seriesText'] += ', ' + this.attributes['currentNo'] + ', ' + this.attributes['nextNo'];
                    isCard = true;
                    cardContent += 'Square Series: ' + this.attributes['seriesText'];

                }else {

                    // Error in next number
                    this.attributes['errorCount']++;

                    if(this.attributes['errorCount'] === 3) {

                        isEndGame = true;
                        speechOutput += "Sorry, looks like you have lost your chance here. Please try again later. ";
                         
                    }else {

                        speechOutput += "Next number following " + this.attributes['nextNo'] +" in square series is not correct. Try Again or say 'Stop' to end game. Or say 'Help' for assistance. ";
                        repromptSpeech = speechOutput;
                    }
                }
            }

        }else if(this.attributes['currentSeries'] === 'cube') {

            cardTitle = 'Cube Series';

            if(this.attributes['index'] === 0) {

                // Started by user
                if(numberInput === 1) {

                    // First number is correct 
                    this.attributes['currentNo'] = numberInput;
                    this.attributes['nextNo'] = Math.pow((numberInput + 1), 3);
                    this.attributes['index'] += 2;

                    this.attributes['errorCount'] = 0;

                    speechOutput += constants.breakTime['1000'];
                    speechOutput += this.attributes['nextNo'];
                    repromptSpeech = speechOutput;

                    this.attributes['seriesText'] += this.attributes['currentNo'] + ', ' +  this.attributes['nextNo'];
                    isCard = true;
                    cardContent += 'Cube Series: ' + this.attributes['seriesText'];

                }else {

                    // Error in first number
                    this.attributes['errorCount']++;

                    if(this.attributes['errorCount'] === 3) {

                        isEndGame = true;
                        speechOutput += "Sorry, looks like you have lost your chance here. Please try again later. ";
                         
                    }else {

                        speechOutput += "First number in cube series is not correct. Try Again or say 'Stop' to end game. ";
                        repromptSpeech = speechOutput;    
                    }
                }


            }else if(this.attributes['index'] === 1) {

                // Started by Alexa
                // Second Number
                if(numberInput === 8) {

                    // Second number is correct 
                    this.attributes['prevNo'] = 0;
                    this.attributes['currentNo'] = numberInput;
                    this.attributes['nextNo'] =  Math.pow(Math.pow(parseInt(this.attributes['currentNo']), 1/3) + 1, 3);
                    this.attributes['index'] += 2;

                    this.attributes['errorCount'] = 0;

                    speechOutput += constants.breakTime['1000'];
                    speechOutput += this.attributes['nextNo'];
                    repromptSpeech = speechOutput;

                    this.attributes['seriesText'] += ', ' + this.attributes['currentNo'] + ', ' + this.attributes['nextNo'];
                    isCard = true;
                    cardContent += 'Cube Series: ' + this.attributes['seriesText'];

                }else {

                    // Error in second number
                    this.attributes['errorCount']++;

                    if(this.attributes['errorCount'] === 3) {

                        isEndGame = true;
                        speechOutput += "Sorry, looks like you have lost your chance here. Please try again later. ";
                         
                    }else {

                        speechOutput += "Second number following " + this.attributes['currentNo'] +" in cube series is not correct. Try Again or say 'Stop' to end game. Or say 'Help' for assistance. ";
                        repromptSpeech = speechOutput;
                    }   
                }

            }else {

                // 
                var expectedNo = Math.pow(Math.pow(parseInt(this.attributes['nextNo']), 1/3) + 1, 3);

                if(numberInput === expectedNo) {


                    this.attributes['prevNo'] = this.attributes['nextNo'];
                    this.attributes['currentNo'] = numberInput;
                    this.attributes['nextNo'] = Math.pow(Math.pow(parseInt(this.attributes['currentNo']), 1/3) + 1, 3);
                    this.attributes['index'] += 2;

                    this.attributes['errorCount'] = 0;

                    speechOutput += constants.breakTime['1000'];
                    speechOutput += this.attributes['nextNo'];
                    repromptSpeech = speechOutput;

                    this.attributes['seriesText'] += ', ' + this.attributes['currentNo'] + ', ' + this.attributes['nextNo'];
                    isCard = true;
                    cardContent += 'Cube Series: ' + this.attributes['seriesText'];

                }else {

                    // Error in next number
                    this.attributes['errorCount']++;

                    if(this.attributes['errorCount'] === 3) {

                        isEndGame = true;
                        speechOutput += "Sorry, looks like you have lost your chance here. Please try again later. ";
                         
                    }else {

                        speechOutput += "Next number following " + this.attributes['nextNo'] +" in cube series is not correct. Try Again or say 'Stop' to end game. Or say 'Help' for assistance. ";
                        repromptSpeech = speechOutput;
                    }
                }
            }
            
        }else {

            speechOutput += 'Please retry with a different number series. For example, you can say "Start Square" or "Start Cube". ';
            speechOutput += 'Or you can say Help for assistance. What would you like to do? ';
            repromptSpeech += speechOutput;
        }

        if(isEndGame === true) {
            this.emit('EndSession', speechOutput);
        }else {

            if(isCard) {

                this.emit(':askWithCard', speechOutput, repromptSpeech, cardTitle, cardContent);

            }else {

                this.emit(':ask', speechOutput, repromptSpeech);        
            }
        }
        
    },

    'helpStartMode' : function () {

        // Outputs helps message when in START MODE
        var speechOutput = constants.welcomeMessage + constants.breakTime['100'];
        speechOutput += constants.gameName + ' game teaches Mathematical Series and lets you compete against your own score. ' + constants.breakTime['100'];
        speechOutput += 'The game provides options to play different mathematical series. ' + constants.breakTime['100'];
        speechOutput += 'Series currently available are Fibonacci, Square and Cube. More series will be added later. ' + constants.breakTime['100'];
        speechOutput += 'During the game you can say help to know about the Mathematical Series. ' + constants.breakTime['100'];
        speechOutput += 'You will get 3 chances to correctly tell the next number is selected series. In the end, your highest level will be saved. You can come back later to beat your own score and push your limits. ' + constants.breakTime['100'];
        speechOutput += 'Let\'s begin the game. ' + constants.breakTime['100'];
        speechOutput += 'You can begin the game by choosing the Series. For example, you can say "Play Fibonacci". ' + constants.breakTime['100'];
        speechOutput += 'What would you like to do? ';

        var reprompt = speechOutput;
        this.emit(':ask', speechOutput, reprompt);
    },

    'helpGameMode' : function () {
        
        // Outputs helps message when in GAME MODE
        // TODO: Different help based on Game type - Fibonacci, Square, Cube

        var message = '';
        if(this.attributes['currentSeries'] === 'fibonacci') {

            message += 'Fibonacci is a series of numbers in which each number is the sum of the two preceding numbers. ';
            message += constants.breakTime['500'] + 'The simplest is the series 0, 1, 1, 2, 3, 5, 8, etc. ';
            message += constants.breakTime['500'];

            if(this.attributes['index'] === 0) {
                message += 'Please say the first number in Fibonacci series to begin the game. ';
            }else if(this.attributes['index'] === 1) {
                message += 'Please say the second number following '+ this.attributes['currentNo'] +' in Fibonacci series to begin the game. ';
            }else {
                message += 'Please say the next number following '+ this.attributes['nextNo'] +' in Fibonacci series to begin the game. ';
            }
        }else if(this.attributes['currentSeries'] === 'square') {

            message += 'Square series is a series of natural numbers to the power of 2. ';
            message += constants.breakTime['500'] + 'The series is 1, 4, 9, 16, 25, etc. ';
            message += constants.breakTime['500'];

            if(this.attributes['index'] === 0) {
                message += 'Please say the first number in Square series to begin the game. ';
            }else if(this.attributes['index'] === 1) {
                message += 'Please say the second number following '+ this.attributes['currentNo'] +' in Square series to begin the game. ';
            }else {
                message += 'Please say the next number following '+ this.attributes['nextNo'] +' in Square series to begin the game. ';
            }

        }else if(this.attributes['currentSeries'] === 'cube') {

            message += 'Cube series is a series of natural numbers to the power of 3. ';
            message += constants.breakTime['500'] + 'The series is 1, 8, 27, 64, 125, etc. ';
            message += constants.breakTime['500'];

            if(this.attributes['index'] === 0) {
                message += 'Please say the first number in Cube series to begin the game. ';
            }else if(this.attributes['index'] === 1) {
                message += 'Please say the second number following '+ this.attributes['currentNo'] +' in Cube series to begin the game. ';
            }else {
                message += 'Please say the next number following '+ this.attributes['nextNo'] +' in Cube series to begin the game. ';
            }
        }

        message += 'What is the number? ';

        this.emit(':ask', message, message);
    },

    'unhandledStartMode' : function () {

        console.log("Intent Start ", JSON.stringify(this.event.request));

        if (this.event.request.type === 'LaunchRequest') {

            this.handler.state = constants.states.START_MODE;
            this.emit('welcome');

        }else {

            var message = constants.welcomeMessage + constants.breakTime['100'];
            message += 'Say "Play Fibonacci" to begin new game with Fibonacci Series or say "Help" for assistance. You can also say "Stop" to end the game. What would you like to do? ';   
            
            this.emit(':ask', message, message);    
        }
    },

    'unhandledGameMode' : function() {

        console.log("Intent Game ", JSON.stringify(this.event.request));

        if (this.event.request.type === 'LaunchRequest') {

            this.handler.state = constants.states.START_MODE;
            this.emit('welcome');

        }else {

            var message = 'Please say "Help" for assistance or "Stop" to end the game. What would you like to do? ';
            this.emit(':ask', message, message);    
        }

    }
};

module.exports = intentHandlers;