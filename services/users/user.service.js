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
var moment = require('moment');
var random = require('alphanumeric');
var code = random(6);


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
            firstName:{type:Sequelize.STRING},
            lastName: {type:Sequelize.STRING},
            email: {type:Sequelize.STRING},
			gender: {type:Sequelize.STRING},
			profilePic: {type:Sequelize.STRING},
			password: {type:Sequelize.INTEGER},
			mobileNo: {type:Sequelize.STRING},
			dob: {type:Sequelize.DATE},
			stripeCustomerId: {type:Sequelize.STRING},
            emailVerificationCode: {type:Sequelize.STRING},
            coupleCode: {type:Sequelize.STRING},
            resetPasswordCode: {type:Sequelize.STRING},
            resetPasswordExpire: {type:Sequelize.STRING},
            referedBy: {type:Sequelize.INTEGER},
            privacy: {type:Sequelize.INTEGER},
            blockedUsers: {type:Sequelize.JSON},
            totalFriends: {type:Sequelize.JSON},
            status: {type:Sequelize.INTEGER},
            createdAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')},
            updatedAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')},
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
                    const activityCategories = ctx.params.user_preference.activityCategories;
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
                                const userCreate = `insert into users(firstName,lastName,email,gender,profilePic,password,mobileNo,dob,status,coupleCode) values('${firstName}','${lastName}','${email}','${gender}','${profilePic}','${hash}','${mobileNo}','${dob}','${status}','${coupleCode}')`;

                                const [user] = await this.adapter.db.query(userCreate)
                                if(user){
                                    
                                    const userPreference = `insert into user_preferences(userId,googleId,activityCategories) values('${user}','${googleId}','${activityCategories}')`;
                                    const [userPreferenceress] = await this.adapter.db.query(userPreference); 
                                   
                                    // --------
                                    /** Generator coupleCode **/
                                    // var codeval;                                                        
                                    // var query=`SELECT * FROM users WHERE coupleCode = '${codeval}'`;
                                    // const [userCode] = await this.adapter.db.query(query)                            
                                    // if(userCode.length==0){
                                    //     codeval=await random(6);
                                    //     var userUpdate=`UPDATE users SET coupleCode = '${codeval}' WHERE id=${user}`;
                                    //     const [CodeUpdate] = await this.adapter.db.query(userUpdate);                                                               
                                    // }
                                    // if(userCode.length!=0){
                                    //     codeval=await random(6);
                                    //     var userUpdate=`UPDATE users SET coupleCode = '${codeval}' WHERE id=${user}`;
                                    //     const [CodeUpdate] = await this.adapter.db.query(userUpdate);                                                               
                                    // }
                                    // --------
                                    
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
                                const userCreate = `insert into users(firstName,lastName,email,gender,profilePic,password,mobileNo,dob,status,coupleCode) values('${firstName}','${lastName}','${email}','${gender}','${profilePic}','${hash}','${mobileNo}','${dob}','${status}','${coupleCode}')`;

                                const [user] = await this.adapter.db.query(userCreate)
                                if(user){
                                    
                                    const userPreference = `insert into user_preferences(userId,facebookId,activityCategories) values('${user}','${facebookId}','${activityCategories}')`;
                                    const [userPreferenceress] = await this.adapter.db.query(userPreference); 
                                   
                                    // --------
                                    /** Generator coupleCode **/
                                    // var codeval;                                                        
                                    // var query=`SELECT * FROM users WHERE coupleCode = '${codeval}'`;
                                    // const [userCode] = await this.adapter.db.query(query)                            
                                    // if(userCode.length==0){
                                    //     codeval=await random(6);
                                    //     var userUpdate=`UPDATE users SET coupleCode = '${codeval}' WHERE id=${user}`;
                                    //     const [CodeUpdate] = await this.adapter.db.query(userUpdate);                                                               
                                    // }
                                    // if(userCode.length!=0){
                                    //     codeval=await random(6);
                                    //     var userUpdate=`UPDATE users SET coupleCode = '${codeval}' WHERE id=${user}`;
                                    //     const [CodeUpdate] = await this.adapter.db.query(userUpdate);                                                               
                                    // }
                                    // --------
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



                                /** Send Email **/
                                let mailTransporter = nodemailer.createTransport({ 
                                    service: 'gmail', 
                                    host: 'smtp.gmail.com',
                                    port: 465,
                                    secure: false,
                                    auth: { 
                                        user: 'developer.entangled@gmail.com',//'deeptivaidhya.emaster@gmail.com', 
                                        pass: 'Sp@rks2019'//'Deepti79877'
                                    } 
                                }); 
                                 const template = `<html ⚡4email>
                                    <head>
                                    <meta charset="utf-8">
                                    </head>
                                    <body>
                                    <h4>Dear User</h4>
                                    <p>Registered Succesfully.</p>
                                    <h4>Thanks</h4>
                                    <h4>Team Sparks</h4>                                                                       
                                    </body>
                                </html>`;   
                                let mailDetails = { 
                                    from: 'Sparks', 
                                    to: email, //'sensanjay42@gmail.com', 
                                    subject: 'Registered Succesfully ✔', 
                                    text: 'For clients with plaintext support only',
                                    html: template
                                }; 

                                mailTransporter.sendMail(mailDetails, function(err, data) { 
                                    if(err) { 
                                        const successMessage = {
                                            success     : false,
                                            statusCode  : 200,
                                            message     : err
                                        }
                                        return  successMessage; 
                                    } else { 
                                        const successMessage = {
                                            success     : true,
                                            statusCode  : 200,
                                            message     : "Email Sent. Go to your email account and reset password"
                                        }
                                        return  successMessage; 
                                    }
                                });
                                /** End Email **/

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
                        }
                        // --------Developer
                        if(dupUserress != '' && dupUserress[0].firstName==null&& dupUserress[0].lastName==null && dupUserress[0].gender == null && dupUserress[0].dob==null){

                            const userCreate = `UPDATE users SET firstName ='${firstName}',lastName='${lastName}',gender='${gender}',profilePic='${profilePic}',password='${hash}',mobileNo='${mobileNo}',dob='${dob}',stripeCustomerId='${stripeCustomerId}',emailVerificationCode='${emailVerificationCode}',coupleCode='${coupleCode}',resetPasswordCode='${resetPasswordCode}',resetPasswordExpire='${resetPasswordExpire}',referedBy='${referedBy}',privacy='${privacy}',blockedUsers='${blockedUsers}',totalFriends='${totalFriends}',status='${status}'
                            WHERE email='${email}'`                            
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
                                
                                const userPreference = `insert into user_preferences(userId,accountPrivacy,googleId,facebookId,instagramId,twitterId,notificationSettings,exportCalendarType,activityCategories,countryMode,favouriteActivities,cards) values('${dupUserress[0].id}','${accountPrivacy}','${googleId}','${facebookId}','${instagramId}','${twitterId}','${notificationSettings}','${exportCalendarType}','${activityCategories}','${countryMode}','${favouriteActivities}','${cards}')`;
                                const [userPreferenceress] = await this.adapter.db.query(userPreference); 



                                /** Send Email **/
                                // let mailTransporter = nodemailer.createTransport({ 
                                //     service: 'gmail', 
                                //     host: 'smtp.gmail.com',
                                //     port: 465,
                                //     secure: false,
                                //     auth: { 
                                //         user: 'developer.entangled@gmail.com',//'deeptivaidhya.emaster@gmail.com', 
                                //         pass: 'Sp@rks2019'//'Deepti79877'
                                //     } 
                                // }); 
                                // const template = `<html ⚡4email>
                                //     <head>
                                //     <meta charset="utf-8">
                                //     </head>
                                //     <body>
                                //     <h4>Dear User</h4>
                                //     <p>Registered Succesfully.</p>
                                //     <h4>Thanks</h4>
                                //     <h4>Team Sparks</h4>                                                                       
                                //     </body>
                                // </html>`;     
                                // let mailDetails = { 
                                //     from: 'Sparks', 
                                //     to: email, //'sensanjay42@gmail.com', 
                                //     subject: 'Registered Succesfully ✔', 
                                //     text: 'For clients with plaintext support only',
                                //     html: template
                                // }; 

                                // mailTransporter.sendMail(mailDetails, function(err, data) { 
                                //     if(err) { 
                                //         const successMessage = {
                                //             success     : false,
                                //             statusCode  : 200,
                                //             message     : err
                                //         }
                                //         return  successMessage; 
                                //     } else { 
                                //         const successMessage = {
                                //             success     : true,
                                //             statusCode  : 200,
                                //             message     : "Email Sent. Go to your email account and reset password"
                                //         }
                                //         return  successMessage; 
                                //     }
                                // });
                                /** End Email **/
                                var token = jwt.sign({
                                    id: user,
                                    email:email,
                                    status: status,
                                    role: role
                                }, 'secret', { expiresIn: '12h' });
                                const userData = {
                                    "id":dupUserress[0].id,//user ,
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
                        }
                        // --------Developer
                        else {

                            const successMessage = {
                                success     :   false,
                                statusCode  :   200,
                                message     :   'This email is already registered.',
                            }    
                            return successMessage;
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
                    const checkUser = `select * from users where email = '${email}' AND status='1'`;
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
                    const email      = ctx.params.email;
                    const googleId   = ctx.params.googleId;
                    const facebookId = ctx.params.facebookId;
                    // ---------------------Developer                    
                    // const findEmailCheck  = `SELECT * FROM users WHERE email = '${email}'`;
                    // const [findEmailCheckResult] = await this.adapter.db.query(findEmailCheck);

                    // var test=findEmailCheckResult!=''?findEmailCheckResult[0].status:0                                 
                    // if( test==3 || findEmailCheckResult.length != 0 && googleId.length == 0 && facebookId.length ==0){
                                                    
                    //     // if(userDataResult!=''){
                    //     const resetPwdOtp = Math.floor(100000 + Math.random() * 900000); 
                    //     let mailTransporter = nodemailer.createTransport({ 
                    //         service: 'gmail', 
                    //         host: 'smtp.gmail.com',
                    //         port: 465,
                    //         secure: false,
                    //         auth: { 
                    //             user: 'developer.entangled@gmail.com', 
                    //             pass: 'Sp@rks2019'
                    //         } 
                    //     }); 
                    //      const template = `<html ⚡4email>
                    //         <head>
                    //         <meta charset="utf-8">
                    //         </head>
                    //         <body>
                    //         <h4>Dear User</h4>
                    //         <p>Your sparks account verification code is: `+ resetPwdOtp+`</p>                            
                    //         <h4>Thanks</h4>
                    //         <h4>Team Sparks</h4>
                    //         </body>
                    //     </html>`;  
                    //     let mailDetails = { 
                    //         from: 'Sparks', 
                    //         to: email, //'sensanjay42@gmail.com', 
                    //         subject: 'Email verification OTP ✔', 
                    //         text: 'Email send the code',
                    //         html: template
                    //     };  

                    //     mailTransporter.sendMail(mailDetails, function(err, data) { 
                    //         if(err) { 
                    //            console.log('Error Occurs', err); 
                    //             const successMessage = {
                    //                 success     : false,
                    //                 statusCode  : 200,
                    //                 message     : err
                    //             }
                    //             return  successMessage; 
                    //         } else { 
                    //             console.log('Email sent successfully'); 
                    //             const successMessage = {
                    //                 success     : true,
                    //                 statusCode  : 420,
                    //                 message     : "Email Sent. Go to your email account",
                    //                 email       : email,                                   
                    //             }
                    //             return  successMessage;                                  
                    //         }
                    //     }); 
                        
                    //     const successMessage = {
                    //         success     : true,
                    //         statusCode  : 420,
                    //         message     : "Email Sent. Go to your email account",
                    //         email       : email
                    //     }
                    //     if(test==3){            
                    //         const userDataUpdate = `UPDATE users SET  resetPasswordCode= '${resetPwdOtp}',status='3' WHERE email='${email}'`;
                    //         const [userDataUpdateResult] = await this.adapter.db.query(userDataUpdate)
                    //     }else{
                    //         const userData = `insert into users(email,resetPasswordCode,status) values('${email}','${resetPwdOtp}','3')`;
                    //         const [userDataResult] = await this.adapter.db.query(userData)
                    //     }
                         
                    //     return successMessage; 
                    // }
                    // else{
                    // ---------------------Developer
                        if(googleId != ''){
                            const findEmail  = `SELECT * FROM users as u JOIN user_preferences as up ON u.id = up.userId WHERE up.googleId = '${googleId}'`;
                            const [findEmailress] = await this.adapter.db.query(findEmail);
                            if(findEmailress != ''){
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
                                return successMessage;
                            }else {
                                successMessage = {
                                    success:false,
                                    statusCode:500,
                                    message:"User doesn't exist"
                                }
                                return successMessage;
                            }
                        }else if(facebookId != ''){
                            const findEmail  = `SELECT * FROM users as u JOIN user_preferences as up ON u.id = up.userId WHERE up.facebookId = '${facebookId}'`;
                            const [findEmailress] = await this.adapter.db.query(findEmail);
                            if(findEmailress != ''){
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
                                return successMessage;
                            }else {
                                successMessage = {
                                    success:false,
                                    statusCode:500,
                                    message:"User doesn't exist"
                                }
                                return successMessage;
                            }
                        }else{
                            
                            const findEmail  = `SELECT * FROM users WHERE email = '${email}'`;
                            const [findEmailress] = await this.adapter.db.query(findEmail);
                            if(findEmailress != ''){
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
                                    datas:"user allready exits",
                                    data:userData
                                }
                                return successMessage;
                            }else {
                                successMessage = {
                                    success:false,
                                    statusCode:500,
                                    message:"User doesn't exist"
                                }
                                return successMessage;
                            }   
                        }
                    // }
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
                        const resetPwdOtp = Math.floor(100000 + Math.random() * 900000);
                        const firstName = findEmailress[0].firstName;
                        var today = new Date();
                        var dd = String(today.getDate()).padStart(2, '0');
                        var mm = String(today.getMonth() + 1).padStart(2, '0');
                        var yyyy = today.getFullYear();
                        today = yyyy + '-' + mm + '-' + dd;
                    
                        const updateUserToken = `UPDATE users SET resetPasswordCode = '${resetPwdOtp}', resetPasswordExpire = '${today}' WHERE email = '${findEmailress[0].email}'`;
                        
                        const [Emailresult] = await this.adapter.db.query(updateUserToken);
                        if(Emailresult){
                        
                            let mailTransporter = nodemailer.createTransport({ 
                                service: 'gmail', 
                                host: 'smtp.gmail.com',
                                port: 465,
                                secure: false,
                                auth: { 
                                    user: 'developer.entangled@gmail.com',//'deeptivaidhya.emaster@gmail.com', 
                                    pass: 'Sp@rks2019'//'Deepti79877'
                                } 
                            }); 

                            const template = `<html ⚡4email>
                                <head>
                                <meta charset="utf-8">
                                </head>
                                <body>
                                <h4>Dear User</h4>
                                <p>Please enter this code to reset your password:` +resetPwdOtp+`</p>
                                <h4>Thanks</h4>
                                <h4>Team Sparks</h4>
                                </body>
                            </html>`;     
                            let mailDetails = { 
                                from: 'Sparks', 
                                to: email, //'sensanjay42@gmail.com', 
                                subject: 'Sparks Forget Password OTP ✔', 
                                text: 'For clients with plaintext support only',
                                html: template
                            }; 
                              
                            mailTransporter.sendMail(mailDetails, function(err, data) { 
                                if(err) { 
                                   console.log('Error Occurs', err); 
                                    const successMessage = {
                                        success     : false,
                                        statusCode  : 200,
                                        message     : err
                                    }
                                    return  successMessage; 
                                } else { 
                                    console.log('Email sent successfully'); 
                                    const successMessage = {
                                        success     : true,
                                        statusCode  : 200,
                                        message     : "Email Sent. Go to your email account and reset password"
                                    }
                                    return  successMessage;
                                }
                            });  
                            const successMessage = {
                                success     : true,
                                statusCode  : 200,
                                message     : "Email Sent. Go to your email account and reset password"
                            }
                            return successMessage;

                        }else{
                            const successMessage = {
                                success:false,
                                statusCode:200,
                                message   : "Something Went Wrong"
                            }
                            return  successMessage;
                        }
                    }
                }catch(error){
                    return error
                }
			}
        },

        otpVerification: {
            rest: {
				method: "POST",
				path: "/otpVerification"
            },              
            async handler(ctx,res,req) {
                try{
                    const otp = ctx.params.otp;
                    const findOtp = `select * from users where resetPasswordCode = '${otp}'`;
                    const [findOtpress] = await this.adapter.db.query(findOtp);
                    if(findOtpress == ''){
                        return message.message.OTPNOTFOUND;
                    }else {
                        const successMessage = {
                            success     : true,
                            statusCode  : 200,
                            message     : "OTP matched. Create new password",
                            user_id     : findOtpress[0].id 
                        }
                        return  successMessage; 
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
                    const user_id = ctx.params.user_id;
                    const new_password = ctx.params.new_password;
                    const findUsers = `select * from users where id = '${user_id}'`;
                    const [findUserres] = await this.adapter.db.query(findUsers);
                    if(findUserres != ''){
                        const hash = await bcrypt.hash(new_password,10);
                        const setPassword = `update users set password = '${hash}', resetPasswordCode = '${0}'  where id = '${findUserres[0].id}'`;
                        const [setPassress] = await this.adapter.db.query(setPassword);
                        if(setPassress.affectedRows >= 1){
                            return message.message.RESETPASSWORD;
                        }else{
                            return message.message.RESETPASSWORDNOT;
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

        emailVerification: {
            rest: {
				method: "POST",
				path: "/emailVerification"
            },
            async handler(ctx,res,req) {
                try{
                    const email   = ctx.params.email;
                        const Sql = `SELECT * FROM users WHERE email = '${email}'`;
                        const [SqlResult] = await this.adapter.db.query(Sql);
                        if(SqlResult){
                            if (SqlResult[0].status == '1') {
                                const successMessage = {
                                    success : true,
                                    message : 'you are already verified'
                                }
                                return successMessage;    
                            }else{
                                const updateSql = `UPDATE users SET status = '${1}' WHERE email = '${email}'`;
                                const [updateSqlResult] = await this.adapter.db.query(updateSql);
                                if(updateSqlResult.affectedRows > 0){
                                    const successMessage = {
                                        success : true,
                                        message : 'You are verified successfully',
                                    }
                                    return successMessage;
                                }else{
                                    const successMessage = {
                                        success : false,
                                        message : 'Something went wrong'
                                    }
                                    return successMessage;
                                }
                            }
                            
                        }else{
                            const successMessage = {
                                success : false,
                                message : 'Email not found'
                            }    
                            return successMessage;
                        }
                }catch(error){
                    return error
                }
			}
        }, 

        GetUserContactList: {
            rest: {
				method: "POST",
				path: "/GetUserContactList"
            },              
            async handler(ctx,res,req) {
                try{
                    var userId=ctx.params.userId
                    const contact = ctx.params.contactList;                    
                    var Arr=[];
                    var obj={};
                    var value;                     
                    const uniqueAddresses = Array.from(new Set(contact.map(a => a.number)))
                    .map(number => {
                        return contact.find(a => a.number === number)
                    })
                    for(var contactArr of uniqueAddresses){
                        const findContact = `select id,firstName,lastName,profilePic from users where mobileNo = '${contactArr.number}' AND status='1' order by firstName asc`;
                        const [findContactResult] = await this.adapter.db.query(findContact);
                        if(findContactResult!=''){
                            console.log(findContactResult[0].id)
                            if(findContactResult[0].id!=userId){
                                const findFirend = `select * from friends where  userId= '${userId}' AND friendId='${findContactResult[0].id}' AND status='1'`;
                                const [findFirendResult] = await this.adapter.db.query(findFirend);                                                                                             
                                if(findFirendResult==''){
                                                                                                  
                                // if(Arr.indexOf(findContactResult) === -1) {                                    
                                    obj={
                                        "id": findContactResult[0].id,
                                        "firstName":findContactResult[0].firstName+" "+findContactResult[0].lastName,                                    
                                        "profilePic":findContactResult[0].profilePic,
                                        "isfirend":0,
                                        "mutualFirend":10
                                    }   
                                    Arr.push(obj)                                                        
                                }                                                                        
                            }                            
                        }                                            
                    }
                   var  response={
                           
                        "data":Arr        
                    }                                                       
                    return response;                              
                }catch(error){
                    return error
                }
			}
        },          
    }    
}