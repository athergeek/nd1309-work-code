const Hapi = require('hapi');

/**
 * Class Definition for the REST API
 */
class ApiServer {

    /**
     * Constructor that allows initialize the class 
     */
    constructor() {
        this.server = Hapi.Server({
            port: 8000,
            host: 'localhost'
        });

        this.server.route({
            method: '*',
            path: '/{any*}',
            handler: function (request, h) {
                return '404 Error! Page Not Found!';
            }
        });
        this.initControllers();
        this.start();
    }

    /**
     * Initilization of all the controllers
     */
    initControllers() {
        require("./BlockController.js")(this.server);
    }

    async start() {
        await this.server.start();
        console.log(`Server running at: ${this.server.info.uri}`);
    }

}

new ApiServer();