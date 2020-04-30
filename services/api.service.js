"use strict";

const ApiGateway = require("moleculer-web");
const Client = require("../mixins/db.config");
const jwt = require('jsonwebtoken');
// var cors = require('cors')


module.exports = {
	name: "api",
	mixins: [ApiGateway],

	settings: {
		// app.use(cors()),

		port: process.env.PORT || Client.server.port,
		ip: Client.server.host,

		cors: {
            origin: "*",
            methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
            allowedHeaders: [],
            exposedHeaders: [],
            credentials: false,
            maxAge: 3600
        },

		routes: [
			{
				path: "/api",
				authorization: true,
				authentication: true,
				whitelist: ["**"],
				 // Route CORS settings (overwrite global settings)
				 cors: {
                    origin: ["https://localhost:4000"],
                    methods: ["GET", "OPTIONS", "POST","DELETE","PUT"],
                    credentials: true
                },

				aliases: {

				},

				callingOptions: {},

				bodyParsers: {
					json: {
						strict: false,
						limit: "1MB"
					},
					urlencoded: {
						extended: true,
						limit: "1MB"
					}
				},


				mappingPolicy: "all", // Available values: "all", "restrict"

				// Enable/disable logging
				logging: true
			}
		],
		assets: {
			folder: "public",

			// Options to `server-static` module
			options: {}
		}
	},

	methods: {

		async authenticate(ctx, route, req) {
			// Read the token from header
			const auth = req.headers["authorization"];
			if (auth && auth.startsWith("Bearer")) {
				const token = auth.slice(7);
				if (token) {
					return jwt.verify(token,'secretkey', (err, userData) => {  
						if(err){
							// console.log(err)
							return Client.message.TOKENEXPIRE;
						}else{
							if(userData){
								return{
									id      : userData.id,
									username: userData.firstName,
									email   : userData.email,
									status  : userData.status,
									role	: userData.role,
									token   : token,
									exp     : userData.exp
								}
							}else{
								return null;
							}
						}
					});
				}else {
					throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN);
				}
				
			} else {
				// No token. Throw an error or do nothing if anonymous access is allowed.
				// throw new E.UnAuthorizedError(E.ERR_NO_TOKEN);
				return null;
			}
		},
		
		async authorize(ctx, route, req) {
			// Get the authenticated user.
			// It check the `auth` property in action schema.
			if (req.$action.auth == "required" && !user) {
				throw new ApiGateway.Errors.UnAuthorizedError("NO_RIGHTS");
			}
		}
		
	}
};
