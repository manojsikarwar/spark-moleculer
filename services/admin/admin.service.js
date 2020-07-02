const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require("../../mixins/db.config");
const message = require("../../lib/message");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const role = message.roles.admin;
var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0");
var yyyy = today.getFullYear();
var hh = today.getHours();
var mi = today.getMinutes();
var ss = today.getSeconds();
today = yyyy + "-" + mm + "-" + dd + " " + hh + ":" + mi + ":" + ss;

module.exports = {
  name: "admin",
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
    name: "admin",
    define: {
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false },
      password: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.INTEGER, defaultValue: 1 },
      token: { type: Sequelize.STRING, defaultValue: null },
      createdBy: { type: Sequelize.INTEGER, defaultValue: null },
      updatedBy: { type: Sequelize.INTEGER, defaultValue: null },
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
          const email = ctx.params.email;
          const password = ctx.params.password;
          const checkAdmin = `select * from admins where email = '${email}'`;
          const [checkAdminress] = await this.adapter.db.query(checkAdmin);
          if (checkAdminress != "") {
            const pwd = checkAdminress[0].password;
            var matchResult = await bcrypt.compare(password, pwd);
            if (matchResult == true) {
              const adminId = checkAdminress[0].id;

              var token = jwt.sign(
                {
                  id: adminId,
                  email: checkAdminress[0].email,
                  status: checkAdminress[0].status,
                  role: role,
                },
                "secretkey",
                { expiresIn: "12h" }
              );
              const adminData = {
                id: adminId,
                name: checkAdminress[0].name,
                email: checkAdminress[0].email,
                password: checkAdminress[0].password,
                status: checkAdminress[0].status,
                createdBy: checkAdminress[0].createdBy,
                updatedBy: checkAdminress[0].updatedBy,
                createdAt: checkAdminress[0].createdAt,
                updatedAt: checkAdminress[0].updatedAt,
                token: token,
              };

              const successMessage = {
                success: true,
                statusCode: 200,
                data: adminData,
                message: "Success",
              };
              const checkToken = `select * from authentications where user_id = '${adminId}' and type = '${"admin"}'`;
              const [checkTokenress] = await this.adapter.db.query(checkToken);
              if (checkTokenress != "") {
                const updateToken = `update authentications set token = '${token}' where user_id = '${adminId}'`;
                const [updateTokenress] = await this.adapter.db.query(
                  updateToken
                );
                if (updateTokenress.affectedRows >= 1) {
                  return successMessage;
                } else {
                  return message.message.LOGINFAIL;
                }
              } else {
                const saveToken = `insert into authentications(type,user_id,token) values('${"admin"}','${adminId}','${token}')`;
                const [saveTokenress] = await this.adapter.db.query(saveToken);
                if (saveTokenress) {
                  return successMessage;
                } else {
                  return message.message.LOGINFAIL;
                }
              }
              return successMessage;
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

    adminProfile: {
      rest: {
        method: "GET",
        path: "/adminProfile",
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
            const id = Auth.id;
            const findEmail = `select * from admins where id = '${id}'`;
            const [findEmailress] = await this.adapter.db.query(findEmail);
            if (findEmailress != "") {
              for (let profile of findEmailress) {
                const ProfileData = {
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  status: profile.status,
                  createdAt: profile.createdAt,
                  updatedAt: profile.updatedAt,
                };
                const successMessage = {
                  status: true,
                  statusCode: 200,
                  data: ProfileData,
                };
                return successMessage;
              }
            } else {
              const successMessage = {
                status: true,
                statusCode: 200,
                data: ProfileData,
              };
              return successMessage;
            }
          } else {
            return message.message.PERMISSIONDENIDE;
          }
        } catch (error) {
          return error;
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
          const search = ctx.params.search;
          if (Auth == "fobidden") {
            return message.message.UNAUTHORIZED;
          }
          const Authentication = `select * from authentications where user_id = '${Auth.id}'`;
          const [Authenticationress] = await this.adapter.db.query(
            Authentication
          );
          if (Authenticationress != "") {
            // return Authenticationress?
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
          const findEmail = `select * from admins where email = '${email}'`;
          const [findEmailress] = await this.adapter.db.query(findEmail);
          if (findEmailress == "") {
            return message.message.EMAILNOTFOUND;
          } else {
            const resetPwdOtp = Math.floor(100000 + Math.random() * 900000);
            const name = findEmailress[0].name;
            const id = findEmailress[0].id;
            const status = "forget";

            const updateUserToken = `UPDATE admins SET token = '${resetPwdOtp}' WHERE email = '${email}'`;
            const [Emailresult] = await this.adapter.db.query(updateUserToken);
            if (Emailresult.affectedRows >= 1) {
              ctx.emit("AdminForgetMail", { name, id, email, status });

              const successMessage = {
                success: true,
                statusCode: 200,
                message:
                  "Email has been sent to your account. Please follow instructions in email to reset your password.",
              };
              return successMessage;
            } else {
              const successMessage = {
                success: false,
                statusCode: 200,
                message: "Something Went Wrong",
              };
              return successMessage;
            }
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
          const findEmail = `select * from admins where id = '${id}'`;
          const [findEmailress] = await this.adapter.db.query(findEmail);
          if (findEmailress != "") {
            const hash = await bcrypt.hash(password, 10);
            const setPassword = `update admins set password = '${hash}' where id = '${id}'`;
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
      async handler(ctx, res, req) {
        try {
          const Auth = ctx.meta.user;
          if (Auth.success == false) {
            return Auth;
          }
          if (Auth.role == 1) {
            const currentPassword = ctx.params.currentPassword;
            const newPassword = ctx.params.newPassword;
            const confirmPassword = ctx.params.confirmPassword;
            // const email1 = ctx.params.email;
            const email = Auth.email;

            const findEmail = `select * from admins where email = '${email}'`;
            const [findEmailress] = await this.adapter.db.query(findEmail);
            if (findEmailress != "") {
              const pass = findEmailress[0].password;
              const matchResult = await bcrypt.compare(currentPassword, pass);
              if (matchResult == true) {
                if (newPassword === confirmPassword) {
                  const hash = await bcrypt.hash(newPassword, 10);
                  const setPassword = `update admins set password = '${hash}' where email = '${email}'`;
                  const [setPassress] = await this.adapter.db.query(
                    setPassword
                  );
                  if (setPassress.affectedRows >= 1) {
                    const checkAdmin = `select * from admins where email = '${email}'`;
                    const [checkAdminress] = await this.adapter.db.query(
                      checkAdmin
                    );
                    if (checkAdminress != "") {
                      const pwd = checkAdminress[0].password;
                      var matchResult1 = await bcrypt.compare(newPassword, pwd);
                      if (matchResult1 == true) {
                        const adminId = checkAdminress[0].id;

                        var token = jwt.sign(
                          {
                            id: adminId,
                            email: checkAdminress[0].email,
                            status: checkAdminress[0].status,
                            role: role,
                          },
                          "secretkey",
                          { expiresIn: "12h" }
                        );
                        const adminData = {
                          id: adminId,
                          name: checkAdminress[0].name,
                          email: checkAdminress[0].email,
                          password: checkAdminress[0].password,
                          status: checkAdminress[0].status,
                          createdBy: checkAdminress[0].createdBy,
                          updatedBy: checkAdminress[0].updatedBy,
                          createdAt: checkAdminress[0].createdAt,
                          updatedAt: checkAdminress[0].updatedAt,
                          token: token,
                        };

                        const successMessage = {
                          success: true,
                          statusCode: 200,
                          data: adminData,
                          message: "Success",
                        };
                        const checkToken = `select * from authentications where user_id = '${adminId}' and type = '${"admin"}'`;
                        const [checkTokenress] = await this.adapter.db.query(
                          checkToken
                        );
                        if (checkTokenress != "") {
                          const updateToken = `update authentications set token = '${token}' where user_id = '${adminId}'`;
                          const [updateTokenress] = await this.adapter.db.query(
                            updateToken
                          );
                          if (updateTokenress.affectedRows >= 1) {
                            return successMessage;
                          } else {
                            return message.message.LOGINFAIL;
                          }
                        } else {
                          const saveToken = `insert into authentications(type,user_id,token) values('${"admin"}','${adminId}','${token}')`;
                          const [saveTokenress] = await this.adapter.db.query(
                            saveToken
                          );
                          if (saveTokenress) {
                            return successMessage;
                          } else {
                            return message.message.LOGINFAIL;
                          }
                        }
                        return successMessage;
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

    edit: {
      rest: {
        method: "PUT",
        path: "/edit",
      },
      async handler(ctx) {
        try {
          const Auth = ctx.meta.user;
          const id = Auth.id;
          const name = ctx.params.name;
          const email = ctx.params.email;

          if (Auth.success == false) {
            return Auth;
          }
          const tokenfind = `select * from authentications where user_id = '${Auth.id}'`;
          const [token] = await this.adapter.db.query(tokenfind);
          if (token[0].token == "null") {
            return message.message.LOGIN;
          }

          if (Auth.role == 1) {
            const adminList = `select * from admins where id = '${id}'`;
            const [adminListress] = await this.adapter.db.query(adminList);
            if (adminListress != "") {
              const updateAdmin = `update admins set name = '${name}',email = '${email}' where id = '${id}'`;
              const [updateAdminress] = await this.adapter.db.query(
                updateAdmin
              );
              if (updateAdminress.affectedRows >= 0) {
                return message.message.UPDATE;
              } else {
                return message.message.NOTUPDATE;
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

    changeEmail: {
      rest: {
        method: "POST",
        path: "/changeEmail",
      },
      async handler(ctx, res, req) {
        try {
          const Auth = ctx.meta.user;
          if (Auth.success == false) {
            return Auth;
          }
          if (Auth.role == 1) {
            const currentEmail = ctx.params.currentEmail;
            const newEmail = ctx.params.newEmail;
            const password = ctx.params.password;
            const status = "change";

            const resetPwdOtp = Math.floor(100000 + Math.random() * 900000);
            if (Auth.success == false) {
              return Auth;
            }
            const tokenfind = `select * from authentications where user_id = '${Auth.id}'`;
            const [token] = await this.adapter.db.query(tokenfind);
            if (token[0].token == "null") {
              return message.message.LOGIN;
            }
            const findEmail = `select * from admins where email = '${currentEmail}'`;
            const [findEmailress] = await this.adapter.db.query(findEmail);
            if (findEmailress != "") {
              const pwd = findEmailress[0].password;
              var matchResult = await bcrypt.compare(password, pwd);
              if (matchResult == true) {
                const setEmail = `update admins set email = '${newEmail}',token = '${resetPwdOtp}' where email = '${currentEmail}'`;
                const [setEmailress] = await this.adapter.db.query(setEmail);
                if (
                  setEmailress.info >=
                  "Rows matched: 1  Changed: 0  Warnings: 0"
                ) {
                  ctx.emit("AdminForgetMail", {
                    newEmail,
                    resetPwdOtp,
                    status,
                  });

                  const successMessage = {
                    success: true,
                    statusCode: 301,
                    message:
                      "Email has been changed successfully. Please check your mail",
                  };
                  return successMessage;
                } else {
                  return message.message.RESETPASSWORDNOT;
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
  },
};
