/**
 * Module Dependencies
 */
const config = require('./config');
const restify = require('restify');
const mongoose = require('mongoose');
const restifyPlugins = require('restify-plugins');
const corsMiddleware = require('restify-cors-middleware');

/**
  * Initialize Server
  */
const server = restify.createServer({
	name: config.name,
	version: config.version,
});
const cors = corsMiddleware({
	preflightMaxAge: 5,
	origins: ['*'],
	allowHeaders:['X-App-Version'],
	exposeHeaders:[]
  });

/**
  * Middleware
  */
server.use(restifyPlugins.jsonBodyParser({ mapParams: true }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(restifyPlugins.fullResponse());
server.pre(cors.preflight);
server.use(cors.actual);

/**
  * Start Server, Connect to DB & Require Routes
  */
server.listen(config.port, () => {
	// establish connection to mongodb
	mongoose.Promise = global.Promise;
	mongoose.connect(config.db.uri/* , { useMongoClient: true } */);

	const db = mongoose.connection;

	db.on('error', (err) => {
	    console.error(err);
	    process.exit(1);
	});
    
	db.once('open', () => {
	    require('./routes')(server);
	    console.log(`Server is listening on port ${config.port}`);
	});
});