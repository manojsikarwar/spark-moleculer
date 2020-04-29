const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require('../../mixins/db.config');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { uuid } = require('uuidv4');
const nodemailer = require("nodemailer");
const role = process.roles.merchant;


module.exports = {
    name: 'merchants',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),
    
    model: {
        name: "merchant",
        define: {
            merchantName:Sequelize.STRING,
            merchantLogo: Sequelize.STRING,
            password: Sequelize.STRING,
			merchantWebsite: Sequelize.STRING,
			contactPersonForSparks: Sequelize.STRING,
			contactEmail: Sequelize.STRING,
			mobileForSparks: Sequelize.STRING,
			notes: Sequelize.STRING,
			status: Sequelize.STRING,
            bank	: Sequelize.JSON,
            connect_id: Sequelize.STRING,
            stripeMerchantId: Sequelize.STRING,
            createdBy: Sequelize.INTEGER,
            updatedBy: Sequelize.INTEGER,
            createdAt : Sequelize.DATE,
            updatedAt : Sequelize.DATE
        },
        options: {}
    },

    actions: {

        signup: {
            rest: {
				method: "POST",
				path: "/signup"
            },
            async handler(ctx) {
                try{
                    const password = '123456';
                    const merchantName = ctx.params.merchantName;
                    const merchantLogo = ctx.params.merchantLogo;
                    const merchantSignUpEmail = ctx.params.merchantSignUpEmail;
                    const merchantWebsite = ctx.params.merchantWebsite;
                    const contactPersonForSparks = ctx.params.contactPersonForSparks || null;
                    const contactEmail = ctx.params.contactEmail || null;
                    const mobileForSparks = JSON.stringify(ctx.params.mobileForSparks) || null;
                    const notes = ctx.params.notes || null;
                    const status = 1;
                    const bank = ctx.params.bank || null;
                    const connect_id = ctx.params.connect_id || null;
                    const stripeMerchantId = ctx.params.stripeMerchantId || null;
                    const createdBy = 1;
                    const updatedBy = 1;
                    const hash = await bcrypt.hash(password,10);
                    const checkMerchant = `select * from merchants where merchantName = '${merchantName}' and merchantSignUpEmail = '${merchantSignUpEmail}'`;
                    const [checkMerchantress] = await this.adapter.db.query(checkMerchant)
                    if(checkMerchantress != ''){
                        return process.message.UNIQMERCHANT;
                    }else{
                        const hash1 = await bcrypt.hash(password,10);
                        const saveMerchant = `insert into merchants(merchantName,merchantLogo,merchantSignUpEmail,password,merchantWebsite,contactPersonForSparks,contactEmail,mobileForSparks,notes,status,bank,connect_id,stripeMerchantId,createdBy,updatedBy) values('${merchantName}','${merchantLogo}','${merchantSignUpEmail}','${hash}','${merchantWebsite}','${contactPersonForSparks}','${contactEmail}','${mobileForSparks}','${notes}','${status}','${bank}','${connect_id}','${stripeMerchantId}','${createdBy}','${updatedBy}')`;
                        const [saveMerchantress] = await this.adapter.db.query(saveMerchant);
                        
                        return saveMerchantress
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

        signin: {
            rest: {
				method: "POST",
				path: "/signin"
            },
            async handler(ctx) {
                try{
                    const merchantSignUpEmail = ctx.params.merchantSignUpEmail;
                    const password = ctx.params.password;
                    const checkMerchant = `select * from merchants where merchantSignUpEmail = '${merchantSignUpEmail}'`;
                    const [checkMerchantress] = await this.adapter.db.query(checkMerchant);
                    if(checkMerchantress != ''){
                        const pwd = checkMerchantress[0].password;
                        var matchResult = await bcrypt.compare(password,pwd);
                        if(matchResult == true){
                            const userId = checkMerchantress[0].id;

                            var token = jwt.sign({
                                id: userId,
                                email:checkMerchantress[0].email,
                                status: checkMerchantress[0].status,
                                role:role,
                            }, 'secret', { expiresIn: '12h' });
                            const userdata = {
                                id: userId,
                                firstName: checkMerchantress[0].firstName,
                                lastName: checkMerchantress[0].lastName,
                                email: checkMerchantress[0].email,
                                gender: checkMerchantress[0].gender,
                                profilePic: checkMerchantress[0].profilePic,
                                mobileNo: checkMerchantress[0].mobileNo,
                                dob: checkMerchantress[0].dob,
                                coupleCode: checkMerchantress[0].coupleCode,
                                status: checkMerchantress[0].status,
                                createdAt:checkMerchantress[0].createdAt,
                                updatedAt:checkMerchantress[0].updatedAt,
                                user_preference: {
                                    userId: userId,
                                    token: token
                                }
                            }
           
                            const successMessage = {
                                  success:true,
                                  statusCode:200,
                                  data:userdata,
                                  message:'Success'
                            }
                            const checkToken  = `select * from authentications where user_id = '${userId}'`;
                            const [checkTokenress] = await this.adapter.db.query(checkToken);
                            if(checkTokenress != ''){
                                const updateToken = `update authentications set token = '${token}' where user_id = '${userId}'`
                                const [updateTokenress] = await this.adapter.db.query(updateToken);
                                if(updateTokenress.affectedRows >= 1){

                                    return successMessage
                                }else{
                                    return process.message.LOGINFAIL;
                                }
                            }else {
                                const saveToken = `insert into authentications(type,user_id,token) values('${'user'}','${userId}','${token}')`
                                const [saveTokenress] = await this.adapter.db.query(saveToken);
                                if(saveTokenress){
                                    return successMessage;
                                }else {
                                    return process.message.LOGINFAIL;
                                }
                            }
                        }else {
                            return process.message.PASSWORDDUP;
                        }
                    }else {
                        return process.message.USERNOTFOUND;
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
