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
    name: 'freeActivitySuggestion',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
    }),
    
    model: {
        name: "free_activity_suggestion",
        define: {
            activityId: {type: Sequelize.INTEGER},
            title: {type: Sequelize.STRING},
            suggestionType: {type: Sequelize.INTEGER},
            subTitle: {type: Sequelize.STRING},
            images: {type: Sequelize.JSON},
            suggestionCategories: {type: Sequelize.JSON},
            status: {type: Sequelize.INTEGER},
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
                const Auth = ctx.meta.user;
                if(Auth.success == false){
                    return Auth;
                }
                const activityId = ctx.params.activityId;
                const freeTitle = ctx.params.title;
                const subTitle = ctx.params.subTitle;
                const suggestionType = ctx.params.suggestionType;
                const freeImages = JSON.stringify(ctx.params.images);
                const suggestionCategories = JSON.stringify(ctx.params.suggestionCategories);
                const createdBy = Auth.id;
                const updatedBy = Auth.id;

                const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                const [token] = await this.adapter.db.query(tokenfind);
                if(token[0].token == "null"){
                    return message.message.LOGIN;
                }
                
                const freesuggestion = `select * from free_activity_suggestions where title = '${freeTitle}'`
                const [freesuggestionress] = await this.adapter.db.query(freesuggestion);
                if(freesuggestionress != ''){
                    return message.message.FREEALREADYTITLE;
                }else{
                    const freesuggetionInsert = `insert into free_activity_suggestions(activityId,title,suggestionType,subTitle,images,suggestionCategories,status,createdBy,updatedBy) value('${activityId}','${freeTitle}','${suggestionType}','${subTitle}','${freeImages}','${suggestionCategories}','${1}','${createdBy}','${updatedBy}') `
                    const [freesuggetionInsertress] = await this.adapter.db.query(freesuggetionInsert);
                    
                        return message.message.SAVE
                }
                      
			}
        },

        edit: {
            rest: {
				method: "PUT",
				path: "/edit/:freesuggestionID"
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    const freesuggestionID = ctx.params.freesuggestionID;
                    const activityId = ctx.params.activityId;
                    const title = ctx.params.title;
                    const suggestionType = ctx.params.suggestionType;
                    const subTitle = ctx.params.subTitle;
                    const images = JSON.stringify(ctx.params.images);
                    const suggestionCategories = JSON.stringify(ctx.params.suggestionCategories);
                    // const suggestionHeader = ctx.params.suggestionHeader
                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }
                    if(Auth.role == 1){
                        if(activityId != ''){
                            const freeSuggestion = `SELECT * FROM free_activity_suggestions where id = '${freesuggestionID}'`;
                            const [freeSuggestionress] = await this.adapter.db.query(freeSuggestion);
                                const successMessage = {
                                    success:true,
                                    status: 200,
                                    data:freeSuggestionress
                                }
                                if(freeSuggestionress != ''){
                                    // const activityId = freesuggestionress[0].activityId
                                    const updateSuggestion = `update free_activity_suggestions set title = '${title}',suggestionType = '${suggestionType}',subTitle = '${subTitle}',images = '${images}' where id = '${freesuggestionID}'`
                                    const [updateSuggestionress] = await this.adapter.db.query(updateSuggestion);
                                    // return updateSuggestionress
                                    if(updateSuggestionress.info > "Rows matched: 1  Changed: 0  Warnings: 0"){
                                    //     const ativityUpdate = `update activities set suggestionHeader = '${suggestionHeader}' where id = '${activityId}'`
                                    // const [ativityUpdateress] = await this.adapter.db.query(ativityUpdate);
                                        return message.message.UPDATE;
                                    }else{
                                        return message.message.NOTHINGCHANGES;
                                    }
                                }else{
                                    return successMessage
                                }
                        }else{
                            return message.message.FIELDS
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
