const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require('../../mixins/db.config');
const message = require('../../lib/message');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { uuid } = require('uuidv4');
const nodemailer = require("nodemailer");
const role = message.roles.user;
var moment = require('moment');
const stripe = require('stripe')('sk_test_0ltSf6gi0wGXVo982Afs5s6700TQU6zHck')

module.exports = {
    name: 'payment_gateway',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),
    
    model: {
        name: "activities",
        define: {
            title: Sequelize.STRING,
            description: Sequelize.STRING,
            images: Sequelize.STRING,
			activityType: Sequelize.STRING,
			letterCollected: Sequelize.STRING,
			isBestSeller: Sequelize.INTEGER,
			bestSellerDuration: Sequelize.STRING,
			bestSellerStartDate: Sequelize.STRING,
			bestSellerEndDate: Sequelize.STRING,
			suggestionHeader: Sequelize.STRING,
            status: Sequelize.INTEGER,
            createdAt : Sequelize.DATE,
            updatedAt : Sequelize.DATE
        },
        options: {}
    },

    actions: {
        payment: {
            rest: {
				method: "GET",
				path: "/payment"
            },
            async handler(ctx,res,req) {
                try{
                    // console.log("Test")                    
                    // stripe.customers.create({
                    //     name: ctx.params.name,
                    //     email:ctx.params.email,
                    //     source: ctx.params.stripeToken
                    // }).then(customer => stripe.charges.create({
                    //     amount: ctx.params.amount * 100,
                    //     currency: 'usd',
                    //     customer: customer.id,
                    //     description: 'Thank you for your generous donation.'
                    // })).then(() =>{ return({"Data":"Success"})})
                }  catch(error){
                    return error
                }
			}
        },

        value: {
            rest: {
				method: "POST",
				path: "/value"
            },
            async handler(ctx,res,req) {
                try{
                    console.log(ctx.params.name,"Dataprocess ")
                    var value=({
                    message:"successfully post"
                    })
                    return value
                }  catch(error){
                    return error
                }
			}
        },

    }
    
}
// 1.ActivityList api all data not coming for ex-rating,booked
// 2.Merchant api all data not coming
// 3.Favourite api for merchant