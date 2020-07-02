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
    name: 'beFeatureds',
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
            createdBy: {type: Sequelize.INTEGER},
            updatedBy: {type: Sequelize.INTEGER},
            createdAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')},
            updatedAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')}
        },
        options: {}
    },


    actions: {

        featuredList: {
            rest: {
				method: "GET",
				path: "/featuredList"
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
                    const FEATURED = [];
                    const search = ctx.params.search;
                    const offset = ctx.params.offset;
                    const orderBy = ctx.params.orderBy;
                    const order = ctx.params.order;
                    const limit = ctx.params.limit;
                    const status = ctx.params.status;

                    if(Auth.role == 2 || Auth.role == 1){
                        if(search == ''){
                            const findFeatured = `select m.merchantName,a.letterCollected,fea.id as featuredId, a.id as activityId,m.id as merchantId,a.title as activityName,fea.merchantActivityId,fea.createdAt as createdAt,fea.notes as note,fea.startDate,fea.endDate,fea.totaluniqueView,fea.totalpurchase,fea.status from befeatureds as fea inner JOIN activities as a on fea.activityId = a.id inner JOIN merchants as m on m.id = fea.merchantId where merchantName like '%${search}%' and (fea.status = '${status}' && fea.endDate >= '${time}') ORDER BY ${orderBy} ${order} limit ${limit} offset ${offset}`;
                            const [findFeaturedress] = await this.adapter.db.query(findFeatured);
                            const count = `select m.merchantName,a.letterCollected,fea.id as featuredId, a.id as activityId,m.id as merchantId,a.title as activityName,fea.createdAt as createAt,fea.notes as note,fea.startDate,fea.endDate,fea.totaluniqueView,fea.totalpurchase from befeatureds as fea inner JOIN activities as a on fea.activityId = a.id inner JOIN merchants as m on m.id = fea.merchantId where fea.status = '${status}' and fea.endDate >= '${time}'`;
                            const [countress] = await this.adapter.db.query(count);
                            if(findFeaturedress == ''){
                                const successMessage = {
                                    success:true,
                                    statusCode:200,
                                    data:findFeaturedress
                                }
                                return successMessage;
                            }else {
                                for(let megaData of findFeaturedress){
                                    const outletId = megaData.outletId;
                                    const merId = megaData.merchantActivityId;
                                    const activityId = megaData.activityId;
                                    const categories = `select ac.id as categor_id,ac.name as category_name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${activityId}'`
                                    const [categoriesress] = await this.adapter.db.query(categories);
                                    // for(let catlist of categoriesress){
                                        //     Activcat.push(catlist) 
                                        // }
                                        // console.log({id:merId})

                                    const price = `select min(rd.discountedPrice) as price,min(rd.currency) as currency,count(rd.id) as totalDeals from regular_deals_relations as rds inner join regular_deals as rd on rds.regularDealId = rd.id where rds.merchantActivityId = '${merId}' and rds.activityId = '${activityId}'`
                                    const [priceress] = await this.adapter.db.query(price)
                                    for(let rate of priceress){
                                        // const activityData = {
                                        //     price : rate,
                                        //     activityId:activityId,
                                        //     activityName:megaData.activityName,
                                        //     activitycategories:Activcat
                                        // }
                                        // ACT.push(activityData)
                                        const data = {
                                            featuredId : megaData.featuredId,
                                            merchantId: megaData.merchantId,
                                            merchantActivityId:merId,
                                            merchantName: megaData.merchantName,
                                            activityId:megaData.activityId,
                                            activityName:megaData.activityName,
                                            letterCollected: megaData.letterCollected,
                                            status:megaData.status,
                                            startDate: megaData.startDate,
                                            endDate: megaData.endDate,
                                            view: megaData.totaluniqueView,
                                            notes: megaData.note,
                                            conversions: megaData.totalPurchase,
                                            createdAt: megaData.createdAt,
                                            outletIds: megaData.outletIds,
                                            price: rate,
                                            categories:categoriesress
                                        }
                                        FEATURED.push(data)
                                    }
                                }
                                const successMessage = {
                                    success:true,
                                    statusCode:200,
                                    totalCount:countress.length,
                                    data:FEATURED
                                }
                                return successMessage;
                            }
                        }else{
                            const findFeatured = `select m.merchantName,a.letterCollected,fea.id as featuredId, a.id as activityId,m.id as merchantId,a.title as activityName,fea.merchantActivityId,fea.createdAt as createdAt,fea.notes as note,fea.startDate,fea.endDate,fea.totaluniqueView,fea.totalpurchase,fea.status from befeatureds as fea inner JOIN activities as a on fea.activityId = a.id inner JOIN merchants as m on m.id = fea.merchantId where merchantName like '%${search}%' and (fea.status = '${status}' && fea.endDate >= '${time}') ORDER BY ${orderBy} ${order} limit ${limit} offset ${0}`;
                            const [findFeaturedress] = await this.adapter.db.query(findFeatured);
                            const count = `select m.merchantName,a.letterCollected,fea.id as featuredId, a.id as activityId,m.id as merchantId,a.title as activityName,fea.createdAt as createAt,fea.notes as note,fea.startDate,fea.endDate,fea.totaluniqueView,fea.totalpurchase from befeatureds as fea inner JOIN activities as a on fea.activityId = a.id inner JOIN merchants as m on m.id = fea.merchantId where fea.status = '${status}' and fea.endDate >= '${time}'`;
                            const [countress] = await this.adapter.db.query(count);
                            if(findFeaturedress == ''){
                                const successMessage = {
                                    success:true,
                                    statusCode:200,
                                    data:findFeaturedress
                                }
                                return successMessage;
                            }else {
                                for(let megaData of findFeaturedress){
                                    const outletId = megaData.outletId;
                                    const merId = megaData.merchantActivityId;
                                    const activityId = megaData.activityId;
    
                                    const categories = `select ac.id as categor_id,ac.name as category_name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${activityId}'`
                                    const [categoriesress] = await this.adapter.db.query(categories);
                                    const price = `select min(rd.discountedPrice) as price,min(rd.currency) as currency,count(rd.id) as totalDeals from regular_deals_relations as rds inner join regular_deals as rd on rds.regularDealId = rd.id where rds.merchantActivityId = '${merId}' and rds.activityId = '${activityId}'`
                                    const [priceress] = await this.adapter.db.query(price)
                                    for(let rate of priceress){
                                        const data = {
                                            featuredId : megaData.featuredId,
                                            merchantId: megaData.merchantId,
                                            merchantActivityId:merId,
                                            merchantName: megaData.merchantName,
                                            activityId:megaData.activityId,
                                            activityName:megaData.activityName,
                                            letterCollected: megaData.letterCollected,
                                            status:megaData.status,
                                            startDate: megaData.startDate,
                                            endDate: megaData.endDate,
                                            view: megaData.totaluniqueView,
                                            notes: megaData.note,
                                            conversions: megaData.totalPurchase,
                                            createdAt: megaData.createdAt,
                                            outletIds: megaData.outletIds,
                                            price: rate,
                                            categories:categoriesress
                                        }
                                        FEATURED.push(data)
                                    }
                                }
                                const successMessage = {
                                    success:true,
                                    statusCode:200,
                                    totalCount:countress.length,
                                    data:FEATURED
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

        featureProfile: {
            rest: {
				method: "GET",
				path: "/featureProfile/:id"
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
                    const FEATURED = [];
                    const ACT = [];
                    const Activcat = [];
                    const id = ctx.params.id;
                    if(Auth.role == 2 || Auth.role == 1){
                        const findFeatured = `select m.merchantName,a.letterCollected,fea.id as featuredId, a.id as activityId,m.id as merchantId,a.title as activityName,fea.merchantActivityId,fea.createdAt as createAt,fea.notes as note,fea.startDate,fea.endDate,fea.totaluniqueView,fea.totalpurchase,fea.status from befeatureds as fea inner JOIN activities as a on fea.activityId = a.id inner JOIN merchants as m on m.id = fea.merchantId where fea.id = '${id}'`;
                        const [findFeaturedress] = await this.adapter.db.query(findFeatured);
                        const count = `select m.merchantName,a.letterCollected,fea.id as featuredId, a.id as activityId,m.id as merchantId,a.title as activityName,fea.createdAt as createAt,fea.notes as note,fea.startDate,fea.endDate,fea.totaluniqueView,fea.totalpurchase,fea.status from befeatureds as fea inner JOIN activities as a on fea.activityId = a.id inner JOIN merchants as m on m.id = fea.merchantId where fea.id = '${id}'`;
                        const [countress] = await this.adapter.db.query(count);
                        if(findFeaturedress == ''){
                            const successMessage = {
                                success:true,
                                statusCode:200,
                                data:findFeaturedress
                            }
                            return successMessage;
                        }else {
                            for(let megaData of findFeaturedress){
                                const outletId = megaData.outletId;
                                const merId = megaData.merchantActivityId;
                                const activityId = megaData.activityId;

                                const categories = `select ac.id as categor_id,ac.name as category_name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${activityId}'`
                                const [categoriesress] = await this.adapter.db.query(categories);
                                const price = `select min(rd.discountedPrice) as price,min(rd.currency) as currency,count(rd.id) as totalDeals from regular_deals_relations as rds inner join regular_deals as rd on rds.regularDealId = rd.id where rds.merchantActivityId = '${merId}' and rds.activityId = '${activityId}'`
                                const [priceress] = await this.adapter.db.query(price)
                                for(let rate of priceress){
                                    const data = {
                                        featuredId : megaData.featuredId,
                                        merchantId: megaData.merchantId,
                                        merchantName: megaData.merchantName,
                                        activityId:megaData.activityId,
                                        activityName:megaData.activityName,
                                        letterCollected: megaData.letterCollected,
                                        status:megaData.status,
                                        startDate: megaData.startDate,
                                        endDate: megaData.endDate,
                                        view: megaData.totaluniqueView,
                                        notes: megaData.note,
                                        conversions: megaData.totalPurchase,
                                        createdAt: megaData.createAt,
                                        outletIds: megaData.outletIds,
                                        price: rate,
                                        categories:categoriesress
                                    }
                                    FEATURED.push(data)
                                }
                            }
                            const successMessage = {
                                success:true,
                                statusCode:200,
                                totalCount:countress.length,
                                data:FEATURED
                            }
                            return successMessage;
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
                    const primaryCategory = ctx.params.primaryCategory;
                    const secondaryCategory = ctx.params.secondaryCategory;
                    const letter = ctx.params.letter;
                    const adminNotes = ctx.params.adminNotes;
                    const startDate = ctx.params.startDate;
                    const endDate = ctx.params.endDate;

                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }

                    if(Auth.role == 1 || Auth.role == 2){
                        const FeaturedList = `select * from befeatureds where id = '${id}'`;
                        const [FeaturedListress] = await this.adapter.db.query(FeaturedList);
                            if(FeaturedListress != ''){
                                if(status == 1){
                                    const updateFeatured = `update befeatureds set startDate = '${startDate}',endDate = '${endDate}',status = '${status}',primaryCategory = '${primaryCategory}',secondaryCategory = '${secondaryCategory}',letter = '${letter}',adminNotes = '${adminNotes}' where id = '${id}' `
                                    const [FeaturedUpdate] = await this.adapter.db.query(updateFeatured);
                                    if(FeaturedUpdate.info >= "Rows matched: 1  Changed: 0  Warnings: 0"){
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
                                            message:"Not Active"
                                        }
                                        return successMessage
                                    }
                                }else{
                                    const updateFeatured = `update befeatureds set status = '${status}' where id = '${id}' `
                                    const [FeaturedUpdate] = await this.adapter.db.query(updateFeatured);
                                    if(FeaturedUpdate.info >= "Rows matched: 1  Changed: 0  Warnings: 0"){
                                        const successMessage = {
                                            success:true,
                                            statusCode:200,
                                            status:status,
                                            message:"Reject"
                                        }
                                        return successMessage
                                    }else{
                                        const successMessage = {
                                            success:true,
                                            statusCode:200,
                                            status:status,
                                            message:"Not Reject"
                                        }
                                        return successMessage
                                    }
                                }
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

        archived: {
            rest: {
				method: "Post",
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
                    const FEATURED = [];
                    const search = ctx.params.search;
                    const offset = ctx.params.offset;
                    const orderBy = ctx.params.orderBy;
                    const order = ctx.params.order;
                    const limit = ctx.params.limit;
                    if(Auth.role == 2 || Auth.role == 1){
                        const findFeatured = `select m.merchantName,a.letterCollected,fea.id as featuredId, a.id as activityId,m.id as merchantId,a.title as activityName,fea.createdAt as createdAt,fea.notes as note,fea.startDate,fea.endDate,fea.totaluniqueView,fea.totalpurchase,fea.status from befeatureds as fea inner JOIN activities as a on fea.activityId = a.id inner JOIN merchants as m on m.id = fea.merchantId where m.merchantName like '%${search}%' and (fea.status != '${0}' && fea.endDate < '${time}') ORDER BY ${orderBy} ${order} limit ${limit} offset ${offset}`;
                        const [findFeaturedress] = await this.adapter.db.query(findFeatured);

                        const count = `select m.merchantName,a.letterCollected,fea.id as featuredId, a.id as activityId,m.id as merchantId,a.title as activityName,fea.createdAt as createAt,fea.notes as note,fea.startDate,fea.endDate,fea.totaluniqueView,fea.totalpurchase from befeatureds as fea inner JOIN activities as a on fea.activityId = a.id inner JOIN merchants as m on m.id = fea.merchantId where fea.status != '${0}' and fea.endDate < '${time}'`;
                        const [countress] = await this.adapter.db.query(count);
                        if(findFeaturedress == ''){
                            const successMessage = {
                                success:true,
                                statusCode:200,
                                data:findFeaturedress
                            }
                            return successMessage;
                        }else {
                            for(let megaData of findFeaturedress){
                                const outletId = megaData.outletId;
                                const merId = megaData.merchantActivityId;
                                const activityId = megaData.activityId;

                                const categories = `select ac.id as categor_id,ac.name as category_name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${activityId}'`
                                const [categoriesress] = await this.adapter.db.query(categories);
                                const price = `select min(rd.discountedPrice) as price,min(rd.currency) as currency,count(rd.id) as totalDeals from regular_deals_relations as rds inner join regular_deals as rd on rds.regularDealId = rd.id where rds.outletId = '${outletId}' and rds.merchantActivityId = '${merId}'`
                                const [priceress] = await this.adapter.db.query(price)
                                for(let rate of priceress){
                                    const data = {
                                        featuredId : megaData.featuredId,
                                        merchantId: megaData.merchantId,
                                        merchantName: megaData.merchantName,
                                        activityId:megaData.activityId,
                                        activityName:megaData.activityName,
                                        letterCollected: megaData.letterCollected,
                                        status:megaData.status,
                                        startDate: megaData.startDate,
                                        endDate: megaData.endDate,
                                        view: megaData.totaluniqueView,
                                        notes: megaData.note,
                                        conversions: megaData.totalPurchase,
                                        createdAt: megaData.createdAt,
                                        outletIds: megaData.outletIds,
                                        price: rate,
                                        categories:categoriesress
                                    }
                                    FEATURED.push(data)
                                }
                            }
                            const successMessage = {
                                success:true,
                                statusCode:200,
                                totalCount:countress.length,
                                data:FEATURED
                            }
                            return successMessage;
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
