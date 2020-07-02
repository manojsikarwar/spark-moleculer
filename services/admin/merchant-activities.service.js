const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require('../../mixins/db.config');
const message = require('../../lib/message');
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();
var hh = today.getHours();
var mi = today.getMinutes();
var ss = today.getSeconds();
today = yyyy + '-' + mm + '-' + dd+' '+ hh+':'+mi+':'+ss;

module.exports = {
    name: 'merchant_activities',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),
    
    model: {
        name: "merchant_activitie",
        define: {
            merchantId: {type: Sequelize.INTEGER},
            activityId: {type: Sequelize.INTEGER},
            outletIds: Sequelize.JSON,
			title: {type: Sequelize.STRING},
			images: {type: Sequelize.JSON},
			quantity: {type: Sequelize.INTEGER, defaultValue: null},
			description: {type: Sequelize.STRING, defaultValue: null},
			activityDuration: {type: Sequelize.INTEGER, defaultValue: null},
			isReservationRequired: {type: Sequelize.STRING, defaultValue: null},
			isAnniversarySpecial: {type: Sequelize.STRING, defaultValue: null},
            averageRating: {type: Sequelize.INTEGER, defaultValue: null},
            isBestSeller: {type: Sequelize.STRING},
            isAnnisparksCommissionversarySpecial: {type: Sequelize.STRING},
            sparksCommissionLastUpdated: {type: Sequelize.STRING},
            sparksCommissionLastUpdateReason: {type: Sequelize.STRING},
            merchantRanking: {type: Sequelize.STRING},
            rankingStartDate: {type: Sequelize.DATE},
            rankingEndDate: {type: Sequelize.DATE},
            isFeatured: {type: Sequelize.STRING},
            isFeaturedStartDate: {type: Sequelize.DATE, defaultValue: null},
            isFeaturedEndDate: {type: Sequelize.DATE, defaultValue: null},
            expectations: {type: Sequelize.TEXT, defaultValue: null},
            additionalInfo: {type: Sequelize.TEXT, defaultValue: null},
            terms: {type: Sequelize.TEXT, defaultValue: null},
            howToRedeem: {type: Sequelize.TEXT, defaultValue: null},
            status: {type: Sequelize.INTEGER, defaultValue: 1},
            merchantStatus: {type: Sequelize.INTEGER, defaultValue: 1},
            latitude: {type: Sequelize.INTEGER, defaultValue: null},
            longitude: {type: Sequelize.INTEGER, defaultValue: null},
            validityPeriod: {type: Sequelize.INTEGER},
            commisionPercentage: {type: Sequelize.INTEGER, defaultValue: 0},
            createdBy: {type: Sequelize.INTEGER, defaultValue: null},
            updatedBy: {type: Sequelize.INTEGER, defaultValue: null},
            createdAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')},
            updatedAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')},
            min_originalPrice : {type: Sequelize.FLOAT, defaultValue: null},
            min_discountedPrice : {type: Sequelize.FLOAT, defaultValue: null},
            min_discountedPercentage : {type: Sequelize.FLOAT, defaultValue: null},
            min_discountAmount : {type: Sequelize.FLOAT, defaultValue: null},
            avg_rating : {type: Sequelize.FLOAT, defaultValue: null},
            booking_count : {type: Sequelize.FLOAT, defaultValue: null},
            review_count  : {type: Sequelize.FLOAT, defaultValue: null},
            location : {type: Sequelize.INTEGER, defaultValue: null}
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
                merchantId: {type: "number"}
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    const adminId = Auth.role;
                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }
                    if(adminId == 1){
                        const merchantId = ctx.params.merchantId;//
                        const activityId = ctx.params.activityId;//
                        const outletIds = JSON.stringify(ctx.params.outlets);//
                        const title = 'NULL';//
                        // first letter capitalized
                        const nameCapitalized = title.charAt(0).toUpperCase() + title.slice(1)
                        const images = JSON.stringify(ctx.params.images);//
                        const quantity = ctx.params.quantity || 1;
                        const description = ctx.params.description;//
                        const activityDuration = ctx.params.activityDuration;//
                        const isReservationRequired = ctx.params.isReservationRequired;
                        const isAnniversarySpecial = ctx.params.isAnniversarySpecial;//
                        const averageRating = ctx.params.averageRating || 4;
                        const isBestSeller = ctx.params.isBestSeller || 0;
                        const sparksCommission = ctx.params.sparksCommission || 10;
                        const sparksCommissionLastUpdated = ctx.params.sparksCommissionLastUpdated || 1;
                        const sparksCommissionLastUpdateReason = ctx.params.sparksCommissionLastUpdateReason || 'sparksCommissionLastUpdateReason Text';
                        const merchantRanking = ctx.params.merchantRanking || 4;
                        const isFeatured = ctx.params.isFeatured || 0;
                        const expectations = ctx.params.expectations;//
                        const additionalInfo = ctx.params.additionalInfo;//
                        const terms = ctx.params.terms;//
                        const howToRedeem = ctx.params.howToRedeem;//
                        const status = 2;
                        const latitude = ctx.params.latitude || null;
                        const longitude = ctx.params.longitude || null;
                        const validityPeriod = ctx.params.validityPeriod;
                        const createdBy = adminId;
                        const updatedBy = adminId;
                        const commisionPercentage = ctx.params.commisionPercentage || 0;
                        
                        // const checkTitle = `select * from merchant_activities where title = '${title}'`
                        // const [checkTitleress] = await this.adapter.db.query(checkTitle);
                        // if(checkTitleress != ""){
                        //     return message.message.ALREADYTITLE;
                        // }else{
                            const checkactivity = `select * from merchant_activities where merchantId = '${merchantId}' and activityId = '${activityId}'`
                            const [checkactivityress] = await this.adapter.db.query(checkactivity);
                            if(checkactivityress != ''){
                                const successMessage = {
                                    success:false,
                                    statusCode:409,
                                    message:'This Acitivity already in merchant.'
                                }
                                return successMessage
                            }else{
                                const merchantActivity = `insert into merchant_activities(merchantId,activityId,outletIds,title,images,quantity,description,activityDuration,isReservationRequired,isAnniversarySpecial,averageRating,isBestSeller,sparksCommission,sparksCommissionLastUpdated,sparksCommissionLastUpdateReason,merchantRanking,rankingStartDate,rankingEndDate,isFeatured,isFeaturedStartDate,isFeaturedEndDate,expectations,additionalInfo,terms,howToRedeem,status,merchantStatus,latitude,longitude,validityPeriod,commisionPercentage,createdBy,updatedBy,min_originalPrice,min_discountedPrice,min_discountedPercentage,min_discountAmount,avg_rating,booking_count,review_count,location) values('${merchantId}','${activityId}','${outletIds}','${nameCapitalized}','${images}','${quantity}','${description}','${activityDuration}','${isReservationRequired}','${isAnniversarySpecial}','${averageRating}','${isBestSeller}','${sparksCommission}','${sparksCommissionLastUpdated}','${sparksCommissionLastUpdateReason}','${merchantRanking}','${today}','${today}','${isFeatured}','${today}','${today}','${expectations}','${additionalInfo}','${terms}','${howToRedeem}','${status}','${2}','${latitude}','${longitude}','${validityPeriod}','${commisionPercentage}','${createdBy}','${updatedBy}','${0}','${0}','${0}','${0}','${0}','${0}','${0}','${0}')`;
                                const [merchantActivityress] = await this.adapter.db.query(merchantActivity);
                                for(let outIDD of ctx.params.outlets){
                                    const outletsave = `insert into merchant_activities_suggetions(merchantActivityId,merchantId,activityId,outletId) values('${merchantActivityress}','${merchantId}','${activityId}','${outIDD}')`
                                    const [outletress] = await this.adapter.db.query(outletsave);
                                }
                                const data = {
                                    id:merchantActivityress,
                                    merchantId:merchantId,
                                    activityId : activityId,
                                    outletIds : ctx.params.outlets,
                                    title : nameCapitalized,
                                    images : images,
                                    quantity : quantity,
                                    description : description,
                                    activityDuration : activityDuration,
                                    isReservationRequired : isReservationRequired,
                                    isAnniversarySpecial : isAnniversarySpecial,
                                    averageRating : averageRating,
                                    isBestSeller : isBestSeller,
                                    sparksCommission : sparksCommission,
                                    merchantRanking : merchantRanking,
                                    isFeatured : isFeatured,
                                    expectations : ctx.params.expectations,
                                    additionalInfo : ctx.params.additionalInfo,
                                    terms : ctx.params.terms,
                                    howToRedeem : howToRedeem,
                                    status : 1,
                                    latitude : latitude,
                                    longitude : longitude,
                                    validityPeriod:validityPeriod,
                                    commisionPercentage:commisionPercentage,
                                }
                                if(merchantActivityress != ''){
                                    const successMessage = {
                                        success:true,
                                        statusCode:200,
                                        data:data,
                                        message:'Save successfuly'
                                    }
                                    return successMessage
                                }else{
                                    return message.message.NOTSAVE; 
                                }
                            }
                        // }
                    }else{
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

        listing: {
            rest: {
				method: "GET",
				path: "/listing/:merchantId"
            },
            async handler(ctx,res,req) {
                try{
                    const DATA = [];
                    const Auth = ctx.meta.user;
                    const merchantId = ctx.params.merchantId;
                    if(Auth.success != false){
                        const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                        const [token] = await this.adapter.db.query(tokenfind);
                        if(token[0].token == "null"){
                            return message.message.LOGIN;
                        }
                        if(Auth.role == 1 || Auth.role == 2 || Auth.role == 3){
                            const findmerchant = `select * from merchant_activities where merchantId = '${merchantId}'`;
                            const [findmerchantress] = await this.adapter.db.query(findmerchant);
                            for(let key of findmerchantress){
                                const activityId = key.activityId;
                                const activity = `select * from activities where id = '${activityId}'`;
                                const [activityress] = await this.adapter.db.query(activity)
                                for(let actName of activityress){
                                    const list = {
                                        outletId: key.outletIds,
                                        id : key.id,
                                        title:key.title,
                                        activityId:key.activityId,
                                        activityName:actName.title,
                                        merchantStatus:key.merchantStatus
                                    }
                                    DATA.push(list)
                                }
                            }
                            const successMessage = {
                                success:true,
                                statusCode:200,
                                data:DATA,
                                message:'Success'
                            }
                            return successMessage
                        }else{
                            return message.message.PERMISSIONDENIDE;
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

        merchantActivity: {
            rest: {
				method: "GET",
				path: "/merchantActivity/:merchantActivityId"
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    const merchantId = ctx.params.merchantActivityId;
                    if(Auth.success != false){
                        const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                        const [token] = await this.adapter.db.query(tokenfind);
                        if(token[0].token == "null"){
                            return message.message.LOGIN;
                        }
                        if(Auth.role == 1 || Auth.role == 2 || Auth.role == 3){
                            const findmerchant = `select * from merchant_activities where id = '${merchantId}'`;
                            const [findmerchantress] = await this.adapter.db.query(findmerchant);
                            // const outletID = JSON.parse(findmerchantress[0].outletIds)
                            if(findmerchantress == ''){
                                const successMessage = {
                                    success:true,
                                    statusCode:200,
                                    data:findmerchantress
                                }
                                return successMessage 
                            }else {
                                const activityId = findmerchantress[0].activityId
                                const activity = `select * from activities where id = '${activityId}' `;
                                const [activityress] = await this.adapter.db.query(activity);
                                if(activityress != ''){
                                    const Activcat = [];
                                    for(let atv of activityress){
                                        const aId = atv.id
                                        const categories = `select acr.*,ac.id as categor_id,ac.name as category_name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${aId}'`
                                        const [categoriesress] = await this.adapter.db.query(categories);
                                           for(let catlist of categoriesress){

                                               Activcat.push(catlist) 
                                           }
                                        const activityData = {
                                            merchantActivityId : findmerchantress[0].id,
                                            merchantId : findmerchantress[0].merchantId,
                                            outletIds : findmerchantress[0].outletIds,
                                            title : findmerchantress[0].title,
                                            images : findmerchantress[0].images,
                                            quantity : findmerchantress[0].quantity,
                                            description : findmerchantress[0].description,
                                            activityDuration : findmerchantress[0].activityDuration,
                                            isReservationRequired : findmerchantress[0].isReservationRequired,
                                            isAnniversarySpecial : findmerchantress[0].isAnniversarySpecial,
                                            averageRating : findmerchantress[0].averageRating,
                                            isBestSeller : findmerchantress[0].isBestSeller,
                                            sparksCommission : findmerchantress[0].sparksCommission,
                                            sparksCommissionLastUpdated : findmerchantress[0].sparksCommissionLastUpdated,
                                            sparksCommissionLastUpdateReason : findmerchantress[0].sparksCommissionLastUpdateReason,
                                            merchantRanking : findmerchantress[0].merchantRanking,
                                            isFeatured : findmerchantress[0].isFeatured,
                                            isFeaturedStartDate : findmerchantress[0].isFeaturedStartDate,
                                            isFeaturedEndDate : findmerchantress[0].isFeaturedEndDate,
                                            expectations : findmerchantress[0].expectations,
                                            additionalInfo : findmerchantress[0].additionalInfo,
                                            terms : findmerchantress[0].terms,
                                            howToRedeem : findmerchantress[0].howToRedeem,
                                            // status : findmerchantress[0].status,
                                            status : findmerchantress[0].merchantStatus,
                                            latitude : findmerchantress[0].latitude,
                                            longitude : findmerchantress[0].longitude,
                                            validityPeriod: findmerchantress[0].validityPeriod,
                                            commisionPercentage:findmerchantress[0].commisionPercentage,
                                            createdAt: findmerchantress[0].createdAt,
                                            updatedAt: findmerchantress[0].updatedAt,
                                            activityId: atv.id,
                                            activityName:atv.title,
                                            activityType:atv.activityType,
                                            letterCollected:atv.letterCollected,
                                            activitycategories:Activcat
                                        }
                                        const successMessage = {
                                            success:true,
                                            statusCode:200,
                                            data:activityData                      
                                        }
                                        return successMessage

                                     
                                    }

                                }else{
                                    const errMessage = {
                                        success:true,
                                        statusCode:200,
                                        data:activityress
                                    }
                                    return errMessage
                                }
                            }
                           
                        }else{
                            return message.message.PERMISSIONDENIDE;
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

        edit: {
            rest: {
				method: "GET",
				path: "/edit/:id"
            },
            async handler(ctx,res,req) {
                try{
                    const Auth = ctx.meta.user;
                    const id = ctx.params.id;
                    if(Auth.success != false){
                        const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                        const [token] = await this.adapter.db.query(tokenfind);
                        if(token[0].token == "null"){
                            return message.message.LOGIN;
                        }
                        const images = JSON.stringify(ctx.params.images)
                        const activityDuration = ctx.params.activityDuration;
                        const activityId = ctx.params.activityId;
                        const merchantId = ctx.params.merchantId; 
                        const expectations = ctx.params.expectations;
                        const additionalInfo = ctx.params.additionalInfo;
                        const terms = ctx.params.terms;
                        const howToRedeem = ctx.params.howToRedeem;
                        const description = ctx.params.description;
                        const latitude = ctx.params.latitude;
                        const longitude = ctx.params.longitude;
                        const isAnniversarySpecial = ctx.params.isAnniversarySpecial;
                        const outlets = JSON.stringify(ctx.params.outlets);
                        const isReservationRequired = ctx.params.isReservationRequired;
                        const validityPeriod = ctx.params.validityPeriod;
                        const commisionPercentage = ctx.params.commisionPercentage;
                                                
                        if(Auth.role == 1){
                            const findmerchant = `select * from merchant_activities where id = '${id}'`;
                            const [findmerchantress] = await this.adapter.db.query(findmerchant);
                            if(findmerchantress != ''){
                                const outlen = findmerchantress[0].outletIds
                                const updateMerchant = `update merchant_activities set outletIds = '${outlets}',images = '${images}',description = '${description}',activityDuration = '${activityDuration}',isReservationRequired = '${isReservationRequired}',isAnniversarySpecial = '${isAnniversarySpecial}',expectations = '${expectations}',additionalInfo = '${additionalInfo}',terms = '${terms}',howToRedeem = '${howToRedeem}',latitude = '${latitude}',longitude = '${longitude}',validityPeriod = '${validityPeriod}',commisionPercentage = '${commisionPercentage}' where id = '${id}'`;
                                const [updateMerchantress] = await this.adapter.db.query(updateMerchant);
                                if(updateMerchantress.info > "Rows matched: 1  Changed: 0  Warnings: 0"){
                                    const deletmersugg = `delete from merchant_activities_suggetions where merchantActivityId = '${id}'`
                                    const [deletmersuggress] = await this.adapter.db.query(deletmersugg);
                                    let findregular;
                                    let outlen1;
                                    
                                    if(ctx.params.outlets == ''){
                                        const errMessage = {
                                            success:false,
                                            statusCode:409,
                                            message:'Please select outlets'
                                        }
                                        return errMessage
                                    }else{
                                        for(let outIDD of ctx.params.outlets){
                                            const outletsave = `insert into merchant_activities_suggetions(merchantActivityId,merchantId,activityId,outletId) values('${id}','${merchantId}','${activityId}','${outIDD}')`
                                            const [outletress] = await this.adapter.db.query(outletsave);

                                            const findmerchant1 = `select * from merchant_activities where id = '${id}'`;
                                            const [findmerchantress1] = await this.adapter.db.query(findmerchant1);
                                            outlen1 = findmerchantress1[0].outletIds
                                            // console.log({'len1':outlen1.length})

                                            const find = ` select regularDealId,outletId from regular_deals_relations where merchantActivityId = '${id}' and outletId != '${outIDD}'`
                                            const [findress] = await this.adapter.db.query(find);
                                            findregular = findress;
                                        }
                                    }
                                    if(outlen > outlen1){
                                        if(findregular == ''){
                                            return message.message.UPDATE
                                        }else{
                                            let Deal;
                                            for(let keyregular of findregular){
                                                const regID = keyregular.regularDealId;
                                                const outletiid = keyregular.outletId;

                                                // const delDealsReal = `update regular_deals_relations set outletId = '${null}' where outletId = '${outletiid}'`
                                                // const [delDealsRealress] = await this.adapter.db.query(delDealsReal);
                                                const delDealsReal = `delete from regular_deals_relations where outletId = '${outletiid}'`
                                                const [delDealsRealress] = await this.adapter.db.query(delDealsReal);
                                                // return delDealsReal
                                                const delDeals = `select * from regular_deals_relations where regularDealId = '${regID}'`
                                                const [delDealsress] = await this.adapter.db.query(delDeals);
                                                Deal = delDealsress
                                                console.log(Deal)
                                                if(Deal != ''){
                                                    return message.message.UPDATE
                                                }else{
                                                    const delDealsReal1 = `delete from  regular_deals where id = '${regID}'`
                                                    const [delDealsRealress1] = await this.adapter.db.query(delDealsReal1);
                                                }
                                                return message.message.UPDATE
                                            }
                                            // return Deal
                                        }
                                    }else{
                                        return message.message.UPDATE
                                    }
                                }else{
                                   return message.message.NOTHINGCHANGES;
                                }
                            }else{
                                const data = {
                                    status :false,
                                    statusCode:409,
                                    data:findmerchantress
                                }  
                                return data;                              
                            }
                        }else{
                            return message.message.PERMISSIONDENIDE;
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

        delete: {
            rest: {
				method: "DELETE",
				path: "/delete/:id"
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    const id = ctx.params.id;

                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }
                    if(Auth.role == 1){
                        const searchOutlet = `select * from merchant_activities where id = '${id}'`;
                        const [searchOutletress] = await this.adapter.db.query(searchOutlet);
                            if(searchOutletress != ''){
                                const deletreDeals = `delete from regular_deals_relations where merchantActivityId = '${id}'`
                                const [delerteDealsress] = await this.adapter.db.query(deletreDeals);

                                const delereDeals1 = `delete from regular_deals where merchantId = '${id}'`
                                const [delereDealsress1] = await this.adapter.db.query(delereDeals1);

                                const deletmersugg = `delete from merchant_activities_suggetions where merchantActivityId = '${id}'`
                                const [deletmersuggress] = await this.adapter.db.query(deletmersugg);
                                
                                const delereDeals = `delete from merchant_activities where id = '${id}'`
                                const [delereDealsress] = await this.adapter.db.query(delereDeals);
                                if(delereDealsress.affectedRows >= 0){
                                    return message.message.ACTIVITYDELETE
                                }else{
                                    return message.message.NOTDELTE
                                }
                            }else{
                                const errMessage = {
                                    success:true,
                                    statusCode:200,
                                    data:searchOutletress
                                } 
                                return errMessage;
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

        active: {
            rest: {
                method: "POST",
                path: "/active"
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    const merchantActivityId = ctx.params.merchantActivityId;
                    const status = ctx.params.status;

                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }

                    if(Auth.role == 1 || Auth.role == 2){
                        const merchantList = `select * from merchant_activities where id = '${merchantActivityId}'`;
                        const [merchantListress] = await this.adapter.db.query(merchantList);
                        if(merchantListress != ''){
                            const upmer = `update merchant_activities set merchantStatus = '${status}' where id = '${merchantActivityId}'`
                                const [upmerress] = await this.adapter.db.query(upmer);
                                if(upmerress.info >= "Rows matched: 1  Changed: 0  Warnings: 0"){
                                    if(status >= 1 && status <= 2){
                                        if(status == 1){
                                            const successMessage = {
                                                success:true,
                                                statusCode:200,
                                                status:status,
                                                message:"Active"
                                            }
                                            return successMessage
                                        }else if(status == 2){
                                            // for(let key of findMerress){
                                                const DealDeactive = `update regular_deals set status = '${status}' where merchantId = '${merchantActivityId}'`
                                                const [DealDeact] = await this.adapter.db.query(DealDeactive);
                                            // }
                                            const successMessage = {
                                                success:true,
                                                statusCode:200,
                                                status:status,
                                                message:"Deactive"
                                            }
                                            return successMessage
                                        }
                                    }else{
                                        const errMessage = {
                                            success:false,
                                            statusCode:409,
                                            message:'Only you can Active and Deactive'
                                        } 
                                        return errMessage
                                    }
                                }else{
                                    return message.message.NOTUPDATE;
                                }
                        }else{
                            const errMessage = {
                                success:true,
                                statusCode:200,
                                data:merchantListress
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
