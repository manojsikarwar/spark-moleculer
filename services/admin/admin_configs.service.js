const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require('../../mixins/db.config');
const message = require('../../lib/message');

module.exports = {
    name: 'adminConfig',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),

    model : {
        name: "admin_config",
        define: {
            dealValidityperiod: {type: Sequelize.INTEGER, defaultValue: null},
            bestSellerDuration: {type: Sequelize.INTEGER, defaultValue: null},
            bestSellerbookingsRequired: {type: Sequelize.INTEGER, defaultValue: null},
            unlockedPromotionGracePeriod: {type: Sequelize.INTEGER, defaultValue: null},
            pointsMultiplerForPromotionUnlocked: {type: Sequelize.FLOAT, defaultValue: null},
            pointsMultiplerForBookings: {type: Sequelize.INTEGER, defaultValue: null},
            merchantActivityTerms: {type: Sequelize.STRING, defaultValue: null},
            createdBy: {type: Sequelize.INTEGER, defaultValue: null},
            updatedBy: {type: Sequelize.INTEGER, defaultValue: null},
            createdAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')},
            updatedAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')}
        },
        options: {}
    },

    actions: {
        
    }
    
}
