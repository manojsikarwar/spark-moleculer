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
    name: 'outlets',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),
    
    model: {
        name: "outlet",
        define: {
            merchantId: {type: Sequelize.INTEGER},
            outletName: {type: Sequelize.STRING},
            outletEmail: {type: Sequelize.STRING},
			outletExtension: {type: Sequelize.STRING},
			outletMobile: {type: Sequelize.INTEGER},
            openingHours: {type: Sequelize.JSON},
            region: {type: Sequelize.STRING},
			streetAddress: {type: Sequelize.STRING},
			address: {type: Sequelize.STRING},
            postalCode: {type: Sequelize.STRING},
            mrtLatitude: {type: Sequelize.STRING},
            mrtLongitude: {type: Sequelize.STRING},
            trainStations: {type: Sequelize.STRING},
			status: {type: Sequelize.INTEGER},
			createdBy: {type: Sequelize.INTEGER},
			modifiedBy: {type: Sequelize.INTEGER},
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
                    const adminId = Auth.role;
                    const merchantId = ctx.params.merchantId;
                    const outletName = ctx.params.outletname;
                    const outletEmail = ctx.params.outletemail;
                    const outletExtension = ctx.params.outletExtension;
                    const outletMobile = ctx.params.outletMobile;
                    const openingHours = JSON.stringify(ctx.params.openingHours);
                    const activity_location = ctx.params.activity_location;
                    const streetAddress = activity_location.streetAddress;
                    const address = activity_location.address;
                    const region = activity_location.region
                    const trainStations = activity_location.trainStations
                    const mrtLatitude = activity_location.mrtLatitude
                    const mrtLongitude = activity_location.mrtLongitude
                    const postalCode = activity_location.postalCode;
                    const status = 1;//active
                    const createdBy = adminId;
                    const modifiedBy = adminId;
                    if(Auth.success == false){
                        return Auth;
                    }else{
                        const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                        const [token] = await this.adapter.db.query(tokenfind);
                        if(token[0].token == "null"){
                            return message.message.LOGIN;
                        }
                        if(adminId == 1){
                            const outletCreate = `insert into outlets(merchantId,outletName,outletEmail,outletExtension,outletMobile,openingHours,region,streetAddress,address,postalCode,mrtLatitude,mrtLongitude,trainStations,status,createdBy,modifiedBy) values('${merchantId}','${outletName}','${outletEmail}','${outletExtension}','${outletMobile}','${openingHours}','${region}','${streetAddress}','${address}','${postalCode}','${mrtLatitude}','${mrtLongitude}','${trainStations}','${status}','${createdBy}','${modifiedBy}')`;
                            // return outletCreate
                            const [outletCreateress] = await this.adapter.db.query(outletCreate);
                            if(outletCreateress){
                                const successMessage = {
                                    status:true,
                                    statusCode:200,
                                    message:'Save'
                                }
                                return successMessage
                            }else{
                                const successMessage = {
                                    status:false,
                                    statusCode:409,
                                    message:'Note save'
                                }
                                return successMessage
                            }
                        }else{
                            return message.message.PERMISSIONDENIDE;
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

        outletsList: {
            rest: {
				method: "GET",
				path: "/outletsList/:merchantId"
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    const OUTLETS = [];
                    const id = ctx.params.merchantId;
                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }
                    if(Auth.role == 1){
                        const outletList = `SELECT * FROM outlets where merchantId = '${id}'`;
                        const [outletListress] = await this.adapter.db.query(outletList);
                        for(let rest of outletListress){
                            OUTLETS.push(rest)
                        }
                            const successMessage = {
                                success:true,
                                status: 200,
                                data:OUTLETS
                            }
                            if(outletListress != ''){
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

        list: {
            rest: {
				method: "GET",
				path: "/list/:outletId"
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    const id = ctx.params.outletId;
                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }
                    if(Auth.role == 1 || Auth.role == 2){
                        const outletList = `SELECT * FROM outlets where id = '${id}'`;
                        const [outletListress] = await this.adapter.db.query(outletList);
                            const successMessage = {
                                success:true,
                                status: 200,
                                data:outletListress
                            }
                            if(outletListress != ''){
                                for(let data of outletListress){
                                    const Data = {
                                        status:true,
                                        statusCode:200,
                                        data:data
                                    }
                                    return Data
                                }
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
                    const id = ctx.params.outletId;
                    const outletName = ctx.params.outletname;
                    const outletEmail = ctx.params.outletemail;
                    const outletExtension = ctx.params.outletExtension;
                    const outletMobile = ctx.params.outletMobile;
                    const openingHours = JSON.stringify(ctx.params.openingHours);
                    const activity_location = ctx.params.activity_location;
                    const region = activity_location.region;
                    const streetAddress = activity_location.streetAddress;
                    const address = activity_location.address;
                    const postalCode = activity_location.postalCode;
                    const mrtLatitude = activity_location.mrtLatitude;
                    const mrtLongitude = activity_location.mrtLongitude;
                    const trainStations = activity_location.trainStations;
                   
                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }
                    if(Auth.role == 1){
                        if(id != ''){
                            const outletList = `SELECT * FROM outlets where id = '${id}'`;
                            const [outletListress] = await this.adapter.db.query(outletList);
                                const successMessage = {
                                    success:true,
                                    status: 200,
                                    data:outletListress
                                }
                                if(outletListress != ''){
                                    const updateOutlet = `update outlets set outletName = '${outletName}',outletEmail = '${outletEmail}',outletExtension = '${outletExtension}',outletMobile = '${outletMobile}',openingHours = '${openingHours}',region = '${region}',streetAddress = '${streetAddress}',address = '${address}',postalCode = '${postalCode}',mrtLatitude = '${mrtLatitude}',mrtLongitude = '${mrtLongitude}',trainStations = '${trainStations}' where id = '${id}'`
                                    const [updateOutletress] = await this.adapter.db.query(updateOutlet);
                                    if(updateOutletress.info >= "Rows matched: 1  Changed: 0  Warnings: 0"){
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

        outlet_list: {
            rest: {
				method: "GET",
				path: "/outlet_list/:merchantActivityId"
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    const id = ctx.params.merchantActivityId;
                    const OUTLETS = [];

                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }

                    if(Auth.role == 1 || Auth.role == 2 || Auth.role == 3){
                        const searchMerchantActivity = `select * from merchant_activities where id = '${id}'`;
                        const [MerchantActivity] = await this.adapter.db.query(searchMerchantActivity);
                        
                        if(MerchantActivity != ''){
                            for(let merAct of MerchantActivity){
                                for(let outId of merAct.outletIds){
                                    const getOutlet = `select * from outlets where id = '${outId}'`
                                    const [getOutletress] = await this.adapter.db.query(getOutlet);
                                    for(let rest of getOutletress){
                                        OUTLETS.push(rest)
                                    }
                                }                                
                            }
                            const successMessage = {
                                success:true,
                                statusCode:200,
                                data:OUTLETS
                            }
                            return successMessage
                                
                        }else{
                            const errMessage = {
                                success:true,
                                statusCode:200,
                                data:MerchantActivity
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

        delete: {
            rest: {
				method: "DELETE",
				path: "/delete/:id"
            },
            async handler(ctx) {
                try{
                    const Auth = ctx.meta.user;
                    const id = ctx.params.id;
                    const ID = [];
                   
                    if(Auth.success == false){
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if(token[0].token == "null"){
                        return message.message.LOGIN;
                    }
                    if(Auth.role == 1){
                        if(id != ''){
                            const outletList = `SELECT * FROM outlets where id = '${id}'`;
                            const [outletListress] = await this.adapter.db.query(outletList);
                            const successMessage = {
                                success:true,
                                status: 200,
                                data:outletListress
                            }
                            if(outletListress != ''){
                                const merId = `select merchantActivityId from merchant_activities_suggetions where outletId = '${id}'`
                                const [merIdress] = await this.adapter.db.query(merId);
                                if(merIdress == ''){
                                    const delOutlet = `delete from outlets where id = '${id}'`
                                    const [delOutletress] = await this.adapter.db.query(delOutlet);
                                    if(delOutletress.affectedRows >= 1){
                                        return message.message.DELETE;
                                    }else{
                                        return message.message.NOTDELTE;
                                    }
                                }else {
                                    const merchantActivityId = merIdress[0].merchantActivityId;
                                    const delLocation = `delete from merchant_activities_suggetions where outletId = '${id}'`
                                    const [delLocationress] = await this.adapter.db.query(delLocation);
                                    if(delLocationress.affectedRows >= 1){
                                        const findMer = `select outletId from merchant_activities_suggetions where merchantActivityId = '${merchantActivityId}'`
                                        const [findMerress] = await this.adapter.db.query(findMer);
                                        for(let outIID of findMerress){
                                            const idoutlet = outIID.outletId
                                            ID.push(idoutlet)
                                        }
                                        
                                        const meroutlet = JSON.stringify(ID)
                                        const updateMER = `update merchant_activities set outletIds = '${meroutlet}' where id = '${merchantActivityId}'`
                                        const [updateMERress] = await this.adapter.db.query(updateMER);
                                        const find = ` select regularDealId from regular_deals_relations where outletId = '${id}'`
                                        const [findress] = await this.adapter.db.query(find);
                                        if(findress == ''){
                                            const delOutlet = `delete from outlets where id = '${id}'`
                                            const [delOutletress] = await this.adapter.db.query(delOutlet);
                                            if(delOutletress.affectedRows >= 1){
                                                return message.message.DELETE;
                                            }else{
                                                return message.message.NOTDELTE;
                                            }
                                        }else{
                                            const delDealsReal = `delete from regular_deals_relations where outletId = '${id}'`
                                            const [delDealsRealress] = await this.adapter.db.query(delDealsReal);
                                            for(let keydata of findress){
                                                const regID = keydata.regularDealId
                                                const find = ` select * from regular_deals_relations where regularDealId = '${regID}'`
                                                const [findress] = await this.adapter.db.query(find);
                                                if(findress == ""){
                                                    const delDeals = `delete from regular_deals where id = '${regID}'`
                                                    const [delDealsress] = await this.adapter.db.query(delDeals);
                                                }
                                            }
                                            
                                            const delOutlet = `delete from outlets where id = '${id}'`
                                            const [delOutletress] = await this.adapter.db.query(delOutlet);
                                            if(delOutletress.affectedRows >= 1){
                                                return message.message.DELETE;
                                            }else{
                                                return message.message.NOTDELTE;
                                            }
                                        }
                                    }else{
                                        return message.message.NOTDELTE;
                                    }
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
