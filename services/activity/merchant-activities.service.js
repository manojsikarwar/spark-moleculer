const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const jwt = require('jsonwebtoken');
const process = require('../../mixins/db.config');
const message = require('../../lib/message');


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
            // id:Sequelize.INTEGER,
            merchantId: Sequelize.INTEGER,
            activityId: Sequelize.INTEGER,
            outletIds: Sequelize.JSON,
			title: Sequelize.STRING,
			images: Sequelize.JSON,
			quantity: Sequelize.INTEGER,
			description: Sequelize.STRING,
			activityDuration: Sequelize.INTEGER,
			isReservationRequired: Sequelize.STRING,
			isAnniversarySpecial: Sequelize.STRING,
            averageRating: Sequelize.INTEGER,
            isBestSeller: Sequelize.STRING,
            isAnnisparksCommissionversarySpecial: Sequelize.STRING,
            sparksCommissionLastUpdated: Sequelize.STRING,
            sparksCommissionLastUpdateReason: Sequelize.STRING,
            merchantRanking: Sequelize.STRING,
            rankingStartDate: Sequelize.DATE,
            rankingEndDate: Sequelize.DATE,
            isFeatured: Sequelize.STRING,
            isFeaturedStartDate: Sequelize.DATE,
            isFeaturedEndDate: Sequelize.DATE,
            expectations: Sequelize.TEXT,
            additionalInfo: Sequelize.TEXT,
            terms: Sequelize.TEXT,
            howToRedeem: Sequelize.TEXT,
            status: Sequelize.INTEGER,
            createdBy: Sequelize.INTEGER,
            updatedBy: Sequelize.INTEGER,
            createdAt : Sequelize.DATE,
            updatedAt : Sequelize.DATE
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
                    const adminId = Auth.role;
                    if(Auth == null){
                        return message.message.UNAUTHORIZED;
                    }
                    if(adminId == 1){
                        const merchantId = ctx.params.merchantId;//
                        const activityId = ctx.params.activityId;//
                        const outletIds = JSON.stringify(ctx.params.outlets);//
                        const title = ctx.params.title;//
                        const images = JSON.stringify(ctx.params.images);//
                        const quantity = ctx.params.quantity || 1;
                        const description = ctx.params.description;//
                        const activityDuration = ctx.params.activityDuration;//
                        const isReservationRequired = ctx.params.isReservationRequired || 0;
                        const isAnniversarySpecial = ctx.params.isAnniversarySpecial;//
                        const averageRating = ctx.params.averageRating || 4;
                        const isBestSeller = ctx.params.isBestSeller || 0;
                        const sparksCommission = ctx.params.sparksCommission || 10;
                        const sparksCommissionLastUpdated = ctx.params.sparksCommissionLastUpdated || 1;
                        const sparksCommissionLastUpdateReason = ctx.params.sparksCommissionLastUpdateReason || 'sparksCommissionLastUpdateReason Text';
                        const merchantRanking = ctx.params.merchantRanking || 4;
                        const rankingStartDate = ctx.params.rankingStartDate;
                        const rankingEndDate = ctx.params.rankingEndDate;
                        const isFeatured = ctx.params.isFeatured || 0;
                        const isFeaturedStartDate = ctx.params.isFeaturedStartDate;
                        const isFeaturedEndDate = ctx.params.isFeaturedEndDate;
                        const expectations = ctx.params.expectations;//
                        const additionalInfo = ctx.params.additionalInfo;//
                        const terms = ctx.params.terms;//
                        const howToRedeem = ctx.params.howToRedeem;//
                        const status = 1;
                        const createdBy = adminId;
                        const updatedBy = adminId;
                        // return isAnniversarySpecial
                        const checkTitle = `select * from merchant_activities where title = '${title}'`
                        const [checkTitleress] = await this.adapter.db.query(checkTitle);
                        // return checkTitleress
                        if(checkTitleress != ""){
                            return message.message.ALREADYTITLE;
                        }else{
                            const merchantActivity = `insert into merchant_activities(merchantId,activityId,outletIds,title,images,quantity,description,activityDuration,isReservationRequired,isAnniversarySpecial,averageRating,isBestSeller,sparksCommission,sparksCommissionLastUpdated,sparksCommissionLastUpdateReason,merchantRanking,isFeatured,expectations,additionalInfo,terms,howToRedeem,status,createdBy,updatedBy) values('${merchantId}','${activityId}','${outletIds}','${title}','${images}','${quantity}','${description}','${activityDuration}','${isReservationRequired}','${isAnniversarySpecial}','${averageRating}','${isBestSeller}','${sparksCommission}','${sparksCommissionLastUpdated}','${sparksCommissionLastUpdateReason}','${merchantRanking}','${isFeatured}','${expectations}','${additionalInfo}','${terms}','${howToRedeem}','${status}','${createdBy}','${updatedBy}')`;
                            
                            // return 'merchantActivity'
                            const [merchantActivityress] = await this.adapter.db.query(merchantActivity);
                            if(merchantActivityress){
                                // const activityId = res;
                              return message.message.SAVE;
                            }else{
                                const successMessage = {
                                    success:false,
                                    status: 500,
                                    message:'Not save'
                                }
                                return successMessage;
                            }

                        }
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

    },
    
}
