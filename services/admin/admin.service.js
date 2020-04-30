const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require('../../mixins/db.config');
const message = require('../../lib/message');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { uuid } = require('uuidv4');
const nodemailer = require("nodemailer");
const role = message.roles.admin
console.log(role)
module.exports = {
    name: "admin",
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),

    model: {
        name: "admin",
        define: {
            name:Sequelize.STRING,
            email: Sequelize.STRING,
            password: Sequelize.STRING,
            status: Sequelize.INTEGER,
            token: Sequelize.STRING,
            createdBy: Sequelize.INTEGER,
            updatedBy: Sequelize.INTEGER,
            createdAt : Sequelize.DATE,
            updatedAt : Sequelize.DATE
        },
        options: {}
    },
    actions: {

        signin: {
            rest: {
				method: "POST",
				path: "/signin"
            },
            async handler(ctx) {
                try{
                    const email = ctx.params.email;
                    const password = ctx.params.password;
                    const checkAdmin = `select * from admins where email = '${email}'`;
                    const [checkAdminress] = await this.adapter.db.query(checkAdmin);
                    if(checkAdminress != ''){
                        // return checkAdminress
                        const pwd = checkAdminress[0].password;
                        var matchResult = await bcrypt.compare(password,pwd);
                        if(matchResult == true){
                            const adminId = checkAdminress[0].id;

                            var token = jwt.sign({
                                id: adminId,
                                email:checkAdminress[0].email,
                                status: checkAdminress[0].status,
                                role:role,
                            }, 'secretkey', { expiresIn: '12h' });
                            const adminData = {
                                id: adminId,
                                name: checkAdminress[0].name,
                                email: checkAdminress[0].email,
                                password: checkAdminress[0].password,
                                status: checkAdminress[0].status,
                                createdBy: checkAdminress[0].createdBy,
                                updatedBy: checkAdminress[0].updatedBy,
                                createdAt:checkAdminress[0].createdAt,
                                updatedAt:checkAdminress[0].updatedAt,
                                token: token
                            }
           
                            const successMessage = {
                                  success:true,
                                  statusCode:200,
                                  data:adminData,
                                  message:'Success'
                            }
                            return successMessage;
                        }else {
                            return message.message.PASSWORDDUP;
                        }
                    }else {
                        return message.message.USERNOTFOUND;
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