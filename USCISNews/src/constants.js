"use strict";

module.exports = Object.freeze({
    //  States
    states : {
        START_MODE : '_START_MODE',
        FEED_MODE : '_FEED_MODE',
        NO_NEW_ITEM : '_NO_NEW_ITEM'
    },

    //  Custom constants
    terminate : 'TERMINATE',

    //  Speech break time
    breakTime : {
        '50' : '<break time = "50ms"/>',
        '100' : '<break time = "100ms"/>',
        '200' : '<break time = "200ms"/>',
        '250' : '<break time = "250ms"/>',
        '300' : '<break time = "300ms"/>',
        '500' : '<break time = "500ms"/>'
    },

    uscisTerm : '<say-as interpret-as="spell-out">USCIS</say-as>',

    dhsTerm : '<say-as interpret-as="spell-out">DHS</say-as>',

    cardTitle : 'USCIS News from DHS'
});