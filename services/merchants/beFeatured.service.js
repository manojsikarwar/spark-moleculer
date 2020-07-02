const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const message = require('../../lib/message');
const process = require('../../mixins/db.config');
const { uuid } = require('uuidv4');
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
    name: 'beFeatured',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),
    
    model: {
        name: "befeatured",
        define: {
            merchantId:{type: Sequelize.INTEGER},
            activityId: {type: Sequelize.INTEGER},
            merchantActivityId: {type: Sequelize.INTEGER},
            outletId: {type: Sequelize.JSON},
			startDate: {type: Sequelize.DATE},
			endDate: {type: Sequelize.DATE},
			notes: {type: Sequelize.STRING},
            status: {type: Sequelize.STRING},
            totaluniqueView:{type: Sequelize.INTEGER},
            totalPurchase:{type: Sequelize.INTEGER},
            primaryCategory: {type: Sequelize.STRING},
            secondaryCategory: {type: Sequelize.STRING},
            letter: {type: Sequelize.STRING},
            adminNotes: {type: Sequelize.STRING},
            createdBy: {type: Sequelize.INTEGER},
            updatedBy: {type: Sequelize.INTEGER},
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
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    if(Auth.success == false){
                        return Auth;
                    }
                    if(Auth.role == 1 || Auth.role == 2){
                        const merchantId = ctx.params.merchantId;
                        const activityId = ctx.params.activityId;
                        const merchantActivityId = ctx.params.merchantActivityId;
                        const outletId = JSON.stringify(ctx.params.outletId);
                        const startDate = ctx.params.startDate;
                        const endDate = ctx.params.endDate;
                        const notes = ctx.params.notes;
                        const status = 2;
                        const updatedBy = Auth.id;
                        const createdBy = Auth.id;
                        const totaluniqueView = 0;
                        const totalPurchase = 0;
                        const primaryCategory = 'false';
                        const secondaryCategory = 'flase';
                        const letter = 'false';
                        const adminNotes = 'NULL';

                        const dupFeatured = `select * from befeatureds where activityId = '${activityId}' and merchantId = '${merchantId}'`;
                        const [dupress] = await this.adapter.db.query(dupFeatured)
                        if(dupress != ''){
                            return message.message.DUPFEATURED
                        }else{
                            const Featured = `insert into befeatureds(merchantId, activityId, merchantActivityId,outletId, startDate, endDate, notes, status, totaluniqueView, totalPurchase,primaryCategory,secondaryCategory,letter,adminNotes, createdBy, updatedBy) values('${merchantId}','${activityId}','${merchantActivityId}','${outletId}','${startDate}','${endDate}','${notes}','${status}','${totaluniqueView}','${totalPurchase}','${primaryCategory}','${secondaryCategory}','${letter}','${adminNotes}','${createdBy}','${updatedBy}')`;
                            // return Featured
                            const [Featuredress] = await this.adapter.db.query(Featured)
                            const data = {
                                id : Featuredress,
                                merchantId : merchantId,
                                activityId: activityId,
                                merchantActivityId: merchantActivityId,
                                startDate: startDate,
                                endDate: endDate,
                                status: status,
                                notes: notes,
                                totaluniqueView: totaluniqueView,
                                totalPurchase: totalPurchase,
                                createdBy: createdBy,
                                createdAt: time,
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
                    if(Auth.role == 2){
                        const search = ctx.params.search;
                        const offset = ctx.params.offset;
                        const orderBy = ctx.params.orderBy;
                        const order = ctx.params.order;
                        const limit = ctx.params.limit;
                        const merchantId = Auth.id;
                        if(search == ''){
                            const findFeatured = `select fea.*,a.title as activityName from befeatureds as fea JOIN activities as a on fea.activityId = a.id where title like '%${search}%' and (fea.merchantId = '${merchantId}' && (fea.status = '${1}' || fea.status = '${2}')) ORDER BY ${orderBy} ${order} limit ${limit} offset ${offset}`;
                            const [findFeaturedress] = await this.adapter.db.query(findFeatured);
                            const count = `select fea.*,a.title as activityName from befeatureds as fea JOIN activities as a on fea.activityId = a.id where (fea.merchantId = '${merchantId}' && (fea.status = '${1}' || fea.status = '${2}')) ORDER BY ${orderBy} ${order}`;
                            const [countress] = await this.adapter.db.query(count);
                            const successMessage = {
                                success:true,
                                statusCode:200,
                                totalCount:countress.length,
                                data:findFeaturedress
                            }
                            if(findFeaturedress == ''){
                                return successMessage;
                            }else {
                                return successMessage;
                            }
                        }else{
                            const findFeatured = `select fea.*,a.title as activityName from befeatureds as fea JOIN activities as a on fea.activityId = a.id where title like '%${search}%' and (fea.merchantId = '${merchantId}' && (fea.status = '${1}' || fea.status = '${2}')) ORDER BY ${orderBy} ${order} limit ${limit} offset ${0} `;
                            const [findFeaturedress] = await this.adapter.db.query(findFeatured);
                            const count = `select fea.*,a.title as activityName from befeatureds as fea JOIN activities as a on fea.activityId = a.id where (fea.merchantId = '${merchantId}' && (fea.status = '${1}' || fea.status = '${2}')) ORDER BY ${orderBy} ${order}`;
                            const [countress] = await this.adapter.db.query(count);
                            const successMessage = {
                                success:true,
                                statusCode:200,
                                totalCount:countress.length,
                                data:findFeaturedress
                            }
                            if(findFeaturedress == ''){
                                return successMessage;
                            }else {
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
