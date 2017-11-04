'use strict';

var config = require('./configuration');
var constants = require('./constants');

var speechHandlers = {
    'welcome' : function() {
        // Output welcome message
        var message = config.welcome_message + constants.breakTime['100'] +
            ' You can ask for latest Unofficial ' + constants.uscisTerm + ' News from ' + constants.dhsTerm + '. For example, you can say tell me news. ';
        var reprompt = 'You can ask for latest news for Unofficial ' + constants.uscisTerm + ' News from ' + constants.dhsTerm + '.';
        this.emit(':ask', message, reprompt);
    },
    'noNewItems' : function () {
        // Output message when no new items present
        var message = 'There are no news available at the moment. Thank you! ';
        this.handler.state = constants.states.NO_NEW_ITEM;
        this.emit(':tell', message, message);
    },
    'readPagedItem' : function (items) {

        var message = '';
        var content = '';

        // change state to FEED_MODE
        this.handler.state = constants.states.FEED_MODE;
        this.attributes['pageditem'] = items;

        items.forEach(function (feed) {

            var d = new Date(feed.date);
            var curr_date = d.getDate();
            curr_date = curr_date + "";
            if(curr_date.length == 1)
                curr_date = "0" + curr_date;
            var curr_month = d.getMonth() + 1; 
            curr_month = curr_month + "";
            if(curr_month.length  == 1)
                curr_month = "0" + curr_month;

            var curr_year = d.getFullYear();
            var date = '<say-as interpret-as="date">' + curr_year + curr_month + curr_date + '</say-as>';

            content += config.speech_style_for_numbering_feeds + " " + (feed.count + 1) + " published on " + date + ". " + feed.title + ". ";
            content += constants.breakTime['500'];
        });
        message += content;
        if (this.attributes["isFeedEnd"]) {
            message += ' No more news available. ' + constants.breakTime['200'] +
                ' You can say restart to hear the news from the beginning or say previous to hear previous news. ';
        } else {

            var subMessage = '';
            if(this.attributes["index"] > 1)  {
                subMessage = 'Or you can say "Previous" to know old news. ';
            }
            message += 'Please say give me details to know more about the news or you can say "next" for more news. ' + subMessage + 'What would you like to do? ';
        }

        // Add space with period
        message = message.replace(/\./g, '. ');
        message = message.replace(/\uscis/g, constants.uscisTerm); 
        message = message.replace(/\USCIS/g, constants.uscisTerm);

        this.emit(':ask', message, message);
    },

    'justStarted' : function () {
        // Outputs message when user says previous when already at start of feed
        var message = 'Sorry, there are no new ' + constants.uscisTerm + ' news available. ' +
            'You can say next to hear old news. ';
        var reprompt = 'You can say next to hear old news. ';
        this.emit(':ask', message, reprompt);
    },

    'alreadyEnded' : function () {
        // Outputs message when user says next when already at end of feed
        var message = 'Sorry, you have already gone through all the news. ' +
            'You can say previous to hear latest news.';
        var reprompt = 'You can say previous to hear latest news.';
        this.emit(':ask', message, reprompt);
    },

    'helpStartMode' : function () {
        // Outputs helps message when in START MODE
        var message = config.welcome_message + constants.breakTime['100'] +
            ' You can ask for latest Unofficial ' + constants.uscisTerm + ' News from ' + constants.dhsTerm + '. For example, you can say tell me news. ';
        this.emit(':ask', message, message);
    },

    'helpFeedMode' : function () {
        // Outputs helps message when in FEED MODE
        var message = 
            'You can say next or previous to navigate through the news. ' +
            constants.breakTime['100'] +
            ' And say restart to start over. ' +
            constants.breakTime['100'] +
            'You can also ask, give me details to get more information about the last read news. ' +
            constants.breakTime['100'] +
            'What would you like to do?';
        this.emit(':ask', message, message);
    },

    'readItemSpeechHelper' : function () {

        var message = '';
        var content = '';
        var cardTitle = '';
        var cardContent = '';
        
        var items = this.attributes['pageditem'];

        if(items) {

            items.forEach(function (feed) {

                var d = new Date(feed.date);
                var curr_date = d.getDate();
                curr_date = curr_date + "";
                if(curr_date.length == 1)
                    curr_date = "0" + curr_date;
                var curr_month = d.getMonth() + 1; 
                curr_month = curr_month + "";
                if(curr_month.length  == 1)
                    curr_month = "0" + curr_month;

                var curr_year = d.getFullYear();
                
                content += constants.breakTime['300'];
                content += feed.description + " ";
                content += constants.breakTime['500'];

                cardTitle = constants.cardTitle;
                cardContent += feed.title + ", " + curr_month + "-" + curr_date + "-" + curr_year + "\n";
                cardContent += feed.description + "\n";
            });
            message += content;
            if (this.attributes["isFeedEnd"]) {
                message += ' You have reached the end of the news. ' + constants.breakTime['200'] +
                    ' You can say restart to hear the news from the beginning or say previous to hear previous news. ';
            } else {
                message += 'You can say next for more. ';
            }

            // Add space with period
            message = message.replace(/\./g, '. ');
            message = message.replace(/\uscis/g, constants.uscisTerm); 
            message = message.replace(/\USCIS/g, constants.uscisTerm);

            // Add space with period
            cardContent = cardContent.replace(/\./g, '. ');

            this.emit(':askWithCard', message, message, cardTitle, cardContent, null);

        }else {

            this.emit('helpStartMode');
        }
    },
    'unhandledStartMode' : function () {
        // Help user with possible options in _FEED_MODE
        var message = 'Sorry, to hear Unofficial ' + constants.uscisTerm + ' news feed from ' + constants.dhsTerm + ', you can say give me news or tell me latest news. ';
        
        this.emit(':ask', message, message);
    },
    'unhandledFeedMode' : function () {
        // Help user with possible options in _FEED_MODE
        var message = 'Sorry, you can say next or previous to navigate through the news. ' +
            constants.breakTime['100'] +
            ' And say restart to start over. ' +
            constants.breakTime['100'] +
            'You can also ask, give me details to get more information about the last read news. ' +
            constants.breakTime['100'] +
            'What would you like to do?';
        this.emit(':ask', message, message);
    },
    'reportError' : function () {
        // Output error message and close the session
        var message = 'Sorry, there are some technical difficulties in fetching the requested information. Please try again later.';
        this.emit('EndSession', message);
    }
};

module.exports = speechHandlers;