const express = require('express');
const compression = require('compression');
const next = require('next');
const helmet = require('helmet');
const router = require('./router');

const api = require('./api');

const logger = require('./logs');

require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 8000;
const ROOT_URL = dev ? `http://localhost:${port}` : process.env.API_SERVER;

const URL_MAP = {
  // '/login': '/public/login',
};

const app = next({ dev });
const handle = app.getRequestHandler();

const expressWinston = require('express-winston');
const winston = require('winston');

app.prepare().then(() => {
  const server = express();

  server.use(helmet());
  server.use(compression());
  server.use(express.json());

  server.use(expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      }),
      new winston.transports.File({ filename: '../server.log', level: 'info' }) 
    ],
    label: {label:'nodeserver'},
    meta: false, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}} {{req.statusCode}} {{JSON.stringify(req.query)}} {{res.responseTime}}ms", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: false, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function (req, res) {
      if (req.originalUrl.match(/_next|static/)) {
        return true;
      }
      return false;
    } // optional: allows to skip some log messages based on request and/or response
  }));
  // potential fix for Error: Can't set headers
  // try reproducing with Chrome Dev Tools open

  // if (!dev) {
  //   server.use(compression());
  // };

  // give all Nextjs's request to Nextjs server
  server.get('/_next/*', (req, res) => {
    handle(req, res);
  });

  server.get('/static/*', (req, res) => {
    handle(req, res);
  });

  router({ server, app });

  api(server, process.env.API_SERVER);

  server.get('*', (req, res) => {
    const url = URL_MAP[req.path];
    if (url) {
      app.render(req, res, url);
    } else {
      handle(req, res);
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    logger.info(`> Ready on ${ROOT_URL}`);
  });
});
