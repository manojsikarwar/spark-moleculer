const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require('../../mixins/db.config');
const message = require('../../lib/message');

module.exports = {
    name: 'activity',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),
    
    model: {
        name: "activitie",
        define: {
            title: {type: Sequelize.STRING, defaultValue: null},
            description: {type: Sequelize.STRING, defaultValue: null},
            images: {type: Sequelize.STRING, defaultValue: null},
			activityType: {type: Sequelize.STRING, defaultValue: null},
			letterCollected: {type: Sequelize.STRING, defaultValue: null},
			isBestSeller: {type: Sequelize.INTEGER, defaultValue: 0},
			bestSellerDuration: {type: Sequelize.STRING, defaultValue: null},
			bestSellerStartDate: {type: Sequelize.STRING, defaultValue: null},
			bestSellerEndDate: {type: Sequelize.STRING, defaultValue: null},
			suggestionHeader: {type: Sequelize.STRING, defaultValue: null},
            status: {type: Sequelize.INTEGER, defaultValue: 1},
            createdAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')},
            updatedAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')},
            location : {type: Sequelize.STRING, defaultValue: null},
            avg_rating : {type: Sequelize.INTEGER, defaultValue: 0},
            booking_count : {type: Sequelize.INTEGER, defaultValue: 0},
            originalPrice : {type: Sequelize.INTEGER, defaultValue: 0},
            discountedPercentage : {type: Sequelize.INTEGER, defaultValue: 0},
            discountedPrice : {type: Sequelize.INTEGER, defaultValue: 0},
            discountAmount : {type: Sequelize.INTEGER, defaultValue: 0},
            review_count : {type: Sequelize.INTEGER, defaultValue: 0},
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
                const Auth = ctx.meta.user;
                if(Auth.success == false){
                    return Auth;
                }
                const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                const [token] = await this.adapter.db.query(tokenfind);
                if(token[0].token == "null"){
                    return message.message.LOGIN;
                }

                const activityType = ctx.params.activityType;
                const title = ctx.params.title;
                const description = ctx.params.description;
                const images = JSON.stringify(ctx.params.images);
                const letterCollected = ctx.params.letterCollected || null;
                const isBestSeller = ctx.params.isBestSeller || '0';
                const bestSellerDuration = ctx.params.bestSellerDuration || null;
                const bestSellerStartDate = ctx.params.bestSellerStartDate || null;
                const bestSellerEndDate = ctx.params.bestSellerEndDate || null;
                const suggestionHeader = ctx.params.suggestionHeader || null;
                const status = 2;
                const categoryIds = ctx.params.categoryIds;
                const freeActivitySuggestions = ctx.params.freeActivitySuggestions;
                // first letter capitalized
                const nameCapitalized = title.charAt(0).toUpperCase() + title.slice(1)

                if(activityType == 'general' || activityType == 'special'){
                    const activitiesList = `select * from activities where title = '${title}' and status != '${0}'`;
                    const [activitiesListress] = await this.adapter.db.query(activitiesList);
                    if(activitiesListress == ''){
                        const sql = `insert into activities(title,description,images,activityType,letterCollected,isBestSeller,bestSellerDuration,bestSellerStartDate,bestSellerEndDate,suggestionHeader,status,location,avg_rating,booking_count,originalPrice,discountedPercentage,discountedPrice,discountAmount,review_count) values('${nameCapitalized}','${description}','${images}','${activityType}','${letterCollected}','${isBestSeller}','${bestSellerDuration}','${bestSellerStartDate}','${bestSellerEndDate}','${suggestionHeader}','${status}','${0}','${0}','${0}','${0}','${0}','${0}','${0}','${0}')`;
                        const [res] = await this.adapter.db.query(sql)
                        if(res){
                            var successMessage;
                            const activityId = res;
                            if(categoryIds == ''){
                                return message.message.ACTIVITYCREATE;
                            }else{
                                for(let activityCategoryId of categoryIds){
                                    const cat = `insert into activity_category_relations(activityId,activityCategoryId) values('${activityId}','${activityCategoryId}')`;
                                    const [res1] = await this.adapter.db.query(cat); 
                                  
                                    successMessage = message.message.ACTIVITYCREATE;
                                    const data = {
                                        id : res,
                                        activityType : activityType,
                                        title : title,
                                        description : description,
                                        images : images,
                                        letterCollected : letterCollected,
                                        isBestSeller : isBestSeller,
                                        bestSellerDuration : bestSellerDuration,
                                        bestSellerStartDate : bestSellerStartDate,
                                        bestSellerEndDate : bestSellerEndDate,
                                        suggestionHeader : suggestionHeader,
                                        status : status,
                                        categoryIds : categoryIds,
                                        freeActivitySuggestions : freeActivitySuggestions,                                        
                                    }
                                    successMessage = {
                                        success:true,
                                        statusCode:200,
                                        data:data,
                                        message:'Activity created successfully'
                                    }
                                }
                                return successMessage
                            }
                        }else{
                            const successMessage = {
                                success:false,
                                status: 500,
                                message:'Not save'
                            }
                            return successMessage;
                        }
                    }else{
                        return message.message.ALREADYTITLE
                    }
                }else{
                    const activitiesList = `select * from activities where title = '${title}' and status != '${0}'`;
                    const [activitiesListress] = await this.adapter.db.query(activitiesList);
                    if(activitiesListress == ''){
                        const sql = `insert into activities(title,description,images,activityType,letterCollected,isBestSeller,bestSellerDuration,bestSellerStartDate,bestSellerEndDate,suggestionHeader,status,location,avg_rating,booking_count,originalPrice,discountedPercentage,discountedPrice,discountAmount,review_count) values('${nameCapitalized}','${description}','${images}','${activityType}','${letterCollected}','${isBestSeller}','${bestSellerDuration}','${bestSellerStartDate}','${bestSellerEndDate}','${suggestionHeader}','${status}','${0}','${0}','${0}','${0}','${0}','${0}','${0}','${0}')`;
                        const [res] = await this.adapter.db.query(sql);
                        if(res){
                            var successMessage;
                            const activityId = res;
                            if(categoryIds == ''){
                                return message.message.ACTIVITYCREATE;
                            }else{
                                for(let activityCategoryId of categoryIds){
                                    const cat = `insert into activity_category_relations(activityId,activityCategoryId) values('${activityId}','${activityCategoryId}')`;
                                    const [res1] = await this.adapter.db.query(cat); 
                                }

                                for(let freesugg of freeActivitySuggestions){
                                    const freeTitle = freesugg.title;
                                    const subTitle = freesugg.subTitle;
                                    const suggestionType = freesugg.suggestionType;
                                    const freeImages = JSON.stringify(freesugg.images);
                                    const suggestionCategories = JSON.stringify(freesugg.suggestionCategories);
                                    const createdBy = Auth.id;
                                    const updatedBy = Auth.id;
                                    
                                    const freesuggestion = `select * from free_activity_suggestions where title = '${freeTitle}'`
                                    const [freesuggestionress] = await this.adapter.db.query(freesuggestion);
                                    if(freesuggestionress != ''){
                                        successMessage = message.message.FREEALREADYTITLE;
                                    }else{
                                        const freesuggetionInsert = `insert into free_activity_suggestions(activityId,title,suggestionType,subTitle,images,suggestionCategories,status,createdBy,updatedBy) value('${activityId}','${freeTitle}','${suggestionType}','${subTitle}','${freeImages}','${suggestionCategories}','${1}','${createdBy}','${updatedBy}') `
                                        const [freesuggetionInsertress] = await this.adapter.db.query(freesuggetionInsert);
                                        const data = {
                                            id : res,
                                            activityType : activityType,
                                            title : title,
                                            description : description,
                                            images : images,
                                            letterCollected : letterCollected,
                                            isBestSeller : isBestSeller,
                                            bestSellerDuration : bestSellerDuration,
                                            bestSellerStartDate : bestSellerStartDate,
                                            bestSellerEndDate : bestSellerEndDate,
                                            suggestionHeader : suggestionHeader,
                                            status : status,
                                            categoryIds : categoryIds,
                                        }
                                        successMessage = {
                                            success:true,
                                            statusCode:200,
                                            data:data,
                                            message:'save successfully'
                                        }
                                    }
                                    }
                                    return successMessage
                            }
                        }else{
                            const successMessage = {
                                success:false,
                                status: 500,
                                message:'Not save'
                            }
                            return successMessage;
                        }
                    }else{
                        return message.message.ALREADYTITLE
                    }
                }
			}
        },
        
        activity_list: {
            rest: {
				method: "GET",
				path: "/activity_list/:search"
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    const search = ctx.params.search;
                    if(Auth.success == false){
                        return Auth;
                    }
                    if(Auth.role == 1){
                        const activitiesList = `SELECT * FROM activities where title like '%${search}%' and activityType != '${'free'}' ORDER BY title ASC`;
                        const [activitiesListress] = await this.adapter.db.query(activitiesList);
                            const successMessage = {
                                success:true,
                                status: 200,
                                data:activitiesListress
                            }
                            if(activitiesListress != ''){
                                return successMessage
                            }else{
                                return successMessage
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

        allList: {
            rest: {
				method: "POST",
				path: "/allList"
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    const ACTIVITY = [];
                    const ACTIVITY1 = [];
                    const search = ctx.params.search;
                    const offset = ctx.params.offset;
                    const orderBy = ctx.params.orderBy;
                    const order = ctx.params.order;
                    const limit = ctx.params.limit;
                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }
                    if(Auth.role == 1){   
                        if(search == ''){
                            
                            const activitiesList = `SELECT * FROM activities where title like '%${search}%' and (status = '${1}' || status = '${2}') ORDER BY ${orderBy} ${order} limit ${limit} offset ${offset}`;
                            const [activitiesListress] = await this.adapter.db.query(activitiesList);
                            
                            for(let actData of activitiesListress){
                                const activityId = actData.id;
                                const activityCate = `select ac.id,ac.name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${activityId}'`
                                const [activityCateress] = await this.adapter.db.query(activityCate);
                                // const merchantCount = `select min(rd.discountedPrice) as price from regular_deals_relations as rds inner join regular_deals as rd on rds.merchantActivityId = rd.merchantId where rds.activityId = '${activityId} '`;
                                // const [merchantCountress] = await this.adapter.db.query(merchantCount);
                                const Price = `select min(rd.discountedPrice) as price,min(rd.currency) as currency,count(rd.id) as totalDeals from regular_deals as rd inner join merchant_activities as ma on rd.merchantId = ma.id where ma.activityId = '${activityId}' and ma.status = '${1}'`;
                                const [merchantCountress] = await this.adapter.db.query(Price);
    
                                const merchant = `select count(ma.id) as merchountCount from merchants as mrct inner join merchant_activities as ma on mrct.id = ma.merchantId where ma.activityId = '${activityId}' and (mrct.status = '${1}' || mrct.status = '${2}')`
                                const [merchantCountdata] = await this.adapter.db.query(merchant);
                               
                                for(let dam of merchantCountress){
                                    const DATA = {
                                        id: activityId,
                                        title: actData.title,
                                        status: actData.status,
                                        createdAt: actData.createdAt,
                                        updatedAt: actData.updatedAt,
                                        activityType: actData.activityType,
                                        price:dam,
                                        merchantCount: merchantCountdata,
                                        isBestSeller: actData.isBestSeller,
                                        activityCategories: activityCateress
                                    }
                                        ACTIVITY.push(DATA);
                                }
                            }
                            //====================================================
                            const count = `SELECT * FROM activities where status = '${1}' || status = '${2}'`;
                            const [countress] = await this.adapter.db.query(count);
                            for(let actData1 of countress){
                                const activityId1 = actData1.id;
                                const activityCate1 = `select ac.id,ac.name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${activityId1}'`
                                const [activityCateress1] = await this.adapter.db.query(activityCate1);
                                const merchantCount1 = `select min(rd.discountAmount) as price from regular_deals_relations as rds inner join regular_deals as rd on rds.merchantActivityId = rd.merchantId where rds.activityId = '${activityId1} '`
                                const [merchantCountress1] = await this.adapter.db.query(merchantCount1);
                                
                                for(let dam1 of merchantCountress1){
                                    const DATA1 = {
                                        id: activityId1,
                                        title: actData1.title,
                                        status: actData1.status,
                                        createdAt: actData1.createdAt,
                                        updatedAt: actData1.updatedAt,
                                        activityType: actData1.activityType,
                                        price:dam1,
                                        merchantCount: actData1.merchantCount || 0,
                                        isBestSeller: actData1.isBestSeller,
                                        activityCategories: activityCateress1
                                    }
                                        ACTIVITY1.push(DATA1);
                                        
                                }
                            }
                                const successMessage = {
                                    success:true,
                                    status: 200,
                                    totalCount:ACTIVITY1.length,
                                    data:ACTIVITY
                                }
                                if(activitiesListress != ''){
                                    return successMessage
                                }else{
                                    return successMessage
                                }
                            
                        }else{
                            const activitiesList = `SELECT * FROM activities where title like '%${search}%' and (status = '${1}' || status = '${2}') ORDER BY ${orderBy} ${order} limit ${limit} offset ${0}`;
                        const [activitiesListress] = await this.adapter.db.query(activitiesList);4
                        for(let actData of activitiesListress){
                            const activityId = actData.id;
                            const activityCate = `select ac.id,ac.name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${activityId}'`
                            const [activityCateress] = await this.adapter.db.query(activityCate);
                            // const merchantCount = `select min(rd.discountedPrice) as price from regular_deals_relations as rds inner join regular_deals as rd on rds.merchantActivityId = rd.merchantId where rds.activityId = '${activityId} '`;
                            // const [merchantCountress] = await this.adapter.db.query(merchantCount);
                            // return 'manoj'
                            const Price = `select min(rd.discountedPrice) as price from regular_deals as rd inner join merchant_activities as ma on rd.merchantId = ma.id where ma.activityId = '${activityId}' and ma.status = '${1}'`;
                            const [merchantCountress] = await this.adapter.db.query(Price);

                            const merchant = `select count(ma.id) as merchountCount from merchants as mrct inner join merchant_activities as ma on mrct.id = ma.merchantId where ma.activityId = '${activityId}' and (mrct.status = '${1}' || mrct.status = '${2}')`
                            const [merchantCountdata] = await this.adapter.db.query(merchant);
                            for(let dam of merchantCountress){
                                const DATA = {
                                    id: activityId,
                                    title: actData.title,
                                    status: actData.status,
                                    createdAt: actData.createdAt,
                                    updatedAt: actData.updatedAt,
                                    activityType: actData.activityType,
                                    price:dam,
                                    merchantCount: merchantCountdata,
                                    isBestSeller: actData.isBestSeller,
                                    activityCategories: activityCateress
                                }
                                    ACTIVITY.push(DATA);
                            }
                        }
                        //====================================================
                        const count = `SELECT * FROM activities where status = '${1}' || status = '${2}'`;
                        const [countress] = await this.adapter.db.query(count);
                        for(let actData1 of countress){
                            const activityId1 = actData1.id;
                            const activityCate1 = `select ac.id,ac.name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${activityId1}'`
                            const [activityCateress1] = await this.adapter.db.query(activityCate1);
                            const merchantCount1 = `select min(rd.discountedPrice) as price from regular_deals as rd inner join merchant_activities as ma on rd.merchantId = ma.id where ma.activityId = '${activityId1}' and ma.status = '${1}'`
                            const [merchantCountress1] = await this.adapter.db.query(merchantCount1);
                            
                            for(let dam1 of merchantCountress1){
                                const DATA1 = {
                                    id: activityId1,
                                    title: actData1.title,
                                    status: actData1.status,
                                    createdAt: actData1.createdAt,
                                    updatedAt: actData1.updatedAt,
                                    activityType: actData1.activityType,
                                    price:dam1,
                                    merchantCount: actData1.merchantCount || 0,
                                    isBestSeller: actData1.isBestSeller,
                                    activityCategories: activityCateress1
                                }
                                    ACTIVITY1.push(DATA1);
                                    
                            }
                        }
                            const successMessage = {
                                success:true,
                                status: 200,
                                totalCount:ACTIVITY1.length,
                                data:ACTIVITY
                            }
                            if(activitiesListress != ''){
                                return successMessage
                            }else{
                                return successMessage
                            }
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
        
        singleList: {
            rest: {
				method: "GET",
				path: "/singleList/:id"
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    const ACTIVITY = [];
                    const CAT = [];
                    const FREE = [];
                    const id = ctx.params.id;
                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }

                    if(Auth.role == 1 || Auth.role == 2){
                        const activitiesList = `SELECT * FROM activities where id = '${id}'`;
                        const [activitiesListress] = await this.adapter.db.query(activitiesList);
                        const PERDATA = [];
                        for(let actData of activitiesListress){
                            const id = actData.id;
                            const activityCate = `select ac.id,ac.name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${id}'`
                            const [activityCateress] = await this.adapter.db.query(activityCate);
                            CAT.push(activityCateress)

                            const freeSuggestion = `select * from free_activity_suggestions where activityId = '${id}'`
                            const [freeSuggestionress] = await this.adapter.db.query(freeSuggestion);
                            for(let free of freeSuggestionress){
                                FREE.push(free)
                            }
                            const merchantCount = `select min(rd.discountedPrice) as price from regular_deals_relations as rds inner join regular_deals as rd on rds.merchantActivityId = rd.merchantId where rds.activityId = '${id} '`
                            const [merchantCountress] = await this.adapter.db.query(merchantCount);
                            for(let dam of merchantCountress){
                            
                                const actdata = {
                                    id: id,
                                    title: actData.title,
                                    images:actData.images,
                                    createdAt: actData.createdAt,
                                    letterCollected:actData.letterCollected,
                                    bestSellerDuration:actData.bestSellerDuration,
                                    suggestionHeader:actData.suggestionHeader,
                                    updatedAt: actData.updatedAt,
                                    activityType: actData.activityType,
                                    price:dam,
                                    status:actData.status,
                                    merchantCount: actData.merchantCount || 0,
                                    isBestSeller: actData.isBestSeller,
                                    activityCategories: activityCateress,
                                    freeActivitySuggestions:FREE
                                }
                                    ACTIVITY.push(actdata)
                            }
                        }

                            const successMessage = {
                                success:true,
                                statusCode: 200,
                                data:ACTIVITY,
                                message:'Success'
                            }
                            if(activitiesListress != ''){
                                return successMessage
                            }else{
                                return successMessage
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

        edit: {
            rest: {
				method: "PUT",
				path: "/edit"
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    const activityId = ctx.params.activityId;
                    const title = ctx.params.title;
                    const letterCollected = ctx.params.letterCollected;
                    const status = ctx.params.status;
                    const categoryIds = ctx.params.categoryIds;
                    const images = JSON.stringify(ctx.params.images);
                    const activityType = ctx.params.activityType;
                    const suggestionHeader = ctx.params.suggestionHeader;
                    // first letter capitalized
                    const nameCapitalized = title.charAt(0).toUpperCase() + title.slice(1)

                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }

                    if(Auth.role == 1 || Auth.role == 2){
                        let successMessage;
                        const activitiesList = `select * from activities where id = '${activityId}'`;
                        const [activitiesListress] = await this.adapter.db.query(activitiesList);
                            if(activitiesListress != ''){
                                if(activitiesListress[0].activityType == 'free'){
                                    const updateActivity = `update activities set title = '${nameCapitalized}',images = '${images}',activityType = '${activityType}',letterCollected = '${letterCollected}',suggestionHeader = '${suggestionHeader}',status = '${status}' where id = '${activityId}'`
                                    const [updateActivityress] = await this.adapter.db.query(updateActivity);
                                    if(updateActivityress.info >= "Rows matched: 1  Changed: 0  Warnings: 0"){
                                        const delteData = `delete from activity_category_relations where activityId = '${activityId}'`
                                        const [deleteDataress] = await this.adapter.db.query(delteData);
                                        if(deleteDataress)
                                       for(let catId of categoryIds){
                                           const updateCate = `insert activity_category_relations(activityId,activityCategoryId) values('${activityId}','${catId}') `
                                           const [updateCateress] = await this.adapter.db.query(updateCate);
                                           successMessage = message.message.UPDATE;
                                          
                                       }
                                       return successMessage
                                    }else{
                                        return message.message.NOTHINGCHANGES;
                                    } 
                                }
                                const updateActivity = `update activities set title = '${title}',images = '${images}',activityType = '${activityType}',letterCollected = '${letterCollected}',status = '${status}' where id = '${activityId}'`
                                const [updateActivityress] = await this.adapter.db.query(updateActivity);
                                if(updateActivityress.affectedRows >= 0){
                                    const delteData = `delete from activity_category_relations where activityId = '${activityId}'`
                                    const [deleteDataress] = await this.adapter.db.query(delteData);
                                    if(deleteDataress)
                                   for(let catId of categoryIds){
                                       const updateCate = `insert activity_category_relations(activityId,activityCategoryId) values('${activityId}','${catId}') `
                                       const [updateCateress] = await this.adapter.db.query(updateCate);
                                       successMessage = message.message.UPDATE;
                                      
                                   }
                                   return successMessage
                                }else{
                                    return message.message.NOTUPDATE;
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

        merchantActivitylist: {
            rest: {
				method: "POST",
				path: "/merchantActivitylist"
            },
            async handler(ctx) {
                try{
                    const merchantDATA = [];
                    const PRICE = []
                    const Auth = ctx.meta.user;
                    const activityId = ctx.params.activityId;
                    const search = ctx.params.search;
                    const orderBy = ctx.params.orderBy;
                    const order = ctx.params.order;
                    if(Auth.success != false){
                        const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                        const [token] = await this.adapter.db.query(tokenfind);
                        if(token[0].token == "null"){
                            return message.message.LOGIN;
                        }

                        if(Auth.role == 1  || Auth.role == 2){
                            const merchatActivities = `select ma.id as merchantActivityId,ma.outletIds,ma.merchantRanking,ma.averageRating,m.id as merchantId,m.merchantName,m.status from merchant_activities as ma inner join merchants as m on m.id = ma.merchantId where title like '%${search}%' and ma.activityId = '${activityId}' and (m.status = '${1}' || m.status = '${2}') ORDER BY '${orderBy}' '${order}' `
                            const [merchatActivitiesress] = await this.adapter.db.query(merchatActivities);
                            if(merchatActivitiesress == ''){
                                const errMessage = {
                                    success:true,
                                    statusCode:200,
                                    data:merchatActivitiesress
                                }
                                return errMessage
                            }else{
                                var data;
                                for(let key of merchatActivitiesress){
                                    const merchantActId = key.merchantActivityId;
                                    // for(let MERID of key.outletIds){
                                        const priceCount = `select min(rd.discountedPrice) as price,min(rd.currency) as currency,count(rd.id) as totalDeals from regular_deals_relations as rds inner join regular_deals as rd on rds.regularDealId = rd.id where rd.merchantId = '${merchantActId}'`
                                        // return priceCount
                                        const [priceCountress] = await this.adapter.db.query(priceCount);
                                            PRICE.push(priceCountress)
                                             data = {
                                                merchantActivityId:key.merchantActivityId,
                                                outletIds:key.outletIds,
                                                merchantRanking:key.merchantRanking,
                                                merchantId:key.merchantId,
                                                merchantName:key.merchantName,
                                                price:priceCountress,
                                                BookingNO:0,
                                                averageRating:key.averageRating,
                                                status:key.status
                                            }

                                        // }
                                        merchantDATA.push(data);
                                    }
                                const successMessage = {
                                    success:true,
                                    statusCode:200,
                                    data:merchantDATA
                                }
                                return successMessage
                            }
                        }else{
                            return message.message.PERMISSIONDENIDE
                        }
                    }else{
                        return message.message.UNAUTHORIZED;
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
                    const activityId = ctx.params.activityId;
                    const status = ctx.params.status;
                    let STATUS;

                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }

                    if(Auth.role == 1 || Auth.role == 2){
                        const activitiesList = `select * from activities where id = '${activityId}'`;
                        const [activitiesListress] = await this.adapter.db.query(activitiesList);
                        if(activitiesListress != ''){
                            const activityType = activitiesListress[0].activityType;
                            if(activityType == 'free'){
                                const updateActivity = `update activities set status = '${status}' where id = '${activityId}'`
                                const [updateActivityress] = await this.adapter.db.query(updateActivity);
                                if(updateActivityress.affectedRows >= 0){
                                    if(status == 1){
                                        const successMessage = {
                                            success:true,
                                            statusCode:200,
                                            status:status,
                                            message:"Active"
                                        }
                                        return successMessage
                                    }else if(status == 2){
                                        const successMessage = {
                                            success:true,
                                            statusCode:200,
                                            status:status,
                                            message:"Deactive"
                                        }
                                        return successMessage
                                    }else{
                                        const deleterelation = `delete from activity_category_relations where activityId = '${activityId}'`
                                        const [deleterelationress] = await this.adapter.db.query(deleterelation);
                                        
                                        const successMessage = {
                                            success:true,
                                            statusCode:200,
                                            status:status,
                                            message:"Delete"
                                        }
                                        return successMessage
                                    }
                                }
                            }else{
                                const merchantAct = `select merchantId from merchant_activities where activityId = '${activityId}'`;
                                const [merchantActress] = await this.adapter.db.query(merchantAct);
                                if(merchantActress == ''){
                                    const successMessage = {
                                        success: false,
                                        statusCode: 409,
                                        message: 'Merchant not active'
                                    }
                                    return successMessage
                                }else{
                                    for(let key of merchantActress){
                                        const merID = key.merchantId
                                        const activeMerchant = `select status from merchants where id = '${merID}'`
                                        const [merchantActive] = await this.adapter.db.query(activeMerchant);
                                        for(let statusMer of merchantActive){
                                            
                                            if(status == 1 || status == 2){
                                                if(statusMer.status == 1){
                                                    const updateActivity = `update activities set status = '${status}' where id = '${activityId}'`
                                                    const [updateActivityress] = await this.adapter.db.query(updateActivity);
                                                    if(updateActivityress.affectedRows >= 0){
                                                        if(status == 1){
                                                            const successMessage = {
                                                                success:true,
                                                                statusCode:200,
                                                                status:status,
                                                                message:"Active"
                                                            }
                                                            return successMessage
                                                        }else if(status == 2){
                                                            const successMessage = {
                                                                success:true,
                                                                statusCode:200,
                                                                status:status,
                                                                message:"Deactive"
                                                            }
                                                            return successMessage
                                                        }else{
                                                            const deleterelation = `delete from activity_category_relations where activityId = '${activityId}'`
                                                            const [deleterelationress] = await this.adapter.db.query(deleterelation);
                    
                                                            const successMessage = {
                                                                success:true,
                                                                statusCode:200,
                                                                status:status,
                                                                message:"Delete"
                                                            }
                                                            return successMessage
                                                        }
                                                    }
                                                }else{
                                                    STATUS = {
                                                        success: false,
                                                        statusCode:409,
                                                        message:'One merchant should be active'
                                                    }
                                                    
                                                }
                                            }else{
                                                const updateActivity = `update activities set status = '${status}' where id = '${activityId}'`
                                                const [updateActivityress] = await this.adapter.db.query(updateActivity);
                                                if(updateActivityress.affectedRows >= 0){
                                                    const updateActivity = `update activities set status = '${status}' where id = '${activityId}'`
                                                    const [updateActivityress] = await this.adapter.db.query(updateActivity);
                                                    if(updateActivityress.affectedRows >= 0){
                                                        
                                                        const deleterelation = `delete from activity_category_relations where activityId = '${activityId}'`
                                                        const [deleterelationress] = await this.adapter.db.query(deleterelation);

                                                            const successMessage = {
                                                                success:true,
                                                                statusCode:200,
                                                                status:status,
                                                                message:"Delete"
                                                            }
                                                            return successMessage
                                                        }
                                                    }
    
                                            }
                                        }
                                        return STATUS
                                    }
                                    
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

    }
    
}
