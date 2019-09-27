const  knex = require('knex')({
    client: 'pg',
    version: '7.2',
    connection: {
      host : 'localhost',
      user : 'postgres',
      password : 'postgres',
      database : 'user_registration'
    },
    pool: {
      min: 1,
      max: 2,
    },
    ssl: true,
    debug: false
  });
  //expose knex connection object;
  module.exports = knex;