"use strict";

module.exports = Object.freeze({
    
    welcomeMessage : 'Welcome to Number Series Game. ',

    welcomeMessageCard : 'Welcome to Number Series Game. ',

    gameCardName : 'Number Series',

    gameName : 'Number Series',

    thankyouMessage : 'Thank you for playing Number Series. Come back to try again! ',

    //  States
    states : {
        START_MODE : '_START_MODE',
        GAME_MODE : '_GAME_MODE'
    },

    //  Speech break time
    breakTime : {
        '50' : '<break time = "50ms"/>',
        '100' : '<break time = "100ms"/>',
        '200' : '<break time = "200ms"/>',
        '250' : '<break time = "250ms"/>',
        '300' : '<break time = "300ms"/>',
        '500' : '<break time = "500ms"/>',
        '1000' : '<break time = "1000ms"/>'
    },

    // Number Series
    numberSeries : [
        "fibonacci",
        "square",
        "cube"
    ]
});