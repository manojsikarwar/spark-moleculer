const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const message = require("../../lib/message");
const process = require("../../mixins/db.config");
const bcrypt = require("bcrypt");
const { getTestMessageUrl } = require("nodemailer");

module.exports = {
    name: "merchants",
    mixins: [DbService],

    adapter: new SqlAdapter(
        process.mysql.database,
        process.mysql.user,
        process.mysql.password,
        {
            host: process.mysql.host,
            dialect: "mysql" /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        }
    ),

    model: {
        name: "merchant",
        define: {
            merchantName: { type: Sequelize.STRING, allowNull: false },
            merchantLogo: { type: Sequelize.STRING, allowNull: false },
            password: { type: Sequelize.STRING, allowNull: false },
            merchantWebsite: { type: Sequelize.STRING, allowNull: false },
            contactPersonForSparks: { type: Sequelize.STRING, allowNull: false },
            contactEmail: { type: Sequelize.STRING, allowNull: false },
            mobileForSparks: { type: Sequelize.STRING, allowNull: false },
            notes: { type: Sequelize.STRING, allowNull: false },
            status: { type: Sequelize.STRING, defaultValue: 0 },
            bank: { type: Sequelize.JSON, defaultValue: null },
            connect_id: { type: Sequelize.STRING, defaultValue: null },
            stripeMerchantId: { type: Sequelize.STRING, defaultValue: null },
            resetPasswordCode: { type: Sequelize.STRING, defaultValue: null },
            updatedBy: { type: Sequelize.INTEGER, unique: true, defaultValue: 0 },
            createdBy: { type: Sequelize.INTEGER, unique: true, defaultValue: 0 },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                ),
            },
        },
        options: {},
    },

    actions: {
        signup: {
            rest: {
                method: "POST",
                path: "/signup",
            },
            params: {
                merchantName: { type: "string" },
                contactEmail: { type: "email" },
            },
            async handler(ctx) {
                try {
                    const Auth = ctx.meta.user;
                    if (Auth.success == false) {
                        return Auth;
                    }
                    if (Auth.role == 1) {
                        const password = "123456";
                        const merchantName = ctx.params.merchantName;
                        const merchantLogo = ctx.params.merchantLogo;
                        const merchantSignUpEmail = ctx.params.merchantSignUpEmail;
                        const merchantWebsite = ctx.params.merchantWebsite;
                        const contactPersonForSparks =
                            ctx.params.contactPersonForSparks || null;
                        const contactEmail = ctx.params.contactEmail || null;
                        const mobileForSparks =
                            JSON.stringify(ctx.params.mobileForSparks) || null;
                        const notes = ctx.params.notes || null;
                        const status = 2;
                        const bank = ctx.params.bank || null;
                        const connect_id = ctx.params.connect_id || null;
                        const stripeMerchantId = ctx.params.stripeMerchantId || null;
                        const resetPasswordCode = null;
                        const createdBy = 1;
                        const updatedBy = 1;
                        // first letter capitalized
                        const nameCapitalized =
                            merchantName.charAt(0).toUpperCase() + merchantName.slice(1);

                        const hash = await bcrypt.hash(password, 10);
                        const checkMerchant = `select * from merchants where (merchantName = '${merchantName}' || merchantSignUpEmail = '${merchantSignUpEmail}') and status != '${0}'`;
                        const [checkMerchantress] = await this.adapter.db.query(
                            checkMerchant
                        );

                        if (checkMerchantress != "") {
                            return message.message.UNIQMERCHANT;
                        } else {
                            const saveMerchant = `insert into merchants(merchantName,merchantLogo,merchantSignUpEmail,password,merchantWebsite,contactPersonForSparks,contactEmail,mobileForSparks,notes,status,bank,connect_id,stripeMerchantId,resetPasswordCode,createdBy,updatedBy) values('${nameCapitalized}','${merchantLogo}','${merchantSignUpEmail}','${hash}','${merchantWebsite}','${contactPersonForSparks}','${contactEmail}','${mobileForSparks}','${notes}','${status}','${bank}','${connect_id}','${stripeMerchantId}','${resetPasswordCode}','${createdBy}','${updatedBy}')`;
                            const [saveMerchantress] = await this.adapter.db.query(
                                saveMerchant
                            );
                            const data = {
                                id: saveMerchantress,
                                merchantName: nameCapitalized,
                                merchantLogo: ctx.params.merchantLogo,
                                merchantSignUpEmail: ctx.params.merchantSignUpEmail,
                                merchantWebsite: ctx.params.merchantWebsite,
                                contactPersonForSparks: ctx.params.contactPersonForSparks,
                                contactEmail: ctx.params.contactEmail,
                                mobileForSparks: ctx.params.mobileForSparks,
                                notes: ctx.params.notes,
                                bank: ctx.params.bank,
                                connect_id: ctx.params.connect_id,
                                stripeMerchantId: ctx.params.stripeMerchantId,
                            };
                            const successMessage = {
                                success: true,
                                statusCode: 200,
                                data: data,
                                message: "Success",
                            };
                            return successMessage;
                        }
                    } else {
                        return message.message.PERMISSIONDENIDE;
                    }
                } catch (error) {
                    const errMessage = {
                        success: false,
                        statusCode: 409,
                        error: error.errors,
                    };
                    return errMessage;
                }
            },
        },

        merchantList: {
            rest: {
                method: "GET",
                path: "/merchantList",
            },
            async handler(ctx) {
                try {
                    const MERCHANT = [];
                    const merchantDATA = [];
                    const Auth = ctx.meta.user;

                    if (Auth.success != false) {
                        const tokenfind = `select * from authentications where user_id = '${Auth.id}'`;
                        const [token] = await this.adapter.db.query(tokenfind);
                        if (token[0].token == "null") {
                            return message.message.LOGIN;
                        }
                        if (Auth.role == 1 || Auth.role == 2) {
                            // const merchant = `select * from merchants where merchantName like '%${search}%' and (status = '1' || status = '2') ORDER BY ${orderBy} ${order} limit ${limit} offset ${offset}`
                            // const [merchantress] = await this.adapter.db.query(merchant);

                            const merchant = `select * from merchants where (status = '1' || status = '2')  ORDER BY merchantName ASC`;
                            const [merchantress] = await this.adapter.db.query(merchant);

                            for (let mer of merchantress) {
                                const merchantId = mer.id;
                                const mercantAct = `select * from merchant_activities where merchantId = '${merchantId}' `;
                                // and merchantStatus = '${1}'
                                const [mercantActress] = await this.adapter.db.query(
                                    mercantAct
                                );
                                const ACT = [];
                                for (let merAct of mercantActress) {
                                    const activityId = merAct.activityId;
                                    const activity = `select * from activities where id = '${activityId}' `;
                                    const [activityress] = await this.adapter.db.query(activity);
                                    if (activityress != "") {
                                        const Activcat = [];
                                        const PRICE = [];

                                        for (let atv of activityress) {
                                            const categories = `select ac.id as categor_id,ac.name as category_name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${activityId}'`;
                                            const [categoriesress] = await this.adapter.db.query(
                                                categories
                                            );
                                            for (let catlist of categoriesress) {
                                                Activcat.push(catlist);
                                            }
                                            const price = `select min(rd.discountedPrice) as price,min(rd.currency) as currency,count(rd.id) as totalDeals from regular_deals_relations as rds inner join regular_deals as rd on rds.regularDealId = rd.id where rds.merchantActivityId = '${merAct.id}'`;
                                            const [priceress] = await this.adapter.db.query(price);
                                            for (let rate of priceress) {
                                                const activityData = {
                                                    merchantActivityId: merAct.id,
                                                    price: rate,
                                                    activityId: atv.id,
                                                    title: atv.title,
                                                    activitycategories: Activcat,
                                                };
                                                ACT.push(activityData);
                                            }
                                        }
                                    } else {
                                        const errMessage = {
                                            success: true,
                                            statusCode: 200,
                                            data: activityress,
                                        };
                                        return errMessage;
                                    }
                                }
                                const merchant = {
                                    merchantId: merchantId,
                                    merchantName: mer.merchantName,
                                    status: mer.status,
                                    createdAt: mer.createdAt,
                                    updatedAt: mer.updatedAt,
                                    activity: ACT,
                                };

                                MERCHANT.push(merchant);
                            }

                            const successMessage = {
                                success: true,
                                statusCode: 200,
                                totalCount: merchantress.length,
                                data: MERCHANT,
                            };
                            return successMessage;
                        } else {
                            return message.message.PERMISSIONDENIDE;
                        }
                    } else {
                        return message.message.UNAUTHORIZED;
                    }
                } catch (error) {
                    const errMessage = {
                        success: false,
                        statusCode: 409,
                        error: error.errors,
                    };
                    return errMessage;
                }
            },
        },

        merchantList1: {
            rest: {
                method: "GET",
                path: "/merchantList",
            },
            async handler(ctx) {
                try {
                    const MERCHANT = [];
                    const merchantDATA = [];
                    const Auth = ctx.meta.user;
                    if (Auth.success != false) {
                        const tokenfind = `select * from authentications where user_id = '${Auth.id}'`;
                        const [token] = await this.adapter.db.query(tokenfind);
                        if (token[0].token == "null") {
                            return message.message.LOGIN;
                        }
                        if (Auth.role == 1 || Auth.role == 2) {
                            const merchatActivities = `select * from merchants where status != '0' ORDER BY merchantName ASC`;
                            const [merchatActivitiesress] = await this.adapter.db.query(
                                merchatActivities
                            );
                            for (let mer of merchatActivitiesress) {
                                const merchantId = mer.id;
                                const mercantAct = `select * from merchant_activities where merchantId = '${merchantId}'`;
                                const [mercantActress] = await this.adapter.db.query(
                                    mercantAct
                                );
                                if (mercantActress == "") {
                                    const data = {
                                        merchantActivtyId: "",
                                        merchantId: merchantId,
                                        merchantName: mer.merchantName,
                                        status: mer.status,
                                        price: [],
                                        createdAt: mer.createdAt,
                                        activity: [],
                                    };
                                    merchantDATA.push(data);
                                }
                                const ACT = [];
                                for (let merAct of mercantActress) {
                                    const activityId = merAct.activityId;
                                    const activity = `select * from activities where id = '${activityId}' `;
                                    const [activityress] = await this.adapter.db.query(activity);
                                    if (activityress != "") {
                                        const Activcat = [];
                                        for (let atv of activityress) {
                                            const categories = `select ac.id as categor_id,ac.name as category_name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${activityId}'`;
                                            const [categoriesress] = await this.adapter.db.query(
                                                categories
                                            );
                                            for (let catlist of categoriesress) {
                                                Activcat.push(catlist);
                                            }
                                            const activityData = {
                                                id: atv.id,
                                                title: atv.title,
                                                activitycategories: Activcat,
                                            };
                                            ACT.push(activityData);
                                            const price = `select min(rd.discountedPrice) as price,min(rd.currency) as currency,count(rd.id) as totalDeals from regular_deals_relations as rds inner join regular_deals as rd on rds.regularDealId = rd.id where rds.merchantActivityId = '${merAct.id}'`;

                                            // const price = `select min(rd.discountedPrice) as price from regular_deals_relations as rds inner join regular_deals as rd on rds.regularDealId = rd.id where rds.outletId = '${merAct.outletIds[0]}' and rds.merchantActivityId = '${merAct.id}'`
                                            const [priceress] = await this.adapter.db.query(price);
                                            const PRICE = [];
                                            for (let rate of priceress) {
                                                PRICE.push(rate);
                                            }
                                            const data = {
                                                merchantActivtyId: merAct.id,
                                                merchantId: merchantId,
                                                merchantName: mer.merchantName,
                                                status: mer.status,
                                                price: PRICE,
                                                createdAt: mer.createdAt,
                                                activity: activityData,
                                            };
                                            merchantDATA.push(data);
                                        }
                                    } else {
                                        const errMessage = {
                                            success: true,
                                            statusCode: 200,
                                            data: activityress,
                                        };
                                        return errMessage;
                                    }
                                }
                            }
                            const successMessage = {
                                success: true,
                                statusCode: 200,
                                data: merchantDATA,
                            };
                            return successMessage;
                        } else {
                            return message.message.PERMISSIONDENIDE;
                        }
                    } else {
                        return message.message.UNAUTHORIZED;
                    }
                } catch (error) {
                    const errMessage = {
                        success: false,
                        statusCode: 409,
                        error: error.errors,
                    };
                    return errMessage;
                }
            },
        },

        //================= list by id ====================
        list: {
            rest: {
                method: "GET",
                path: "/list/:id",
            },
            async handler(ctx) {
                try {
                    const Auth = ctx.meta.user;
                    const merchantId = ctx.params.id;
                    if (Auth.success != false) {
                        if (Auth.role == 1 || Auth.role == 2) {
                            const findmerchant = `select * from merchants where id = '${merchantId}'`;
                            const [findmerchantress] = await this.adapter.db.query(
                                findmerchant
                            );
                            const List = {
                                id: findmerchantress[0].id,
                                merchantName: findmerchantress[0].merchantName,
                                merchantLogo: findmerchantress[0].merchantLogo,
                                merchantSignUpEmail: findmerchantress[0].merchantSignUpEmail,
                                merchantWebsite: findmerchantress[0].merchantWebsite,
                                contactPersonForSparks:
                                    findmerchantress[0].contactPersonForSparks,
                                contactEmail: findmerchantress[0].contactEmail,
                                mobileForSparks: findmerchantress[0].mobileForSparks,
                                notes: findmerchantress[0].notes,
                                status: findmerchantress[0].status,
                                connect_id: findmerchantress[0].connect_id,
                                stripeMerchantId: findmerchantress[0].stripeMerchantId,
                                createdBy: findmerchantress[0].createdBy,
                                updatedBy: findmerchantress[0].updatedBy,
                                createdAt: findmerchantress[0].createdAt,
                                updatedAt: findmerchantress[0].updatedAt,
                            };
                            const successMessage = {
                                success: true,
                                statusCode: 200,
                                data: List,
                                message: "Success",
                            };
                            if (findmerchantress == "") {
                                return successMessage;
                            } else {
                                return successMessage;
                            }
                        } else {
                            return message.message.PERMISSIONDENIDE;
                        }
                    } else {
                        return message.message.UNAUTHORIZED;
                    }
                } catch (error) {
                    const errMessage = {
                        success: false,
                        statusCode: 409,
                        error: error.errors,
                    };
                    return errMessage;
                }
            },
        },

        edit: {
            rest: {
                method: "PUT",
                path: "/edit/:merchantId",
            },
            async handler(ctx) {
                try {
                    const Auth = ctx.meta.user;
                    const merchantId = ctx.params.merchantId;
                    const merchantName = ctx.params.merchantName;
                    // first letter capitalized
                    const nameCapitalized =
                        merchantName.charAt(0).toUpperCase() + merchantName.slice(1);
                    const merchantLogo = ctx.params.merchantLogo;
                    const merchantSignUpEmail = ctx.params.merchantSignUpEmail;
                    const merchantWebsite = ctx.params.merchantWebsite;
                    const contactPersonForSparks = ctx.params.contactPersonForSparks;
                    const contactEmail = ctx.params.contactEmail;
                    const mobileForSparks = JSON.stringify(ctx.params.mobileForSparks);
                    const notes = ctx.params.notes;

                    if (Auth.success == false) {
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`;
                    const [token] = await this.adapter.db.query(tokenfind);
                    if (token[0].token == "null") {
                        return message.message.LOGIN;
                    }
                    if (Auth.role == 1 || Auth.role == 2) {
                        const merchantlist = `select * from merchants where id = '${merchantId}'`;
                        const [merchantlistress] = await this.adapter.db.query(
                            merchantlist
                        );
                        if (merchantlistress != "") {
                            // const merchantname = `select * from merchants where id = '${merchantId}'`;
                            // const [merchantnameress] = await this.adapter.db.query(merchantname);
                            const merDate = merchantlistress[0].createdAt;
                            const updateMerchant = `update merchants set merchantName = '${nameCapitalized}',merchantLogo = '${merchantLogo}',merchantSignUpEmail = '${merchantSignUpEmail}',merchantWebsite = '${merchantWebsite}',contactPersonForSparks = '${contactPersonForSparks}',contactEmail = '${contactEmail}',mobileForSparks = '${mobileForSparks}',notes = '${notes}'  where id = '${merchantId}'`;
                            const [updateMerchantProfile] = await this.adapter.db.query(
                                updateMerchant
                            );
                            // return updateMerchantProfile
                            if (
                                updateMerchantProfile.info >
                                "Rows matched: 1  Changed: 0  Warnings: 0"
                            ) {
                                return message.message.UPDATE;
                            } else {
                                return message.message.NOTHINGCHANGES;
                            }
                        } else {
                            const errMessage = {
                                success: true,
                                statusCode: 200,
                                data: activitiesListress,
                            };
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
                    };
                    return errMessage;
                }
            },
        },

        changePassword: {
            rest: {
                method: "POST",
                path: "/changePassword",
            },
            async handler(ctx, res, req) {
                try {
                    const Auth = ctx.meta.user;
                    if (Auth.success == false) {
                        return Auth;
                    }
                    if (Auth.role == 2) {
                        const currentPassword = ctx.params.currentPassword;
                        const newPassword = ctx.params.newPassword;
                        const confirmPassword = ctx.params.confirmPassword;
                        const email = Auth.email;

                        const findEmail = `select * from merchants where merchantSignUpEmail = '${email}'`;
                        const [findEmailress] = await this.adapter.db.query(findEmail);
                        if (findEmailress != "") {
                            const pass = findEmailress[0].password;
                            const matchResult = await bcrypt.compare(currentPassword, pass);
                            if (matchResult == true) {
                                if (newPassword === confirmPassword) {
                                    const hash = await bcrypt.hash(newPassword, 10);
                                    const setPassword = `update merchants set password = '${hash}',createdAt = '${today}' ,updatedAt = '${today}' where merchantSignUpEmail = '${email}'`;
                                    const [setPassress] = await this.adapter.db.query(
                                        setPassword
                                    );
                                    if (setPassress.affectedRows >= 1) {
                                        return message.message.RESETPASSWORD;
                                    } else {
                                        return message.message.RESETPASSWORDNOT;
                                    }
                                } else {
                                    return "not match";
                                }
                            } else {
                                return message.message.PASSWORDDUP;
                            }
                        } else {
                            return message.message.EMAILNOTFOUND;
                        }
                    } else {
                        return message.message.PERMISSIONDENIDE;
                    }
                } catch (error) {
                    return error;
                }
            },
        },

        profile: {
            rest: {
                method: "GET",
                path: "/profile/:id",
            },
            async handler(ctx) {
                try {
                    const Auth = ctx.meta.user;
                    if (Auth.success == false) {
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`;
                    const [token] = await this.adapter.db.query(tokenfind);
                    if (token[0].token == "null") {
                        return message.message.LOGIN;
                    }
                    if (Auth.role == 1) {
                        const MERPROFILE = [];
                        const merchantId = ctx.params.id;
                        const findmerchant = `select * from merchants where id = '${merchantId}' and status != '${0}'`;
                        const [findmerchantress] = await this.adapter.db.query(
                            findmerchant
                        );
                        if (findmerchantress == "") {
                            const successMessage = {
                                success: true,
                                statusCode: 200,
                                data: findmerchantress,
                            };
                            return successMessage;
                        } else {
                            const merchantProfile = {
                                id: findmerchantress[0].id,
                                merchantName: findmerchantress[0].merchantName,
                                merchantLogo: findmerchantress[0].merchantLogo,
                                merchantSignUpEmail: findmerchantress[0].merchantSignUpEmail,
                                merchantWebsite: findmerchantress[0].merchantWebsite,
                                contactPersonForSparks:
                                    findmerchantress[0].contactPersonForSparks,
                                contactEmail: findmerchantress[0].contactEmail,
                                mobileForSparks: findmerchantress[0].mobileForSparks,
                                notes: findmerchantress[0].notes,
                                status: findmerchantress[0].status,
                                connect_id: findmerchantress[0].connect_id,
                                stripeMerchantId: findmerchantress[0].stripeMerchantId,
                                createdAt: findmerchantress[0].createdAt,
                            };
                            MERPROFILE.push(merchantProfile);
                            //=======================================================//

                            const merchantDate1 = findmerchantress[0].updatedAt;
                            const modifyData = `select updatedAt as ModifyDate from outlets where merchantId = '${merchantId}' ORDER BY createdAt DESC`;
                            const [ModifyData] = await this.adapter.db.query(modifyData);

                            if (ModifyData != "") {
                                const outletDate = ModifyData[0].ModifyDate;
                                if (outletDate > merchantDate1) {
                                    const merchantDate = `select updatedAt as ModifyDate from merchant_activities where merchantId = '${merchantId}' ORDER BY createdAt DESC`;
                                    const [merchantDateress] = await this.adapter.db.query(
                                        merchantDate
                                    );
                                    if (merchantDateress != "") {
                                        const merDate = merchantDateress[0].ModifyDate;
                                        if (outletDate > merDate) {
                                            const merActId = `select id from merchant_activities where merchantId = '${merchantId}' ORDER BY createdAt DESC`;
                                            const [merActIdress] = await this.adapter.db.query(
                                                merActId
                                            );
                                            let DEAL;
                                            for (let IID of merActIdress) {
                                                const merAtId = IID.id;
                                                const RegDeal = `select updatedAt from regular_deals where merchantId = '${merAtId}' ORDER BY createdAt DESC`;
                                                const [RegDealress] = await this.adapter.db.query(
                                                    RegDeal
                                                );
                                                DEAL = RegDealress;
                                            }
                                            if (DEAL != "") {
                                                const REG = RegDealress[0].updatedAt;
                                                if (outletDate > REG) {
                                                    MERPROFILE.push({ ModifyDate: outletDate });
                                                } else {
                                                    MERPROFILE.push({ ModifyDate: REG });
                                                }
                                            } else {
                                                MERPROFILE.push({ ModifyDate: outletDate });
                                            }
                                        } else {
                                            let DEAL;
                                            const merActId = `select id from merchant_activities where merchantId = '${merchantId}' ORDER BY createdAt DESC`;
                                            const [merActIdress] = await this.adapter.db.query(
                                                merActId
                                            );
                                            for (let IID of merActIdress) {
                                                const merAtId = IID.id;
                                                const RegDeal = `select updatedAt from regular_deals where merchantId = '${merAtId}' ORDER BY createdAt DESC`;
                                                const [RegDealress] = await this.adapter.db.query(
                                                    RegDeal
                                                );
                                                DEAL = RegDealress;
                                            }
                                            if (DEAL != "") {
                                                const REG = DEAL[0].updatedAt;
                                                if (merDate > REG) {
                                                    MERPROFILE.push({ ModifyDate: merDate });
                                                } else {
                                                    MERPROFILE.push({ ModifyDate: REG });
                                                }
                                            } else {
                                                MERPROFILE.push({ ModifyDate: merDate });
                                            }
                                        }
                                    } else {
                                        MERPROFILE.push({ ModifyDate: outletDate });
                                    }
                                } else {
                                    const merchantDate = `select updatedAt as ModifyDate from merchant_activities where merchantId = '${merchantId}' ORDER BY createdAt DESC`;
                                    const [merchantDateress] = await this.adapter.db.query(
                                        merchantDate
                                    );
                                    if (merchantDateress != "") {
                                        const merDate = merchantDateress[0].ModifyDate;
                                        if (merchantDate1 > merDate) {
                                            const merActId = `select id from merchant_activities where merchantId = '${merchantId}' ORDER BY createdAt DESC`;
                                            const [merActIdress] = await this.adapter.db.query(
                                                merActId
                                            );
                                            let DEAL;
                                            for (let IID of merActIdress) {
                                                const merAtId = IID.id;
                                                const RegDeal = `select updatedAt from regular_deals where merchantId = '${merAtId}' ORDER BY createdAt DESC`;
                                                const [RegDealress] = await this.adapter.db.query(
                                                    RegDeal
                                                );
                                                DEAL = RegDealress;
                                            }
                                            if (DEAL != "") {
                                                const REG = DEAL[0].updatedAt;
                                                if (merchantDate1 > REG) {
                                                    MERPROFILE.push({ ModifyDate: merchantDate1 });
                                                } else {
                                                    MERPROFILE.push({ ModifyDate: REG });
                                                }
                                            } else {
                                                MERPROFILE.push({ ModifyDate: merchantDate1 });
                                            }
                                        } else {
                                            let DEAL;
                                            const merActId = `select id from merchant_activities where merchantId = '${merchantId}' ORDER BY createdAt DESC`;
                                            const [merActIdress] = await this.adapter.db.query(
                                                merActId
                                            );
                                            for (let IID of merActIdress) {
                                                const merAtId = IID.id;
                                                const RegDeal = `select updatedAt from regular_deals where merchantId = '${merAtId}' ORDER BY createdAt DESC`;
                                                const [RegDealress] = await this.adapter.db.query(
                                                    RegDeal
                                                );
                                                DEAL = RegDealress;
                                            }
                                            if (DEAL != "") {
                                                const REG = DEAL[0].updatedAt;
                                                if (merDate > REG) {
                                                    MERPROFILE.push({ ModifyDate: merDate });
                                                } else {
                                                    MERPROFILE.push({ ModifyDate: REG });
                                                }
                                            } else {
                                                MERPROFILE.push({ ModifyDate: merDate });
                                            }
                                        }
                                    } else {
                                        MERPROFILE.push({ ModifyDate: merchantDate1 });
                                    }
                                }
                            } else {
                                MERPROFILE.push({ ModifyDate: merchantDate1 });
                            }

                            //=========================================================//

                            const successMessage = {
                                success: true,
                                statusCode: 200,
                                data: MERPROFILE,
                            };
                            return successMessage;
                        }
                    } else if (Auth.role == 2) {
                        const merchantId = Auth.id;
                        const findmerchant = `select * from merchants where id = '${merchantId}'`;
                        const [findmerchantress] = await this.adapter.db.query(
                            findmerchant
                        );
                        if (findmerchantress == "") {
                            const successMessage = {
                                success: true,
                                statusCode: 200,
                                data: findmerchantress,
                            };
                            return successMessage;
                        } else {
                            const merchantProfile = {
                                id: findmerchantress[0].id,
                                merchantName: findmerchantress[0].merchantName,
                                merchantLogo: findmerchantress[0].merchantLogo,
                                merchantSignUpEmail: findmerchantress[0].merchantSignUpEmail,
                                merchantWebsite: findmerchantress[0].merchantWebsite,
                                contactPersonForSparks:
                                    findmerchantress[0].contactPersonForSparks,
                                contactEmail: findmerchantress[0].contactEmail,
                                mobileForSparks: findmerchantress[0].mobileForSparks,
                                notes: findmerchantress[0].notes,
                                status: findmerchantress[0].status,
                                connect_id: findmerchantress[0].connect_id,
                                stripeMerchantId: findmerchantress[0].stripeMerchantId,
                                // createdBy: findmerchantress[0].createdBy,
                                // updatedBy: findmerchantress[0].updatedBy,
                                // createdAt:findmerchantress[0].createdAt,
                                // updatedAt:findmerchantress[0].updatedAt,
                            };
                            const successMessage = {
                                success: true,
                                statusCode: 200,
                                data: merchantProfile,
                            };
                            return successMessage;
                        }
                    } else {
                        return message.message.PERMISSIONDENIDE;
                    }
                } catch (error) {
                    const errMessage = {
                        success: false,
                        statusCode: 409,
                        error: error.errors,
                    };
                    return errMessage;
                }
            },
        },

        merchant_list: {
            rest: {
                method: "GET",
                path: "/merchant_list/:search",
            },
            async handler(ctx) {
                try {
                    const Auth = ctx.meta.user;
                    const search = ctx.params.search;
                    if (Auth.success == false) {
                        return Auth;
                    }
                    const MERNAME = [];
                    if (Auth.role == 1) {
                        const merchantList = `SELECT * FROM merchants where merchantName like '%${search}%' and status != '${0}' ORDER BY merchantName ASC`;
                        const [merchantListress] = await this.adapter.db.query(
                            merchantList
                        );
                        const successMessage = {
                            success: true,
                            statusCode: 200,
                            data: merchantListress,
                        };
                        if (merchantListress != "") {
                            var merName;
                            for (let dat of merchantListress) {
                                merName = dat.merchantName;
                                MERNAME.push(merName);
                            }
                            if (search.toUpperCase() == merName.toUpperCase()) {
                                const successMessage = {
                                    success: true,
                                    statusCode: 200,
                                    data: MERNAME,
                                };
                                return successMessage;
                            } else {
                                const successMessage = {
                                    success: true,
                                    statusCode: 200,
                                    data: [],
                                };
                                return successMessage;
                            }
                        } else {
                            return successMessage;
                        }
                    } else {
                        return message.message.PERMISSIONDENIDE;
                    }
                } catch (error) {
                    const errMessage = {
                        success: false,
                        statusCode: 409,
                        error: error.errors,
                    };
                    return errMessage;
                }
            },
        },

        listMerchant: {
            rest: {
                method: "GET",
                path: "/listMerchant",
            },
            async handler(ctx) {
                try {
                    const Auth = ctx.meta.user;
                    const DATA = [];
                    if (Auth.success != false) {
                        if (Auth.role == 1 || Auth.role == 2) {
                            const findmerchant = `select * from merchants `;
                            const [findmerchantress] = await this.adapter.db.query(
                                findmerchant
                            );

                            if (findmerchantress == "") {
                                const successMessage = {
                                    success: true,
                                    statusCode: 200,
                                    data: findmerchantress,
                                    message: "Success",
                                };
                                return successMessage;
                            } else {
                                for (let listMer of findmerchantress) {
                                    const List = {
                                        id: listMer.id,
                                        merchantName: listMer.merchantName,
                                    };
                                    DATA.push(List);
                                }
                                const successMessage = {
                                    success: true,
                                    statusCode: 200,
                                    data: DATA,
                                };
                                return successMessage;
                            }
                        } else {
                            return message.message.PERMISSIONDENIDE;
                        }
                    } else {
                        return message.message.UNAUTHORIZED;
                    }
                } catch (error) {
                    const errMessage = {
                        success: false,
                        statusCode: 409,
                        error: error.errors,
                    };
                    return errMessage;
                }
            },
        },

        active: {
            rest: {
                method: "POST",
                path: "/active",
            },
            async handler(ctx) {
                try {
                    const Auth = ctx.meta.user;
                    const merchantId = ctx.params.merchantId;
                    const status = ctx.params.status;

                    if (Auth.success == false) {
                        return Auth;
                    }
                    const tokenfind = `select * from authentications where user_id = '${Auth.id}'`;
                    const [token] = await this.adapter.db.query(tokenfind);
                    if (token[0].token == "null") {
                        return message.message.LOGIN;
                    }

                    if (Auth.role == 1 || Auth.role == 2) {
                        const merchantList = `select * from merchants where id = '${merchantId}'`;
                        const [merchantListress] = await this.adapter.db.query(
                            merchantList
                        );
                        if (merchantListress != "") {
                            if (status == 1 || status == 2) {
                                const getmerAct = `select activityId from merchant_activities where merchantId = '${merchantId}' and merchantStatus = '${1}'`;
                                const [getmerActress] = await this.adapter.db.query(getmerAct);
                                if (getmerActress.length == 0) {
                                    const errMessage = {
                                        success: false,
                                        statusCode: 409,
                                        message: "One MerchantActivity must be active",
                                    };
                                    return errMessage;
                                }else{
                                    const updateActivity = `update merchants set status = '${status}' where id = '${merchantId}'`
                                    const [updateActivityress] = await this.adapter.db.query(updateActivity);
                                    const updateMerAct = `update merchant_activities set status = '${status}' where merchantId = '${merchantId}'`
                                    const [updateMerActress] = await this.adapter.db.query(updateMerAct);
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
                                            const merActDeactive = `update merchant_activities set merchantStatus = '${status}' where merchantId = '${merchantId}'`
                                            const [merAct] = await this.adapter.db.query(merActDeactive);
                                            const findMer = `select id from merchant_activities where merchantId = '${merchantId}'`
                                            const [findMerress] = await this.adapter.db.query(findMer);
                                            if(findMerress == ''){
                                                const successMessage = {
                                                    success:true,
                                                    statusCode:200,
                                                    status:status,
                                                    message:"Deactive"
                                                }
                                                return successMessage
                                            }else{
                                                for(let key of findMerress){
                                                    const DealDeactive = `update regular_deals set status = '${status}' where merchantId = '${key.id}'`
                                                    const [DealDeact] = await this.adapter.db.query(DealDeactive);
                                                }
                                                for (let key1 of getmerActress) {
                                                    const getstatus = `select Count(status) as count from merchant_activities where activityId = '${
                                                        key1.activityId
                                                    }' and status = '${1}'`;
                                                    const [getstatusress] = await this.adapter.db.query(
                                                        getstatus
                                                        );
                                                        if (getstatusress[0].count == 0) {
                                                            const deactiveAct = `update activities set status = '${status}' where id = '${key1.activityId}'`;
                                                            const [deactiveActress] = await this.adapter.db.query(
                                                                deactiveAct
                                                                );
                                                    }
                                                }
                                                const successMessage = {
                                                    success:true,
                                                    statusCode:200,
                                                    status:status,
                                                    message:"Deactive"
                                                }
                                                return successMessage
                                            }
                                        }
                                    }else{
                                        return message.message.NOTUPDATE;
                                    }
                                }
                            } else {
                                const updateActivity = `update merchants set status = '${status}' where id = '${merchantId}'`;
                                const [updateActivityress] = await this.adapter.db.query(
                                    updateActivity
                                    );
                                if (updateActivityress.affectedRows >= 0) {
                                    const deletreDeals = `delete from regular_deals_relations where merId = '${merchantId}'`;
                                    const [delerteDealsress] = await this.adapter.db.query(
                                        deletreDeals
                                    );
                                    const delereDeals1 = `delete from regular_deals where merId = '${merchantId}'`;
                                    const [delereDealsress1] = await this.adapter.db.query(
                                        delereDeals1
                                    );
                                    const deletmersugg = `delete from merchant_activities_suggetions where merchantId = '${merchantId}'`;
                                    const [deletmersuggress] = await this.adapter.db.query(
                                        deletmersugg
                                    );
                                    const delereDeals = `delete from merchant_activities where merchantId = '${merchantId}'`;
                                    const [delereDealsress] = await this.adapter.db.query(
                                        delereDeals
                                    );
                                    const successMessage = {
                                        success: true,
                                        statusCode: 200,
                                        status: status,
                                        message: "Delete",
                                    };
                                    return successMessage;
                                }
                            }
                        } else {
                            const errMessage = {
                                success: true,
                                statusCode: 200,
                                data: activitiesListress,
                            };
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
                    };
                    return errMessage;
                }
            },
        },
    },
};
