const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require('../../mixins/db.config');
const message = require('../../lib/message');

module.exports = {
    name: 'Calendar',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),

    model : {
        name: "calendar",
        define: {
            userId: {type: Sequelize.INTEGER, defaultValue: null},
            coupleId: {type: Sequelize.INTEGER, defaultValue: null},
            activityId: {type: Sequelize.INTEGER, defaultValue: null},
            activityType: {type: Sequelize.STRING, defaultValue: null},
            outletId: {type: Sequelize.INTEGER, defaultValue: null},
            bookingId: {type: Sequelize.INTEGER, defaultValue: null},
            surprisePartner: {type: Sequelize.INTEGER, defaultValue: null},
            surpriseRevealDate: {type: Sequelize.STRING, defaultValue: null},
            clue: {type: Sequelize.STRING, defaultValue: null},
            exportCalendarType: {type: Sequelize.STRING, defaultValue: null},
            startDateTime: {type: Sequelize.DATE, defaultValue: null},
            endDateTime: {type: Sequelize.DATE, defaultValue: null},
            createdAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')},
            updatedAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')}
        },
        options: {}
    },

    actions: {
        
    }
    
}
