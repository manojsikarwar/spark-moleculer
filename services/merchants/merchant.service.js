const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const message = require("../../lib/message");
const process = require("../../mixins/db.config");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const { uuid } = require("uuidv4");
const nodemailer = require("nodemailer");
const role = message.roles.merchant;
var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0");
var yyyy = today.getFullYear();
var hh = today.getHours();
var mi = today.getMinutes();
var ss = today.getSeconds();
today = yyyy + "-" + mm + "-" + dd + " " + hh + ":" + mi + ":" + ss;

module.exports = {
  name: "merchant",
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
      merchantName: { type: Sequelize.STRING },
      merchantLogo: { type: Sequelize.STRING },
      password: { type: Sequelize.STRING },
      merchantWebsite: { type: Sequelize.STRING },
      contactPersonForSparks: { type: Sequelize.STRING },
      contactEmail: { type: Sequelize.STRING },
      mobileForSparks: { type: Sequelize.STRING },
      notes: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING },
      bank: { type: Sequelize.JSON },
      connect_id: { type: Sequelize.STRING },
      stripeMerchantId: { type: Sequelize.STRING },
      resetPasswordCode: { type: Sequelize.STRING },
      createdBy: { type: Sequelize.INTEGER },
      updatedBy: { type: Sequelize.INTEGER },
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
    signin: {
      rest: {
        method: "POST",
        path: "/signin",
      },
      async handler(ctx) {
        try {
          const merchantSignUpEmail = ctx.params.merchantSignUpEmail;
          const password = ctx.params.password;
          const checkMerchant = `select * from merchants where merchantSignUpEmail = '${merchantSignUpEmail}' and status != '${0}'`;
          const [checkMerchantress] = await this.adapter.db.query(
            checkMerchant
          );
          if (checkMerchantress != "") {
            if (checkMerchantress[0].resetPasswordCode > 0) {
              const successMessage = {
                success: false,
                statusCode: 409,
                message: "Please Confirm Your Email",
              };
              return successMessage;
            }
            const pwd = checkMerchantress[0].password;
            var matchResult = await bcrypt.compare(password, pwd);
            if (matchResult == true) {
              const merchantID = checkMerchantress[0].id;

              var token = jwt.sign(
                {
                  id: merchantID,
                  email: checkMerchantress[0].merchantSignUpEmail,
                  status: checkMerchantress[0].status,
                  role: role,
                },
                "secretkey",
                { expiresIn: "12h" }
              );
              const merchantdata = {
                id: merchantID,
                merchantName: checkMerchantress[0].merchantName,
                merchantLogo: checkMerchantress[0].merchantLogo,
                merchantSignUpEmail: checkMerchantress[0].merchantSignUpEmail,
                merchantWebsite: checkMerchantress[0].merchantWebsite,
                contactPersonForSparks:
                  checkMerchantress[0].contactPersonForSparks,
                contactEmail: checkMerchantress[0].contactEmail,
                mobileForSparks: checkMerchantress[0].mobileForSparks,
                notes: checkMerchantress[0].notes,
                status: checkMerchantress[0].status,
                connect_id: checkMerchantress[0].connect_id,
                stripeMerchantId: checkMerchantress[0].stripeMerchantId,
                role_id: 2,
                createdBy: checkMerchantress[0].createdBy,
                updatedBy: checkMerchantress[0].updatedBy,
                createdAt: checkMerchantress[0].createdAt,
                updatedAt: checkMerchantress[0].updatedAt,
                token: token,
              };
              const successMessage = {
                success: true,
                statusCode: 200,
                data: merchantdata,
                message: "Success",
              };
              const checkToken = `select * from authentications where user_id = '${merchantID}' and type = '${"merchant"}'`;
              const [checkTokenress] = await this.adapter.db.query(checkToken);
              if (checkTokenress != "") {
                const updateToken = `update authentications set token = '${token}' where user_id = '${merchantID}'`;
                const [updateTokenress] = await this.adapter.db.query(
                  updateToken
                );
                if (updateTokenress.affectedRows >= 1) {
                  return successMessage;
                } else {
                  return message.message.LOGINFAIL;
                }
              } else {
                const saveToken = `insert into authentications(type,user_id,token,createdAt,updatedAt) values('${"merchant"}','${merchantID}','${token}','${today}','${today}')`;
                const [saveTokenress] = await this.adapter.db.query(saveToken);
                if (saveTokenress) {
                  return successMessage;
                } else {
                  return message.message.LOGINFAIL;
                }
              }
            } else {
              return message.message.PASSWORDDUP;
            }
          } else {
            return message.message.USERNOTFOUND;
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

    signout: {
      rest: {
        method: "GET",
        path: "/signout",
      },
      async handler(ctx) {
        try {
          const Auth = ctx.meta.user;
          if (Auth.success == false) {
            return message.message.UNAUTHORIZED;
          }
          const Authentication = `select * from authentications where user_id = '${Auth.id}'`;
          const [Authenticationress] = await this.adapter.db.query(
            Authentication
          );
          if (Authenticationress != "") {
            const tokenExpire = `update authentications set token = '${null}' where user_id = '${
              Auth.id
            }'`;
            const [tokenExpireress] = await this.adapter.db.query(tokenExpire);
            if (tokenExpireress.affectedRows >= 1) {
              return message.message.SIGNOUT;
            } else {
              return message.message.ALREADYUPDATED;
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

    forget_password: {
      rest: {
        method: "POST",
        path: "/forget_password",
      },

      async handler(ctx) {
        try {
          const email = ctx.params.email;
          const findEmail = `select * from merchants where merchantSignUpEmail = '${email}' and status != '${0}'`;
          const [findEmailress] = await this.adapter.db.query(findEmail);
          if (findEmailress == "") {
            return message.message.EMAILNOTFOUND;
          } else {
            const name = findEmailress[0].merchantName;
            const id = findEmailress[0].id;
            const status = "forget";

            // await ctx.call("merchant.ForgetMail", { name, id, email, status });
            ctx.emit("ForgetMail", { name, id, email, status });
            const successMessage = {
              success: true,
              statusCode: 200,
              message:
                "Email has been sent to your account. Please follow instructions in email to reset your password.",
            };
            return successMessage;
          }
        } catch (error) {
          return error;
        }
      },
    },

    reset_password: {
      rest: {
        method: "POST",
        path: "/reset_password",
      },
      async handler(ctx) {
        try {
          const id = ctx.params.id;
          const password = ctx.params.password;
          if (password.length < 6) {
            const errMessage = {
              success: false,
              statusCode: 409,
              message: "Password must be atleast 6 digit or above",
            };
            return errMessage;
          }
          const findEmail = `select * from merchants where id = '${id}'`;
          const [findEmailress] = await this.adapter.db.query(findEmail);
          if (findEmailress != "") {
            const hash = await bcrypt.hash(password, 10);
            const setPassword = `update merchants set password = '${hash}' where id = '${id}'`;
            const [setPassress] = await this.adapter.db.query(setPassword);
            if (setPassress.affectedRows >= 1) {
              return message.message.RESETPASSWORD;
            } else {
              return message.message.RESETPASSWORDNOT;
            }
          } else {
            return message.message.ADMINIDNOTFOUND;
          }
        } catch (error) {
          return error;
        }
      },
    },

    changePassword: {
      rest: {
        method: "POST",
        path: "/changePassword",
      },
      params: {
        newPassword: { type: "string", min: 6 },
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
            // const email1 = ctx.params.email;
            const email = Auth.email;
            const findEmail = `select * from merchants where merchantSignUpEmail = '${email}'`;
            const [findEmailress] = await this.adapter.db.query(findEmail);
            if (findEmailress != "") {
              const pass = findEmailress[0].password;
              const matchResult = await bcrypt.compare(currentPassword, pass);
              if (matchResult == true) {
                if (newPassword === confirmPassword) {
                  const hash = await bcrypt.hash(newPassword, 10);
                  const setPassword = `update merchants set password = '${hash}' where merchantSignUpEmail = '${email}'`;
                  const [setPassress] = await this.adapter.db.query(
                    setPassword
                  );
                  if (setPassress.affectedRows >= 1) {
                    const checkMerchant = `select * from merchants where merchantSignUpEmail = '${email}' and status != '${0}'`;
                    const [checkMerchantress] = await this.adapter.db.query(
                      checkMerchant
                    );
                    if (checkMerchantress != "") {
                      if (checkMerchantress[0].resetPasswordCode > 0) {
                        const successMessage = {
                          success: false,
                          statusCode: 409,
                          message: "Please Confirm Your Email",
                        };
                        return successMessage;
                      }
                      const pwd = checkMerchantress[0].password;
                      var matchResult1 = await bcrypt.compare(newPassword, pwd);
                      0;
                      if (matchResult1 == true) {
                        const merchantID = checkMerchantress[0].id;

                        var token = jwt.sign(
                          {
                            id: merchantID,
                            email: checkMerchantress[0].merchantSignUpEmail,
                            status: checkMerchantress[0].status,
                            role: role,
                          },
                          "secretkey",
                          { expiresIn: "12h" }
                        );
                        const merchantdata = {
                          id: merchantID,
                          merchantName: checkMerchantress[0].merchantName,
                          merchantLogo: checkMerchantress[0].merchantLogo,
                          merchantSignUpEmail:
                            checkMerchantress[0].merchantSignUpEmail,
                          merchantWebsite: checkMerchantress[0].merchantWebsite,
                          contactPersonForSparks:
                            checkMerchantress[0].contactPersonForSparks,
                          contactEmail: checkMerchantress[0].contactEmail,
                          mobileForSparks: checkMerchantress[0].mobileForSparks,
                          notes: checkMerchantress[0].notes,
                          status: checkMerchantress[0].status,
                          connect_id: checkMerchantress[0].connect_id,
                          stripeMerchantId:
                            checkMerchantress[0].stripeMerchantId,
                          role_id: 2,
                          createdBy: checkMerchantress[0].createdBy,
                          updatedBy: checkMerchantress[0].updatedBy,
                          createdAt: checkMerchantress[0].createdAt,
                          updatedAt: checkMerchantress[0].updatedAt,
                          token: token,
                        };
                        const successMessage = {
                          success: true,
                          statusCode: 200,
                          data: merchantdata,
                          message: "Password Reset Successfully",
                        };
                        const checkToken = `select * from authentications where user_id = '${merchantID}' and type = '${"merchant"}'`;
                        const [checkTokenress] = await this.adapter.db.query(
                          checkToken
                        );
                        if (checkTokenress != "") {
                          const updateToken = `update authentications set token = '${token}' where user_id = '${merchantID}'`;
                          const [updateTokenress] = await this.adapter.db.query(
                            updateToken
                          );
                          if (updateTokenress.affectedRows >= 1) {
                            return successMessage;
                          } else {
                            return message.message.LOGINFAIL;
                          }
                        } else {
                          const saveToken = `insert into authentications(type,user_id,token,createdAt,updatedAt) values('${"merchant"}','${merchantID}','${token}','${today}','${today}')`;
                          const [saveTokenress] = await this.adapter.db.query(
                            saveToken
                          );
                          if (saveTokenress) {
                            return successMessage;
                          } else {
                            return message.message.LOGINFAIL;
                          }
                        }
                      } else {
                        return message.message.PASSWORDDUP;
                      }
                    } else {
                      return message.message.USERNOTFOUND;
                    }
                    // return message.message.RESETPASSWORD;
                  } else {
                    return message.message.RESETPASSWORDNOT;
                  }
                } else {
                  return message.message.MATCHPASSWORD;
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

    changeEmail: {
      rest: {
        method: "POST",
        path: "/changeEmail",
      },
      async handler(ctx) {
        try {
          const Auth = ctx.meta.user;
          if (Auth.success == false) {
            return Auth;
          }
          if (Auth.role == 1 || Auth.role == 2) {
            const currentEmail = ctx.params.currentEmail;
            const newEmail = ctx.params.newEmail;
            // const password = ctx.params.password;
            const resetPwdOtp = Math.floor(100000 + Math.random() * 900000);
            if (Auth.success == false) {
              return Auth;
            }
            const tokenfind = `select * from authentications where user_id = '${Auth.id}'`;
            const [token] = await this.adapter.db.query(tokenfind);
            if (token[0].token == "null") {
              return message.message.LOGIN;
            }
            const findEmail = `select * from merchants where merchantSignUpEmail = '${currentEmail}'`;
            const [findEmailress] = await this.adapter.db.query(findEmail);
            if (findEmailress != "") {
              const pwd = findEmailress[0].password;

              const merchantID = findEmailress[0].id;
              const status = "change";
              const setEmail = `update merchants set merchantSignUpEmail = '${newEmail}',resetPasswordCode = '${resetPwdOtp}' where merchantSignUpEmail = '${currentEmail}'`;
              const [setEmailress] = await this.adapter.db.query(setEmail);
              if (
                setEmailress.info >= "Rows matched: 1  Changed: 0  Warnings: 0"
              ) {
                const updateToken = `update authentications set token = 'null' where user_id = '${merchantID}'`;
                const [updateTokenress] = await this.adapter.db.query(
                  updateToken
                );
                // await ctx.call("merchant.ForgetMail", {
                //   newEmail,
                //   resetPwdOtp,
                //   status,
                // });
                ctx.emit("ForgetMail", { newEmail, resetPwdOtp, status });
                const successMessage = {
                  success: true,
                  statusCode: 301,
                  message:
                    "Email Sent. Go to your email account and Confirm Email",
                };
                return successMessage;
              } else {
                return message.message.RESETPASSWORDNOT;
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

    confirmEmail: {
      rest: {
        method: "POST",
        path: "/confirmEmail",
      },
      async handler(ctx) {
        try {
          const code = ctx.params.code;
          const email = ctx.params.email;

          const findEmail = `select * from merchants where merchantSignUpEmail = '${email}'`;
          const [findEmailress] = await this.adapter.db.query(findEmail);
          if (findEmailress != "") {
            const merchantID = findEmailress[0].id;
            const resetPasswordCode = findEmailress[0].resetPasswordCode;
            if (resetPasswordCode == code) {
              const setEmail = `update merchants set resetPasswordCode = '${0}' where merchantSignUpEmail = '${email}'`;
              const [setEmailress] = await this.adapter.db.query(setEmail);
              if (
                setEmailress.info >= "Rows matched: 1  Changed: 0  Warnings: 0"
              ) {
                const successMessage = {
                  success: true,
                  statusCode: 200,
                  message: "Confirmation successfully done",
                };
                return successMessage;
              } else {
                return message.message.RESETPASSWORDNOT;
              }
            } else {
              const successMessage = {
                success: false,
                statusCode: 409,
                message: "You have already confirm you email",
              };
              return successMessage;
            }
          } else {
            return message.message.EMAILNOTFOUND;
          }
        } catch (error) {
          return error;
        }
      },
    },
  },
};
