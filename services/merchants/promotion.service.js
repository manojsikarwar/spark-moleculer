const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const message = require('../../lib/message');
const process = require('../../mixins/db.config');
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();
var hh = today.getHours();
var mi = today.getMinutes();
var ss = today.getSeconds();
today = yyyy + '-' + mm + '-' + dd+' '+ hh+':'+mi+':'+ss;
var time = today.toLocaleString(today);

module.exports = {
    name: 'Promotion',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),
    
    model: {
        name: "promotion",
        define: {
            merchantId:{type: Sequelize.INTEGER},
            merchantActivityId: {type: Sequelize.INTEGER},
            outletId: {type: Sequelize.INTEGER},
            title: {type: Sequelize.STRING},
			description: {type: Sequelize.STRING},
			originalPrice: {type: Sequelize.FLOAT},
			discountedPrice: {type: Sequelize.FLOAT},
            discountedPercentage: {type: Sequelize.FLOAT},
            discountAmount:{type: Sequelize.FLOAT},
            promotionalTerms:{type: Sequelize.STRING},
            startDate: {type: Sequelize.DATE},
            endDate: {type: Sequelize.DATE},
            approvedBy: {type: Sequelize.STRING},
            quantity: {type: Sequelize.STRING},
            quantityPaidFor: {type: Sequelize.INTEGER},
            status: {type: Sequelize.INTEGER},
            createdAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')},
            updatedAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')}
        },
        options: {}
    },

    actions: {

        create: {
            rest: {
				method: "POST",
				path: "/create"
            },
            params: {
                merchantId: {type: "number"},
                merchantActivityId: {type: "number"},
                outletId: {type: "array"},
                description: {type: "string"},
                originalPrice: {type: "any"},
                discountedPrice: {type: "any"},
                discountedPercentage: {type: "any"},
                discountAmount: {type: "any"},   
                promotionalTerms: {type: "array"},
                endDate: {type: "date", convert: true},
                startDate: {type: "date", convert: true},
                quantity: {type: "any"},
                quantityPaidFor: {type: "number"}     
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }
                    if(Auth.role == 1 || Auth.role == 2){
                        const merchantId = ctx.params.merchantId;
                        const merchantActivityId = ctx.params.merchantActivityId;
                        const outletId = JSON.stringify(ctx.params.outletId)
                        const title = ctx.params.title;
                        const description = ctx.params.description;
                        const originalPrice = ctx.params.originalPrice;
                        const discountedPrice = ctx.params.discountedPrice;
                        const discountedPercentage = ctx.params.discountedPercentage;
                        const discountAmount = ctx.params.discountAmount;
                        const promotionalTerms = JSON.stringify(ctx.params.promotionalTerms)
                        const startDate = ctx.params.startDate;
                        const endDate = ctx.params.endDate;
                        const approvedBy = 0;
                        const quantity = ctx.params.quantity;
                        const quantityPaidFor = ctx.params.quantityPaidFor;
                        const status = 2;
                        const adminNotes = 'none'
                        const adminId = ctx.params.adminId;
                        
                        if(adminId > 0){
                            const dupPromotion = `select * from promotions where merchantActivityId = '${merchantActivityId}' and merchantId = '${merchantId}'`;
                            const [dupPromotionress] = await this.adapter.db.query(dupPromotion)
                            if(dupPromotionress != ''){
                                return message.message.DUPFEATURED
                            }else{
                                const promotionSave = `insert into promotions(merchantId, merchantActivityId,outletId, title, description, originalPrice, discountedPrice, discountedPercentage, discountAmount, promotionalTerms, startDate, endDate, approvedBy, quantity, quantityPaidFor, status,adminNotes,adminId) values('${merchantId}','${merchantActivityId}','${outletId}','${title}','${description}','${originalPrice}','${discountedPrice}','${discountedPercentage}','${discountAmount}','${promotionalTerms}','${startDate}','${endDate}','${approvedBy}','${quantity}','${quantityPaidFor}','${status}','${adminNotes}','${adminId}')`;
                                const [promotionSaveress] = await this.adapter.db.query(promotionSave)
                                const data = {
                                    id : promotionSaveress,
                                    merchantId : merchantId,
                                    merchantActivityId: merchantActivityId,
                                    outletId: ctx.params.outletId,
                                    title: title,
                                    description: description,
                                    originalPrice: originalPrice,
                                    discountedPrice: discountedPrice,
                                    discountedPercentage: discountedPercentage,
                                    promotionalTerms: ctx.params.promotionalTerms,
                                    approvedBy: approvedBy,
                                    quantity: quantity,
                                    quantityPaidFor: quantityPaidFor,
                                    startDate: startDate,
                                    endDate: endDate,
                                    status: status,
                                    adminNotes: adminNotes,
                                    adminId : adminId
                                }
                                const successMessage = {
                                    success:true,
                                    statusCode:200,
                                    data:data,
                                    message:'Success'
                                }
                                return successMessage
                            }
                        }else{
                            const dupPromotion = `select * from promotions where merchantActivityId = '${merchantActivityId}' and merchantId = '${merchantId}'`;
                            const [dupPromotionress] = await this.adapter.db.query(dupPromotion)
                            if(dupPromotionress != ''){
                                return message.message.DUPFEATURED
                            }else{
                                const promotionSave = `insert into promotions(merchantId, merchantActivityId,outletId, title, description, originalPrice, discountedPrice, discountedPercentage, discountAmount, promotionalTerms, startDate, endDate, approvedBy, quantity, quantityPaidFor, status,adminNotes,adminId) values('${merchantId}','${merchantActivityId}','${outletId}','${title}','${description}','${originalPrice}','${discountedPrice}','${discountedPercentage}','${discountAmount}','${promotionalTerms}','${startDate}','${endDate}','${approvedBy}','${quantity}','${quantityPaidFor}','${status}','${adminNotes}','${adminId}')`;
                                const [promotionSaveress] = await this.adapter.db.query(promotionSave)
                                const data = {
                                    id : promotionSaveress,
                                    merchantId : merchantId,
                                    merchantActivityId: merchantActivityId,
                                    outletId: ctx.params.outletId,
                                    title: title,
                                    description: description,
                                    originalPrice: originalPrice,
                                    discountedPrice: discountedPrice,
                                    discountedPercentage: discountedPercentage,
                                    promotionalTerms: ctx.params.promotionalTerms,
                                    approvedBy: approvedBy,
                                    quantity: quantity,
                                    quantityPaidFor: quantityPaidFor,
                                    startDate: startDate,
                                    endDate: endDate,
                                    status: status,
                                    adminNotes: adminNotes,
                                    adminId : adminId
                                }
                                const successMessage = {
                                    success:true,
                                    statusCode:200,
                                    data:data,
                                    message:'Success'
                                }
                                return successMessage;
                            }

                        }
                        
                    }
                }catch(error){
                    const errMessage = {
                        success:false,
                        statusCode:409,
                        error:error.errors,
                    }
                    return errMessage;
                }
			}
        },

        list: {
            rest: {
				method: "POST",
				path: "/list"
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }
                    if(Auth.role == 1 || Auth.role == 2){
                        const search = ctx.params.search;
                        const offset = ctx.params.offset;
                        const orderBy = ctx.params.orderBy;
                        const order = ctx.params.order;
                        const limit = ctx.params.limit;
                        const DATA = [];
                        const merchantId = Auth.id;
                        if(search == ''){
                            const findPromotion = `SELECT p.*, a.title as activityName, a.id as activityId FROM promotions as p JOIN merchant_activities as ma on ma.id = p.merchantActivityId JOIN activities as a on a.id = ma.activityId where p.title like '%${search}%' and (p.merchantId = '${merchantId}' && p.status != '${0}') ORDER BY ${orderBy} ${order} limit ${limit} offset ${offset}`;
                            const [findPromotionress] = await this.adapter.db.query(findPromotion);
                            const count = `SELECT p.*, a.title as activityName, a.id as activityId FROM promotions as p JOIN merchant_activities as ma on ma.id = p.merchantActivityId JOIN activities as a on a.id = ma.activityId where p.status != '${0}'`;
                            const [countress] = await this.adapter.db.query(count);
                            if(findPromotionress == ''){
                                const successMessage = {
                                    success:true,
                                    statusCode:200,
                                    totalCount:0,
                                    data:findPromotionress
                                }
                                return successMessage;
                            }else {
                                for(let Pro of findPromotionress){
                                    const data = {
                                        "id": Pro.id,
                                        "merchantId": Pro.merchantId,
                                        "merchantActivityId": Pro.merchantActivityId,
                                        "outletId": Pro.outletId,
                                        "title": Pro.title,
                                        "description": Pro.description,
                                        "originalPrice": Pro.originalPrice,
                                        "discountedPrice": Pro.discountedPrice,
                                        "discountedPercentage": Pro.discountedPercentage,
                                        "discountAmount": Pro.discountAmount,
                                        "promotionalTerms": Pro.promotionalTerms,
                                        "startDate": Pro.startDate,
                                        "endDate": Pro.endDate,
                                        "approvedBy": Pro.approvedBy,
                                        "quantity": Pro.quantity,
                                        "quantityPaidFor": Pro.quantityPaidFor,
                                        "status": Pro.status,
                                        "createdAt": Pro.createdAt,
                                        "updatedAt": Pro.updatedAt,
                                        "activityName": Pro.activityName,
                                        "activityId": Pro.activityId,
                                        // "ticketClaimed":"NA"
                                    }
                                    DATA.push(data)
                                }
                                const successMessage = {
                                    success:true,
                                    statusCode:200,
                                    totalCount:countress.length,
                                    data:DATA
                                }
                                return successMessage;
                            }
                        }else{
                            const findPromotion = `SELECT p.*, a.title as activityName, a.id as activityId FROM promotions as p JOIN merchant_activities as ma on ma.id = p.merchantActivityId JOIN activities as a on a.id = ma.activityId where p.title like '%${search}%' and (p.merchantId = '${merchantId}' && p.status != '${0}') ORDER BY ${orderBy} ${order} limit ${limit} offset ${offset}`;
                            const [findPromotionress] = await this.adapter.db.query(findPromotion);
                            const count = `SELECT p.*, a.title as activityName, a.id as activityId FROM promotions as p JOIN merchant_activities as ma on ma.id = p.merchantActivityId JOIN activities as a on a.id = ma.activityId where p.status != '${0}'`;
                            const [countress] = await this.adapter.db.query(count);
                            if(findPromotionress == ''){
                                const successMessage = {
                                    success:true,
                                    statusCode:200,
                                    totalCount:0,
                                    data:findPromotionress
                                }
                                return successMessage;
                            }else {
                                for(let Pro of findPromotionress){
                                    const data = {
                                        "id": Pro.id,
                                        "merchantId": Pro.merchantId,
                                        "merchantActivityId": Pro.merchantActivityId,
                                        "outletId": Pro.outletId,
                                        "title": Pro.title,
                                        "description": Pro.description,
                                        "originalPrice": Pro.originalPrice,
                                        "discountedPrice": Pro.discountedPrice,
                                        "discountedPercentage": Pro.discountedPercentage,
                                        "discountAmount": Pro.discountAmount,
                                        "promotionalTerms": Pro.promotionalTerms,
                                        "startDate": Pro.startDate,
                                        "endDate": Pro.endDate,
                                        "approvedBy": Pro.approvedBy,
                                        "quantity": Pro.quantity,
                                        "quantityPaidFor": Pro.quantityPaidFor,
                                        "status": Pro.status,
                                        "createdAt": Pro.createdAt,
                                        "updatedAt": Pro.updatedAt,
                                        "activityName": Pro.activityName,
                                        "activityId": Pro.activityId,
                                        // "ticketClaimed":"NA"
                                    }
                                    DATA.push(data)
                                }
                                const successMessage = {
                                    success:true,
                                    statusCode:200,
                                    totalCount:countress.length,
                                    data:DATA
                                }
                                return successMessage;
                            }
                        }
                    }else{
                        return message.message.PERMISSIONDENIDE
                    }
                  
                }catch(error){
                    const errMessage = {
                        success:false,
                        statusCode:409,
                        error:error.errors,
                    }
                    return errMessage;
                }
			}
        },

    }
    
}
