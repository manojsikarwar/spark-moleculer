'use strict';

const fs = require('fs');
const os = require('os');


/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */


module.exports = {
  server: {
    host: '0.0.0.0',
    port:  4000,
  },
  metrics: {
    heartbeatInterval: Number(process.env.HEARTBEAT_INTERVAL) || 1000,
    commitSha: fs.readFileSync(__dirname + '/commit_sha', {encoding: 'utf-8'}) || 'manual-build',
    dockerHost: os.hostname(),
    version: process.env.npm_package_version || '',
  },
  mysql: {
    user: process.env.PGSQL_DB_USER || 'root',
    password: process.env.PGSQL_DB_PASSWORD || 'root',
    database: process.env.PGSQL_DB_NAME || 'spark',
    host: process.env.PGSQL_DB_HOST || 'localhost',
    // port: process.env.PGSQL_DB_PORT || 5432,
  },
 
  // mysql: {
  //   user: process.env.PGSQL_DB_USER || 'root',
  //   password: process.env.PGSQL_DB_PASSWORD || 'admin',
  //   database: process.env.PGSQL_DB_NAME || 'spark',
  //   host: process.env.PGSQL_DB_HOST || '127.0.0.1',
  //   // port: process.env.PGSQL_DB_PORT || 5432,
  // },

};