const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require('../../mixins/db.config');
const message = require('../../lib/message');

module.exports = {
    name: 'Coupon',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),
        
    model : {
        name: "coupon",
        define: {
            userIds: {type: Sequelize.INTEGER, defaultValue: null},
            quantity: {type: Sequelize.INTEGER, defaultValue: null},
            quantityPaidFor: {type: Sequelize.INTEGER, defaultValue: null},
            discountAmount: {type: Sequelize.FLOAT, defaultValue: null},
            discountPercentage: {type: Sequelize.FLOAT, defaultValue: null},
            couponCode: {type: Sequelize.STRING, defaultValue: null},
            expireOn: {type: Sequelize.DATE, defaultValue: null},
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