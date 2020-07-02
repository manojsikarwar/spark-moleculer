const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require('../../mixins/db.config');
const message = require('../../lib/message');


module.exports = {
    name: 'merchantactivitySuggetion',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),

    model: {
        name: "merchant_activities_suggetion",
        define: {
            merchantActivityId : {type: Sequelize.INTEGER, defaultValue: null},
            merchantId: {type: Sequelize.INTEGER, defaultValue: null},
            activityId: {type: Sequelize.INTEGER, defaultValue: null},
            outletIds: {type: Sequelize.INTEGER, defaultValue: null},
            createdAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')},
            updatedAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')}
        },
        options:{}
    },

    actions: {
        
    }
    
}
