const options = {
    connection: {
        rejectUnauthorized: false,
        headers: {
            "Content-Type": "application/json"
        }
    },
    requestConfig: {
        timeout: 60000,
        noDelay: true,
        keepAlive: true,
        keepAliveDelay: 1000
    },
    responseConfig: {
        timeout: 300000
    }
};

const client = require('node-rest-client-promise').Client(options);

module.exports = client;