const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require('../../mixins/db.config');
const message = require('../../lib/message');
// const JoiValidator = require('../../lib/validator');
const Validator = require("fastest-validator");
const v = new Validator();
const fs = require('fs')

module.exports = {
    name: 'demo',
    mixins: [DbService],

    model: {
        name: "demo",
        define: {
            name: {type: Sequelize.STRING, defaultValue: null},
            email: {type: Sequelize.STRING, defaultValue: null},
            Mobile: {type: Sequelize.INTEGER, defaultValue: null},
            // images: {type: Sequelize.JSON, defaultValue: null},
            status: {type: Sequelize.INTEGER, defaultValue: 1},
            createdAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')},
            updatedAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')}
        }
    },

    actions: {

        testValidation: {
            rest: {
				method: "POST",
				path: "/testValidation"
            },
            params: {
                name: { type: "string", min: 5, max: 10 },
                email: { type: "email", },
                mobile: { type: "number", positive: true, integer: true, min: 10}
            },
            
            async handler(ctx) {
                const name = ctx.params.name;
                // first letter capitalize
                const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1)
                const email = ctx.params.email;
                const status = 1;
                return 'done'
             
			}
        },

        
    }
    
}
