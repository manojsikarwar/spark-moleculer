const nodemailer = require("nodemailer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require("../../mixins/db.config");
const message = require("../../lib/message");
const bcrypt = require("bcrypt");
const data = require('../admin/activity-categories.service.js')
const model = data.model;
// console.log(data.model)
module.exports = {
  name: "Function",
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
  model,
  events: {

    ForgetMail(body) {
      const name = body.name;
      const email = body.email;
      const id = body.id;
      const newEmail = body.newEmail;
      const resetPwdOtp = body.resetPwdOtp;
      const status = body.status;

      if (status === "forget") {
        let mailTransporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: false,
          auth: {
            user: "developer.entangled@gmail.com",
            pass: "Sp@rks2019",
          },
        });

        let mailDetails = {
          from: '"Sparks_Mail" <developer.entangled@gmail.com>',
          to: email,
          subject: "Forget password ✔",
          html:
            "Reset password link : http://3.22.3.82:4000/merchant/change-password/" +
            id +
            "<br><br> Name : " +
            name,
        };
        mailTransporter.sendMail(mailDetails, function (err, data) {
            // console.log(data)
          if (data) {
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
              message: err,
            };
            return successMessage;
          }
        });
      } else if (status === "change") {
        let mailTransporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: false,
          auth: {
            user: "developer.entangled@gmail.com",
            pass: "Sp@rks2019",
          },
        });

        let mailDetails = {
          from: '"Sparks_Mail" <developer.entangled@gmail.com>',
          to: newEmail,
          subject: "Confirm Email ✔",
          html: `Plese confirm email http://3.22.3.82:4000/merchant/email-confirm-link/${resetPwdOtp}/${newEmail}`,
        };
        mailTransporter.sendMail(mailDetails, function (err, data) {
          if (err) {
            const successMessage = {
              success: false,
              statusCode: 200,
              message: err,
            };
            return successMessage;
          } else {
            const successMessage = {
              success: true,
              statusCode: 301,
              message: "Email Sent. Go to your email account and Confirm Email",
            };
            return successMessage;
          }
        });
      }
    },

    AdminForgetMail(body) {
        console.log(body)
        const name = body.name;
        const email = body.email;
        const id = body.id;
        const newEmail = body.newEmail;
        const status = body.status;
        if (status === "forget") {
          let mailTransporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: false,
            auth: {
                user: "developer.entangled@gmail.com",
                pass: "Sp@rks2019",
            },
          });
  
          let mailDetails = {
            from: '"Sparks_Mail" <developer.entangled@gmail.com>',
            to: email,
            subject: "Forget password ✔",
            html:
              "Reset password link : http://3.22.3.82:4000/admin/change-password/" +
              id +
              "<br><br> Name : " +
              name,
          };
  
          mailTransporter.sendMail(mailDetails, function (err, data) {
            if (data) {
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
                message: err,
              };
              return successMessage;
            }
          });
        } else if (status === "change") {
          let mailTransporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: false,
            auth: {
              user: "developer.entangled@gmail.com",
              pass: "Sp@rks2019",
            },
          });
  
          let mailDetails = {
            from: '"Sparks_Mail" <developer.entangled@gmail.com>',
            to: newEmail,
            subject: "Confirm Email ✔",
            html: `Your Email Change Successfully and Your new email '${newEmail}'`,
          };
          mailTransporter.sendMail(mailDetails, function (err, data) {
            if (data) {
              const successMessage = {
                success: true,
                statusCode: 301,
                message: "Email Sent. Go to your email account and Confirm Email",
              };
              return successMessage;
            } else {
              const successMessage = {
                success: false,
                statusCode: 200,
                message: err,
              };
              return successMessage;
            }
          });
        }
    },

    MerchantCreateMail(body) {
      const email = body.merchantSignUpEmail;
      const password = body.password;

      let mailTransporter = nodemailer.createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 465,
          secure: false,
          auth: {
              user: 'developer.entangled@gmail.com',
              pass: 'Sp@rks2019'
          }
      });

      let mailDetails = {
          from: '"Sparks_Mail" <developer.entangled@gmail.com>',
          to: email,
          subject: 'Added As Merchant ✔',
          html: '<b> You are add as Merchant by Spark Admin</b><br><br> Your Email: ' + email + '<br><br> Your Password: ' + password + '<br><br>Please click here for login http://3.22.3.82:4000/merchant'
      };

      mailTransporter.sendMail(mailDetails, function (err, data) {
          if (data) {
              console.log(data)
              const successMessage = {
                  success: true,
                  statusCode: 200,
                  message: 'Success'
              }
              return successMessage
          } else {
              const successMessage = {
                  success: false,
                  statusCode: 200,
                  message: err
              }
              return successMessage;
          }
      });
  },

  },
};
