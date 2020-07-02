const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require('../../mixins/db.config');
const message = require('../../lib/message');

module.exports = {
    name: 'Diaries',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),
        
    model : {
        name: "diarie",
        define: {
            userId: {type: Sequelize.INTEGER, defaultValue: null},
            coupleId: {type: Sequelize.INTEGER, defaultValue: null},
            bookingId: {type: Sequelize.INTEGER, defaultValue: null},
            activityId: {type: Sequelize.INTEGER, defaultValue: null},
            calendarId: {type: Sequelize.INTEGER, defaultValue: null},
            customDiaryEntriesId: {type: Sequelize.STRING, defaultValue: null},
            rating: {type: Sequelize.FLOAT, defaultValue: null},
            review: {type: Sequelize.STRING, defaultValue: null},
            experience: {type: Sequelize.STRING, defaultValue: null},
            images: {type: Sequelize.JSON, defaultValue: null},
            likes: {type: Sequelize.INTEGER, defaultValue: null},
            startDateTime: {type: Sequelize.DATE, defaultValue: null},
            endDateTime: {type: Sequelize.DATE, defaultValue: null},
            publishDateTime: {type: Sequelize.DATE, defaultValue: null},
            privacy: {type: Sequelize.TEXT, defaultValue: null},
            createdAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')},
            updatedAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')}
        },
        options: {}
    },

    actions: {
        
    }
    
}