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
const role = message.roles.user;


module.exports = {
    name: 'users',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),
    
    model: {
        name: "user",
        define: {
            firstName:Sequelize.STRING,
            lastName: Sequelize.STRING,
            email: Sequelize.STRING,
			gender: Sequelize.STRING,
			profilePic: Sequelize.STRING,
			password: Sequelize.INTEGER,
			mobileNo: Sequelize.STRING,
			dob: Sequelize.DATE,
			stripeCustomerId: Sequelize.STRING,
            emailVerificationCode: Sequelize.STRING,
            coupleCode: Sequelize.STRING,
            resetPasswordCode: Sequelize.STRING,
            resetPasswordExpire: Sequelize.STRING,
            referedBy: Sequelize.INTEGER,
            privacy: Sequelize.INTEGER,
            blockedUsers: Sequelize.JSON,
            totalFriends: Sequelize.JSON,
            status: Sequelize.INTEGER,
            createdAt : Sequelize.DATE,
            updatedAt : Sequelize.DATE
        },
        options: {}
    },

    actions: {

        signupOld: {
            rest: {
				method: "POST",
				path: "/signupOld"
            },
            async handler(ctx) {
                try{
                    const firstName = ctx.params.firstName;
                    const lastName = ctx.params.lastName;
                    const email = ctx.params.email;
                    const gender = ctx.params.gender;
                    const profilePic = ctx.params.profilePic || null;
                    const password = ctx.params.password;
                    const mobileNo = ctx.params.mobileNo;
                    const dob = ctx.params.dob;
                    const stripeCustomerId = ctx.params.stripeCustomerId || null
                    const emailVerificationCode = ctx.params.emailVerificationCode || null;
                    const coupleCode = ctx.params.coupleCode || null;
                    const resetPasswordCode = ctx.params.resetPasswordCode || null;
                    const resetPasswordExpire = ctx.params.resetPasswordExpire || null;
                    const referedBy = ctx.params.referedBy || '0';
                    const privacy = ctx.params.privacy || '1';
                    const blockedUsers = ctx.params.blockedUsers || null;
                    const totalFriends = ctx.params.totalFriends || null;
                    const status = ctx.params.status || '1';
                    const activityCategories = ctx.params.user_preference.activityCategories;
                    const country = ctx.params.country;

                    const hash = await bcrypt.hash(password,10);
                    const dupUser = `select * from users where email = '${email}'`;
                    const [dupUserress] = await this.adapter.db.query(dupUser)
                    if(dupUserress == ''){
                        const userCreate = `insert into users(firstName,lastName,email,gender,profilePic,password,mobileNo,dob,stripeCustomerId,emailVerificationCode,coupleCode,resetPasswordCode,resetPasswordExpire,referedBy,privacy,blockedUsers,totalFriends,status) values('${firstName}','${lastName}','${email}','${gender}','${profilePic}','${hash}','${mobileNo}','${dob}','${stripeCustomerId}','${emailVerificationCode}','${coupleCode}','${resetPasswordCode}','${resetPasswordExpire}','${referedBy}','${privacy}','${blockedUsers}','${totalFriends}','${status}')`;
                        const [user] = await this.adapter.db.query(userCreate)
                        if(user){
                            const accountPrivacy = ctx.params.accountPrivacy || null;
                            const googleId = ctx.params.googleId || null;
                            const facebookId = ctx.params.facebookId;
                            const instagramId = ctx.params.instagramId || null;
                            const twitterId = ctx.params.twitterId || null;
                            const notificationSettings = ctx.params.notificationSettings || null;
                            const exportCalendarType = ctx.params.exportCalendarType || null;
                            const activityCategories1 = ctx.params.activityCategories || null
                            const countryMode	 = ctx.params.countryMode	 || null;
                            const favouriteActivities = ctx.params.favouriteActivities || null;
                            const cards = ctx.params.cards || null;
                            
                            const userPreference = `insert into user_preferences(userId,accountPrivacy,googleId,facebookId,instagramId,twitterId,notificationSettings,exportCalendarType,activityCategories,countryMode,favouriteActivities,cards) values('${user}','${accountPrivacy}','${googleId}','${facebookId}','${instagramId}','${twitterId}','${notificationSettings}','${exportCalendarType}','${activityCategories}','${countryMode}','${favouriteActivities}','${cards}')`;
                            const [userPreferenceress] = await this.adapter.db.query(userPreference); 
                            var token = jwt.sign({
                                id: user,
                                email:email,
                                status: status,
                                role: role
                            }, 'secret', { expiresIn: '12h' });
                            const userData = {
                                "id":user ,
                                "firstName": firstName,
                                "lastName":lastName,
                                "email": email,
                                "gender": gender,
                                "profilePic": profilePic,
                                "mobileNo": mobileNo,
                                "dob": dob,
                                "coupleCode": coupleCode,
                                "status": status,
                                "user_preference": {
                                    "userId": user,
                                    "token": token
                                }
                            }
                            const successMessage = {
                                success:true,
                                statusCode:200,
                                data:userData,
                                message:'Success'
                            }
                            return successMessage;
                        }else{
                            const successMessage = {
                                success:false,
                                status: 500,
                                message:'Not save'
                            }
                            return successMessage;
                        }
                    }else {
                        return message.message.USERDUPLICATE;
                    }
                }catch(error){
                    return error;
                }
			}
        },

        signup: {
            rest: {
				method: "POST",
				path: "/signup"
            },
            async handler(ctx) {
                try{
                    const firstName = ctx.params.firstName;
                    const lastName = ctx.params.lastName;
                    const email = ctx.params.email;
                    const gender = ctx.params.gender;
                    const profilePic = ctx.params.profilePic || null;
                    const password = ctx.params.password;
                    const mobileNo = ctx.params.mobileNo;
                    const dob = ctx.params.dob;
                    const stripeCustomerId = ctx.params.stripeCustomerId || null
                    const emailVerificationCode = ctx.params.emailVerificationCode || null;
                    const coupleCode = ctx.params.coupleCode || null;
                    const resetPasswordCode = ctx.params.resetPasswordCode || null;
                    const resetPasswordExpire = ctx.params.resetPasswordExpire || null;
                    const referedBy = ctx.params.referedBy || '0';
                    const privacy = ctx.params.privacy || '1';
                    const blockedUsers = ctx.params.blockedUsers || null;
                    const totalFriends = ctx.params.totalFriends || null;
                    const status = ctx.params.status || '1';
                    const activityCategories = '['+ctx.params.user_preference.activityCategories+']';
                    const country = ctx.params.country;

                    const facebookId = ctx.params.facebookId;
                    const googleId   = ctx.params.googleId;

                    if(googleId != ''){
                        /** Loign with google **/
                        const checkUser = `SELECT * FROM user_preferences as up JOIN users as u ON up.userId = u.id WHERE googleId = '${googleId}'`;
                        const [checkUserress] = await this.adapter.db.query(checkUser);
                        if(checkUserress != ''){
                                const userId = checkUserress[0].id;
                                var token = jwt.sign({
                                    id      : userId,
                                    email   : checkUserress[0].email,
                                    status  : checkUserress[0].status,
                                    role    : role,
                                }, 'secret', { expiresIn: '12h' });

                                const userdata = {
                                    id          : userId,
                                    firstName   : checkUserress[0].firstName,
                                    lastName    : checkUserress[0].lastName,
                                    email       : checkUserress[0].email,
                                    gender      : checkUserress[0].gender,
                                    profilePic  : checkUserress[0].profilePic,
                                    mobileNo    : checkUserress[0].mobileNo,
                                    dob         : checkUserress[0].dob,
                                    coupleCode  : checkUserress[0].coupleCode,
                                    status      : checkUserress[0].status,
                                    createdAt   : checkUserress[0].createdAt,
                                    updatedAt   : checkUserress[0].updatedAt,
                                    user_preference: {
                                        userId : userId,
                                        token  : token
                                    }
                                }
            
                                const successMessage = {
                                    success:true,
                                    statusCode    : 200,
                                    message     : 'Success',
                                    message     : 'Google login',
                                    data          : userdata,
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
                            // return process.message.USERNOTFOUND;
                            const checkUser = `SELECT * FROM user_preferences as up JOIN users as u ON up.userId = u.id WHERE email = '${email}'`;
                            const [checkUserress] = await this.adapter.db.query(checkUser);
                            if(checkUserress != ''){
                                // return checkUserress[0].email;

                                    const userPreference = `UPDATE user_preferences SET googleId = '${googleId}' WHERE userId = '${checkUserress[0].userId}'`;
                                    const [userPreferenceress] = await this.adapter.db.query(userPreference); 
                                    if(userPreferenceress){
                                        var token = jwt.sign({
                                            id      : checkUserress[0].id,
                                            email   :email,
                                            status  : status,
                                            role    : role
                                        }, 'secret', { expiresIn: '12h' });
                                
                                        const userData = {
                                            "id":checkUserress[0].id ,
                                            "firstName": firstName,
                                            "lastName":lastName,
                                            "email": email,
                                            "gender": gender,
                                            "profilePic": profilePic,
                                            "mobileNo": mobileNo,
                                            "dob": dob,
                                            "coupleCode": coupleCode,
                                            "status": status,
                                            "user_preference": {
                                                "userId":checkUserress[0].id,
                                                "token": token
                                            }
                                        }
                                        const successMessage = {
                                            success     :   true,
                                            statusCode  :   200,
                                            message     :   'Success',
                                            logi        :   'update as Google',
                                            data        :  userData,                      
                                        }
                                        return successMessage;
                                    }

                                    
                            }else{
                                // return 'checkUserress[0].email';

                                const hash = await bcrypt.hash(password,10);
                                const userCreate = `insert into users(firstName,lastName,email,gender,profilePic,password,mobileNo,dob,status) values('${firstName}','${lastName}','${email}','${gender}','${profilePic}','${hash}','${mobileNo}','${dob}','${status}')`;

                                const [user] = await this.adapter.db.query(userCreate)
                                if(user){
                                    console.log(user)
                                    
                                    const userPreference = `insert into user_preferences(userId,googleId,activityCategories) values('${user}','${googleId}','${activityCategories}')`;
                                    const [userPreferenceress] = await this.adapter.db.query(userPreference); 
                                    var token = jwt.sign({
                                        id: user,
                                        email:email,
                                        status: status,
                                        role: role
                                    }, 'secret', { expiresIn: '12h' });
                                    const userData = {
                                        "id":user ,
                                        "firstName": firstName,
                                        "lastName":lastName,
                                        "email": email,
                                        "gender": gender,
                                        "profilePic": profilePic,
                                        "mobileNo": mobileNo,
                                        "dob": dob,
                                        "coupleCode": coupleCode,
                                        "status": status,
                                        "user_preference": {
                                            "userId": user,
                                            "token": token
                                        }
                                    }
                                    const successMessage = {
                                        success:true,
                                        statusCode:200,
                                        message:'Success',
                                        logi   :'Register as Google',
                                        data:userData,                      
                                    }
                                    return successMessage;
                                }else{
                                    const successMessage = {
                                        success:false,
                                        status: 500,
                                        message:'Not save'
                                    }
                                    return successMessage;
                                }
                            }
                            
                        }
                        /** End **/
                    }else if(facebookId != ''){
                        /** Loign with Facebook **/
                        const checkUser = `SELECT * FROM user_preferences as up JOIN users as u ON up.userId = u.id WHERE facebookId = '${facebookId}'`;
                        const [checkUserress] = await this.adapter.db.query(checkUser);
                        if(checkUserress != ''){
                                const userId = checkUserress[0].id;
                                var token = jwt.sign({
                                    id      : userId,
                                    email   : checkUserress[0].email,
                                    status  : checkUserress[0].status,
                                    role    : role,
                                }, 'secret', { expiresIn: '12h' });

                                const userdata = {
                                    id          : userId,
                                    firstName   : checkUserress[0].firstName,
                                    lastName    : checkUserress[0].lastName,
                                    email       : checkUserress[0].email,
                                    gender      : checkUserress[0].gender,
                                    profilePic  : checkUserress[0].profilePic,
                                    mobileNo    : checkUserress[0].mobileNo,
                                    dob         : checkUserress[0].dob,
                                    coupleCode  : checkUserress[0].coupleCode,
                                    status      : checkUserress[0].status,
                                    createdAt   : checkUserress[0].createdAt,
                                    updatedAt   : checkUserress[0].updatedAt,
                                    user_preference: {
                                        userId : userId,
                                        token  : token
                                    }
                                }
            
                                const successMessage = {
                                    success:true,
                                    statusCode    : 200,
                                    message     : 'Success',
                                    message     : 'Facebook login',
                                    data          : userdata,
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
                            // return process.message.USERNOTFOUND;
                            const checkUser = `SELECT * FROM user_preferences as up JOIN users as u ON up.userId = u.id WHERE email = '${email}'`;
                            const [checkUserress] = await this.adapter.db.query(checkUser);
                            if(checkUserress != ''){
                                // return checkUserress[0].email;

                                    const userPreference = `UPDATE user_preferences SET facebookId = '${facebookId}' WHERE userId = '${checkUserress[0].userId}'`;
                                    const [userPreferenceress] = await this.adapter.db.query(userPreference); 
                                    if(userPreferenceress){
                                        var token = jwt.sign({
                                            id      : checkUserress[0].id,
                                            email   :email,
                                            status  : status,
                                            role    : role
                                        }, 'secret', { expiresIn: '12h' });
                                
                                        const userData = {
                                            "id":checkUserress[0].id ,
                                            "firstName": firstName,
                                            "lastName":lastName,
                                            "email": email,
                                            "gender": gender,
                                            "profilePic": profilePic,
                                            "mobileNo": mobileNo,
                                            "dob": dob,
                                            "coupleCode": coupleCode,
                                            "status": status,
                                            "user_preference": {
                                                "userId":checkUserress[0].id,
                                                "token": token
                                            }
                                        }
                                        const successMessage = {
                                            success     :   true,
                                            statusCode  :   200,
                                            message     :   'Success',
                                            logi        :   'update as facebook',
                                            data        :  userData,                      
                                        }
                                        return successMessage;
                                    }

                                    
                            }else{
                                // return 'checkUserress[0].email';

                                const hash = await bcrypt.hash(password,10);
                                const userCreate = `insert into users(firstName,lastName,email,gender,profilePic,password,mobileNo,dob,status) values('${firstName}','${lastName}','${email}','${gender}','${profilePic}','${hash}','${mobileNo}','${dob}','${status}')`;

                                const [user] = await this.adapter.db.query(userCreate)
                                if(user){
                                    console.log(user)
                                    
                                    const userPreference = `insert into user_preferences(userId,facebookId,activityCategories) values('${user}','${facebookId}','${activityCategories}')`;
                                    const [userPreferenceress] = await this.adapter.db.query(userPreference); 
                                    var token = jwt.sign({
                                        id: user,
                                        email:email,
                                        status: status,
                                        role: role
                                    }, 'secret', { expiresIn: '12h' });
                                    const userData = {
                                        "id":user ,
                                        "firstName": firstName,
                                        "lastName":lastName,
                                        "email": email,
                                        "gender": gender,
                                        "profilePic": profilePic,
                                        "mobileNo": mobileNo,
                                        "dob": dob,
                                        "coupleCode": coupleCode,
                                        "status": status,
                                        "user_preference": {
                                            "userId": user,
                                            "token": token
                                        }
                                    }
                                    const successMessage = {
                                        success:true,
                                        statusCode:200,
                                        message:'Success',
                                        logi   :'Register as Facebook',
                                        data:userData,                      
                                    }
                                    return successMessage;
                                }else{
                                    const successMessage = {
                                        success:false,
                                        status: 500,
                                        message:'Not save'
                                    }
                                    return successMessage;
                                }
                            }
                            
                        }
                        /** End **/
                    }else if(googleId == '' && facebookId == ''){
                        const hash = await bcrypt.hash(password,10);
                        const dupUser = `select * from users where email = '${email}'`;
                        const [dupUserress] = await this.adapter.db.query(dupUser)
                        if(dupUserress == ''){
                            const userCreate = `insert into users(firstName,lastName,email,gender,profilePic,password,mobileNo,dob,stripeCustomerId,emailVerificationCode,coupleCode,resetPasswordCode,resetPasswordExpire,referedBy,privacy,blockedUsers,totalFriends,status) values('${firstName}','${lastName}','${email}','${gender}','${profilePic}','${hash}','${mobileNo}','${dob}','${stripeCustomerId}','${emailVerificationCode}','${coupleCode}','${resetPasswordCode}','${resetPasswordExpire}','${referedBy}','${privacy}','${blockedUsers}','${totalFriends}','${status}')`;
                            const [user] = await this.adapter.db.query(userCreate)
                            if(user){
                                const accountPrivacy = ctx.params.accountPrivacy || null;
                                const googleId = ctx.params.googleId || null;
                                const facebookId = ctx.params.facebookId;
                                const instagramId = ctx.params.instagramId || null;
                                const twitterId = ctx.params.twitterId || null;
                                const notificationSettings = ctx.params.notificationSettings || null;
                                const exportCalendarType = ctx.params.exportCalendarType || null;
                                const activityCategories1 = ctx.params.activityCategories || null
                                const countryMode	 = ctx.params.countryMode	 || null;
                                const favouriteActivities = ctx.params.favouriteActivities || null;
                                const cards = ctx.params.cards || null;
                                
                                const userPreference = `insert into user_preferences(userId,accountPrivacy,googleId,facebookId,instagramId,twitterId,notificationSettings,exportCalendarType,activityCategories,countryMode,favouriteActivities,cards) values('${user}','${accountPrivacy}','${googleId}','${facebookId}','${instagramId}','${twitterId}','${notificationSettings}','${exportCalendarType}','${activityCategories}','${countryMode}','${favouriteActivities}','${cards}')`;
                                const [userPreferenceress] = await this.adapter.db.query(userPreference); 
                                var token = jwt.sign({
                                    id: user,
                                    email:email,
                                    status: status,
                                    role: role
                                }, 'secret', { expiresIn: '12h' });
                                const userData = {
                                    "id":user ,
                                    "firstName": firstName,
                                    "lastName":lastName,
                                    "email": email,
                                    "gender": gender,
                                    "profilePic": profilePic,
                                    "mobileNo": mobileNo,
                                    "dob": dob,
                                    "coupleCode": coupleCode,
                                    "status": status,
                                    "user_preference": {
                                        "userId": user,
                                        "token": token
                                    }
                                }
                                const successMessage = {
                                    success:true,
                                    statusCode:200,
                                    data:userData,
                                    message:'Success'
                                }
                                return successMessage;
                            }else{
                                const successMessage = {
                                    success:false,
                                    status: 500,
                                    message:'Not save'
                                }
                                return successMessage;
                            }
                        }else {
                            return process.message.USERDUPLICATE;
                        }
                    }else{
                        const successMessage = {
                            success:false,
                            statusCode:500,
                            message:'Something went wrong'
                        }
                        return successMessage;
                    }    

                }catch(error){
                    return error;
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
                    const email = ctx.params.email;
                    const password = ctx.params.password;
                    const checkUser = `select * from users where email = '${email}'`;
                    const [checkUserress] = await this.adapter.db.query(checkUser);
                    if(checkUserress != ''){
                        const pwd = checkUserress[0].password;
                        var matchResult = await bcrypt.compare(password,pwd);
                        if(matchResult == true){
                            const userId = checkUserress[0].id;

                            var token = jwt.sign({
                                id: userId,
                                email:checkUserress[0].email,
                                status: checkUserress[0].status,
                                role:role,
                            }, 'secretkey', { expiresIn: '12h' });
                            const userdata = {
                                id: userId,
                                firstName: checkUserress[0].firstName,
                                lastName: checkUserress[0].lastName,
                                email: checkUserress[0].email,
                                gender: checkUserress[0].gender,
                                profilePic: checkUserress[0].profilePic,
                                mobileNo: checkUserress[0].mobileNo,
                                dob: checkUserress[0].dob,
                                coupleCode: checkUserress[0].coupleCode,
                                status: checkUserress[0].status,
                                createdAt:checkUserress[0].createdAt,
                                updatedAt:checkUserress[0].updatedAt,
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
                                    return message.message.LOGINFAIL;
                                }
                            }else {
                                const saveToken = `insert into authentications(type,user_id,token) values('${'user'}','${userId}','${token}')`
                                const [saveTokenress] = await this.adapter.db.query(saveToken);
                                if(saveTokenress){
                                    return successMessage;
                                }else {
                                    return message.message.LOGINFAIL;
                                }
                            }
                        }else {
                            return message.message.PASSWORDDUP;
                        }
                    }else {
                        return message.message.USERNOTFOUND;
                    }
                }catch(error){
                    return error
                }
			}
        },

        userList: {
            rest: {
				method: "GET",
				path: "/userList"
            },
            async handler(ctx,res,req) {
                try{
                    // console.log(ctx)
                    const Auth = ctx.meta.user;
                    if(Auth != null){
                        const userId = Auth.id;
                        const findUser = `select * from users where id = '${userId}'`;
                        const [findUserress] = await this.adapter.db.query(findUser);
                            successMessage = {
                                success:true,
                                statusCode:200,
                                data:findUserress
                            }
                        if(findUserress == ''){
                            return successMessage;
                        }else {
                            return successMessage;
                        }
                    }else{
                        return message.message.UNAUTHORIZED;
                    }
                }catch(error){
                    return error
                }
			}
        },

        validate: {
            rest: {
				method: "POST",
				path: "/validate"
            },
            async handler(ctx,res,req) {
                try{
                    const email = ctx.params.email;
                    const findEmail = `select * from users where email = '${email}'`;
                    const [findEmailress] = await this.adapter.db.query(findEmail);
                        const userData = {
                            id:findEmailress[0].id,
                            firstName:findEmailress[0].firstName,
                            lastName:findEmailress[0].lastName,
                            email:findEmailress[0].email,
                            gender:findEmailress[0].gender,
                            profilePic:findEmailress[0].profilePic,
                            mobileNo:findEmailress[0].mobileNo,
                            dob:findEmailress[0].dob,
                            status:findEmailress[0].status
                        }
                        successMessage = {
                            success:true,
                            statusCode:200,
                            data:userData
                        }
                    if(findEmailress == ''){
                        return successMessage;
                    }else {
                        return successMessage;
                    }
                }catch(error){
                    return error
                }
			}
        },
        
        forget_password: {
            rest: {
				method: "POST",
				path: "/forget_password"
            },
              
            async handler(ctx,res,req) {
                try{
                    const email = ctx.params.email;
                    const findEmail = `select * from users where email = '${email}'`;
                    const [findEmailress] = await this.adapter.db.query(findEmail);
                    if(findEmailress == ''){
                        return message.message.EMAILNOTFOUND;
                    }else {
                        const token = uuid();
                        const firstName = findEmailress[0].firstName;
                        
                        let testAccount = await nodemailer.createTestAccount();

                        // create reusable transporter object using the default SMTP transport
                        let transporter = nodemailer.createTransport({
                          host: "smtp.ethereal.email",
                          port: 587,
                          secure: false, // true for 465, false for other ports
                          auth: {
                            user: testAccount.user, // generated ethereal user
                            pass: testAccount.pass // generated ethereal password
                          }
                        });
                      
                        // send mail with defined transport object
                        let info = await transporter.sendMail({
                          from: `'Sparks' <help@sparks.com>`, // sender address
                          to: email, // list of receivers
                          subject: "Forget password ✔", // Subject line
                          text: `token: '${token}'`, // plain text body
                          html: "<b>Hello world?</b>" // html body
                        });
                        // return info
                        const setToken = `update users set t`
                        
                    }
                }catch(error){
                    return error
                }
			}
        },


        reset_password: {
            rest: {
				method: "POST",
				path: "/reset_password"
            },
            async handler(ctx,res,req) {
                try{
                    const email = ctx.params.email;
                    const password = ctx.params.password;
                    const findEmail = `select * from users where email = '${email}'`;
                    const [findEmailress] = await this.adapter.db.query(findEmail);
                    if(findEmailress != ''){
                        // return findEmailress
                        const hash = await bcrypt.hash(password,10);
                        const setPassword = `update users set password = '${hash}' where email = '${email}'`;
                        const [setPassress] = await this.adapter.db.query(setPassword);
                        if(setPassress.affectedRows >= 1){
                            return message.message.RESETPASSWORD;
                        }else{
                            return 
                        }
                    }else{
                        return message.message.EMAILNOTFOUND;
                    }
                }catch(error){
                    return error
                }
			}
        },

        allUsers: {
            rest: {
				method: "POST",
				path: "/allUsers"
            },
            async handler(ctx,res,req) {
                try{
                    const email = ctx.params.email;
                    const password = ctx.params.password;
                    const findEmail = `select * from users where email = '${email}'`;
                    const [findEmailress] = await this.adapter.db.query(findEmail);
                    if(findEmailress != ''){
                        // return findEmailress
                        const hash = await bcrypt.hash(password,10);
                        const setPassword = `update users set password = '${hash}' where email = '${email}'`;
                        const [setPassress] = await this.adapter.db.query(setPassword);
                        if(setPassress.affectedRows >= 1){
                            return message.message.RESETPASSWORD;
                        }else{
                            return 
                        }
                    }else{
                        return message.message.EMAILNOTFOUND;
                    }
                }catch(error){
                    return error
                }
			}
        },
        
        
    }
    
}