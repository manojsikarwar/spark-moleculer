const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const jwt = require('jsonwebtoken');
const process = require('../../mixins/db.config');

module.exports = {
    name: 'activites',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),
    
    model: {
        name: "activitie",
        define: {
            // id:Sequelize.INTEGER,
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

        list: {
            rest: {
				method: "GET",
				path: "/list/:id"
            },
            async handler(ctx) {
                const id = ctx.params.id;
                const sql = `select * from activities where id = '${id}'`
				return this.adapter.db.query(sql)
				.then(([res, metadata]) => {
					const successMessage = {
						success:true,
						status: 200,
						data: res
					}
					return successMessage
				});
			}
        },
        
        activityAll_list: {
            rest: {
				method: "GET",
				path: "/activityAll_list"
            },
            async handler(ctx) {
				return this.adapter.db.query("SELECT * FROM activities ORDER BY id DESC")
				.then(([res, metadata]) => {
					const successMessage = {
						success:true,
						status: 200,
						data:res
					}
					return successMessage
				});
			}
        },

        create: {
            rest: {
				method: "POST",
				path: "/create"
            },
            async handler(ctx) {
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

                const sql = `insert into activities(title,description,images,activityType,letterCollected,isBestSeller,bestSellerDuration,bestSellerStartDate,bestSellerEndDate,suggestionHeader,status) values('${title}','${description}','${images}','${activityType}','${letterCollected}','${isBestSeller}','${bestSellerDuration}','${bestSellerStartDate}','${bestSellerEndDate}','${suggestionHeader}','${status}')`;
              
				const [res] = await this.adapter.db.query(sql)
                if(res){
                    var successMessage;
                    const activityId = res;
                    if(categoryIds == ''){
                        return process.message.ACTIVITYCREATE;
                    }else{
                        for(let activityCategoryId of categoryIds){
                            const cat = `insert into activity_category_relations(activityId,activityCategoryId) values('${activityId}','${activityCategoryId}')`;
                            const [res1] = await this.adapter.db.query(cat); 
                          
                            return process.message.ACTIVITYCREATE;
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

        activityDelete: {
            rest: {
				method: "DELETE",
				path: "/activityDelete/:id"
            },
            async handler(ctx) {
                const id = ctx.params.id;

                const searchID = `select * from activities where id = '${id}'`
				return this.adapter.db.query(searchID)
				.then(([searchIDress, metadata]) => {
                    if(searchIDress == ''){
                        const successMessage = {
                            success:true,
                            status: 200,
                            data: searchIDress
                        }
                        return successMessage;
                    }else {
                        const searchCategory = `select * from activity_category_relations where id = '${id}'`;
                        return this.adapter.db.query(searchCategory)
                        .then(([searchCategoryress,metadata]) => {
                            if(searchCategory == ''){
                                const deleteID = `delete from activities where id = '${id}'`;
                                return this.adapter.db.query(deleteID)
                                .then(([deleteIDress,metadata]) => {
                                    if(deleteIDress.affectedRows >= '1'){
                                        return process.message.ACTIVITYDELETE; 
                                    }else {
                                        return process.message.NOTDELTE; 
                                    }
                                })

                            }else {
                                const errorMessage = {
                                    success:flase,
                                    status: 200,
                                    message: "not deleted"
                                }
                                return errorMessage;
                            }
                        })
                    }
				});
			}
        },


        activityCategoryList: {
            rest: {
				method: "GET",
				path: "/activityCategoryList"
            },
            async handler(ctx) {
                // console.log(ctx.meta)
                try{
                    // const Auth = ctx.meta.user
                    // if(Auth == null){
                    //     return process.message.UNAUTHORIZED;
                    // }else{
                        const List = [];
                        const sql = `select * from activity_categories`
                        const [searcActivityress] = await this.adapter.db.query(sql);
                        for(let key of searcActivityress){
                            const list = {
                                id:key.id,
                                name:key.name,
                                images:JSON.parse(key.images)
                            }
                            List.push(list);
                        }
                        const successMessage = {
                            success:true,
                            status: 200,
                            data: List,
                            message:'Success'
                        }
                        if(searcActivityress == ''){
                            return successMessage;
                        }else{
                            return successMessage;
                        }
                    // }
                }catch(error){
                    return error
                }
			}
        },


    },
    
}
