const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require('../../mixins/db.config');
const message = require('../../lib/message');

module.exports = {
    name: 'bookings',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),

    model : {
        name: "booking",
        define: {
            userId: {type: Sequelize.INTEGER, unique: true},
            coupleId: {type: Sequelize.INTEGER, unique: true},
            activityId: {type: Sequelize.INTEGER, unique: true},
            merchantActivityId: {type: Sequelize.INTEGER, unique: true},
            outletId: {type: Sequelize.INTEGER, unique: true},
            stripeTransactionId: {type: Sequelize.STRING},
            promotionId: {type: Sequelize.INTEGER, unique: true},
            regularDealId: {type: Sequelize.INTEGER, unique: true},
            couponId: {type: Sequelize.INTEGER},
            paymentReceived: {type: Sequelize.FLOAT},
            paymentMethod: {type: Sequelize.STRING},
            pointsEarned: {type: Sequelize.INTEGER},
            pointsRedemed: {type: Sequelize.INTEGER},
            savings: {type: Sequelize.FLOAT},
            commissionEarner: {type: Sequelize.FLOAT},
            quantity: {type: Sequelize.INTEGER},
            originalPrice: {type: Sequelize.FLOAT},
            finalPrice: {type: Sequelize.FLOAT},
            dateExpired : {type: Sequelize.DATE},
            datePurchased : {type: Sequelize.DATE},
            dateRedeemed : {type: Sequelize.DATE},
            dateReserved : {type: Sequelize.DATE},
            status: {type: Sequelize.INTEGER},
            createdAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')},
            updatedAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')}
        },
        options: {}
    },

    actions: {
        
    }
    
}
