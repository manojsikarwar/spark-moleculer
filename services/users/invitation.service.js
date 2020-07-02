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
        name: "invitation",
        define: {
            user_Id: {type: Sequelize.INTEGER, defaultValue: null},
            to_user_Id : {type: Sequelize.INTEGER, defaultValue: null},
            code:{type:Sequelize.STRING},
            status:{type:Sequelize.INTEGER},
            // isAccept:Sequelize.INTEGER,
            createdAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')},
            updatedAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')}
        },
        options: {}
    },

    actions: {
        
    }
    
}
