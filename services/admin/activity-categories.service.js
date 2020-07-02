const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const Sequelize = require("sequelize");
const process = require("../../mixins/db.config");
const message = require("../../lib/message");
const bcrypt = require("bcrypt");
const data = require('../admin/admin.service.js')
const model1 = data.model;

module.exports = {
  name: "activityCategory",
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

  model1:  model1,
  model: {
    name: "activity_categorie",
    define: {
      name: { type: Sequelize.STRING, defaultValue: null },
      images: { type: Sequelize.JSON, defaultValue: null },
      status: { type: Sequelize.INTEGER, defaultValue: 1 },
      createdBy: { type: Sequelize.INTEGER, defaultValue: 0 },
      updatedBy: { type: Sequelize.INTEGER, defaultValue: 0 },
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
  },

  actions: {
    create: {
      rest: {
        method: "POST",
        path: "/create",
      },
      async handler(ctx) {
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
          const name = ctx.params.name;
          // first letter capitalized
          const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
          const images = JSON.stringify(ctx.params.images);
          const status = 1;
          const createdBy = Auth.id;
          const updatedBy = Auth.id;

          const categoryList = `select * from activity_categories where name = '${name}' and status != '${0}'`;
          const [categoryListress] = await this.adapter.db.query(categoryList);
          if (categoryListress == "") {
            const sql = `insert into activity_categories(name,images,status,createdBy,updatedBy) values('${nameCapitalized}','${images}','${status}','${createdBy}','${updatedBy}')`;
            const [res] = await this.adapter.db.query(sql);
            if (res) {
              return message.message.SAVE;
            } else {
              return message.message.NOTSAVE;
            }
          } else {
            return message.message.ALREADYTITLE;
          }
        } else {
          return message.message.PERMISSIONDENIDE;
        }
      },
    },

    activityCategoryList: {
      rest: {
        method: "GET",
        path: "/activityCategoryList",
      },
      async handler(ctx) {
        try {
          const Auth = ctx.meta.user;
          const List = [];
          if (Auth.success == false) {
            return Auth;
          } else {
            const tokenfind = `select * from authentications where user_id = '${Auth.id}'`;
            const [token] = await this.adapter.db.query(tokenfind);
            if (token[0].token == "null") {
              return message.message.LOGIN;
            }
            const sql = `select * from activity_categories`;
            const [searcActivityress] = await this.adapter.db.query(sql);

            if (searcActivityress == "") {
              const successMessage = {
                success: true,
                status: 200,
                data: searcActivityress,
                message: "Success",
              };
              return successMessage;
            } else {
              for (let key of searcActivityress) {
                List.push(key);
              }
              const successMessage = {
                success: true,
                status: 200,
                data: List,
                message: "Success",
              };
              return successMessage;
            }
          }
        } catch (error) {
          return error;
        }
      },
    },

    // demo: {
    //   rest: {
    //     method: "POST",
    //     path: "/demo",
    //   },

    //   async handler(ctx) {
    //     const firstname = ctx.params.firstName;
    //     const lastname = ctx.params.lastName;
    //     const email = ctx.params.email;
    //     const password = ctx.params.password;
    //     const mobile = ctx.params.mobile;
    //     const city = ctx.params.city;
    //     const location = ctx.params.location;
    //     const status = 1;
    //     const hash = await bcrypt.hash(password, 10);
    //     const categoryList = `select * from demo_user where email = '${email}' and status != '${0}'`;
    //     const [categoryListress] = await this.adapter.db.query(categoryList);
    //     if (categoryListress == "") {
    //       const sql = `insert into demo_user(firstname,lastname,email,password,mobile,city,location,status) values('${firstname}','${lastname}','${email}','${password}','${mobile}','${city}','${location}','${status}')`;
    //     const [res] = await this.adapter.db.query(sql);
    //     if (res) {
    //             ctx.emit('tesing',({res}))
    //       } else {
    //         ctx.emit('tesing',res)
    //     }
    //       // ctx.emit("testing", {
    //       //   firstname,
    //       //   lastname,
    //       //   email,
    //       //   mobile,
    //       //   city,
    //       //   location,
    //       //   status,
    //       //   hash,
    //       // },(result) => {
    //       //   return result
    //       // })
    //     } else {
    //       const successMessage = {
    //         success: false,
    //         statusCode: 409,
    //         message: "email must be unique",
    //       };
    //       return successMessage;
    //     }
    //   },
    // },
  },
};
