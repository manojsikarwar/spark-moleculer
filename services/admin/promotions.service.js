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
    name: 'adminPromotion',
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
                    if(Auth.role == 1){
                        const search = ctx.params.search;
                        const offset = ctx.params.offset;
                        const orderBy = ctx.params.orderBy;
                        const order = ctx.params.order;
                        const limit = ctx.params.limit;
                        const status = ctx.params.status;
                        const DATA = [];
                        const Activcat = [];

                        if(search == ''){
                            const findPromotion = `SELECT p.*,m.merchantName, a.title as activityName, a.id as activityId,a.letterCollected FROM promotions as p JOIN merchant_activities as ma on ma.id = p.merchantActivityId JOIN activities as a on a.id = ma.activityId JOIN merchants as m on m.id = p.merchantId where p.title like '%${search}%' and (p.status = '${status}' && p.endDate >= '${time}') ORDER BY ${orderBy} ${order} limit ${limit} offset ${offset}`;
                            const [findPromotionress] = await this.adapter.db.query(findPromotion);
                            const count = `SELECT p.*, a.title as activityName, a.id as activityId FROM promotions as p JOIN merchant_activities as ma on ma.id = p.merchantActivityId JOIN activities as a on a.id = ma.activityId where p.status = '${status}'`;
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
                                    const categories = `select ac.id as categor_id,ac.name as category_name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${Pro.activityId}'`
                                    const [categoriesress] = await this.adapter.db.query(categories);
                                   
                                    const data = {
                                        "id": Pro.id,
                                        "merchantId": Pro.merchantId,
                                        "merchantName":Pro.merchantName,
                                        "merchantActivityId": Pro.merchantActivityId,
                                        "outletId": JSON.parse(Pro.outletId),
                                        "title": Pro.title,
                                        "description": Pro.description,
                                        "originalPrice": Pro.originalPrice,
                                        "discountedPrice": Pro.discountedPrice,
                                        "discountedPercentage": Pro.discountedPercentage,
                                        "discountAmount": Pro.discountAmount,
                                        "promotionalTerms": JSON.parse(Pro.promotionalTerms),
                                        "startDate": Pro.startDate,
                                        "endDate": Pro.endDate,
                                        "approvedBy": Pro.approvedBy,
                                        "quantity": Pro.quantity,
                                        "quantityPaidFor": Pro.quantityPaidFor,
                                        "status": Pro.status,
                                        "createdAt": Pro.createdAt,
                                        "updatedAt": Pro.updatedAt,
                                        "activityId" : Pro.activityId,
                                        "activityName":Pro.activityName,
                                        "activityId" : Pro.activityId,
                                        "letterCollected":Pro.letterCollected,
                                        "activityName":Pro.activityName,
                                        "categories":categoriesress,
                                        "ticketClaimed":"NA"
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
                            const findPromotion = `SELECT p.*, a.title as activityName, a.id as activityId FROM promotions as p JOIN merchant_activities as ma on ma.id = p.merchantActivityId JOIN activities as a on a.id = ma.activityId where p.title like '%${search}%' and p.status = '${status}' ORDER BY ${orderBy} ${order} limit ${limit} offset ${offset}`;
                            const [findPromotionress] = await this.adapter.db.query(findPromotion);

                            const count = `SELECT p.*, a.title as activityName, a.id as activityId FROM promotions as p JOIN merchant_activities as ma on ma.id = p.merchantActivityId JOIN activities as a on a.id = ma.activityId where p.status = '${status}'`;
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
                                        "outletId": JSON.parse(Pro.outletId),
                                        "title": Pro.title,
                                        "description": Pro.description,
                                        "originalPrice": Pro.originalPrice,
                                        "discountedPrice": Pro.discountedPrice,
                                        "discountedPercentage": Pro.discountedPercentage,
                                        "discountAmount": Pro.discountAmount,
                                        "promotionalTerms": JSON.parse(Pro.promotionalTerms),
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
                                        "ticketClaimed":"NA"
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

        active: {
            rest: {
                method: "POST",
                path: "/active"
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    const id = ctx.params.id;
                    const status = ctx.params.status;
                    const adminNotes = ctx.params.adminNotes;
    
                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }
    
                    if(Auth.role == 1 || Auth.role == 2){
                        const Promotionlist = `select * from promotions where id = '${id}'`;
                        const [Promotionlistress] = await this.adapter.db.query(Promotionlist);
                            if(Promotionlistress != ''){
                                    // if(status == 1){
                                        const updatePromotion = `update promotions set status = '${status}',adminNotes = '${adminNotes}' where id = '${id}' `
                                        const [PromotionUpdate] = await this.adapter.db.query(updatePromotion);
                                        if(PromotionUpdate.info >= "Rows matched: 1  Changed: 0  Warnings: 0"){
                                            if(status == 1){
                                                const successMessage = {
                                                    success:true,
                                                    statusCode:200,
                                                    status:status,
                                                    message:"Active"
                                                }
                                                return successMessage
                                            }else{
                                                const successMessage = {
                                                    success:true,
                                                    statusCode:200,
                                                    status:status,
                                                    message:"Rejected"
                                                }
                                                return successMessage
                                            }
                                        }else{
                                            const successMessage = {
                                                success:true,
                                                statusCode:200,
                                                status:status,
                                                message:"Not Active"
                                            }
                                            return successMessage
                                        }
                                    // }else{
                                    //     const updateFeatured = `update befeatureds set status = '${status}' where id = '${id}' `
                                    //     const [FeaturedUpdate] = await this.adapter.db.query(updateFeatured);
                                    //     if(FeaturedUpdate.info >= "Rows matched: 1  Changed: 0  Warnings: 0"){
                                    //         const successMessage = {
                                    //             success:true,
                                    //             statusCode:200,
                                    //             status:status,
                                    //             message:"Reject"
                                    //         }
                                    //         return successMessage
                                    //     }else{
                                    //         const successMessage = {
                                    //             success:true,
                                    //             statusCode:200,
                                    //             status:status,
                                    //             message:"Not Reject"
                                    //         }
                                    //         return successMessage
                                    //     }
                                    // }
                            }else{
                                const errMessage = {
                                    success:true,
                                    statusCode:200,
                                    data:activitiesListress
                                } 
                                return errMessage
                            }
                    }else {
                        return message.message.PERMISSIONDENIDE;
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

        promotionProfile: {
            rest: {
				method: "GET",
				path: "/promotionProfile/:id"
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
                    if(Auth.role == 1){
                        const id = ctx.params.id;
                        const findPromotion = `SELECT p.*,m.merchantName, a.title as activityName, a.id as activityId,a.letterCollected FROM promotions as p JOIN merchant_activities as ma on ma.id = p.merchantActivityId JOIN activities as a on a.id = ma.activityId JOIN merchants as m on m.id = p.merchantId where p.id = '${id}'`;
                        const [findPromotionress] = await this.adapter.db.query(findPromotion);
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
                                const categories = `select ac.id as categor_id,ac.name as category_name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${Pro.activityId}'`
                                const [categoriesress] = await this.adapter.db.query(categories);
                                
                                const data = {
                                    "id": Pro.id,
                                    "merchantId": Pro.merchantId,
                                    "merchantName":Pro.merchantName,
                                    "merchantActivityId": Pro.merchantActivityId,
                                    "outletId": JSON.parse(Pro.outletId),
                                    "title": Pro.title,
                                    "description": Pro.description,
                                    "originalPrice": Pro.originalPrice,
                                    "discountedPrice": Pro.discountedPrice,
                                    "discountedPercentage": Pro.discountedPercentage,
                                    "discountAmount": Pro.discountAmount,
                                    "promotionalTerms": JSON.parse(Pro.promotionalTerms),
                                    "startDate": Pro.startDate,
                                    "endDate": Pro.endDate,
                                    "approvedBy": Pro.approvedBy,
                                    "quantity": Pro.quantity,
                                    "quantityPaidFor": Pro.quantityPaidFor,
                                    "status": Pro.status,
                                    "createdAt": Pro.createdAt,
                                    "updatedAt": Pro.updatedAt,
                                    "activityId" : Pro.activityId,
                                    "activityName":Pro.activityName,
                                    "activityId" : Pro.activityId,
                                    "letterCollected":Pro.letterCollected,
                                    "activityName":Pro.activityName,
                                    "categories":categoriesress,
                                    "ticketClaimed":"NA"
                                }
                                const successMessage = {
                                    success:true,
                                    statusCode:200,
                                    data:data
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

        archived: {
            rest: {
				method: "POST",
				path: "/archived"
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
                    if(Auth.role == 1){
                        const search = ctx.params.search;
                        const offset = ctx.params.offset;
                        const orderBy = ctx.params.orderBy;
                        const order = ctx.params.order;
                        const limit = ctx.params.limit;
                        const DATA = [];

                        if(search == ''){
                            const findPromotion = `SELECT p.*,m.merchantName, a.title as activityName, a.id as activityId,a.letterCollected FROM promotions as p JOIN merchant_activities as ma on ma.id = p.merchantActivityId JOIN activities as a on a.id = ma.activityId JOIN merchants as m on m.id = p.merchantId where p.title like '%${search}%' and (p.status != '${0}' && p.endDate <= '${time}') ORDER BY ${orderBy} ${order} limit ${limit} offset ${offset}`;
                            const [findPromotionress] = await this.adapter.db.query(findPromotion);
                            const count = `SELECT p.*, a.title as activityName, a.id as activityId FROM promotions as p JOIN merchant_activities as ma on ma.id = p.merchantActivityId JOIN activities as a on a.id = ma.activityId where p.status != '${0}' and p.endDate <= '${time}'`;
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
                                    const categories = `select ac.id as categor_id,ac.name as category_name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${Pro.activityId}'`
                                    const [categoriesress] = await this.adapter.db.query(categories);
                                   
                                    const data = {
                                        "id": Pro.id,
                                        "merchantId": Pro.merchantId,
                                        "merchantName":Pro.merchantName,
                                        "merchantActivityId": Pro.merchantActivityId,
                                        "outletId": JSON.parse(Pro.outletId),
                                        "title": Pro.title,
                                        "description": Pro.description,
                                        "originalPrice": Pro.originalPrice,
                                        "discountedPrice": Pro.discountedPrice,
                                        "discountedPercentage": Pro.discountedPercentage,
                                        "discountAmount": Pro.discountAmount,
                                        "promotionalTerms": JSON.parse(Pro.promotionalTerms),
                                        "startDate": Pro.startDate,
                                        "endDate": Pro.endDate,
                                        "approvedBy": Pro.approvedBy,
                                        "quantity": Pro.quantity,
                                        "quantityPaidFor": Pro.quantityPaidFor,
                                        "status": Pro.status,
                                        "createdAt": Pro.createdAt,
                                        "updatedAt": Pro.updatedAt,
                                        "activityId" : Pro.activityId,
                                        "activityName":Pro.activityName,
                                        "activityId" : Pro.activityId,
                                        "letterCollected":Pro.letterCollected,
                                        "activityName":Pro.activityName,
                                        "categories":categoriesress,
                                        "ticketClaimed":"NA"
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
                            const findPromotion = `SELECT p.*,m.merchantName, a.title as activityName, a.id as activityId,a.letterCollected FROM promotions as p JOIN merchant_activities as ma on ma.id = p.merchantActivityId JOIN activities as a on a.id = ma.activityId JOIN merchants as m on m.id = p.merchantId where p.title like '%${search}%' and (p.status != '${0}' && p.endDate <= '${time}') ORDER BY ${orderBy} ${order} limit ${limit} offset ${offset}`;
                            const [findPromotionress] = await this.adapter.db.query(findPromotion);
                            const count = `SELECT p.*, a.title as activityName, a.id as activityId FROM promotions as p JOIN merchant_activities as ma on ma.id = p.merchantActivityId JOIN activities as a on a.id = ma.activityId where p.status != '${0}' and p.endDate <= '${time}'`;
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
                                        "outletId": JSON.parse(Pro.outletId),
                                        "title": Pro.title,
                                        "description": Pro.description,
                                        "originalPrice": Pro.originalPrice,
                                        "discountedPrice": Pro.discountedPrice,
                                        "discountedPercentage": Pro.discountedPercentage,
                                        "discountAmount": Pro.discountAmount,
                                        "promotionalTerms": JSON.parse(Pro.promotionalTerms),
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
                                        "ticketClaimed":"NA"
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

        create: {
            rest: {
				method: "POST",
				path: "/create"
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
