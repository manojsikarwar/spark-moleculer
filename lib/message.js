'use strict';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */


module.exports = {

  roles: {
    user: 3,
    merchant: 2,
    admin: 1
  },
  message:{

    //========================= ACTIVITY MESSAGE =====================
    
    ACTIVITYDELETE : ({success:true, statusCode:200, message:"Deleted successfully"}),
    ALREADYTITLE:({success:false, statusCode:409, message:"Title name must be uniqe"}),
    ACTIVITYCREATE : ({success:true, statusCode:200, message:"Activities create successfully"}),
    NOTDELTE : ({success:false, statusCode:400, message:"Not deleted"}),
    FREEALREADYTITLE : ({success:false, statusCode:409, message:"Free Title must be uniqe"}),

    //========================= user message =========================

    USERCREATE : ({success:true, statusCode:200, message:"User created"}),
    USERDELETE : ({success:true, statusCode:200, message:"User deleted"}),
    USERUPDATE : ({success:false, statusCode:409, message:"User updated"}),
    
    USERDUPLICATE : ({success:true, statusCode:409, message:"User already exists"}),
    USERNOTFOUND : ({success:false, statusCode:400, message:"Error: User does not exist."}),
    
    //=========================  MESSAGE FOR ALL ======================
    
    RESETPASSWORDNOT: ({success:true, statusCode:200, message:"Password not changed"}),
    RESETPASSWORD: ({success:true, statusCode:200, message:"Your password has been changed recently."}),
    FIELDS: ({success:true, statusCode:200, message:"Fill all fields compalsoury"}),
    DELETE: ({success:true, statusCode:200, message:"Deleted successfully"}),

    PASSWORDDUP : ({success:false, statusCode:400, message:"Error: Password entered is incorrect."}),
    LOGINFAIL : ({success:false, statusCode:401, message:"Error: Login failed."}),
    SOMETHINGWRONG :({success:false, statusCode:409, message:"Something went wrong"}),
    PERMISSIONDENIDE :({success:false, statusCode:409, message:"Permission denide"}),
    MISSINGFIELD :({success:false, statusCode:408, message:"Fields are missing"}),
    NOTSAVE :({success:false, statusCode:500, message:"Not saved"}),
    SAVE :({success:true, statusCode:200, message:"Save successfully"}),
    UPDATE : ({success:true, statusCode:200, message:"Updated successfully"}),
    NOTUPDATE : ({success:false, statusCode:409, message:"Not Updated"}),
    SIGNOUT : ({success:true, statusCode:200, message:"Signout successfully"}),
    ALREADYUPDATED : ({success:true, statusCode:200, message:"Already updated"}),
    LOGIN : ({success:false, statusCode:301, message:"Please login ."}),
    NOTHINGCHANGES : ({success:false, statusCode:409, message:"Nothing get changes ."}),

    //========================= TOKEN MESSAGE =========================

    UNAUTHORIZED : ({success:false, statusCode:301, message:"Token UnAuthorizedErr."}),
    TOKENEXPIRE : ({success:false, statusCode:301, message:"Token Expire Please Login."}),

    //========================= EMAIL MESSAGE ==========================

    EMAILNOTFOUND : ({success:false, statusCode:401, message:"Email not found."}),
    USERNOTFOUND : ({success:false, statusCode:401, message:"User not found."}),
    OTPNOTFOUND : ({success:false, statusCode:401, message:"OTP does not match."}),


  //========================= MERCHANT MESSAGE =======================

    UNIQMERCHANT : ({success:false, statusCode:400, message:"merchantEmail and Name must be unique."}),

    //========================= OUTLET MESSAGE ========================

    UNIQOUTLET : ({success:false, statusCode:400, message:"outletName and Email must be unique."}),

    //========================= ADMIN MESSAGE =========================

    ADMINIDNOTFOUND : ({success:false, statusCode:409, message:"Id not found ."}),
    MATCHPASSWORD : ({success:false, statusCode:409, message:" Please enter same credentials in new password and confirm new password."}),

    //======================== REGULAR DEALS MESSAGE =========================

    OUTLETID : ({success:false, statusCode:409, message: "Please give outlets ID."}),
    
    DUPFEATURED :({success:false, statusCode:409, message: "This activity already selected by this merchant."}),
  }
};


// const merchatActivities = `select * from merchants where merchantName like '%${search}%' and (status = '1' || status = '2') ORDER BY ${orderBy} ${order} limit ${limit} offset ${offset}`
//                             const [merchatActivitiesress] = await this.adapter.db.query(merchatActivities);

//                             for(let mer of merchatActivitiesress){
//                                 const merchantId = mer.id;
//                                 const mercantAct = `select * from merchant_activities where merchantId = '${merchantId}'`
//                                 const [mercantActress] = await this.adapter.db.query(mercantAct)
//                                 if(mercantActress == ''){
//                                     const data ={
//                                         merchantActivtyId:'',
//                                         merchantId: merchantId,
//                                         merchantName: mer.merchantName,
//                                         status:mer.status,
//                                         price : [],
//                                         createdAt:mer.createdAt,
//                                         activity:[]
//                                     }
//                                     merchantDATA.push(data);
//                                 }
                                
//                                 const ACT = [];
//                                 for(let merAct of mercantActress){
//                                     const activityId = merAct.activityId;
//                                     const activity = `select * from activities where id = '${activityId}' `;
//                                     const [activityress] = await this.adapter.db.query(activity);
//                                     if(activityress != ''){
//                                         const Activcat = [];
//                                         for(let atv of activityress){
//                                             const categories = `select ac.id as categor_id,ac.name as category_name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${activityId}'`
//                                             const [categoriesress] = await this.adapter.db.query(categories);
//                                                for(let catlist of categoriesress){
//                                                    Activcat.push(catlist) 
//                                                }
//                                             const activityData = {
//                                                 id: atv.id,
//                                                 title:atv.title,
//                                                 activitycategories:Activcat
//                                             }
//                                             ACT.push(activityData)
//                                             const price = `select min(rd.discountedPrice) as price from regular_deals_relations as rds inner join regular_deals as rd on rds.regularDealId = rd.id where rds.outletId = '${merAct.outletIds[0]}' and rds.merchantActivityId = '${merAct.id}'`
//                                             const [priceress] = await this.adapter.db.query(price)
//                                             const PRICE = [];
//                                             for(let rate of priceress){
//                                                 PRICE.push(rate)
//                                             }
//                                             const data ={
//                                                 merchantActivtyId:merAct.id,    
//                                                 merchantId: merchantId,
//                                                 merchantName: mer.merchantName,
//                                                 status:mer.status,
//                                                 price : PRICE,
//                                                 createdAt:mer.createdAt,
//                                                 activity:activityData
//                                             }
//                                             merchantDATA.push(data)
//                                         }    
//                                     }else{
//                                         const errMessage = {
//                                             success:true,
//                                             statusCode:200,
//                                             data:activityress
//                                         }
//                                         return errMessage
//                                     }
//                                 }
//                             }
//                             //=================================================================
//                             const merchatActivities1 = `select * from merchants where (status = '1' || status = '2')`
//                             const [merchatActivitiesress1] = await this.adapter.db.query(merchatActivities1);
//                             for(let mer1 of merchatActivitiesress1){
//                                 const merchantId1 = mer1.id;
//                                 const mercantAct1 = `select * from merchant_activities where merchantId = '${merchantId1}'`
//                                 const [mercantActress1] = await this.adapter.db.query(mercantAct1)
//                                 if(mercantActress1 == ''){
//                                     const data1 ={
//                                         merchantId: merchantId1,
//                                         merchantName: mer1.merchantName,
//                                         status:mer1.status,
//                                         price : [],
//                                         createdAt:mer1.createdAt,
//                                         activity:[]
//                                     }
//                                     merchantDATA1.push(data1);
//                                 }
//                                 const ACT1 = [];
//                                 for(let merAct1 of mercantActress1){
//                                     const activityId1 = merAct1.activityId;
//                                     const activity1 = `select * from activities where id = '${activityId1}' `;
//                                     const [activityress1] = await this.adapter.db.query(activity1);
//                                     if(activityress1 != ''){
//                                         const Activcat1 = [];
//                                         for(let atv1 of activityress1){
//                                             const categories1 = `select ac.id as categor_id,ac.name as category_name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${activityId1}'`
//                                             const [categoriesress1] = await this.adapter.db.query(categories1);
//                                                for(let catlist1 of categoriesress1){
//                                                    Activcat1.push(catlist1) 
//                                                }
//                                             const activityData1 = {
//                                                 id: atv1.id,
//                                                 title:atv1.title,
//                                                 activitycategories:Activcat1
//                                             }
//                                             ACT1.push(activityData1)
//                                             const price1 = `select min(discountAmount) as price from regular_deals where merchantId = '${merchantId1}'`
//                                             const [priceress1] = await this.adapter.db.query(price1)
//                                             const PRICE1 = [];
//                                             for(let rate1 of priceress1){
//                                                 PRICE1.push(rate1)
//                                             }
//                                             const data1 ={
//                                                 merchantId: merchantId1,
//                                                 merchantName: mer1.merchantName,
//                                                 status:mer1.status,
//                                                 price : PRICE1,
//                                                 createdAt:mer1.createdAt,
//                                                 activity:activityData1
//                                             }
//                                             merchantDATA1.push(data1)
//                                         }    
//                                     }else{
//                                         const errMessage = {
//                                             success:true,
//                                             statusCode:200,
//                                             data:activityress1
//                                         }
//                                         return errMessage
//                                     }
//                                 }
//                             }

//=========================================()==========================================
// if(Auth.role == 1){
//   // const Merchant = `select * from merchants where merchantName like '%${search}%' and (status = '1' || status = '2') ORDER BY ${orderBy} ${order} limit ${limit} offset ${offset}`
//   // const [Merchantress] = await this.adapter.db.query(Merchant);
//   // for(let mer of Merchantress){
//   //     return mer
//   //     const merchantId = mer.id;
//   //     const mercantAct = `select * from merchant_activities where merchantId = '${merchantId}'`
//   //     const [mercantActress] = await this.adapter.db.query(mercantAct)
//   //     if(mercantActress == ''){
//   //         merchantDATA.push(mer);
//   //     }
//   // }
//   const merchatActivities = `select m.id as merchantId,m.merchantName,m.status,ma.outletIds,act.id as activityId,act.title,act.activityType,act.letterCollected,m.createdAt from merchants as m inner join merchant_activities as ma on m.id = ma.merchantId inner join activities as act on act.id = ma.activityId where m.merchantName like '%${search}%' and (m.status = '1' || m.status = '2') ORDER BY ${orderBy} ${order} limit ${limit} offset ${offset}`
//   const [merchatActivitiesress] = await this.adapter.db.query(merchatActivities);
  
//   for(let mer of merchatActivitiesress){
//       const activityId = mer.activityId;
//       const activityCate = `select ac.id,ac.name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${activityId}'`
//       const [activityCateress] = await this.adapter.db.query(activityCate);
//       const merchantCount = `select min(rd.discountedPrice) as price from regular_deals_relations as rds inner join regular_deals as rd on rds.regularDealId = rd.id where rds.outletId = '${mer.outletIds[0]} '`
//       const [merchantCountress] = await this.adapter.db.query(merchantCount);
//       const data = {
//           merchantId : mer.merchantId,
//           "merchantName": mer.merchantName,
//           "status": mer.status,
//           "activityId": mer.activityId,
//           "title": mer.title,
//           "activityType": mer.activityType,
//           "letterCollected":mer.letterCollected,
//           "createdAt":mer.createdAt,
//           "price":merchantCountress,
//           "actvityCategory":activityCateress
//       }
//       merchantDATA.push(data)
//   }
//   //===============================================================
//   const merchatActivities1 = `select m.id as merchantId,m.merchantName,m.status,act.id as activityId,act.title,act.activityType,act.letterCollected,m.createdAt from merchants as m inner join merchant_activities as ma on m.id = ma.merchantId inner join activities as act on act.id = ma.activityId where m.merchantName like '%${search}%' and (m.status = '1' || m.status = '2') ORDER BY ${orderBy} ${order}`
//   const [merchatActivitiesress1] = await this.adapter.db.query(merchatActivities1);
//   for(let mer of merchatActivitiesress1){
//       const activityId1 = mer.activityId;
//       const activityCate1 = `select ac.id,ac.name from activity_category_relations as acr inner join activity_categories as ac on acr.activityCategoryId = ac.id where acr.activityId = '${activityId1}'`
//       const [activityCateress1] = await this.adapter.db.query(activityCate1);
//       const data1 = {
//           merchantId : mer.merchantId,
//           "merchantName": mer.merchantName,
//           "status": mer.status,
//           "activityId": mer.activityId,
//           "title": mer.title,
//           "activityType": mer.activityType,
//           "letterCollected":mer.letterCollected,
//           "createdAt":mer.createdAt,
//           "actvityCategory":activityCateress1
//       }
//       merchantDATA1.push(data1)
//   }
//       const successMessage = {
//           success:true,
//           statusCode:200,
//           totalCount:merchantDATA1.length,
//           data:merchantDATA
//       }
//       return successMessage
// }else{
//     return message.message.PERMISSIONDENIDE
// }