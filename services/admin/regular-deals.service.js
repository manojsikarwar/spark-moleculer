const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require('../../mixins/db.config');
const message = require('../../lib/message');
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();
var hh = today.getHours();
var mi = today.getMinutes();
var ss = today.getSeconds();
today = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + mi + ':' + ss;

module.exports = {
    name: 'regular_deals',
    mixins: [DbService],

    adapter: new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,

    }),

    model: {
        name: "regular_deal",
        define: {
            merchantId: { type: Sequelize.INTEGER },
            title: { type: Sequelize.INTEGER },
            description: { type: Sequelize.JSON },
            originalPrice: { type: Sequelize.STRING },
            discountedPrice: { type: Sequelize.JSON },
            discountedPercentage: { type: Sequelize.INTEGER },
            discountAmount: { type: Sequelize.STRING },
            validityPeriod: { type: Sequelize.INTEGER },
            status: { type: Sequelize.STRING },
            createdBy: { type: Sequelize.STRING },
            modifiedBy: { type: Sequelize.INTEGER },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
        },
        options: {}
    },

    actions: {
        async SavePrice(ctx) {
            const activityDiscountPrice = ctx.params.activityDiscountPrice;
            const originalPrice = ctx.params.originalPrice;
            const discountedPercentage = ctx.params.discountedPercentage;
            const discountedPrice = ctx.params.discountedPrice;
            const discountAmount = ctx.params.discountAmount;
            const activityId = ctx.params.activityId;
            const actid = ctx.params.actid

            if (activityDiscountPrice == 0) {
                const updateprice = `update activities set originalPrice = '${originalPrice}',discountedPercentage = '${discountedPercentage}', discountedPrice = '${discountedPrice}',discountAmount = '${discountAmount}' where id = '${actid}'`
                const [priceUpdate] = await this.adapter.db.query(updateprice);
                console.log('manojasdjflkasdjfl;kasdjfl;kasjdfj')
                if (priceUpdate.info >= "Rows matched: 1  Changed: 0  Warnings: 0") {
                    const merchantAct = `select * from merchant_activities where activityId = '${activityId}'`
                    const [MerAct] = await this.adapter.db.query(merchantAct);
                    if (MerAct == '') {
                        const succcessMessage = {
                            success: false,
                            statusCode: 409,
                            message: 'merchant not found'
                        }
                        return succcessMessage;
                    } else {
                        for (let merID of MerAct) {
                            const MERID = merID.activityId;
                            if (merID.min_discountedPrice == 0) {
                                const updateprice = `update merchant_activities set min_originalPrice = '${originalPrice}',min_discountedPercentage = '${discountedPercentage}', min_discountedPrice = '${discountedPrice}',min_discountAmount = '${discountAmount}' where activityId = '${MERID}'`
                                const [priceUpdate] = await this.adapter.db.query(updateprice);
                            } else if (merID.min_discountedPrice > discountedPrice) {
                                const updateprice = `update merchant_activities set min_originalPrice = '${originalPrice}',min_discountedPercentage = '${discountedPercentage}', min_discountedPrice = '${discountedPrice}',min_discountAmount = '${discountAmount}' where activityId = '${MERID}'`
                                const [priceUpdate] = await this.adapter.db.query(updateprice);
                            }
                        }
                    }
                }
            } else if (activityDiscountPrice > discountedPrice) {
                const updateprice = `update activities set originalPrice = '${originalPrice}',discountedPercentage = '${discountedPercentage}', discountedPrice = '${discountedPrice}',discountAmount = '${discountAmount}' where id = '${actid}'`
                const [priceUpdate] = await this.adapter.db.query(updateprice);
                const merchantAct = `select * from merchant_activities where activityId = '${activityId}'`
                const [MerAct] = await this.adapter.db.query(merchantAct);
                if (MerAct == '') {
                    const succcessMessage = {
                        success: false,
                        statusCode: 409,
                        message: 'merchant not found'
                    }
                    return succcessMessage;
                } else {
                    for (let merID of MerAct) {
                        const MERID = merID.activityId;
                        if (merID.min_discountedPrice == 0) {
                            const updateprice = `update merchant_activities set min_originalPrice = '${originalPrice}',min_discountedPercentage = '${discountedPercentage}', min_discountedPrice = '${discountedPrice}',min_discountAmount = '${discountAmount}' where activityId = '${MERID}'`
                            const [priceUpdate] = await this.adapter.db.query(updateprice);
                        } else if (merID.min_discountedPrice > discountedPrice) {
                            const updateprice = `update merchant_activities set min_originalPrice = '${originalPrice}',min_discountedPercentage = '${discountedPercentage}', min_discountedPrice = '${discountedPrice}',min_discountAmount = '${discountAmount}' where activityId = '${MERID}'`
                            const [priceUpdate] = await this.adapter.db.query(updateprice);
                        }
                    }
                }

            }
        },

        async ActiveModule(ctx) {
            const regularId = ctx.params.regularId;
            const Sql = `SELECT merchantId FROM regular_deals WHERE id='${regularId}'`;
            const [SqlResult] = await this.adapter.db.query(Sql);
            if (SqlResult[0].merchantId != '') {
                const merId = SqlResult[0].merchantId
                const RegualrDeal = `SELECT COUNT(*)as count FROM regular_deals WHERE merchantId='${merId}' AND status='1'`;
                const [RegualrDealResult] = await this.adapter.db.query(RegualrDeal);
                const Count = RegualrDealResult[0].count
                if (Count === 0) {
                    const MerchantActivities = `UPDATE merchant_activities SET merchantStatus = '${2}' WHERE id= '${merId}'`;
                    const [MerchantActivitiesResult] = await this.adapter.db.query(MerchantActivities);
                    if (MerchantActivitiesResult.info >= 'Rows matched: 1  Changed: 0  Warnings: 0') {
                        const MerchantActivitiesFindByID = `SELECT * FROM merchant_activities WHERE id='${merId}'`;
                        const [MerchantActivitiesFindByIDResult] = await this.adapter.db.query(MerchantActivitiesFindByID);
                        if (MerchantActivitiesFindByIDResult != '') {
                            const mId = MerchantActivitiesFindByIDResult[0].merchantId;
                            const actId = MerchantActivitiesFindByIDResult[0].activityId;
                            const merchantStatus = `SELECT COUNT(*) as count FROM merchant_activities WHERE merchantId ='${mId}' AND merchantStatus = '${1}' `;
                            const [merchantStatusress] = await this.adapter.db.query(merchantStatus);
                            if (merchantStatusress[0].count === 0) {
                                const DeactiveMerchantr = `UPDATE merchants SET status = '${2}' WHERE id= '${mId}'`;
                                const [DeactiveMerchantress] = await this.adapter.db.query(DeactiveMerchantr);
                                if (DeactiveMerchantress.info >= 'Rows matched: 1  Changed: 0  Warnings: 0') {
                                    const MerchantActivities1 = `UPDATE merchant_activities SET status = '${2}' WHERE merchantId= '${mId}'`;
                                    const [MerchantActivitiesResult1] = await this.adapter.db.query(MerchantActivities1);
                                    const Actfound = `SELECT COUNT(*) as count FROM merchant_activities WHERE activityId ='${actId}' AND status = '${1}' `;
                                    const [Actfoundress] = await this.adapter.db.query(Actfound);
                                    // console.log(Actfoundress)
                                    if (Actfoundress[0].count === 0) {
                                        const DeactiveMerchantr = `UPDATE activities SET status = '${2}' WHERE id= '${actId}'`;
                                        const [DeactiveMerchantress] = await this.adapter.db.query(DeactiveMerchantr);
                                        // if(DeactiveMerchantress.info >= 'Rows matched: 1  Changed: 0  Warnings: 0'){

                                        // }
                                    } else { }
                                }
                            } else { }

                        }
                    }
                } else { }
            }
        },

        create: {
            rest: {
                method: "POST",
                path: "/create"
            },
            async handler(ctx) {
                try {
                    const Auth = ctx.meta.user;
                    const adminId = Auth.role;
                    if (Auth == 'forbidden') {
                        return message.message.UNAUTHORIZED;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if (token[0].token == "null") {
                        return message.message.LOGIN;
                    }
                    if (adminId == 1) {
                        const activityId = ctx.params.activityId;
                        const merchantId = ctx.params.merchantId;
                        const merchantActivityId = ctx.params.merchantActivityId;
                        const outletIds = ctx.params.outletIds
                        const title = ctx.params.title;
                        const description = ctx.params.description;
                        const originalPrice = ctx.params.originalPrice;
                        const discountedPrice = ctx.params.discountedPrice;
                        const discountedPercentage = ctx.params.discountedPercentage;
                        const discountAmount = ctx.params.discountAmount;
                        const currency = ctx.params.currency;
                        const status = 1;
                        const createdBy = adminId;
                        const updatedBy = adminId;
                        const password = '12345678'
                        if (outletIds == '') {
                            return message.message.OUTLETID;
                        } else {
                            let Message;
                            const dels = `select * from regular_deals where merId = '${merchantId}'`
                            const [Dels] = await this.adapter.db.query(dels);
                            if (Dels == '') {
                                const merDetails = `select * from merchants where id = '${merchantId}'`
                                const [Details] = await this.adapter.db.query(merDetails);
                                if (Details == '') {
                                    const errMessage = {
                                        success: false,
                                        statusCode: 409,
                                        message: 'Merchant not found'
                                    }
                                    return errMessage
                                } else {
                                    const merchantSignUpEmail = Details[0].merchantSignUpEmail;
                                    const hash = await bcrypt.hash(password, 10);
                                    const updatepass = `update merchants set password = '${hash}' where merchantSignUpEmail = '${merchantSignUpEmail}'`
                                    const [UpdatePass] = await this.adapter.db.query(updatepass)

                                    const getactivtiy = `select * from activities where id = '${activityId}'`
                                    const [getact] = await this.adapter.db.query(getactivtiy);
                                    if (getact == '') {
                                        const successMessage = {
                                            success: true,
                                            statusCode: 409,
                                            message: 'Activity not found'
                                        }
                                        return successMessage
                                    } else {
                                        const actid = getact[0].id;
                                        const regularDeal = `insert into regular_deals(merchantId,merId,title,description,originalPrice,discountedPrice,discountedPercentage,discountAmount,status,createdBy,modifiedBy,currency) values('${merchantActivityId}','${merchantId}','${title}','${description}','${originalPrice}','${discountedPrice}','${discountedPercentage}','${discountAmount}','${status}','${createdBy}','${updatedBy}','${currency}')`
                                        const [regularDealsress] = await this.adapter.db.query(regularDeal);
                                        const regularDealId = regularDealsress;
                                        if (regularDealsress) {
                                            for (let RDR of outletIds) {
                                                const outletId = RDR;
                                                const dealsRelation = `insert into regular_deals_relations(activityId,merchantActivityId,regularDealId,outletId,merId) values('${activityId}','${merchantActivityId}','${regularDealId}','${outletId}','${merchantId}')`
                                                const [dealsRelationress] = await this.adapter.db.query(dealsRelation);
                                                Message = message.message.SAVE
                                            }
                                            // await ctx.call("regular_deals.MerchantCreateMail", {
                                            //     merchantSignUpEmail,
                                            //     password,
                                            // });
                                            ctx.emit("MerchantCreateMail", ({ merchantSignUpEmail, password }))
                                            const activityDiscountPrice = getact[0].discountedPrice;
                                            await ctx.call("regular_deals.SavePrice", {
                                                activityDiscountPrice,
                                                originalPrice,
                                                discountedPercentage,
                                                discountedPrice,
                                                discountAmount,
                                                activityId,
                                                actid
                                            });
                                            return Message
                                        } else {
                                            const successMessage = {
                                                success: false,
                                                status: 500,
                                                message: 'Not save'
                                            }
                                            return successMessage;
                                        }
                                    }
                                }
                            } else {
                                const getactivtiy = `select * from activities where id = '${activityId}'`
                                const [getact] = await this.adapter.db.query(getactivtiy);
                                if (getact == '') {
                                    const successMessage = {
                                        success: true,
                                        statusCode: 409,
                                        message: 'Activity not found'
                                    }
                                    return successMessage
                                } else {
                                    const actid = getact[0].id;
                                    const regularDeal = `insert into regular_deals(merchantId,merId,title,description,originalPrice,discountedPrice,discountedPercentage,discountAmount,status,createdBy,modifiedBy,currency) values('${merchantActivityId}','${merchantId}','${title}','${description}','${originalPrice}','${discountedPrice}','${discountedPercentage}','${discountAmount}','${status}','${createdBy}','${updatedBy}','${currency}')`
                                    const [regularDealsress] = await this.adapter.db.query(regularDeal);
                                    const regularDealId = regularDealsress;
                                    if (regularDealsress) {
                                        for (let RDR of outletIds) {
                                            const outletId = RDR;
                                            const dealsRelation = `insert into regular_deals_relations(activityId,merchantActivityId,regularDealId,outletId) values('${activityId}','${merchantActivityId}','${regularDealId}','${outletId}')`
                                            const [dealsRelationress] = await this.adapter.db.query(dealsRelation);
                                            Message = message.message.SAVE
                                        }
                                        const activityDiscountPrice = getact[0].discountedPrice;
                                        await ctx.call("regular_deals.SavePrice", {
                                            activityDiscountPrice,
                                            originalPrice,
                                            discountedPercentage,
                                            discountedPrice,
                                            discountAmount,
                                            activityId,
                                            actid
                                        });

                                        return Message
                                    } else {
                                        const successMessage = {
                                            success: false,
                                            status: 500,
                                            message: 'Not save'
                                        }
                                        return successMessage;
                                    }
                                }
                            }

                        }

                    } else {
                        return message.message.PERMISSIONDENIDE;
                    }
                } catch (error) {
                    const errMessage = {
                        success: false,
                        statusCode: 409,
                        error: error.errors,
                    }
                    return errMessage;

                }
            }
        },

        list: {
            rest: {
                method: "GET",
                path: "list"
            },
            async handler(ctx) {
                try {
                    const Auth = ctx.meta.user;
                    const role = Auth.role;
                    if (Auth.success == false) {
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if (token[0].token == "null") {
                        return message.message.LOGIN;
                    }
                    if (role == 1 || role == 2) {
                        const DATA = [];
                        const OUTLET = [];
                        const id = ctx.params.merchantActivityId;
                        const outletId = ctx.params.outletId;
                        if (id >= 1 && outletId >= 1) {
                            const idFound = `select rd.* from regular_deals_relations as rdr JOIN regular_deals as rd on rd.id = rdr.regularDealId where rdr.merchantActivityId = '${id}' and rdr.outletId = '${outletId}' ORDER BY rd.createdAt ASC`
                            const [idFoundress] = await this.adapter.db.query(idFound);
                            if (idFoundress == "") {
                                const successMessage = {
                                    success: true,
                                    statusCode: 200,
                                    data: idFoundress
                                }
                                return successMessage
                            } else {
                                // for(let fid of idFoundress){
                                //     const regularDealId = fid.regularDealId;
                                //     // const outlet = `select * from regular_deals_relations where regulardealId = '${regularDealId}'`
                                //     // const [outletress] = await this.adapter.db.query(outlet);
                                //     // for(let ouId of outletress){
                                //     //     OUTLET.push(ouId.outletId)
                                //     // }
                                //     const regulaDeals = `select * from regular_deals where id = '${regularDealId}'`
                                //     const [regulaDealsress] = await this.adapter.db.query(regulaDeals);
                                //     if(regulaDealsress != ""){
                                //         for(let reg of regulaDealsress){
                                //             const Dealsdata = {
                                //                 id : reg.id,
                                //                 merchantId : reg.merchantId,
                                //                 title : reg.title,
                                //                 description : reg.description,
                                //                 originalPrice : reg.originalPrice,
                                //                 discountedPrice : reg.discountedPrice,
                                //                 discountedPercentage : reg.discountedPercentage,
                                //                 discountAmount : reg.discountAmount,
                                //                 status : reg.status,
                                //                 createdBy : reg.createdBy,
                                //                 modifiedBy : reg.modifiedBy,
                                //                 createdAt : reg.createdAt,
                                //                 updatedAt : reg.updatedAt,
                                //                 currency : reg.currency,
                                //                 outletId : OUTLET
                                //             }
                                //             DATA.push(Dealsdata);
                                //         }
                                //     }else{
                                //         const errMessage = {
                                //             success:true,
                                //             statusCode:200,
                                //             data:regulaDealsress
                                //         }
                                //         return errMessage;
                                //     }
                                // }
                                const successMessage = {
                                    success: true,
                                    statusCode: 200,
                                    data: idFoundress
                                }
                                return successMessage
                            }
                        } else {
                            const idFound = `select * from regular_deals where merchantId = '${id}' ORDER BY createdAt ASC`
                            const [idFoundress] = await this.adapter.db.query(idFound);
                            if (idFoundress == "") {
                                const successMessage = {
                                    success: true,
                                    statusCode: 200,
                                    data: idFoundress
                                }
                                return successMessage
                            } else {
                                for (let reg of idFoundress) {
                                    const regularDealId = reg.id;
                                    const outlet = `select outletId from regular_deals_relations where regulardealId = '${regularDealId}'`
                                    const [outletress] = await this.adapter.db.query(outlet);
                                    for (let ouId of outletress) {
                                        OUTLET.push(ouId.outletId)
                                    }

                                    const Dealsdata = {
                                        id: reg.id,
                                        merchantId: reg.merchantId,
                                        title: reg.title,
                                        description: reg.description,
                                        originalPrice: reg.originalPrice,
                                        discountedPrice: reg.discountedPrice,
                                        discountedPercentage: reg.discountedPercentage,
                                        discountAmount: reg.discountAmount,
                                        validityPeriod: reg.validityPeriod,
                                        status: reg.status,
                                        createdBy: reg.createdBy,
                                        modifiedBy: reg.modifiedBy,
                                        createdAt: reg.createdAt,
                                        updatedAt: reg.updatedAt,
                                        currency: reg.currency,
                                        outlets: outletress
                                    }
                                    DATA.push(Dealsdata);
                                }
                                const successMessage = {
                                    success: true,
                                    statusCode: 200,
                                    data: DATA
                                }
                                return successMessage
                            }
                        }
                    } else {
                        return message.message.PERMISSIONDENIDE;
                    }
                } catch (error) {
                    const errMessage = {
                        success: false,
                        statusCode: 409,
                        error: error.errors,
                    }
                    return errMessage;

                }
            }
        },

        edit: {
            rest: {
                method: "PUT",
                path: "/edit/:id"
            },
            async handler(ctx) {
                try {
                    const Auth = ctx.meta.user;
                    const activityId = ctx.params.activityId;
                    const merchantActivityId = ctx.params.merchantActivityId;
                    const id = ctx.params.id;
                    const title = ctx.params.title;
                    const description = ctx.params.description;
                    const originalPrice = ctx.params.originalPrice;
                    const discountedPrice = ctx.params.discountedPrice;
                    const discountedPercentage = ctx.params.discountedPercentage;
                    const discountAmount = ctx.params.discountAmount;
                    const outletIds = ctx.params.outletIds;
                    const currency = ctx.params.currency;

                    if (Auth.success == false) {
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if (token[0].token == "null") {
                        return message.message.LOGIN;
                    }
                    if (Auth.role == 1) {
                        // ctx.emit("allActive", ({title, discountAmount, currency}))
                        const getactivtiy = `select * from activities where id = '${activityId}'`
                        const [getact] = await this.adapter.db.query(getactivtiy);
                        if (getact == '') {
                            const successMessage = {
                                success: true,
                                statusCode: 409,
                                message: 'Activity not found'
                            }
                            return successMessage
                        } else {
                            const searchOutlet = `select * from regular_deals where id = '${id}'`;
                            const [searchOutletress] = await this.adapter.db.query(searchOutlet);
                            if (searchOutletress != '') {
                                const regularId = searchOutletress[0].id;
                                const udpdateOutlet = `update regular_deals set title = '${title}',description = '${description}',originalPrice = '${originalPrice}',discountedPrice = '${discountedPrice}',discountedPercentage = '${discountedPercentage}',discountAmount = '${discountAmount}',currency = '${currency}'  where id = '${id}'`
                                const [udpdateOutletress] = await this.adapter.db.query(udpdateOutlet);
                                if (udpdateOutletress.info >= "Rows matched: 1  Changed: 0  Warnings: 0") {
                                    const dealsDelete = `delete from regular_deals_relations where merchantActivityId = '${merchantActivityId}' and regularDealId = '${regularId}'`;
                                    const [dealsDeleteress] = await this.adapter.db.query(dealsDelete);
                                    for (let outId of outletIds) {
                                        const inserdeals = `insert into regular_deals_relations(activityId,merchantActivityId,regularDealId,outletId) values('${activityId}','${merchantActivityId}','${regularId}','${outId}')`;
                                        const [insertDeals] = await this.adapter.db.query(inserdeals)
                                    }
                                    const minPrice = `select min(rd.discountedPrice) as discountedPrice,min(rd.originalPrice) as originalPrice,min(discountedPercentage) as discountedPercentage,min(discountAmount) as discountAmount from regular_deals_relations as rdr JOIN regular_deals as rd on rdr.regularDealId = rd.id where rdr.activityId = '${activityId}'`
                                    const [Minprice] = await this.adapter.db.query(minPrice);
                                    if (Minprice != '') {
                                        const updateprice = `update activities set originalPrice = '${Minprice[0].originalPrice}',discountedPercentage = '${Minprice[0].discountedPercentage}', discountedPrice = '${Minprice[0].discountedPrice}',discountAmount = '${Minprice[0].discountAmount}' where id = '${activityId}'`
                                        const [priceUpdate] = await this.adapter.db.query(updateprice);
                                        const merchantAct = `select * from merchant_activities where activityId = '${activityId}'`
                                        const [MerAct] = await this.adapter.db.query(merchantAct);
                                        if (MerAct == '') {
                                            const succcessMessage = {
                                                success: false,
                                                statusCode: 409,
                                                message: 'merchant not found'
                                            }
                                            return succcessMessage;
                                        } else {
                                            for (let merID of MerAct) {
                                                const MERID = merID.activityId;
                                                const updateprice = `update merchant_activities set min_originalPrice = '${Minprice[0].originalPrice}',min_discountedPercentage = '${Minprice[0].discountedPercentage}', min_discountedPrice = '${Minprice[0].discountedPrice}',min_discountAmount = '${Minprice[0].discountAmount}' where activityId = '${MERID}'`
                                                const [priceUpdate] = await this.adapter.db.query(updateprice);
                                            }
                                            return message.message.UPDATE;
                                        }
                                    } else {
                                        const updateprice = `update activities set originalPrice = '${0}',discountedPercentage = '${0}', discountedPrice = '${0}',discountAmount = '${0}' where id = '${activityId}'`
                                        const [priceUpdate] = await this.adapter.db.query(updateprice);
                                        const merchantAct = `select * from merchant_activities where activityId = '${activityId}'`
                                        const [MerAct] = await this.adapter.db.query(merchantAct);
                                        if (MerAct == '') {
                                            const succcessMessage = {
                                                success: false,
                                                statusCode: 409,
                                                message: 'merchant not found'
                                            }
                                            return succcessMessage;
                                        } else {
                                            for (let merID of MerAct) {
                                                const MERID = merID.activityId;
                                                const updateprice = `update merchant_activities set min_originalPrice = '${0}',min_discountedPercentage = '${0}', min_discountedPrice = '${0}',min_discountAmount = '${0}' where activityId = '${MERID}'`
                                                const [priceUpdate] = await this.adapter.db.query(updateprice);
                                            }
                                        }
                                        return message.message.UPDATE;
                                    }
                                } else {
                                    return message.message.NOTUPDATE;
                                }
                            } else {
                                const errMessage = {
                                    success: true,
                                    statusCode: 200,
                                    data: searchOutletress
                                }
                                return errMessage;
                            }
                        }
                    } else {
                        return message.message.PERMISSIONDENIDE;
                    }
                } catch (error) {
                    const errMessage = {
                        success: false,
                        statusCode: 409,
                        error: error.errors,
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
                try {
                    const Auth = ctx.meta.user;
                    const id = ctx.params.id;

                    if (Auth.success == false) {
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if (token[0].token == "null") {
                        return message.message.LOGIN;
                    }

                    if (Auth.role == 1) {

                        const searchDeals = `select * from regular_deals_relations where regularDealId = '${id}'`;
                        const [searchDealsress] = await this.adapter.db.query(searchDeals);
                        if (searchDealsress != '') {
                            const merchantId = searchDealsress[0].merchantActivityId;
                            const activityId = searchDealsress[0].activityId;
                            const delereDeals = `delete from regular_deals_relations where regularDealId = '${id}'`;
                            const [delereDealsress] = await this.adapter.db.query(delereDeals);
                            if (delereDealsress.affectedRows >= 0) {
                                const delereDeals1 = `delete from regular_deals where id = '${id}'`
                                const [delereDealsress1] = await this.adapter.db.query(delereDeals1);
                                if (delereDealsress1.affectedRows >= 0) {
                                    const price = `select min(discountedPrice) as discountedPrice,min(originalPrice) as originalPrice,min(discountedPercentage) as discountedPercentage,min(discountAmount) as discountAmount from regular_deals where merchantId = '${merchantId}'`
                                    const [priceress] = await this.adapter.db.query(price);
                                    if (priceress[0].discountedPrice == null) {
                                        const updateprice = `update activities set originalPrice = '${0}',discountedPercentage = '${0}', discountedPrice = '${0}',discountAmount = '${0}' where id = '${activityId}'`
                                        const [priceUpdate] = await this.adapter.db.query(updateprice);
                                        const merchantAct = `select * from merchant_activities where activityId = '${activityId}'`
                                        const [MerAct] = await this.adapter.db.query(merchantAct);
                                        if (MerAct == '') {
                                            const succcessMessage = {
                                                success: false,
                                                statusCode: 409,
                                                message: 'merchant not found'
                                            }
                                            return succcessMessage;
                                        } else {
                                            for (let merID of MerAct) {
                                                const MERID = merID.activityId;
                                                const updateprice = `update merchant_activities set min_originalPrice = '${0}',min_discountedPercentage = '${0}', min_discountedPrice = '${0}',min_discountAmount = '${0}' where activityId = '${MERID}'`
                                                const [priceUpdate] = await this.adapter.db.query(updateprice);
                                            }
                                        }
                                        await ctx.call("regular_deals.DealScript", ({ RegulerId: ctx.params.id, status: 0 }))
                                        return message.message.ACTIVITYDELETE
                                    } else {
                                        const getactivtiy = `select * from activities where id = '${activityId}'`
                                        const [getact] = await this.adapter.db.query(getactivtiy);
                                        if (getact == '') {
                                            const successMessage = {
                                                success: true,
                                                statusCode: 409,
                                                message: 'Activity not found'
                                            }
                                            return successMessage
                                        } else {
                                            const updateprice = `update activities set originalPrice = '${priceress[0].originalPrice}',discountedPercentage = '${priceress[0].discountedPercentage}', discountedPrice = '${priceress[0].discountedPrice}',discountAmount = '${priceress[0].discountAmount}' where id = '${activityId}'`
                                            const [priceUpdate] = await this.adapter.db.query(updateprice);
                                            const merchantAct = `select * from merchant_activities where activityId = '${activityId}'`
                                            const [MerAct] = await this.adapter.db.query(merchantAct);
                                            if (MerAct == '') {
                                                const succcessMessage = {
                                                    success: false,
                                                    statusCode: 409,
                                                    message: 'merchant not found'
                                                }
                                                return succcessMessage;
                                            } else {
                                                for (let merID of MerAct) {
                                                    const MERID = merID.activityId;
                                                    const updateprice = `update merchant_activities set min_originalPrice = '${priceress[0].originalPrice}',min_discountedPercentage = '${priceress[0].discountedPercentage}', min_discountedPrice = '${priceress[0].discountedPrice}',min_discountAmount = '${priceress[0].discountAmount}' where activityId = '${MERID}'`
                                                    const [priceUpdate] = await this.adapter.db.query(updateprice);
                                                }
                                            }
                                            await ctx.call("regular_deals.DealScript", ({ RegulerId: ctx.params.id, status: 0 }))
                                            return message.message.ACTIVITYDELETE
                                        }
                                    }
                                } else {
                                    return message.message.NOTDELTE
                                }
                            } else {
                                return message.message.NOTDELTE
                            }
                        } else {
                            const errMessage = {
                                success: true,
                                statusCode: 200,
                                data: searchDealsress
                            }
                            return errMessage;
                        }
                    } else {
                        return message.message.PERMISSIONDENIDE;
                    }
                } catch (error) {
                    const errMessage = {
                        success: false,
                        statusCode: 409,
                        error: error.errors,
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
                try {
                    const Auth = ctx.meta.user;
                    const regularDealsId = ctx.params.regularDealsId;
                    const status = ctx.params.status;

                    if (Auth.success == false) {
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`
                    const [token] = await this.adapter.db.query(tokenfind);
                    if (token[0].token == "null") {
                        return message.message.LOGIN;
                    }

                    if (Auth.role == 1 || Auth.role == 2) {
                        const merchantList = `select * from regular_deals where id = '${regularDealsId}'`;
                        const [merchantListress] = await this.adapter.db.query(merchantList);
                        if (merchantListress != '') {
                            const upmer = `update regular_deals set status = '${status}' where id = '${regularDealsId}'`
                            const [upmerress] = await this.adapter.db.query(upmer);
                            if (upmerress.info >= "Rows matched: 1  Changed: 0  Warnings: 0") {
                                if (status >= 1 && status <= 2) {
                                    if (status == 1) {
                                        await ctx.call("regular_deals.DealScript", (ctx.params))
                                        const successMessage = {
                                            success: true,
                                            statusCode: 200,
                                            status: status,
                                            message: "Active"
                                        }
                                        return successMessage
                                    } else if (status == 2) {
                                        await ctx.call("regular_deals.DealScript", (ctx.params))
                                        await ctx.call("regular_deals.ActiveModule", ({
                                            regularId: regularDealsId
                                        }))
                                        const successMessage = {
                                            success: true,
                                            statusCode: 200,
                                            status: status,
                                            message: "Deactive"
                                        }
                                        return successMessage
                                    } else {
                                        await ctx.call("regular_deals.DealScript", (ctx.params))
                                        const successMessage = {
                                            success: true,
                                            statusCode: 200,
                                            status: status,
                                            message: "Delete"
                                        }
                                        return successMessage
                                    }
                                } else {
                                    const errMessage = {
                                        success: false,
                                        statusCode: 409,
                                        message: 'Only you can Active and Deactive'
                                    }
                                    return errMessage
                                }
                            } else {
                                return message.message.NOTUPDATE;
                            }
                        } else {
                            const errMessage = {
                                success: true,
                                statusCode: 200,
                                data: activitiesListress
                            }
                            return errMessage
                        }
                    } else {
                        return message.message.PERMISSIONDENIDE;
                    }
                } catch (error) {
                    const errMessage = {
                        success: false,
                        statusCode: 409,
                        error: error.errors,
                    }
                    return errMessage;
                }
            }
        },

        async DealScript(ctx) {
            const RegulerId = ctx.params.regularDealsId;
            const status = ctx.params.status;
            if (status == 2) {
                const Sql = `SELECT RDR.activityId FROM regular_deals as RD JOIN regular_deals_relations as RDR ON RD.id =RDR.regularDealId WHERE RDR.regularDealId='${RegulerId}' AND RD.status='2'`;
                const [SqlResult] = await this.adapter.db.query(Sql);
                if (SqlResult != '') {
                    const actId = SqlResult[0].activityId;
                    // console.log(actId)     
                    const minPrice = `select min(rd.discountedPrice) as discountedPrice,min(rd.originalPrice) as originalPrice,min(discountedPercentage) as discountedPercentage,min(discountAmount) as discountAmount from regular_deals_relations as rdr JOIN regular_deals as rd on rdr.regularDealId = rd.id where rdr.activityId = '${actId}' AND rd.status='1' `
                    const [Minprice] = await this.adapter.db.query(minPrice);
                    if (Minprice[0].discountedPrice != null) {
                        const updateprice = `update activities set originalPrice = '${Minprice[0].originalPrice}',discountedPercentage = '${Minprice[0].discountedPercentage}', discountedPrice = '${Minprice[0].discountedPrice}',discountAmount = '${Minprice[0].discountAmount}' where id = '${SqlResult[0].activityId}'`
                        const [priceUpdate] = await this.adapter.db.query(updateprice);
                        const merchantAct = `select * from merchant_activities where activityId = '${SqlResult[0].activityId}'`
                        const [MerAct] = await this.adapter.db.query(merchantAct);
                        if (MerAct == '') {
                            const succcessMessage = {
                                success: false,
                                statusCode: 409,
                                message: 'merchant not found'
                            }
                            return succcessMessage;
                        } else {
                            for (let merID of MerAct) {
                                const MERID = merID.activityId;
                                const updateprice = `update merchant_activities set min_originalPrice = '${Minprice[0].originalPrice}',min_discountedPercentage = '${Minprice[0].discountedPercentage}', min_discountedPrice = '${Minprice[0].discountedPrice}',min_discountAmount = '${Minprice[0].discountAmount}' where activityId = '${MERID}'`
                                const [priceUpdate] = await this.adapter.db.query(updateprice);
                                // console.log(priceUpdate)                       
                            }
                        }
                    } else {
                        const updateprice = `update activities set originalPrice = '${0}',discountedPercentage = '${0}', discountedPrice = '${0}',discountAmount = '${0}' where id = '${SqlResult[0].activityId}'`
                        const [priceUpdate] = await this.adapter.db.query(updateprice);
                        const merchantAct = `select * from merchant_activities where activityId = '${SqlResult[0].activityId}'`
                        const [MerAct] = await this.adapter.db.query(merchantAct);
                        if (MerAct == '') {
                            const succcessMessage = {
                                success: false,
                                statusCode: 409,
                                message: 'merchant not found'
                            }
                            return succcessMessage;
                        } else {
                            for (let merID of MerAct) {
                                const MERID = merID.activityId;
                                const updateprice = `update merchant_activities set min_originalPrice = '${0}',min_discountedPercentage = '${0}', min_discountedPrice = '${0}',min_discountAmount = '${0}' where activityId = '${MERID}'`
                                const [priceUpdate] = await this.adapter.db.query(updateprice);
                            }
                        }
                    }
                }
            } else if (status == 1) {
                const Sql = `SELECT RDR.activityId FROM regular_deals as RD JOIN regular_deals_relations as RDR ON RD.id =RDR.regularDealId WHERE RDR.regularDealId='${RegulerId}' AND RD.status='1'`;
                const [SqlResult] = await this.adapter.db.query(Sql);
                if (SqlResult != '') {
                    const actId = SqlResult[0].activityId;
                    const minPrice = `select min(rd.discountedPrice) as discountedPrice,min(rd.originalPrice) as originalPrice,min(discountedPercentage) as discountedPercentage,min(discountAmount) as discountAmount from regular_deals_relations as rdr JOIN regular_deals as rd on rdr.regularDealId = rd.id where rdr.activityId = '${actId}' AND rd.status='1' `
                    const [Minprice] = await this.adapter.db.query(minPrice);
                    if (Minprice[0].discountedPrice != null) {
                        const updateprice = `update activities set originalPrice = '${Minprice[0].originalPrice}',discountedPercentage = '${Minprice[0].discountedPercentage}', discountedPrice = '${Minprice[0].discountedPrice}',discountAmount = '${Minprice[0].discountAmount}' where id = '${SqlResult[0].activityId}'`
                        const [priceUpdate] = await this.adapter.db.query(updateprice);
                        const merchantAct = `select * from merchant_activities where activityId = '${SqlResult[0].activityId}'`
                        const [MerAct] = await this.adapter.db.query(merchantAct);
                        if (MerAct == '') {
                            const succcessMessage = {
                                success: false,
                                statusCode: 409,
                                message: 'merchant not found'
                            }
                            return succcessMessage;
                        } else {
                            for (let merID of MerAct) {
                                const MERID = merID.activityId;
                                const updateprice = `update merchant_activities set min_originalPrice = '${Minprice[0].originalPrice}',min_discountedPercentage = '${Minprice[0].discountedPercentage}', min_discountedPrice = '${Minprice[0].discountedPrice}',min_discountAmount = '${Minprice[0].discountAmount}' where activityId = '${MERID}'`
                                const [priceUpdate] = await this.adapter.db.query(updateprice);
                            }
                        }
                    } else {
                        const updateprice = `update activities set originalPrice = '${0}',discountedPercentage = '${0}', discountedPrice = '${0}',discountAmount = '${0}' where id = '${SqlResult[0].activityId}'`
                        const [priceUpdate] = await this.adapter.db.query(updateprice);
                        const merchantAct = `select * from merchant_activities where activityId = '${SqlResult[0].activityId}'`
                        const [MerAct] = await this.adapter.db.query(merchantAct);
                        if (MerAct == '') {
                            const succcessMessage = {
                                success: false,
                                statusCode: 409,
                                message: 'merchant not found'
                            }
                            return succcessMessage;
                        } else {
                            for (let merID of MerAct) {
                                const MERID = merID.activityId;
                                const updateprice = `update merchant_activities set min_originalPrice = '${0}',min_discountedPercentage = '${0}', min_discountedPrice = '${0}',min_discountAmount = '${0}' where activityId = '${MERID}'`
                                const [priceUpdate] = await this.adapter.db.query(updateprice);
                            }
                        }
                    }
                }
            } else if (status == 0) {
                const Sql = `SELECT RDR.activityId FROM regular_deals as RD JOIN regular_deals_relations as RDR ON RD.id =RDR.regularDealId WHERE RDR.regularDealId='${RegulerId}' AND RD.status='0'`;
                const [SqlResult] = await this.adapter.db.query(Sql);
                if (SqlResult != '') {
                    const actId = SqlResult[0].activityId;
                    // const findRESID = `SELECT RD.* FROM regular_deals as RD JOIN regular_deals_relations as RDR ON RD.id =RDR.regularDealId WHERE RDR.activityId='${actId}' AND RD.status='1'`; 
                    // const [Findresid] = await this.adapter.db.query(findRESID);
                    const minPrice = `select min(rd.discountedPrice) as discountedPrice,min(rd.originalPrice) as originalPrice,min(discountedPercentage) as discountedPercentage,min(discountAmount) as discountAmount from regular_deals_relations as rdr JOIN regular_deals as rd on rdr.regularDealId = rd.id where rdr.activityId = '${actId}' AND rd.status='1' `
                    const [Minprice] = await this.adapter.db.query(minPrice);
                    if (Minprice[0].discountedPrice != null) {
                        const updateprice = `update activities set originalPrice = '${Minprice[0].originalPrice}',discountedPercentage = '${Minprice[0].discountedPercentage}', discountedPrice = '${Minprice[0].discountedPrice}',discountAmount = '${Minprice[0].discountAmount}' where id = '${SqlResult[0].activityId}'`
                        const [priceUpdate] = await this.adapter.db.query(updateprice);
                        const merchantAct = `select * from merchant_activities where activityId = '${SqlResult[0].activityId}'`
                        const [MerAct] = await this.adapter.db.query(merchantAct);
                        if (MerAct == '') {
                            const succcessMessage = {
                                success: false,
                                statusCode: 409,
                                message: 'merchant not found'
                            }
                            return succcessMessage;
                        } else {
                            for (let merID of MerAct) {
                                const MERID = merID.activityId;
                                const updateprice = `update merchant_activities set min_originalPrice = '${Minprice[0].originalPrice}',min_discountedPercentage = '${Minprice[0].discountedPercentage}', min_discountedPrice = '${Minprice[0].discountedPrice}',min_discountAmount = '${Minprice[0].discountAmount}' where activityId = '${MERID}'`
                                const [priceUpdate] = await this.adapter.db.query(updateprice);
                                // console.log(priceUpdate)                       
                            }
                        }
                    } else {
                        const updateprice = `update activities set originalPrice = '${0}',discountedPercentage = '${0}', discountedPrice = '${0}',discountAmount = '${0}' where id = '${SqlResult[0].activityId}'`
                        const [priceUpdate] = await this.adapter.db.query(updateprice);
                        const merchantAct = `select * from merchant_activities where activityId = '${SqlResult[0].activityId}'`
                        const [MerAct] = await this.adapter.db.query(merchantAct);
                        if (MerAct == '') {
                            const succcessMessage = {
                                success: false,
                                statusCode: 409,
                                message: 'merchant not found'
                            }
                            return succcessMessage;
                        } else {
                            for (let merID of MerAct) {
                                const MERID = merID.activityId;
                                const updateprice = `update merchant_activities set min_originalPrice = '${0}',min_discountedPercentage = '${0}', min_discountedPrice = '${0}',min_discountAmount = '${0}' where activityId = '${MERID}'`
                                const [priceUpdate] = await this.adapter.db.query(updateprice);
                            }
                        }
                    }
                }
            } else {
                const errMessage = {
                    success: false,
                    statusCode: 409,
                    message: 'Wrong Status'
                }
                return errMessage
            }

        }
    }

}
