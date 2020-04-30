const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const jwt = require('jsonwebtoken');
const process = require('../../mixins/db.config');
const message = require('../../lib/message');


module.exports = {
    name: 'merchant-activities',
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
                const Auth = ctx.meta.user;
                if(Auth == null){
                    return message.message.UNAUTHORIZED;
                }
                const title = ctx.params.title;
                const description = ctx.params.description;
                const images = JSON.stringify(ctx.params.images);
                const activityType = ctx.params.activityType;
                const letterCollected = ctx.params.letterCollected;
                const isBestSeller = ctx.params.isBestSeller || '0';
                const bestSellerDuration = ctx.params.bestSellerDuration;
                const bestSellerStartDate = ctx.params.bestSellerStartDate;
                const bestSellerEndDate = ctx.params.bestSellerEndDate;
                const suggestionHeader = ctx.params.suggestionHeader;
                const status = ctx.params.status || '1';
                const categoryIds = ctx.params.categoryIds;

                const sql = `insert into merchant_activities(title,description,images,activityType,letterCollected,isBestSeller,bestSellerDuration,bestSellerStartDate,bestSellerEndDate,suggestionHeader,status) values('${title}','${description}','${images}','${activityType}','${letterCollected}','${isBestSeller}','${bestSellerDuration}','${bestSellerStartDate}','${bestSellerEndDate}','${suggestionHeader}','${status}')`;
              
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
                          
                            return message.message.ACTIVITYCREATE;
                        }
                    }
                }else{
                    const successMessage = {
                        success:false,
                        status: 500,
                        message:'Not save'
                    }
                    return successMessage;
                }
			}
        },




 

    },
    
}
