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
    
    ACTIVITYDELETE : ({success:true, statuCode:200, message:"Deleted successfully"}),
    ACTIVITYCREATE : ({success:true, statuCode:200, message:"Activities create successfully"}),
    NOTDELTE : ({success:false, statuCode:400, message:"Not deleted"}),

    //========================= user message =========================

    USERCREATE : ({success:true, statuCode:200, message:"User created"}),
    USERDELETE : ({success:true, statuCode:200, message:"User deleted"}),
    USERUPDATE : ({success:true, statuCode:200, message:"User updated"}),
    
    USERDUPLICATE : ({success:true, statuCode:409, message:"User already exists"}),
    USERNOTFOUND : ({success:false, statuCode:400, message:"Error: User does not exist."}),
    
    //=========================  MESSAGE FOR ALL ======================
    
    RESETPASSWORDNOT: ({success:true, statuCode:200, message:"Password not changed"}),
    RESETPASSWORD: ({success:true, statuCode:200, message:"Password change successfully"}),
    
    PASSWORDDUP : ({success:false, statuCode:400, message:"Error: Password entered is incorrect."}),
    LOGINFAIL : ({success:false, statuCode:401, message:"Error: Login failed."}),
    SOMETHINGWRONG :({success:false, statuCode:409, message:"Something went wrong"}),
    PERMISSIONDENIDE :({success:false, statuCode:409, message:"Permission denide"}),
    MISSINGFIELD :({success:false, statuCode:408, message:"Fields are missing"}),

    //========================= TOKEN MESSAGE =========================

    UNAUTHORIZED : ({success:false, statuCode:401, message:"Token UnAuthorizedErr."}),
    TOKENEXPIRE : ({success:false, statuCode:401, message:"Token Expire Please Login."}),

    //========================= EMAIL MESSAGE ==========================

    EMAILNOTFOUND : ({success:false, statuCode:401, message:"Email not found."}),

    //========================= MERCHANT MESSAGE =======================

    UNIQMERCHANT : ({success:false, statuCode:400, message:"merchantName must be unique."}),
  }
};
