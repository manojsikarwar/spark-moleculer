module.exports = {
    settings: {
        // Global CORS settings for all routes
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
                path: '/',
                
                // Route CORS settings (overwrite global settings)
                cors: {
                    origin: ["http://localhost:3000", "https://localhost:4000"],
                    methods: ["GET", "OPTIONS", "POST"],
                    credentials: true
                },
            }
        ]
    }

};