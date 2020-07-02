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
var GeoPoint = require('geopoint');

module.exports = {
    name: 'useractivity',
    mixins: [DbService],

    adapter : new SqlAdapter(process.mysql.database, process.mysql.user, process.mysql.password, {
        host: process.mysql.host,
        dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
        
    }),
    
    model: {
        name: "activities",
        define: {
            title: {type:Sequelize.STRING},
            description: {type:Sequelize.STRING},
            images: {type:Sequelize.STRING},
			activityType: {type:Sequelize.STRING},
			letterCollected: {type:Sequelize.STRING},
			isBestSeller: {type:Sequelize.INTEGER},
			bestSellerDuration: {type:Sequelize.STRING},
			bestSellerStartDate: {type:Sequelize.STRING},
			bestSellerEndDate: {type:Sequelize.STRING},
			suggestionHeader: {type:Sequelize.STRING},
            status: {type:Sequelize.INTEGER},
            createdAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')},
            updatedAt : {type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')},
            location      : {type:Sequelize.STRING},
            avg_rating    : {type:Sequelize.STRING},
            booking_count : {type:Sequelize.STRING},
            originalPrice       :  {type:Sequelize.STRING},
            discountedPercentage: {type:Sequelize.STRING},
            discountedPrice     : {type:Sequelize.STRING},
            discountAmount      : {type:Sequelize.STRING},
            review_count        : {type:Sequelize.STRING}
        },
        options: {}
    },

    actions: {

        activityCategoryList: {
            rest: {
				method: "GET",
				path: "/activityCategoryList"
            },
            async handler(ctx) {
                try{
                        const List = [];
                        const sql = `select * from activity_categories WHERE status='1'`                        
                        const [searcActivityress] = await this.adapter.db.query(sql);                        
                        for(var val of searcActivityress){
                            var sqls = `select COUNT(*) as length from activity_category_relations WHERE activityCategoryId='${val.id}'`                        
                            var [data] = await this.adapter.db.query(sqls);
                          var datas={  
                              "id": val.id,
                            "name": val.name,
                            "images":val.images,
                            "status": val.status,
                            "createdBy":val.createdBy,
                            "updatedBy": val.updatedBy,
                            "createdAt": val.createdAt,
                            "updatedAt":val.updateAt,
                            "length":data[0].length 
                            }
                            List.push(datas)
                        }
                        // for(let key of searcActivityress){
                        //     // return key
                        //     const list = {
                        //         id:key.id,
                        //         name:key.name,
                        //         images:JSON.parse(key.images)
                        //     }
                        //     List.push(list);
                        // }
                        const successMessage = {
                            success:true,
                            status: 200,
                            data: List,//searcActivityress,
                            message:'Success'
                        }
                        return successMessage
                        if(searcActivityress == ''){
                            return successMessage;
                        }else{
                            return successMessage;
                        }
                }catch(error){
                    return error
                }
			}
        }, 
        
        UserActivityList: {
            rest: {
				method: "POST",
				path: "/UserActivityList"
            },
            async handler(ctx,res,req) {
                try{
                     const userId = ctx.params.user_id; 
                     const filter    = ctx.params.filter; 
                    const nearBy    = ctx.params.nearBy;
                    const isType    = ctx.params.isType;                   
                    var acArray = [];
                    var acArray1 = [];                     
                    if(isType != ''){
                        if(isType == 'favourite'){                              
                            const findUser= `SELECT * FROM user_Activities_Favourite WHERE userId = '${userId}' GROUP BY activity_id `;                            
                            const [UserResult] = await this.adapter.db.query(findUser);                            
                            if(UserResult.length != 0){     
                                for(var  UR of  UserResult){
                                    // const merchantData = `SELECT COUNT(M.id)as count FROM merchant_activities_suggetions as MAS JOIN merchants as M ON MAS.merchantId=M.id WHERE activityId='${UR.activity_id}' AND M.status=1
                                    // `;
                                    // const [merchantDataResult] = await this.adapter.db.query(merchantData);                                
                                    // if(merchantDataResult[0].count!=0){   
                                const ACData = `SELECT * FROM activities WHERE id = '${UR.activity_id}' AND status='1' `;    
                                const [ACResult] = await this.adapter.db.query(ACData);                                      
                                    if(ACResult != ''){                                                                                        
                                            for(let dat of ACResult){

                                            // --------Developer funnel--------                                    
                                                if(dat.activityType == 'free'){
                                                    var originalPrice       = '';
                                                    var discountedPrice       = '';
                                                    var discountedPrice   = '';   
                                                    var discountAmount    = '';    
                                                }else{                                        
                                                    const paidActivity = `SELECT MIN(rd.originalPrice) as originalPrice, MIN(rd.discountedPrice) as discountedPrice, MIN(rd.discountedPercentage) as discountedPercentage, MIN(rd.discountAmount) as discountAmount FROM regular_deals_relations as rdr JOIN regular_deals as rd ON rdr.regularDealId = rd.id WHERE rdr.activityId = '${dat.id}' AND rd.status = '${1}'`;    
                                                
                                                    const [paidResult] = await this.adapter.db.query(paidActivity) 
                                                    
                                                    var originalPrice       = paidResult[0].originalPrice;
                                                    if (originalPrice == '' || originalPrice == null) {
                                                        originalPrice = '0';                               
                                                    }

                                                    var discountedPrice       = paidResult[0].discountedPrice;
                                                    if (discountedPrice == '' || discountedPrice == null) {
                                                        discountedPrice = '0';                               
                                                    }
                                                    var discountedPercentage   = paidResult[0].discountedPercentage;
                                                    if (discountedPercentage == '' || discountedPercentage == null) {
                                                        discountedPercentage = '0';                               
                                                    }

                                                    var discountAmount       = paidResult[0].discountAmount;
                                                    if (discountAmount == '' || discountAmount == null) {
                                                        discountAmount = '0';                               
                                                    }
                                                }                                   
                                            // --------Developer funnel--------                                             
                                                const ACData = `SELECT * FROM activity_category_relations as acr JOIN activity_categories as ac ON acr.activityCategoryId = ac.id WHERE acr.activityId = '${dat.id}' AND status='1'`;
                                            const [AcResultwo] = await this.adapter.db.query(ACData);                                          
                                            const data = {
                                                "activity_category":AcResultwo,
                                                "id":  dat.id ,
                                                "title": dat.title!=''?dat.title:'blank' ,
                                                "description":dat.description!=''?dat.description:'blank',
                                                "images":dat.images,
                                                "activityType":dat.activityType ,
                                                "letterCollected": dat.letterCollected,
                                                "isBestSeller": dat.isBestSeller,
                                                "bestSellerDuration":dat.bestSellerDuration ,
                                                "bestSellerStartDate":dat.bestSellerStartDate,
                                                "bestSellerEndDate": dat.bestSellerEndDate,
                                                "suggestionHeader": dat.suggestionHeader,
                                                "status": dat.status,
                                                "createdAt": dat.createdAt,
                                                "updatedAt": dat.updatedAt,
                                                // "minPrice":dat.minPrice,
                                                "location":dat.location,
                                                "avg_rating": dat.avg_rating,
                                                "booking_count":dat.booking_count,
                                                // originalPrice       :  Math.round(originalPrice),
                                                // discountedPercentage:  Math.round(discountedPercentage),
                                                // discountedPrice     :  Math.round(discountedPrice),
                                                // discountAmount      :  Math.round(discountAmount),
                                                "originalPrice"       :  Math.round(dat.originalPrice),
                                                "discountedPercentage":  Math.round(dat.discountedPercentage),
                                                "discountedPrice"     :  Math.round(dat.discountedPrice),
                                                "discountAmount"      :  Math.round(dat.discountAmount), 
                                                "review_count"        :  dat.review_count,
                                                "currency"            :  "SGD",
                                                "currencySymbol"      :  "$"
                                                }
                                                acArray.push(data)
                                            }                                                    
                                        }
                                    // }
                                }
                            }                            
                        }
                        if(isType == 'filter'){ 
                            var whereArr = [];
                            if(filter.min_price !='' && filter.max_price !=''){
                                var val='discountedPrice >= '+filter.min_price+' AND discountedPrice <='+filter.max_price;                              
                                whereArr.push(val);
                            }
                            if(filter.location !=''){
                                var val='location IN ('+filter.location+')';                              
                                whereArr.push(val);
                            }
                            if(filter.rating !=''){
                                var val='avg_rating >= '+filter.rating;
                                whereArr.push(val);
                            }

                            var str =whereArr.join(' AND ');  
                            console.log(str) 
                            
                            if(filter.category==''){                                   
                            const ACData = `SELECT * FROM activities WHERE ${str} AND status='1'`;                                
                            const [ACResult] = await this.adapter.db.query(ACData); 
                                if(ACResult != ''){                                              
                                    for(let dat of ACResult){
                                    //     const merchantData = `SELECT COUNT(M.id)as count FROM merchant_activities_suggetions as MAS JOIN merchants as M ON MAS.merchantId=M.id WHERE activityId='${dat.id}' AND M.status=1
                                    // `;
                                    // const [merchantDataResult] = await this.adapter.db.query(merchantData);                                
                                    // if(merchantDataResult[0].count!=0){
                                    // --------Developer funnel--------                                        
                                        if(dat.activityType == 'free'){
                                            var originalPrice       = '';
                                            var discountedPrice       = '';
                                            var discountedPrice   = '';   
                                            var discountAmount    = '';    
                                        }else{                                        
                                            const paidActivity = `SELECT MIN(rd.originalPrice) as originalPrice, MIN(rd.discountedPrice) as discountedPrice, MIN(rd.discountedPercentage) as discountedPercentage, MIN(rd.discountAmount) as discountAmount FROM regular_deals_relations as rdr JOIN regular_deals as rd ON rdr.regularDealId = rd.id WHERE rdr.activityId = '${dat.id}' AND rd.status = '${1}'`;    
                                        
                                            const [paidResult] = await this.adapter.db.query(paidActivity) 
                                            
                                            var originalPrice       = paidResult[0].originalPrice;
                                            if (originalPrice == '' || originalPrice == null) {
                                                originalPrice = '0';                               
                                            }

                                            var discountedPrice       = paidResult[0].discountedPrice;
                                            if (discountedPrice == '' || discountedPrice == null) {
                                                discountedPrice = '0';                               
                                            }
                                            var discountedPercentage   = paidResult[0].discountedPercentage;
                                            if (discountedPercentage == '' || discountedPercentage == null) {
                                                discountedPercentage = '0';                               
                                            }

                                            var discountAmount       = paidResult[0].discountAmount;
                                            if (discountAmount == '' || discountAmount == null) {
                                                discountAmount = '0';                               
                                            }
                                        }                                   
                                    // --------Developer funnel--------
                                        const ACData = `SELECT * FROM activity_category_relations as acr JOIN activity_categories as ac ON acr.activityCategoryId = ac.id WHERE acr.activityId = '${dat.id}' AND status='1'`;
                                        const [AcResultwo] = await this.adapter.db.query(ACData);
                                        //var len=AcResultwo.length;
                                        //AcResultwo.push({Length:len});
                                        const data = {  
                                        "activity_category":AcResultwo,                                      
                                        "id":  dat.id ,
                                        "title": dat.title!=''?dat.title:'blank' ,// "title": dat.title,
                                        "description":dat.description!=''?dat.description:'blank',// "description":dat.description,                                        
                                        "images":dat.images,
                                        "activityType":dat.activityType ,
                                        "letterCollected": dat.letterCollected,
                                        "isBestSeller": dat.isBestSeller,
                                        "bestSellerDuration":dat.bestSellerDuration ,
                                        "bestSellerStartDate":dat.bestSellerStartDate,
                                        "bestSellerEndDate": dat.bestSellerEndDate,
                                        "suggestionHeader": dat.suggestionHeader,
                                        "status": dat.status,
                                        "createdAt": dat.createdAt,
                                        "updatedAt": dat.updatedAt,                                        
                                        "location":dat.location,
                                        "avg_rating": dat.avg_rating,
                                        "booking_count":dat.booking_count,
                                        // "originalPrice"       :  Math.round(originalPrice),
                                        // "discountedPercentage":  Math.round(discountedPercentage),
                                        // "discountedPrice"     :  Math.round(discountedPrice),
                                        // "discountAmount"      :  Math.round(discountAmount),
                                        "originalPrice"       :  Math.round(dat.originalPrice),
                                        "discountedPercentage":  Math.round(dat.discountedPercentage),
                                        "discountedPrice"     :  Math.round(dat.discountedPrice),
                                        "discountAmount"      :  Math.round(dat.discountAmount), 
                                        "review_count"        :  dat.review_count,
                                        "currency"            :  "SGD",
                                        "currencySymbol"      :  "$" 
                                        }
                                        acArray.push(data)
                                    // }
                                    }                                                    
                                } 
                            }else{

                                console.log(str);
                                
                                if(filter.category !='' ){                                                                   
                                    const ACDatathree = `SELECT * FROM activity_category_relations  WHERE activityCategoryId IN (${filter.category}) `;    
                                    console.log(ACDatathree);
                                    const [AC] = await this.adapter.db.query(ACDatathree);                                    
                                    for( let data1 of AC){
                                        // const merchantData = `SELECT COUNT(M.id)as count FROM merchant_activities_suggetions as MAS JOIN merchants as M ON MAS.merchantId=M.id WHERE activityId='${data1.activityId}' AND M.status=1
                                        // `;
                                        // const [merchantDataResult] = await this.adapter.db.query(merchantData);                                
                                        // if(merchantDataResult[0].count!=0){
                                        const ACData = `SELECT * FROM activities WHERE id='${data1.activityId}' AND  ${str} AND status='1'`; 
                                        console.log(ACData)   
                                        const [ACResult] = await this.adapter.db.query(ACData); 
                                        if(ACResult != ''){                                              
                                            for(let dat of ACResult){                                         
                                                const ACData = `SELECT * FROM activity_category_relations as acr JOIN activity_categories as ac ON acr.activityCategoryId = ac.id WHERE acr.activityId = '${dat.id}' AND status='1'`;
                                                const [AcResultwo] = await this.adapter.db.query(ACData);                                        
                                               // var len=AcResultwo.length;
                                               // AcResultwo.push({Length:len});
                                                // --------Developer funnel--------                                                
                                                    if(dat.activityType == 'free'){
                                                        var originalPrice       = '';
                                                        var discountedPrice       = '';
                                                        var discountedPrice   = '';   
                                                        var discountAmount    = '';    
                                                    }else{                                        
                                                        const paidActivity = `SELECT MIN(rd.originalPrice) as originalPrice, MIN(rd.discountedPrice) as discountedPrice, MIN(rd.discountedPercentage) as discountedPercentage, MIN(rd.discountAmount) as discountAmount FROM regular_deals_relations as rdr JOIN regular_deals as rd ON rdr.regularDealId = rd.id WHERE rdr.activityId = '${dat.id}' AND rd.status = '${1}'`;    
                                                    
                                                        const [paidResult] = await this.adapter.db.query(paidActivity) 
                                                        
                                                        var originalPrice       = paidResult[0].originalPrice;
                                                        if (originalPrice == '' || originalPrice == null) {
                                                            originalPrice = '0';                               
                                                        }

                                                        var discountedPrice       = paidResult[0].discountedPrice;
                                                        if (discountedPrice == '' || discountedPrice == null) {
                                                            discountedPrice = '0';                               
                                                        }
                                                        var discountedPercentage   = paidResult[0].discountedPercentage;
                                                        if (discountedPercentage == '' || discountedPercentage == null) {
                                                            discountedPercentage = '0';                               
                                                        }

                                                        var discountAmount       = paidResult[0].discountAmount;
                                                        if (discountAmount == '' || discountAmount == null) {
                                                            discountAmount = '0';                               
                                                        }
                                                    }                                   
                                                // --------Developer funnel--------
                                                const data = {                                      
                                                "activity_category":AcResultwo,
                                                "id":  dat.id ,
                                                "title": dat.title!=''?dat.title:'blank' ,// "title": dat.title,
                                                "description":dat.description!=''?dat.description:'blank',// "description":dat.description,
                                                "images":dat.images,
                                                "activityType":dat.activityType ,
                                                "letterCollected": dat.letterCollected,
                                                "isBestSeller": dat.isBestSeller,
                                                "bestSellerDuration":dat.bestSellerDuration ,
                                                "bestSellerStartDate":dat.bestSellerStartDate,
                                                "bestSellerEndDate": dat.bestSellerEndDate,
                                                "suggestionHeader": dat.suggestionHeader,
                                                "status": dat.status,
                                                "createdAt": dat.createdAt,
                                                "updatedAt": dat.updatedAt,
                                                // "minPrice":dat.minPrice,
                                                "location":dat.location,
                                                "avg_rating": dat.avg_rating,
                                                "booking_count":dat.booking_count,
                                                // "originalPrice"       :  Math.round(originalPrice),
                                                // "discountedPercentage":  Math.round(discountedPercentage),
                                                // "discountedPrice"     :  Math.round(discountedPrice),
                                                // "discountAmount"      :  Math.round(discountAmount),
                                                "originalPrice"       :  Math.round(dat.originalPrice),
                                                "discountedPercentage":  Math.round(dat.discountedPercentage),
                                                "discountedPrice"     :  Math.round(dat.discountedPrice),
                                                "discountAmount"      :  Math.round(dat.discountAmount), 
                                                "review_count"        :  dat.review_count,
                                                "currency"            :  "SGD",
                                                "currencySymbol"      :  "$"
                                            }
                                                acArray.push(data)
                                            }                                                    
                                        }
                                    // }
                                    }                                                                        
                                }
                            }                     
                        } 
                        if(isType == 'nearby'){
                            
                            if(nearBy.latitude != '' && nearBy.longitude != ''){                                                             
                                // ------------------Developer------------
                                const lat    = ctx.params.nearBy.latitude;
                                const lang   = ctx.params.nearBy.longitude;
                                const userId = ctx.params.userId;
                                // console.log(lat,lang);
                                var dis;
                                var marchecntArr=[];
                                var outlet=`SELECT * FROM outlets WHERE status='1'`;
                                const [OutletDataBase] = await this.adapter.db.query(outlet);                                           
                                if(OutletDataBase!=''){
                                    for(var OutletArr of OutletDataBase){                                                      
                                        mk1lat1=lat;
                                        mk1lng1=lang;
                                        mk2lat2=OutletArr.mrtLatitude;
                                        mk2lng2=OutletArr.mrtLongitude;
            
                                        var R = 3958.8; // Radius of the Earth in miles
                                        var rlat1 = mk1lat1 * (Math.PI/180); // Convert degrees to radians
                                        var rlat2 = mk2lat2 * (Math.PI/180); // Convert degrees to radians
                                        var difflat = rlat2-rlat1; // Radian difference (latitudes)
                                        var difflon = (mk2lng2-mk1lng1) * (Math.PI/180); // Radian difference (longitudes)
                                        dis = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
                                    
                                        if(parseInt(dis)<=7){                            
                                       var Activity= `SELECT A.* FROM  activities as A JOIN regular_deals_relations as RDR ON RDR.activityId= A.Id WHERE RDR.outletId='${OutletArr.id}' AND status = '1' GROUP BY A.id`; 
                                        // var Activity=`SELECT A.* FROM activities as A where A.id IN(SELECT MAS.activityId FROM merchant_activities_suggetions as MAS WHERE MAS.merchantActivityId IN (SELECT merchantActivityId FROM regular_deals_relations as RDR where RDR.outletId='${}') AND MAS.activityId IN(SELECT activityId FROM regular_deals_relations as RDR where RDR.outletId='${}'))`
                                        const [Merchantarr] = await this.adapter.db.query(Activity); 
                                                                                                                    
                                            for(var dat of Merchantarr){   
                                                // --
                                                // const merchantData = `SELECT COUNT(M.id)as count FROM merchant_activities_suggetions as MAS JOIN merchants as M ON MAS.merchantId=M.id WHERE activityId='${dat.id}' AND M.status=1
                                                // `;
                                                // const [merchantDataResult] = await this.adapter.db.query(merchantData);                                
                                                // if(merchantDataResult[0].count!=0){
                                                // --                                             
                                                const ACData = `SELECT * FROM activity_category_relations as acr JOIN activity_categories as ac ON acr.activityCategoryId = ac.id WHERE acr.activityId = '${dat.id}' AND ac.status = '1'`;
                                                const [AcResultwo] = await this.adapter.db.query(ACData);
                                                //var len=AcResultwo.length;
                                                //AcResultwo.push({Length:len});
                                                var data={
                                                    "activity_category":AcResultwo,
                                                    "id": dat.id,
                                                    "title": dat.title!=''?dat.title:'blank' ,// "title": dat.title,
                                                    "description":dat.description!=''?dat.description:'blank',// "description":dat.description,                                                    
                                                    "images": dat.images,
                                                    "activityType": dat.activityType,
                                                    "letterCollected":dat.letterCollected,
                                                    "isBestSeller":dat.isBestSeller,
                                                    "bestSellerDuration": dat.bestSellerDuration,
                                                    "bestSellerStartDate": dat.bestSellerStartDate,
                                                    "bestSellerEndDate": dat.bestSellerEndDate,
                                                    "suggestionHeader": dat.suggestionHeader,
                                                    "status": dat.status,
                                                    "createdAt": dat.createdAt,
                                                    "updatedAt": dat.updatedAt,
                                                    "location": dat.location,
                                                    "avg_rating":dat.avg_rating,
                                                    "booking_count": dat.booking_count,
                                                    "originalPrice": Math.round(dat.originalPrice),
                                                    "discountedPercentage":Math.round(dat.discountedPercentage),
                                                    "discountedPrice":Math.round(dat.discountedPrice),
                                                    "discountAmount": Math.round(dat.discountAmount),
                                                    "review_count": dat.review_count,
                                                    "currency"            : "SGD",
                                                    "currencySymbol"      : "$"
                                                }
                                            marchecntArr.push(data) 
                                            // }
                                        }
                                           
                                        }                            
                                    } 
                                    var valuecheck=await marchecntArr.filter((item,index)=>{return marchecntArr.indexOf(item)==index });                      
                                    if(valuecheck!=''){
                                        const successMessage = {
                                            success : true ,
                                            message : 'nearby  Activity list',
                                            data:valuecheck
                                        }
                                            return successMessage;
                                    }else{
                                        const successMessage = {
                                            success : false ,
                                            message : 'nearby  Activity list data not found',
                                            data:valuecheck
                                        }
                                            return successMessage;
                                    }
                                    // const successMessage = {
                                    //     success : true ,
                                    //     message : 'nearby  Activity list',
                                    //     data:valuecheck
                                    // }
                                    //     return successMessage;              
                                }else{
                                    const successMessage = {
                                        success : false,
                                        message : 'data Not found',
                                        data:   []
                                    }
                                        return successMessage;
                                }   
                                // ------------------Developer------------   
                                }else{                                        
                                    
                                    const response = {
                                        success : false,
                                        message : 'Enter location first',
                                        // data    : activityArray
                                    }
                                    return response;
                                }
                        }   
                    }else{  
                        const ACData = `SELECT * FROM activities WHERE status = '1'`;                            
                        const [ACResult] = await this.adapter.db.query(ACData);                        
                        if(ACResult != ''){ 
                            for(let dat of ACResult){ 
                                // const merchantData = `SELECT COUNT(M.id)as count FROM merchant_activities_suggetions as MAS JOIN merchants as M ON MAS.merchantId=M.id WHERE activityId='${dat.id}' AND M.status=1
                                // `;
                                // const [merchantDataResult] = await this.adapter.db.query(merchantData);                                
                                // if(merchantDataResult[0].count!=0){

                                const ACData1 = `SELECT * FROM activity_category_relations as acr JOIN activity_categories as ac ON acr.activityCategoryId = ac.id WHERE acr.activityId = '${dat.id}' AND ac.status='1'`;
                                const [AcResultwo] = await this.adapter.db.query(ACData1);                                        
                                // --Developer               funnel--------                                            
                                    if(dat.activityType == 'free'){
                                        var originalPrice       = '';
                                        var discountedPrice       = '';
                                        var discountedPrice   = '';   
                                        var discountAmount    = '';    
                                    }else{                                        
                                        const paidActivity = `SELECT MIN(rd.originalPrice) as originalPrice, MIN(rd.discountedPrice) as discountedPrice, MIN(rd.discountedPercentage) as discountedPercentage, MIN(rd.discountAmount) as discountAmount FROM regular_deals_relations as rdr JOIN regular_deals as rd ON rdr.regularDealId = rd.id WHERE rdr.activityId = '${dat.id}' AND rd.status = '${1}'`;    
                                    
                                        const [paidResult] = await this.adapter.db.query(paidActivity) 
                                        var originalPrice       = paidResult[0].originalPrice;
                                        if (originalPrice == '' || originalPrice == null) {
                                            originalPrice = '0';                               
                                        }
    
                                        var discountedPrice       = paidResult[0].discountedPrice;
                                        if (discountedPrice == '' || discountedPrice == null) {
                                            discountedPrice = '0';                               
                                        }
                                        var discountedPercentage   = paidResult[0].discountedPercentage;
                                        if (discountedPercentage == '' || discountedPercentage == null) {
                                            discountedPercentage = '0';                               
                                        }
    
                                        var discountAmount       = paidResult[0].discountAmount;
                                        if (discountAmount == '' || discountAmount == null) {
                                            discountAmount = '0';                               
                                        }
                                    } 
                                    // --------Developer funnel--------
                                    const data = {                                      
                                    "activity_category":AcResultwo,
                                    "id":  dat.id ,
                                    "title": dat.title!=''?dat.title:'blank' ,// "title": dat.title,
                                    "description":dat.description!=''?dat.description:'blank',// "description":dat.description,                                        
                                    "images":dat.images,
                                    "activityType":dat.activityType ,
                                    "letterCollected": dat.letterCollected,
                                    "isBestSeller": dat.isBestSeller,
                                    "bestSellerDuration":dat.bestSellerDuration ,
                                    "bestSellerStartDate":dat.bestSellerStartDate,
                                    "bestSellerEndDate": dat.bestSellerEndDate,
                                    "suggestionHeader": dat.suggestionHeader,
                                    "status": dat.status,
                                    "createdAt": dat.createdAt,
                                    "updatedAt": dat.updatedAt,                                  
                                    "location":dat.location,
                                    "avg_rating": dat.avg_rating,
                                    "booking_count":dat.booking_count,
                                    // "originalPrice"       :  Math.round(originalPrice),
                                    // "discountedPercentage":  Math.round(discountedPercentage),
                                    // "discountedPrice"     :  Math.round(discountedPrice),
                                    // "discountAmount"      :  Math.round(discountAmount),  
                                    "originalPrice"         :   Math.round(dat.originalPrice),
                                    "discountedPercentage"  :   Math.round(dat.discountedPercentage),
                                    "discountedPrice"       :   Math.round(dat.discountedPrice),
                                    "discountAmount"        :   Math.round(dat.discountAmount),                                       
                                    "review_count"          :   dat.review_count,
                                    "currency"              :  "SGD",
                                    "currencySymbol"        :  "$" //,
                                    // "count":merchantDataResult[0].count
                                    }
                                    acArray.push(data)
                                // }    
                            }                                             
                            // return ACResult                               
                            }       
                        }
                    // }  
                             
                    var DataArr=acArray!=''?true:false                    
                    const response = {
                        success : DataArr,
                        message : 'Filter Activity list',
                        data    : acArray
                    }
                    return response;                                        
                    // }
                
                }catch(error){
                    return error
                }
			}
        }, 
       
        merchantActivity: {
            rest: {
				method: "POST",
				path: "/merchantActivity"
            },
            async handler(ctx,res,req) {
                try{
                    const userId   = ctx.params.user_id; 
                    const activityId   = ctx.params.activityId; 
                    const filter    = ctx.params.filter; 
                    const nearBy    = ctx.params.nearBy;
                    const isType    = ctx.params.isType;                   
                    var acArray = [];
                    var acArray1 = [];                     
                    if(isType != ''){
                                                                    
                        if(isType == 'favourite'){                              
                            const findUser= `SELECT * FROM  user_Activities_Favourite WHERE userId = '${userId}' AND activity_id=${activityId}`;
                            const [UserResult] = await this.adapter.db.query(findUser);                            
                            if(UserResult.length != 0){     
                                for(var i = 0; i < UserResult.length; i++){
                   
                                const ACData = `SELECT * FROM merchant_activities WHERE id = '${UserResult[i].merchant_activities_id}' AND status='1'`;    
                                const [ACResult] = await this.adapter.db.query(ACData);                                     
                                if(ACResult != ''){                                                                                                                                
                                for(let dat of ACResult){

                                    // const MerchantActivitiesCount=`SELECT COUNT(MA.id) as count FROM merchant_activities as MA JOIN merchants as M ON M.id=MA.merchantId WHERE MA.activityId='${activityId}' AND MA.status=1`
                                    // const [MerchantActivitiesCountResult] = await this.adapter.db.query(MerchantActivitiesCount);
                                    // if(MerchantActivitiesCountResult[0].count!=0){

                                    const ACData = `SELECT * FROM activity_category_relations as acr JOIN activity_categories as ac ON acr.activityCategoryId = ac.id WHERE acr.activityId = '${dat.id}' AND ac.status='1'`;
                                    const [AcResultwo] = await this.adapter.db.query(ACData);
                                
                                    //--merchant fetch name
                                    const ACDataM = `SELECT merchantName FROM  merchants WHERE id = '${dat.merchantId}' `;
                                    const [AcResultwoM] = await this.adapter.db.query(ACDataM);
                                    //--merchant fetch name
                                    const ActData = `SELECT * FROM  activities WHERE id = '${activityId}'`;
                                    const [ActDataress] = await this.adapter.db.query(ActData);

                                    var len=AcResultwo.length;
                                            AcResultwo.push({Length:len});
                                    const data = {                                          
                                        "activity_category":AcResultwo,
                                        "merchant_activities_id": dat.id ,
                                        "activityId":dat.activityId,
                                        "title": AcResultwoM != '' ? AcResultwoM[0].merchantName : 'blank',//AcResultwoM[0].merchantName || dat.title,
                                        "description":dat.description!=''?dat.description:'blank',//"description":dat.description,
                                        "images":dat.images,
                                        "activityType":dat.activityType ,
                                        "letterCollected": ActDataress[0].letterCollected,
                                        "isBestSeller": dat.isBestSeller,
                                        "bestSellerDuration":dat.bestSellerDuration ,
                                        "bestSellerStartDate":dat.bestSellerStartDate,
                                        "bestSellerEndDate": dat.bestSellerEndDate,
                                        "suggestionHeader": dat.suggestionHeader,
                                        "status": dat.status,
                                        "createdAt": dat.createdAt,
                                        "updatedAt": dat.updatedAt,
                                        "minPrice":dat.minPrice,
                                        "location":dat.location,
                                        "avg_rating": dat.avg_rating,
                                        "booking_count":dat.booking_count,
                                        "originalPrice"       :  Math.round(dat.min_originalPrice),
                                        "discountedPercentage":  Math.round(dat.min_discountedPercentage),
                                        "discountedPrice"     :  Math.round(dat.min_discountedPrice),
                                        "discountAmount"      :  Math.round(dat.min_discountAmount), 
                                        "review_count"        :  dat.review_count,
                                        "currency"            :  "SGD",
                                        "currencySymbol"      :  "$"
                                        }
                                        acArray.push(data)
                                    // }
                                }                                                    
                            }
                        }
                    }                            
                }
                        if(isType == 'filter'){ 
                            var whereArr = [];
                            if(filter.min_price !='' && filter.max_price !=''){
                               
                                var val='min_discountedPrice >= '+filter.min_price+' AND min_discountedPrice <='+filter.max_price;                              
                                whereArr.push(val);
                            }
                            if(filter.location !=''){
                                var val='location IN ('+filter.location+')';                              
                                whereArr.push(val);
                            }
                            if(filter.rating !=''){
                                var val='avg_rating >= '+filter.rating;
                                whereArr.push(val);
                            }

                            var str =whereArr.join(' AND ');                              
                            
                            if(filter.category==''){                                   
                            const ACData = `SELECT * FROM merchant_activities WHERE activityId='${activityId}' AND ${str} AND status='1'`;                                
                            const [ACResult] = await this.adapter.db.query(ACData); 
                                if(ACResult != ''){                                              
                                    for(let dat of ACResult){
                                    //     const MerchantActivitiesCount=`SELECT COUNT(MA.id) as count FROM merchant_activities as MA JOIN merchants as M ON M.id=MA.merchantId WHERE MA.activityId='${activityId}' AND MA.status=1`
                                    // const [MerchantActivitiesCountResult] = await this.adapter.db.query(MerchantActivitiesCount);
                                    // if(MerchantActivitiesCountResult[0].count!=0){

                                        const ACData = `SELECT * FROM activity_category_relations as acr JOIN activity_categories as ac ON acr.activityCategoryId = ac.id WHERE acr.activityId = '${dat.id}' AND ac.status='1'`;
                                        const [AcResultwo] = await this.adapter.db.query(ACData);                                        
                                        
                                        //--merchant fetch name
                                        const ACDataM = `SELECT merchantName FROM  merchants WHERE id = '${dat.merchantId}' `;
                                        const [AcResultwoM] = await this.adapter.db.query(ACDataM);
                                        //--merchant fetch name 
                                        const ActData = `SELECT * FROM  activities WHERE id = '${activityId}' `;
                                        const [ActDataress] = await this.adapter.db.query(ActData);
                                        
                                        
                                        var len=AcResultwo.length;
                                        AcResultwo.push({Length:len});
                                        const data = {  
                                        "activity_category":AcResultwo,                                      
                                        "merchant_activities_id":  dat.id ,
                                        "activityId":dat.activityId,
                                        "title": AcResultwoM!= '' ? AcResultwoM[0].merchantName : 'blank',//AcResultwoM[0].merchantName||dat.title,
                                        "description":dat.description!=''?dat.description:'blank',//"description":dat.description,
                                        "images":dat.images,
                                        "activityType":dat.activityType ,
                                        "letterCollected": ActDataress[0].letterCollected,
                                        "isBestSeller": dat.isBestSeller,
                                        "bestSellerDuration":dat.bestSellerDuration ,
                                        "bestSellerStartDate":dat.bestSellerStartDate,
                                        "bestSellerEndDate": dat.bestSellerEndDate,
                                        "suggestionHeader": dat.suggestionHeader,
                                        "status": dat.status,
                                        "createdAt": dat.createdAt,
                                        "updatedAt": dat.updatedAt,
                                        "minPrice":dat.minPrice,
                                        "location":dat.location,
                                        "avg_rating": dat.avg_rating,
                                        "booking_count":dat.booking_count,
                                        "originalPrice"       :  dat.min_originalPrice,
                                        "discountedPercentage":  dat.min_discountedPercentage,
                                        "discountedPrice"     :  dat.min_discountedPrice,
                                        "discountAmount"      :  dat.min_discountAmount, 
                                        "review_count"        :  dat.review_count,
                                        "currency"            :  "SGD",
                                        "currencySymbol"      :  "$"
                                        }
                                        acArray.push(data)
                                    // } 
                                }                                                   
                                } 
                            }else{
                                if(filter.category !='' ){                                                                   
                                    const ACDatathree = `SELECT * FROM activity_category_relations  WHERE activityCategoryId IN (${filter.category}) AND activityId='${activityId}'`;    
                                    const [AC] = await this.adapter.db.query(ACDatathree);                                                                       
                                    for( let data1 of AC){
                                        const ACData = `SELECT * FROM merchant_activities WHERE id='${data1.activityId}' AND  ${str}`; 
                                        console.log(ACData)   
                                        const [ACResult] = await this.adapter.db.query(ACData); 
                                        if(ACResult != ''){                                              
                                            for(let dat of ACResult){  
                                                // const MerchantActivitiesCount=`SELECT COUNT(MA.id) as count FROM merchant_activities as MA JOIN merchants as M ON M.id=MA.merchantId WHERE MA.activityId='${activityId}' AND MA.status=1`
                                                // const [MerchantActivitiesCountResult] = await this.adapter.db.query(MerchantActivitiesCount);
                                                // if(MerchantActivitiesCountResult[0].count!=0){                                      
                                                const ACData = `SELECT * FROM activity_category_relations as acr JOIN activity_categories as ac ON acr.activityCategoryId = ac.id WHERE acr.activityId = '${dat.id}'`;
                                                const [AcResultwo] = await this.adapter.db.query(ACData);                                        

                                                //--merchant fetch name
                                                const ACDataM = `SELECT merchantName FROM  merchants WHERE id = '${dat.merchantId}'`;
                                                const [AcResultwoM] = await this.adapter.db.query(ACDataM);
                                                //--merchant fetch name 
                                                const ActData = `SELECT * FROM  activities WHERE id = '${activityId}' `;
                                                const [ActDataress] = await this.adapter.db.query(ActData); 
                                                
                                                var len=AcResultwo.length;
                                                AcResultwo.push({Length:len});
                                                const data = {                                      
                                                "activity_category":AcResultwo,
                                                "merchant_activities_id": dat.id ,
                                                "activityId":dat.activityId,
                                                "title": AcResultwoM != '' ? AcResultwoM[0].merchantName : 'blank',//AcResultwoM[0].merchantName || dat.title,
                                                "description":dat.description!=''?dat.description:'blank',//"description":dat.description,
                                                "images":dat.images,
                                                "activityType":dat.activityType ,
                                                "letterCollected": ActDataress[0].letterCollected,//dat.letterCollected,
                                                "isBestSeller": dat.isBestSeller,
                                                "bestSellerDuration":dat.bestSellerDuration ,
                                                "bestSellerStartDate":dat.bestSellerStartDate,
                                                "bestSellerEndDate": dat.bestSellerEndDate,
                                                "suggestionHeader": dat.suggestionHeader,
                                                "status": dat.status,
                                                "createdAt": dat.createdAt,
                                                "updatedAt"           : dat.updatedAt,
                                                "minPrice"            : dat.minPrice,
                                                "location"            : dat.location,
                                                "avg_rating"          : dat.avg_rating,
                                                "booking_count"       :  dat.booking_count,
                                                "originalPrice"       :  dat.min_originalPrice,
                                                "discountedPercentage":  dat.min_discountedPercentage,
                                                "discountedPrice"     :  dat.min_discountedPrice,
                                                "discountAmount"      :  dat.min_discountAmount, 
                                                "review_count"        :  dat.review_count,
                                                "currency"            : "SGD",
                                                "currencySymbol"      : "$"
                                            }
                                                acArray.push(data)
                                        // }
                                            }                                                    
                                        }
                                    }                                                                        
                                }
                            }                     
                        } 
                        if(isType == 'nearby'){
                            
                            if(nearBy.latitude != '' && nearBy.longitude != ''){                                                             
                                // -------------------Developer---------------
                                var dis;
                                var marchecntArr=[];
                                var data={};
                                var outlet=`SELECT * FROM outlets WHERE status='1'`;
                                const [OutletDataBase] = await this.adapter.db.query(outlet);     
                                                                    
                                if(OutletDataBase!=''){
                                    for(var OutletArr of OutletDataBase){                                                      
                                        mk1lat1=nearBy.latitude;
                                        mk1lng1=nearBy.longitude;
                                        mk2lat2=OutletArr.mrtLatitude;
                                        mk2lng2=OutletArr.mrtLongitude;
            
                                        var R = 3958.8; // Radius of the Earth in miles
                                        var rlat1 = mk1lat1 * (Math.PI/180); // Convert degrees to radians
                                        var rlat2 = mk2lat2 * (Math.PI/180); // Convert degrees to radians
                                        var difflat = rlat2-rlat1; // Radian difference (latitudes)
                                        var difflon = (mk2lng2-mk1lng1) * (Math.PI/180); // Radian difference (longitudes)
                                        dis = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
                                    
                                        if(parseInt(dis)<=20){  
                                            console.log(OutletArr.id)                          
                                        var Activity= `SELECT MA.* FROM  merchant_activities as MA JOIN regular_deals_relations as RDR ON RDR.activityId= MA.activityId WHERE RDR.outletId='${OutletArr.id}' AND MA.status='1'  GROUP BY MA.id  `; 
                                        const [Merchantarr] = await this.adapter.db.query(Activity); 
                                                                    
                                            
                                           for(var dat of Merchantarr){
                                            // const MerchantActivitiesCount=`SELECT COUNT(MA.id) as count FROM merchant_activities as MA JOIN merchants as M ON M.id=MA.merchantId WHERE MA.activityId='${activityId}' AND MA.status=1`
                                            // const [MerchantActivitiesCountResult] = await this.adapter.db.query(MerchantActivitiesCount);
                                            // if(MerchantActivitiesCountResult[0].count!=0){
                                            

                                                const ACData = `SELECT * FROM activity_category_relations as acr JOIN activity_categories as ac ON acr.activityCategoryId = ac.id WHERE acr.activityId = '${dat.activityId}' AND ac.status='1'`;
                                                const [AcResultwo] = await this.adapter.db.query(ACData);                                                
                                                    console.log(dat.merchantId)
                                                //--merchant fetch name
                                                const ACDataM = `SELECT merchantName FROM  merchants WHERE id = '${dat.merchantId}' `;
                                                const [AcResultwoM] = await this.adapter.db.query(ACDataM);                                                
                                                //--merchant fetch name 
                                                const ActData = `SELECT * FROM  activities WHERE id = '${activityId}' `;
                                                const [ActDataress] = await this.adapter.db.query(ActData); 
                                                
                                                var len=AcResultwo.length;
                                                AcResultwo.push({Length:len});
                                                data= {                                                                              
                                                    "activity_category":AcResultwo,
                                                    "merchant_activities_id": dat.id ,
                                                    "activityId":dat.activityId,
                                                    "title":AcResultwoM != '' ? AcResultwoM[0].merchantName : 'blank',//AcResultwoM[0].merchantName||dat.title,
                                                    "description":dat.description!=''?dat.description:'blank',
                                                    "images":dat.images,
                                                    "activityType":dat.activityType ,
                                                    "letterCollected": ActDataress[0].letterCollected,
                                                    "isBestSeller":dat.isBestSeller,
                                                    "bestSellerDuration":dat.bestSellerDuration ,
                                                    "bestSellerStartDate":dat.bestSellerStartDate,
                                                    "bestSellerEndDate": dat.bestSellerEndDate,
                                                    "suggestionHeader": dat.suggestionHeader,
                                                    "status": dat.status,
                                                    "createdAt":dat.createdAt,
                                                    "updatedAt": dat.updatedAt,                                                       
                                                    "location":dat.location,
                                                    "avg_rating": dat.avg_rating,
                                                    "booking_count":dat.booking_count,
                                                    "originalPrice"       :  Math.round(dat.min_originalPrice),
                                                    "discountedPercentage":  Math.round(dat.min_discountedPercentage),
                                                    "discountedPrice"     : Math.round(dat.min_discountedPrice),
                                                    "discountAmount"      :  Math.round(dat.min_discountAmount) , 
                                                    "review_count"        :  dat.review_count,
                                                    "currency"            : "SGD",
                                                    "currencySymbol"      : "$"                                         
                                                }
                                                marchecntArr.push(data)
                                            }  //}  
                                        }                            
                                    }                                           
                                    var valuecheck=await marchecntArr.filter((item,index)=>{return marchecntArr.indexOf(item)==index });                
                                    if(valuecheck!=''){
                                        const successMessage = {
                                            success : true ,
                                            message : 'nearby merchant Activity list',
                                            data:valuecheck
                                        }
                                            return successMessage;
                                    }else{
                                        const successMessage = {
                                            success : false ,
                                            message : 'nearby merchant Activity list data not found',
                                            data:valuecheck
                                        }
                                            return successMessage;
                                    }
                                                  
                                }else{
                                    const successMessage = {
                                        success : false,
                                        message : 'data Not found',
                                        data:   []
                                    }
                                        return successMessage;
                                } 
                                // -------------------Developer---------------
                                }else{                                        
                                    
                                    const response = {
                                        success : true,
                                        message : 'Enter location first',
                                        // data    : activityArray
                                    }
                                    return response;
                                }
                            }   
                    }else{  
                        const ACData = `SELECT * FROM merchant_activities WHERE activityId='${activityId}' AND status='1'`;    
                            const [ACResult] = await this.adapter.db.query(ACData);                             
                            // return ACResult
                            if(ACResult != ''){                                              
                                for(let dat of ACResult){ 
                                    // const MerchantActivitiesCount=`SELECT COUNT(MA.id) as count FROM merchant_activities as MA JOIN merchants as M ON M.id=MA.merchantId WHERE MA.activityId='${activityId}' AND MA.status=1`
                                    // const [MerchantActivitiesCountResult] = await this.adapter.db.query(MerchantActivitiesCount);
                                    // if(MerchantActivitiesCountResult[0].count!=0){

                                    const ACData = `SELECT * FROM activity_category_relations as acr JOIN activity_categories as ac ON acr.activityCategoryId = ac.id WHERE acr.activityId = '${dat.id}' AND ac.status='1'`;
                                    const [AcResultwo] = await this.adapter.db.query(ACData);                                        

                                    //--merchant fetch name
                                    const ACDataM = `SELECT merchantName FROM  merchants WHERE id = '${dat.merchantId}' `;
                                    const [AcResultwoM] = await this.adapter.db.query(ACDataM);
                                    const ActData = `SELECT * FROM  activities WHERE id = '${activityId}' `;
                                    const [ActDataress] = await this.adapter.db.query(ActData);
                                    //--merchant fetch name
                                    
                                    const data = {                                      
                                    "activity_category":AcResultwo,
                                    "merchant_activities_id":  dat.id ,
                                    "activityId":dat.activityId,
                                    "title": AcResultwoM != '' ? AcResultwoM[0].merchantName : 'blank',
                                    "description":dat.description,
                                    "images":dat.images,
                                    "activityType":dat.activityType ,
                                    "letterCollected": ActDataress[0].letterCollected,
                                    "isBestSeller": dat.isBestSeller,
                                    "bestSellerDuration":dat.bestSellerDuration ,
                                    "bestSellerStartDate":dat.bestSellerStartDate,
                                    "bestSellerEndDate": dat.bestSellerEndDate,
                                    "suggestionHeader": dat.suggestionHeader,
                                    "status": dat.status,
                                    "createdAt": dat.createdAt,
                                    "updatedAt": dat.updatedAt,
                                    "minPrice":dat.minPrice,
                                    "location":dat.location,
                                    "avg_rating": dat.avg_rating,
                                    "booking_count":dat.booking_count,
                                    "originalPrice"       : Math.round( dat.min_originalPrice),
                                    "discountedPercentage": Math.round( dat.min_discountedPercentage),
                                    "discountedPrice"     : Math.round( dat.min_discountedPrice),
                                    "discountAmount"      : Math.round( dat.min_discountAmount) , 
                                    "review_count"        :  dat.review_count,
                                    "currency"            : "SGD",
                                    "currencySymbol"      : "$"
                                    }
                                    acArray.push(data)
                                    // }
                                }                                                    
                            }
                    }           
                                var dataArr=acArray!=''?true:false;     
                                const response = {
                                    success : dataArr||true ,
                                    message : 'Filter Activity list',
                                    data    : acArray
                                }
                                return response;                                        
                    // }
                
                }catch(error){
                    return error
                }
			}
        }, 
       
        MarchantDetails: {
            rest: {
				method: "POST",
				path: "/MarchantDetails"
            },
            async handler(ctx,res,req) {
                try{                                        
                    var  marchantactivityId = ctx.params.marchantactivityId;
                    var  activityId = ctx.params.activityId;
                    var  userData     = ctx.params.userId;
                    const Sql = `SELECT m.*,ma.*,m.id as merchantId, ma.id as merchant_activitiesId  FROM merchants as m JOIN merchant_activities as ma  ON m.id = ma.merchantId WHERE ma.id=${marchantactivityId} AND ma.activityId=${activityId} AND m.status='1'`;
                    const [SqlResult] = await this.adapter.db.query(Sql);   
                    console.log(SqlResult)                                                      
                    if(SqlResult!=''){
                        var value=[];                        
                        var OutletArr=[];                                                
                            var Outlet = SqlResult[0].outletIds;                                                       
                            for (let value of Outlet) {                                                                                                            
                                const sqlOutlet = `SELECT * FROM outlets WHERE id='${value}' AND status='${1}'`;    
                                const [outletRes] = await this.adapter.db.query(sqlOutlet);                                                                                                                                             
                                // const sqlOutletLocation = `SELECT rdr.*,rd.* FROM regular_deals_relations as rdr JOIN  regular_deals as rd  ON rd.id=rdr.regularDealId  WHERE outletId='${value}' AND rd.status='${1}'`;    
                                const sqlOutletLocation =`SELECT rdr.*,rd.* FROM regular_deals_relations as rdr JOIN regular_deals as rd ON rd.id=rdr.regularDealId WHERE rdr.activityId='${activityId}' AND rdr.outletId='${value}' AND rd.status='1'`;
                                const [outletLocationRes] = await this.adapter.db.query(sqlOutletLocation);                                                                                                                                                                                                              
                                var OutletObj={
                                    "outletid"        : outletRes[0].id,
                                    "merchantId"      : outletRes[0].merchantId,
                                    "outletName"      : outletRes[0].outletName,
                                    "outletEmail"     : outletRes[0].outletEmail,
                                    "outletExtension" : outletRes[0].outletExtension,
                                    "outletMobile"    : outletRes[0].outletMobile,
                                    "openingHours"    : outletRes[0].openingHours,
                                    "region"          : outletRes[0].region,
                                    "streetAddress"   : outletRes[0].streetAddress,
                                    "address"         : outletRes[0].address,
                                    "postalCode"      : outletRes[0].postalCode,
                                    "mrtLatitude"     : outletRes[0].mrtLatitude,
                                    "mrtLongitude"    : outletRes[0].mrtLongitude,
                                    "trainStations"   : outletRes[0].trainStations,
                                    "status"          : outletRes[0].status,
                                    "createdBy"       : outletRes[0].createdBy,
                                    "modifiedBy"      : outletRes[0].modifiedBy,
                                    "createdAt"       : outletRes[0].createdAt,
                                    "currency"        : "SGD",
                                    "currencySymbol"  : "$" ,
                                    "deals"           : outletLocationRes
                                }      
                                OutletArr.push(OutletObj)                          
                            }  
                            const sqlOtherAct = `SELECT * FROM merchant_activities WHERE id != '${marchantactivityId}' AND merchantId='${SqlResult[0].merchantId}' AND status='${1}'`;    
                            const [sqlOtherActRes] = await this.adapter.db.query(sqlOtherAct);                                                                                
                            
                            const ActivityRes=`SELECT * FROM activities WHERE  id = '${SqlResult[0].activityId}'`;
                            const [ActivityResult] = await this.adapter.db.query(ActivityRes);

                            var isfav;
                            const userActivitiesFavourite=`SELECT * FROM user_Activities_Favourite WHERE userId = '${userData}' AND activity_id = '${SqlResult[0].activityId}'`;
                            const [UserActivitiesFavouriteResult] = await this.adapter.db.query(userActivitiesFavourite);
                            if(UserActivitiesFavouriteResult!=''){
                                isfav=true;
                            }else{
                                isfav=false;
                            }
                            const data = {                                      
                                "merchantId"               : SqlResult[0].id,
                                "merchantName"             : SqlResult[0].merchantName ,
                                "merchantLogo"             : SqlResult[0].merchantLogo,
                                "merchantSignUpEmail"      : SqlResult[0].merchantSignUpEmail,
                                "merchantWebsite"          : SqlResult[0].merchantWebsite,
                                "contactPersonForSparks"   : SqlResult[0].contactPersonForSparks,
                                "contactEmail"             : SqlResult[0].contactEmail,
                                "notes"                    : SqlResult[0].notes,
                                "bank"                     : SqlResult[0].bank ,
                                "connect_id"               : SqlResult[0].connect_id,
                                "stripeMerchantId"         : SqlResult[0].stripeMerchantId,
                                "createdBy"                : SqlResult[0].createdBy,
                                "updatedBy"                : SqlResult[0].updatedBy,
                                "merchant_activitiesId"    : SqlResult[0].merchant_activitiesId,//SqlResult[0].id
                                "title"                    : ActivityResult[0].title,//SqlResult[0].title,
                                "images"                   : SqlResult[0].images,
                                "quantity"                 : SqlResult[0].quantity,
                                "description"              : SqlResult[0].description,
                                "activityDuration"         : SqlResult[0].activityDuration,
                                "isReservationRequired"    : SqlResult[0].isReservationRequired,
                                "isAnniversarySpecial"     : SqlResult[0].isAnniversarySpecial,
                                "averageRating"            : SqlResult[0].averageRating,
                                "isBestSeller"             : SqlResult[0].isBestSeller,                                         
                                "sparksCommission"         : SqlResult[0].sparksCommission,
                                "sparksCommissionLastUpdated": SqlResult[0].sparksCommissionLastUpdated,
                                "sparksCommissionLastUpdateReason": SqlResult[0].sparksCommissionLastUpdateReason,
                                "merchantRanking"           : SqlResult[0].merchantRanking,
                                "rankingStartDate"          : SqlResult[0].rankingStartDate,
                                "rankingEndDate"            : SqlResult[0].rankingEndDate,
                                "isFeatured"                : SqlResult[0].isFeatured,
                                "isFeaturedStartDate"       : SqlResult[0].isFeaturedStartDate,
                                "isFeaturedEndDate"         : SqlResult[0].isFeaturedEndDate,
                                "expectations"              : SqlResult[0].expectations,
                                "additionalInfo"            : SqlResult[0].additionalInfo,
                                "terms"                     : SqlResult[0].terms,
                                "howToRedeem"               : SqlResult[0].howToRedeem,
                                "status"                    : SqlResult[0].status,
                                "latitude"                  : SqlResult[0].latitude,
                                "longitude"                 : SqlResult[0].longitude,
                                "createdBy"                 : SqlResult[0].createdBy,
                                "updatedBy"                 : SqlResult[0].updatedBy,  
                                "outlet"                    : OutletArr,
                                "sqlOtherActivity"          : sqlOtherActRes,
                                "review_count"              : SqlResult[0].review_count||0,
                                "currency"                  : "SGD",
                                "currencySymbol"            : "$",
                                "isfav"                     : isfav,
                                "validityPeriod"            : SqlResult[0].validityPeriod||0                            
                                }
                                // value.push(data)
                                                 
                        
                        const successMessage = {
                            success : true,
                            message : 'MarchantDetails List',
                            data : data
                        }
                        return successMessage;
                    }else{
                        const successMessage = {
                            success : false,
                            message : 'MarchantDetails Empty List',
                            data : [],
                        }
                        return successMessage;
                    }                    
                }catch(error){
                    return error
                }
			}
        },

        CoupleLinkingRequest: {
            rest: {
				method: "POST",
				path: "/CoupleLinkingRequest"
            },
            async handler(ctx,res,req) {
                try{   
                    var userId= ctx.params.userId;
                    var code=ctx.params.code;                   
                    var UserCodeQuery=`SELECT id FROM users WHERE coupleCode='${code}' `; 
                    const [UserCodebyFetchById] = await this.adapter.db.query(UserCodeQuery);                                        
                   
                    if(UserCodebyFetchById.length!=0){
                   
                    if(UserCodebyFetchById[0].id != userId){

                    if(UserCodebyFetchById.length != ''){

                            var invitationSelectquery=`SELECT * FROM invitations WHERE user_Id ='${userId}' AND to_user_Id ='${UserCodebyFetchById[0].id}'`; 
                            const [invitationUser] = await this.adapter.db.query(invitationSelectquery);  
                    
                            if(invitationUser.length==''){                    
                                
                                var invitationInsertquery=`insert into invitations (user_Id,to_user_Id,code,status) values ('${userId}','${UserCodebyFetchById[0].id}','${code}','2')`;                        
                                const [UserResult] = await this.adapter.db.query(invitationInsertquery);
        
                                const successMessage = {
                                    success : true ,
                                    message : 'Send invitation for couple link successfully'
                                    // data : ,
                                }
                                return successMessage;    
        
                            }else{
                                const successMessage = {
                                    success : false ,
                                    message : 'invitation  Already sent'
                                    // data : ,
                                }
                                return successMessage;    
                            }
                        }else{
                            const successMessage = {
                                success : false ,
                                message : 'coupleCode is not match '
                                // data : ,
                            }
                            return successMessage;
                        } 
                    }else{
                        const successMessage = {
                            success : false ,
                            message : 'coupleCode user are same'
                            // data : ,
                        }
                        return successMessage;
                    }  
                }else{
                    const successMessage = {
                        success : false ,
                        message : 'Couple code entered is invalid'//'Please use this coupon code for Sparks couple linking.'
                        // data : ,
                    }
                    return successMessage;
                }                 
                }catch(error){
                    return error
                }
			}
        },

        CoupleLinking: {
            rest: {
				method: "POST",
				path: "/CoupleLinking"
            },
            async handler(ctx,res,req) {
                try{   
                    const userId    = ctx.params.userId; 
                    const toUserId  = ctx.params.toUserId;
                    const status    = ctx.params.status;
                    
                    var InvitationFetchByUserIdAndToUserId=`SELECT * FROM invitations WHERE user_Id ='${userId}' AND to_user_Id ='${toUserId}' AND status = '${2}'`; 
                    const [InvitationUser] = await this.adapter.db.query(InvitationFetchByUserIdAndToUserId);
                    
                    if(InvitationUser.length!=''){
                        
                        var UserByIdFetchCode=`SELECT coupleCode FROM users WHERE id= ${userId} `;
                        const [UsercoupleCode] = await this.adapter.db.query(UserByIdFetchCode);
                    
                        if(UsercoupleCode!=''){
                            if( status==0 || status=='0' ){                              
                              const CoupleLinkingReject= ` DELETE FROM invitations WHERE user_Id= '${userId}' AND to_user_Id ='${toUserId}'`;
                              const [CoupleLinkingRejectResult] = await this.adapter.db.query(CoupleLinkingReject);
                                if(CoupleLinkingRejectResult != ''){
                                    const successMessage = {
                                      success : true,
                                      message : 'Successfully reject coupleCode'                                                                                
                                    }
                                    return successMessage;            
                                }else{
                                    const successMessage = {
                                        success : false,
                                        message : 'something went wrong'                                        
                                    }
                                    return successMessage;
                                }                               
                            }else{  
                                var ToUserUpdateByCode=`update users set coupleCode = '${UsercoupleCode[0].coupleCode}'  WHERE id= ${toUserId}  `;
                                const [ToUser] = await this.adapter.db.query(ToUserUpdateByCode);
                                
                                if(ToUser!=''){
                                    var ToUserUpdateByCode=`update invitations set status = '${status}'  WHERE user_Id ='${userId}' AND to_user_Id ='${toUserId}' `;
                                    const [ToUser] = await this.adapter.db.query(ToUserUpdateByCode);
                                    
                                    var msg = status==1?'Successfully accept coupleCode':'Successfully reject coupleCode';
                                    const successMessage = {
                                        success : true ,
                                        message : msg//'Successfully accept coupleCode'                                   
                                    }
                                    return successMessage;

                                }else{
                                    const successMessage = {
                                        success : false ,
                                        message : 'something went wrong'
                                        
                                    }
                                    return successMessage;
                            }    }
                        }else{
                            const successMessage = {
                                success : false,
                                message : 'userId match coupleCode'
                                // data : ,
                            }
                            return successMessage;
                        }
                    }else{
                        const successMessage = {
                            success : false ,
                            message : 'CoupleLinkingRequest recode not found'//'user data not found'
                            // data : ,
                        }
                            return successMessage;    
                    }                    
                }catch(error){
                    return error
                }
			}
        },

        UserInfoCoupleLinking: {
            rest: {
				method: "POST",
				path: "/UserInfoCoupleLinking"
            },
            async handler(ctx,res,req) {
                try{ 
                    var userId = ctx.params.userId; 
                    var invitation =`SELECT U.*,I.status as invitation FROM users as U JOIN invitations as I ON U.id=I.user_Id WHERE  to_user_Id='${userId}' `;
                    const [SqlResult] = await this.adapter.db.query(invitation);                    
                    if(SqlResult!=''){
                        if(SqlResult[0].invitation==2){
                            const successMessage = {
                                success : true,
                                message : 'user couple info',
                                data    : SqlResult    
                            }
                            return successMessage;   
                        }else{
                            var statusVal=SqlResult[0].status == 1 ?" Allready accept " : "Allready reject"
                            const successMessage = {
                                success : false,
                                message : statusVal,
                                // data    : []   
                            }
                            return successMessage;
                        }                         
                    }else{
                        const successMessage = {
                            success : false,
                            message : 'Empty',
                            data    : []    
                        }    
                        return successMessage;
                    }                                                               
                }catch(error){
                    return error
                }
			}
        }, 

        FreeActivity: {
            rest: {
				method: "POST",
				path: "/FreeActivity"
            },
            async handler(ctx,res,req) {
                try{ 
                                          
                    var ActivityId= ctx.params.activityId; 
                    var UserId    = ctx.params.userId;                   
                    const ActivitiesQuery=`SELECT * FROM activities  WHERE activities.id='${ActivityId}' AND activities.activityType='free' AND status='1' ` 
                    const [ActivitiesResult] = await this.adapter.db.query(ActivitiesQuery);                   
                    if(ActivitiesResult!=''){
                    const Sql = `SELECT * FROM free_activity_suggestions WHERE activityId = '${ActivityId}'`;
                    const [SqlResult] = await this.adapter.db.query(Sql);                  
                    if(SqlResult!=''){ 
                        var isfav;
                        const UserActivitiesFavourite = `SELECT * FROM user_Activities_Favourite WHERE userId ='${UserId}' AND  activity_id='${ActivityId}'`;
                        const [UserActivitiesFavouriteResult] = await this.adapter.db.query(UserActivitiesFavourite);                        
                        if(UserActivitiesFavouriteResult!=''){
                            isfav=true;
                        }if(UserActivitiesFavouriteResult==''){
                            isfav=false;
                        }
                        const successMessage = {
                               success       : true,
                                message      : 'Free Activity list data',
                                isfav        : isfav||false,
                                title        : ActivitiesResult[0].title != '' ? ActivitiesResult[0].title:'blank',
                                description  : ActivitiesResult[0].description != '' ? ActivitiesResult[0].description:'blank',
                                images       : ActivitiesResult[0].images,
                                data         : SqlResult,
                                "currency"            : "SGD",
                                "currencySymbol"      : "$"                                  
                           }                           
                           return successMessage;                         
                       }else{
                           if(ActivitiesResult[0].title!=''||ActivitiesResult[0].description!=''||ActivitiesResult[0].images){
                                const successMessage = {
                                    message      : 'Free Activity list data',
                                    isfav        : true,
                                    title        : ActivitiesResult[0].title != '' ? ActivitiesResult[0].title:'blank',
                                    description  : ActivitiesResult[0].description != '' ? ActivitiesResult[0].description:'blank',
                                    images       : ActivitiesResult[0].images,
                                    data         : SqlResult,
                                    "currency"        : "SGD",
                                    "currencySymbol"  : "$"
                                }    
                                return successMessage;    
                           }else{
                            const successMessage = {
                                success : false,
                                message : 'Empty',
                                data    : []    
                            }    
                            return successMessage;
                           }                            
                       }  
                }else{
                    const successMessage = {
                        success : false,
                        message : 'ActivityType is not free',
                        data    : []    
                    }    
                    return successMessage;
                }                                         
                }catch(error){
                    return error
                }
			}
        },    

        FavouriteActivity: {
            rest: {
				method: "POST",
				path: "/FavouriteActivity"
            },
            async handler(ctx,res,req) {
                try{                               
                    const activityId = ctx.params.activityId;
                    const userId     = ctx.params.userId;
                    const marchentIdactivityId=  ctx.params.marchantactivityId;                                     
                    const findUser= `SELECT * FROM users WHERE id = '${userId}'`;
                    const [UserResult] = await this.adapter.db.query(findUser);
                        if(UserResult!=''){
                            const userActivitiesFavourite = `SELECT * FROM user_Activities_Favourite WHERE userId='${userId}' AND activity_id='${activityId}' AND merchant_activities_id='${marchentIdactivityId}'`;
                            const [userActivitiesFavouriteResult] = await this.adapter.db.query(userActivitiesFavourite);
                            if(userActivitiesFavouriteResult != ''){                               
                                const FavUserDelete=`DELETE FROM user_Activities_Favourite WHERE userId='${userId}' AND activity_id='${activityId}'`;
                                const [FavUserDeleteQuery] = await this.adapter.db.query(FavUserDelete);
                                if(FavUserDelete!=''){
                                    const successMessage = {
                                        success : false,
                                        message : 'Removed user fav Activity'                                                                                
                                    }
                                    return successMessage;            
                                }
                            }else{
                                const FavUserAdd=`insert into user_Activities_Favourite (userId, activity_id,merchant_activities_id) values ('${userId}' ,'${activityId}','${marchentIdactivityId}')`;
                                const [FavUserAddQuery] = await this.adapter.db.query(FavUserAdd);
                                if(FavUserAddQuery != ''){
                                    const successMessage = {
                                        success : true,
                                        message : 'Add user fav Activity'                                                                                
                                    }
                                    return successMessage;            
                                }
                            }
                        } else{
                            const successMessage = {
                                success : false,
                                message : 'user not exits'                                        
                            }
                            return successMessage;   
                        }
                }catch(error){
                    return error
                }
			}
        },

        NeraByActivity : {
            rest: {
				method: "POST",
				path: "/NeraByActivity"
            },
            async handler(ctx,res,req) {
                try{
                    const lat    = ctx.params.lat;
                    const lang   = ctx.params.lang;
                    const userId = ctx.params.userId;
                    // console.log(lat,lang);
                    var dis;
                    var marchecntArr=[];
                    var outlet=`SELECT * FROM outlets`;
                    const [OutletDataBase] = await this.adapter.db.query(outlet);                                           
                    if(OutletDataBase!=''){
                        for(var OutletArr of OutletDataBase){                                                      
                            mk1lat1=lat;
                            mk1lng1=lang;
                            mk2lat2=OutletArr.mrtLatitude;
                            mk2lng2=OutletArr.mrtLongitude;

                            var R = 3958.8; // Radius of the Earth in miles
                            var rlat1 = mk1lat1 * (Math.PI/180); // Convert degrees to radians
                            var rlat2 = mk2lat2 * (Math.PI/180); // Convert degrees to radians
                            var difflat = rlat2-rlat1; // Radian difference (latitudes)
                            var difflon = (mk2lng2-mk1lng1) * (Math.PI/180); // Radian difference (longitudes)
                            dis = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
                            
                            if(parseInt(dis)<=7){
                                console.log(parseInt(dis))                            
                            var Activity= `SELECT A.* FROM  activities as A JOIN regular_deals_relations as RDR ON RDR.activityId= A.Id WHERE RDR.outletId='${OutletArr.id}' GROUP BY A.id`; 
                            const [Merchantarr] = await this.adapter.db.query(Activity); 
                            
                                // const ACData = `SELECT * FROM activity_category_relations as acr JOIN activity_categories as ac ON acr.activityCategoryId = ac.id WHERE acr.activityId = '${Merchantarr[0].activityId}'`;
                                // const [AcResultwo] = await this.adapter.db.query(ACData);                               
                                for(var dat of Merchantarr){
                                    // var FavSELECT=`SELECT * From user_Activities_Favourite WHERE userId='${userId}' AND activity_id='${}'`
                                    var data={
                                        "id": dat.id,
                                        "title": dat.title,
                                        "description": dat.description,
                                        "images": dat.images,
                                        "activityType": dat.activityType,
                                        "letterCollected":dat.letterCollected,
                                        "isBestSeller":dat.isBestSeller,
                                        "bestSellerDuration": dat.bestSellerDuration,
                                        "bestSellerStartDate": dat.bestSellerStartDate,
                                        "bestSellerEndDate": dat.bestSellerEndDate,
                                        "suggestionHeader": dat.suggestionHeader,
                                        "status": dat.status,
                                        "createdAt": dat.createdAt,
                                        "updatedAt": dat.updatedAt,
                                        "location": dat.location,
                                        "avg_rating":dat.avg_rating,
                                        "booking_count": dat.booking_count,
                                        "originalPrice":dat.originalPrice,
                                        "discountedPercentage":dat.discountedPercentage,
                                        "discountedPrice":dat.discountedPrice,
                                        "discountAmount": dat.discountAmount,
                                        "review_count": dat.review_count
                                    }
                                marchecntArr.push(data) 
                                }
                               
                            }                            
                        } 
                        var valuecheck=await marchecntArr.filter((item,index)=>{return marchecntArr.indexOf(item)==index });                      
                        const successMessage = {
                            success : true ,
                            message : 'nearby merchant Activity list',
                            data:valuecheck
                        }
                            return successMessage;              
                    }else{
                        const successMessage = {
                            success : false,
                            message : 'data Not found',
                            data:   []
                        }
                            return successMessage;
                    }                     
                }catch(error){
                    return error
                }
			}
        },

        NeraByMerchantActivity : {
            rest: {
				method: "POST",
				path: "/NeraByMerchantActivity"
            },
            async handler(ctx,res,req) {
                try{
                    const lat   = ctx.params.lat;
                    const lang  = ctx.params.lang;                                    
                    var dis;
                    var marchecntArr=[];
                    var data={};
                    var outlet=`SELECT * FROM outlets`;
                    const [OutletDataBase] = await this.adapter.db.query(outlet);                                           
                    if(OutletDataBase!=''){
                        for(var OutletArr of OutletDataBase){                                                      
                            mk1lat1=lat;
                            mk1lng1=lang;
                            mk2lat2=OutletArr.mrtLatitude;
                            mk2lng2=OutletArr.mrtLongitude;

                            var R = 3958.8; // Radius of the Earth in miles
                            var rlat1 = mk1lat1 * (Math.PI/180); // Convert degrees to radians
                            var rlat2 = mk2lat2 * (Math.PI/180); // Convert degrees to radians
                            var difflat = rlat2-rlat1; // Radian difference (latitudes)
                            var difflon = (mk2lng2-mk1lng1) * (Math.PI/180); // Radian difference (longitudes)
                            dis = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
                        
                            if(parseInt(dis)<=20){  
                                console.log(OutletArr.id)                          
                            var Activity= `SELECT MA.* FROM  merchant_activities as MA JOIN regular_deals_relations as RDR ON RDR.activityId= MA.activityId WHERE RDR.outletId='${OutletArr.id}' GROUP BY MA.id  `; 
                            const [Merchantarr] = await this.adapter.db.query(Activity); 
                            // console.log(Merchantarr)                            
                                // const ACData = `SELECT * FROM activity_category_relations as acr JOIN activity_categories as ac ON acr.activityCategoryId = ac.id WHERE acr.activityId = '${Merchantarr[0].activityId}'`;
                                // const [AcResultwo] = await this.adapter.db.query(ACData);
                               for(var dat of Merchantarr){
                                 //Merchantarr
                                     data= {                                                                              
                                            // "activity_category":AcResultwo,
                                            "merchant_activities_id": dat.id ,
                                            "activityId":dat.activityId,
                                            "title":dat.title,
                                            "description":dat.description,
                                            "images":dat.images,
                                            "activityType":dat.activityType ,
                                            "letterCollected": dat.letterCollected,
                                            "isBestSeller":dat.isBestSeller,
                                            "bestSellerDuration":dat.bestSellerDuration ,
                                            "bestSellerStartDate":dat.bestSellerStartDate,
                                            "bestSellerEndDate": dat.bestSellerEndDate,
                                            "suggestionHeader": dat.suggestionHeader,
                                            "status": dat.status,
                                            "createdAt":dat.createdAt,
                                            "updatedAt": dat.updatedAt,
                                            // "minPrice":dat.minPrice,
                                            "location":dat.location,
                                            "avg_rating": dat.avg_rating,
                                            "booking_count":dat.booking_count,
                                            "originalPrice"       :  dat.min_originalPrice,
                                            "discountedPercentage":  dat.min_discountedPercentage,
                                            "discountedPrice"     : dat.min_discountedPrice,
                                            "discountAmount"      :  dat.min_discountAmount , 
                                            "review_count"        :  dat.review_count                                           
                                    }
                                    marchecntArr.push(data)
                                }     
                            }                            
                        }  
                        console.log(marchecntArr);     
                        var valuecheck=await marchecntArr.filter((item,index)=>{return marchecntArr.indexOf(item)==index });                
                        const successMessage = {
                            success : true ,
                            message : 'nearby merchant Activity list',
                            data:valuecheck
                        }
                            return successMessage;              
                    }else{
                        const successMessage = {
                            success : false,
                            message : 'data Not found',
                            data:   []
                        }
                            return successMessage;
                    }                     
                }catch(error){
                    return error
                }
			}
        },

        UserProfile: {
            rest: {
				method: "POST",
				path: "/UserProfile"
            },
            async handler(ctx,res,req) {
                try{
                    var userID = ctx.params.userId;
                    var userDataQuery=`SELECT * FROM users WHERE id ='${userID}'`;
                    const [userDataQueryResult] = await this.adapter.db.query(userDataQuery);
                    if(userDataQueryResult!=''){
                        const successMessage = {
                            success : true,
                            message : 'show user profile',
                            data    :  userDataQueryResult
                        }
                            return successMessage;
                    }else{
                        const successMessage = {
                            success : false,
                            message : 'user not exits ',
                            data    :  []
                        }
                            return successMessage;
                    }   
                }  catch(error){
                    return error
                }
			}
        },

        BookingMerchantActivity: {
            rest: {
				method: "POST",
				path: "/BookingMerchantActivity"
            },
            async handler(ctx,res,req) {
                try{
                    var userId              = ctx.params.userId;
                    var coupleId            = ctx.params.coupleId; 
                    var activityId          = ctx.params.activityId;
                    var merchantActivityId  = ctx.params.merchantActivityId;
                    var outletId            = ctx.params.outletId; 
                    var stripeTransactionId = ctx.params.stripeTransactionId;
                    var promotionId         = ctx.params.promotionId;
                    var regularDealId       = ctx.params.regularDealId;
                    var couponId            = ctx.params.couponId;
                    var paymentReceived     = ctx.params.paymentReceived;
                    var paymentMethod       = ctx.params.paymentMethod;
                    var pointsEarned        = ctx.params.pointsEarned;
                    var pointsRedemed       = ctx.params.pointsRedemed;
                    var savings             = ctx.params.savings;
                    var commissionEarner    = ctx.params.commissionEarner;
                    var quantity            = ctx.params.quantity;
                    var originalPrice       = ctx.params.originalPrice;
                    var finalPrice          = ctx.params.finalPrice;
                    var dateExpired         = ctx.params.dateExpired;
                    var datePurchased       = ctx.params.datePurchased;
                    var dateRedeemed        = ctx.params.dateRedeemed;
                    var dateReserved        = ctx.params.dateReserved;
                            
                    var userDataQuery=`SELECT * FROM users WHERE id='${userId}'`;
                    const [userDataQueryResult] = await this.adapter.db.query(userDataQuery);
                    if(userDataQueryResult!=''){
                        const BookingData=`
                        INSERT INTO bookings(userId, coupleId, activityId,merchantActivityId, outletId, stripeTransactionId,promotionId, regularDealId, couponId,paymentReceived,paymentMethod,pointsEarned,pointsRedemed, savings,commissionEarner,quantity, originalPrice, finalPrice,dateExpired, datePurchased, dateRedeemed,dateReserved,status)VALUES ('${userId}','${coupleId}','${activityId}','${merchantActivityId }','${outletId}','${stripeTransactionId}','${promotionId}','${regularDealId}','${couponId}','${paymentReceived}','${paymentMethod}','${pointsEarned}','${pointsRedemed}','${savings}','${commissionEarner}','${quantity}','${originalPrice}','${finalPrice}','${dateExpired }','${datePurchased }','${dateRedeemed }','${dateReserved }','1')`;
                        const [BookingDataResult] = await this.adapter.db.query(BookingData);
                        if(BookingDataResult!=0){
                            const successMessage = {
                                success : true,
                                message : 'Booking successfully'                               
                            }
                                return successMessage;
                        }else{
                            const successMessage = {
                                success : false,
                                message : 'Some went wrong'                               
                            }
                                return successMessage;
                        }
                    }else{

                    }                                           
                }  catch(error){
                    return error
                }
			}
        },
        
    }   
}                       



