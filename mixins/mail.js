const { ServiceBroker } = require("moleculer");
const broker = new ServiceBroker();

// Load service
broker.createService(require("moleculer-mail"), {
    settings: {
        from: "sender@moleculer.services",
        transport: {
            service: 'gmail',
            auth: {
                user: 'gmail.user@gmail.com',
                pass: 'yourpass'
            }
        }
    }
});

// Send an e-mail
broker.call("mail.send", { 
    to: "manojsikarwar@gmail.com", 
    subject: "Hello Friends!", 
    html: "This is the <b>content</b>!"
}).then(console.log);